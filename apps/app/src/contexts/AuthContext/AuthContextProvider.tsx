import type { PropsWithChildren } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { authClient } from "src/lib/authClient";
import { confirmCheckout, fetchMe, type MeResponse } from "src/lib/syncApi";
import { AuthContext } from "src/contexts/AuthContext/AuthContext";
import type {
  AuthContextValue,
  Mode,
  SyncBridge,
  SyncStatus,
} from "src/types/account";

const APP_HOME = "/app";

function modeFromMe(me: MeResponse | null): Mode {
  if (!me?.user) {
    return "free";
  }
  return me.entitlement?.entitled ? "pro" : "localOnly";
}

/** Redirect to a hosted Polar URL returned by a Better Auth Polar endpoint. */
async function redirectToPolar(
  path: "/api/auth/checkout" | "/api/auth/customer/portal",
  body: Record<string, unknown>
): Promise<void> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => null)) as { url?: string } | null;
  if (data?.url) {
    window.location.href = data.url;
  }
}

function stripIntentParams(): void {
  const url = new URL(window.location.href);
  let changed = false;
  for (const key of ["upgrade", "signin", "checkout"]) {
    if (url.searchParams.has(key)) {
      url.searchParams.delete(key);
      changed = true;
    }
  }
  if (changed) {
    window.history.replaceState({}, "", url.pathname + url.search + url.hash);
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [ready, setReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [needsReSignIn, setNeedsReSignIn] = useState(false);
  const bridgeRef = useRef<SyncBridge | null>(null);

  const refresh = useCallback(async () => {
    try {
      const next = await fetchMe();
      setMe(next);
      if (next.user) {
        setNeedsReSignIn(false);
      }
    } catch {
      // Network failure: keep whatever we had; the sync engine handles retry.
    }
  }, []);

  const signInWithGoogle = useCallback(async (callbackURL = APP_HOME) => {
    await authClient.signIn.social({ provider: "google", callbackURL });
  }, []);

  const beginUpgrade = useCallback(
    async (plan: "monthly" | "annual" = "monthly") => {
      const current = me ?? (await fetchMe().catch(() => null));
      if (!current?.user) {
        // Not signed in yet: sign in, then return here to resume the upgrade.
        await authClient.signIn.social({
          provider: "google",
          callbackURL: `${APP_HOME}?upgrade=1`,
        });
        return;
      }
      const slug = plan === "annual" ? "pro-annual" : "pro-monthly";
      await redirectToPolar("/api/auth/checkout", { slug });
    },
    [me]
  );

  const openBillingPortal = useCallback(async () => {
    await redirectToPolar("/api/auth/customer/portal", {});
  }, []);

  const signOut = useCallback(async () => {
    // Explicit sign-out: clear the session, then clear local and restore the
    // pre-sign-in snapshot (privacy-safe on borrowed browsers).
    try {
      await authClient.signOut();
    } finally {
      bridgeRef.current?.restoreLocalAfterSignOut();
      setMe({ user: null, entitlement: null, hasServerDocument: false });
      setNeedsReSignIn(false);
      setSyncStatus("idle");
    }
  }, []);

  const registerSyncBridge = useCallback((bridge: SyncBridge | null) => {
    bridgeRef.current = bridge;
  }, []);

  // Mount: resolve URL intents (upgrade / signin / checkout), then load /api/me.
  useEffect(() => {
    let cancelled = false;

    async function boot() {
      const params = new URLSearchParams(window.location.search);
      const checkoutId = params.get("checkout");
      const wantUpgrade = params.get("upgrade") === "1";
      const wantSignin = params.get("signin") === "1";

      if (checkoutId) {
        // One-shot authoritative entitlement confirm on the post-checkout return.
        const confirmed = await confirmCheckout(checkoutId).catch(() => null);
        if (!cancelled && confirmed) {
          setMe(confirmed);
        }
        stripIntentParams();
        if (!cancelled) {
          setReady(true);
        }
        return;
      }

      const current = await fetchMe().catch(() => null);
      if (cancelled) {
        return;
      }
      if (current) {
        setMe(current);
      }

      if (wantUpgrade) {
        if (!current?.user) {
          await signInWithGoogle(`${APP_HOME}?upgrade=1`);
          return;
        }
        if (!current.entitlement?.entitled) {
          await beginUpgrade();
          return;
        }
        stripIntentParams();
      } else if (wantSignin) {
        if (!current?.user) {
          await signInWithGoogle(APP_HOME);
          return;
        }
        stripIntentParams();
      }

      if (!cancelled) {
        setReady(true);
      }
    }

    void boot();
    return () => {
      cancelled = true;
    };
    // Intent handling is a one-time boot step.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      mode: modeFromMe(me),
      user: me?.user ?? null,
      entitlement: me?.entitlement ?? null,
      syncStatus,
      needsReSignIn,
      ready,
      signInWithGoogle: () => signInWithGoogle(APP_HOME),
      beginUpgrade,
      openBillingPortal,
      signOut,
      refresh,
      setSyncStatus,
      setNeedsReSignIn,
      registerSyncBridge,
    }),
    [
      me,
      syncStatus,
      needsReSignIn,
      ready,
      signInWithGoogle,
      beginUpgrade,
      openBillingPortal,
      signOut,
      refresh,
      registerSyncBridge,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
