import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { authClient } from "src/auth/authClient";
import { Button } from "src/components";
import { cn } from "src/utils";

// Minimal, additive sign-in + subscription surface for cloud sync. Rendered
// only when VITE_SYNC_UI === "true" (see App.tsx) and lazy-loaded, so the
// anonymous/non-paying experience is byte-for-byte unchanged. The real sync
// wiring lands in [009]/[010]; this proves auth + billing end-to-end.
const APP_CALLBACK = "/app";
const apiBaseUrl = import.meta.env.VITE_AUTH_BASE_URL || "";

interface MeResponse {
  entitlement: {
    isEntitled: boolean;
  } | null;
}

export default function SyncAccount() {
  const { data: session, isPending } = authClient.useSession();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [entitled, setEntitled] = useState<boolean | null>(null);

  const user = session?.user ?? null;
  const userId = user?.id ?? null;

  useEffect(() => {
    if (!userId) {
      setEntitled(null);
      return;
    }

    let cancelled = false;
    fetch(`${apiBaseUrl}/api/me`, { credentials: "include" })
      .then(async (response): Promise<MeResponse> => {
        if (!response.ok) {
          throw new Error("Could not load sync entitlement.");
        }
        return response.json() as Promise<MeResponse>;
      })
      .then((result) => {
        if (cancelled) {
          return;
        }
        setEntitled(result.entitlement?.isEntitled ?? false);
      })
      .catch(() => {
        if (!cancelled) {
          setEntitled(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const sendMagicLink = useCallback(async () => {
    if (!email) {
      return;
    }
    setBusy(true);
    const { error } = await authClient.signIn.magicLink({
      email,
      callbackURL: APP_CALLBACK,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message ?? "Could not send the sign-in link.");
      return;
    }
    toast.success("Check your email for a sign-in link.");
  }, [email]);

  const signInWithGoogle = useCallback(async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: APP_CALLBACK,
    });
  }, []);

  const subscribe = useCallback(async (slug: "monthly" | "annual") => {
    try {
      await authClient.checkout({ slug });
    } catch {
      toast.error("Could not open checkout.");
    }
  }, []);

  const openPortal = useCallback(async () => {
    try {
      await authClient.customer.portal();
    } catch {
      toast.error("Could not open the billing portal.");
    }
  }, []);

  const signOut = useCallback(async () => {
    await authClient.signOut();
  }, []);

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 w-72 rounded-2xl border p-4 text-sm shadow-lg",
        "border-black bg-white text-black",
        "dark:border-edge-dark dark:bg-surface-dark dark:text-ink-dark"
      )}
    >
      <p className="mb-3 font-medium">Sync account</p>

      {isPending ? (
        <p className="opacity-70">Loading…</p>
      ) : user ? (
        <div className="flex flex-col gap-2">
          <p className="truncate opacity-80">{user.email}</p>
          <p className="opacity-80">
            {entitled === null
              ? "Checking subscription…"
              : entitled
                ? "Subscribed"
                : "Not subscribed"}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="accent"
              size="sm"
              onClick={() => void subscribe("monthly")}
            >
              Monthly
            </Button>
            <Button
              variant="accent"
              size="sm"
              onClick={() => void subscribe("annual")}
            >
              Annual
            </Button>
          </div>
          <Button variant="surface" size="sm" onClick={() => void openPortal()}>
            Manage billing
          </Button>
          <Button variant="ghost" size="sm" onClick={() => void signOut()}>
            Sign out
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className={cn(
              "rounded-xl border px-3 py-2 outline-none",
              "border-black/30 bg-white text-black",
              "dark:border-edge-dark dark:bg-canvas-dark dark:text-ink-dark"
            )}
          />
          <Button
            variant="accent"
            size="sm"
            disabled={busy || !email}
            onClick={() => void sendMagicLink()}
          >
            Email me a link
          </Button>
          <Button
            variant="surface"
            size="sm"
            onClick={() => void signInWithGoogle()}
          >
            Continue with Google
          </Button>
        </div>
      )}
    </div>
  );
}
