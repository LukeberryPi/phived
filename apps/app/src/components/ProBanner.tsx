import { FLOATING_CHROME_Z } from "src/constants/ui";
import { useAuth } from "src/contexts";
import { cn } from "src/utils";

/**
 * Non-blocking degrade-not-destroy banner (ADR 0004). LocalOnly (signed in but
 * unentitled) and a silent-401 paused-sync state both keep all local data; the
 * banner just explains the situation and offers the recovery action.
 */
export function ProBanner() {
  const {
    mode,
    needsReSignIn,
    signInWithGoogle,
    beginUpgrade,
    openBillingPortal,
  } = useAuth();

  const showReSignIn = needsReSignIn;
  const showLocalOnly = mode === "localOnly" && !needsReSignIn;

  if (!showReSignIn && !showLocalOnly) {
    return null;
  }

  return (
    <div
      className={cn(
        FLOATING_CHROME_Z,
        "pointer-events-none fixed inset-x-0 bottom-4 flex justify-center px-4"
      )}
    >
      <div
        role="status"
        className={cn(
          "pointer-events-auto flex max-w-md items-center gap-3 rounded-2xl border border-black px-4 py-3 text-sm",
          "bg-canvas-light/90 dark:border-edge-dark dark:bg-canvas-dark/90 brutal-shadow backdrop-blur-md"
        )}
      >
        {showReSignIn ? (
          <>
            <span className="lowercase">
              your session expired — saved locally
            </span>
            <button
              type="button"
              onClick={() => void signInWithGoogle()}
              className="font-bold lowercase underline underline-offset-4"
            >
              sign in
            </button>
          </>
        ) : (
          <>
            <span className="lowercase">saving locally only</span>
            <button
              type="button"
              onClick={() => void beginUpgrade()}
              className="font-bold lowercase underline underline-offset-4"
            >
              resume pro
            </button>
            <button
              type="button"
              onClick={() => void openBillingPortal()}
              className="text-muted-light dark:text-muted-dark lowercase underline underline-offset-4"
            >
              manage billing
            </button>
          </>
        )}
      </div>
    </div>
  );
}
