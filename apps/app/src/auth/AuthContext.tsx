import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { authClient } from "src/auth/client";

export type EntitlementState = {
  plan: "free" | "pro";
  status: string;
  active: boolean;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
};

export type AuthMode = "free" | "pro" | "localOnly" | "reauth";

type MeResponse = {
  user: null | {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  entitlement: EntitlementState;
};

type AuthContextValue = {
  user: MeResponse["user"];
  entitlement: EntitlementState;
  mode: AuthMode;
  refreshMe: () => Promise<void>;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  checkout: (billing: "monthly" | "annual") => Promise<void>;
  openBillingPortal: () => Promise<void>;
};

const fallbackEntitlement: EntitlementState = {
  plan: "free",
  status: "none",
  active: false,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [me, setMe] = useState<MeResponse>({
    user: null,
    entitlement: fallbackEntitlement,
  });
  const [sessionExpired, setSessionExpired] = useState(false);

  const refreshMe = useCallback(async () => {
    try {
      const response = await fetch("/api/me", { credentials: "include" });
      if (response.status === 401) {
        setSessionExpired(true);
        return;
      }

      if (!response.ok) {
        return;
      }

      const next = (await response.json()) as MeResponse;
      setMe(next);
      setSessionExpired(false);
    } catch {
      // Offline is handled by the sync hook; keep the current mode.
    }
  }, []);

  useEffect(() => {
    void refreshMe();

    const onFocus = () => void refreshMe();
    const onOnline = () => void refreshMe();

    window.addEventListener("focus", onFocus);
    window.addEventListener("online", onOnline);

    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("online", onOnline);
    };
  }, [refreshMe]);

  const checkout = useCallback(async (billing: "monthly" | "annual") => {
    window.dispatchEvent(
      new CustomEvent("phived:upgrade-cta", { detail: { billing } })
    );
    await authClient.checkout({
      slug: billing === "annual" ? "pro-annual" : "pro-monthly",
    });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const upgrade = params.get("upgrade") === "1";
    const signin = params.get("signin") === "1";
    const checkoutId = params.get("checkout");

    if (checkoutId) {
      void fetch("/api/entitlement/confirm", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkoutId }),
      }).finally(refreshMe);
      window.history.replaceState(null, "", "/app");
      window.dispatchEvent(new CustomEvent("phived:checkout-success"));
      return;
    }

    if ((upgrade || signin) && !me.user) {
      void authClient.signIn.social({
        provider: "google",
        callbackURL: upgrade ? "/app?upgrade=1" : "/app",
      });
      return;
    }

    if (upgrade && me.user && !me.entitlement.active) {
      void checkout("monthly");
    }
  }, [checkout, me.entitlement.active, me.user, refreshMe]);

  const signIn = useCallback(async () => {
    backupCurrentLocalState("phived.preSignIn.backup");
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/app?signin=1",
    });
  }, []);

  const signOut = useCallback(async () => {
    await authClient.signOut();
    restoreBackup("phived.preSignIn.backup");
    localStorage.removeItem("phived.sync.version");
    setMe({ user: null, entitlement: fallbackEntitlement });
    setSessionExpired(false);
  }, []);

  const openBillingPortal = useCallback(async () => {
    await authClient.customer.portal();
  }, []);

  const mode: AuthMode = sessionExpired
    ? "reauth"
    : me.user && me.entitlement.active
      ? "pro"
      : me.user
        ? "localOnly"
        : "free";

  const value = useMemo(
    () => ({
      user: me.user,
      entitlement: me.entitlement,
      mode,
      refreshMe,
      signIn,
      signOut,
      checkout,
      openBillingPortal,
    }),
    [
      checkout,
      me.entitlement,
      me.user,
      mode,
      openBillingPortal,
      refreshMe,
      signIn,
      signOut,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}

function backupCurrentLocalState(key: string) {
  const backup = {
    canvasLists: localStorage.getItem("canvasLists"),
    taskHistory: localStorage.getItem("taskHistory"),
    at: new Date().toISOString(),
  };
  localStorage.setItem(key, JSON.stringify(backup));
}

function restoreBackup(key: string) {
  const raw = localStorage.getItem(key);
  if (!raw) {
    return;
  }

  try {
    const backup = JSON.parse(raw) as {
      canvasLists?: string | null;
      taskHistory?: string | null;
    };

    restoreLocalStorageValue("canvasLists", backup.canvasLists);
    restoreLocalStorageValue("taskHistory", backup.taskHistory);
  } catch {
    // Keep the current local state if the backup is unreadable.
  }
}

function restoreLocalStorageValue(
  key: string,
  value: string | null | undefined
) {
  if (value) {
    localStorage.setItem(key, value);
  } else {
    localStorage.removeItem(key);
  }
}
