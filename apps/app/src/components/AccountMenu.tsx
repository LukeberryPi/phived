import { useEffect, useRef, useState } from "react";
import { Button } from "src/components/Button";
import { useAuth } from "src/contexts";
import { cn } from "src/utils";

/**
 * The minimal, state-driven account slot for the header (ADR 0004): an
 * "upgrade to pro" CTA for non-Pro users and a plain account menu (manage
 * billing via the Polar portal, sign out) for Pro. Export/delete are
 * deliberately deferred from the UI so the calm header stays calm.
 */
export function AccountMenu({ actionClassName }: { actionClassName: string }) {
  const { mode, user, beginUpgrade, openBillingPortal, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onPointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (mode !== "pro") {
    return (
      <Button
        onClick={() => void beginUpgrade()}
        variant="accent"
        className="font-normal"
        aria-label="upgrade to phived pro"
      >
        {mode === "localOnly" ? "resume pro" : "upgrade to pro"}
      </Button>
    );
  }

  const label = user?.email ?? "account";

  return (
    <div ref={menuRef} className="relative">
      <Button
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="account menu"
        variant="ghost"
        className={actionClassName}
      >
        pro
      </Button>
      {open && (
        <div
          role="menu"
          className={cn(
            "dark:border-edge-dark dark:bg-surface-dark absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-black bg-white text-sm",
            "brutal-shadow"
          )}
        >
          <p className="text-muted-light dark:text-muted-dark truncate px-4 py-3 text-xs">
            {label}
          </p>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              void openBillingPortal();
            }}
            className="hover:bg-surface-hover-light dark:hover:bg-surface-hover-dark block w-full px-4 py-3 text-left lowercase"
          >
            manage billing
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              void signOut();
            }}
            className="hover:bg-surface-hover-light dark:hover:bg-surface-hover-dark block w-full px-4 py-3 text-left lowercase"
          >
            sign out
          </button>
        </div>
      )}
    </div>
  );
}
