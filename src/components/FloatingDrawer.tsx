import type { ReactNode } from "react";
import {
  DRAWER_BODY,
  DRAWER_COLLAPSED_BUTTON,
  DRAWER_HEADER_BUTTON,
  DRAWER_HEADER_GRID,
  DRAWER_HEADER_GRID_REVERSED,
  DRAWER_HEADER_HOVER,
  DRAWER_ICON_HEADER_GRID,
  DRAWER_ICON_HEADER_GRID_REVERSED,
  DRAWER_SURFACE,
  DRAWER_WIDTH,
  DRAWER_TOGGLE_DIVIDER,
  FLOATING_CHROME_Z,
} from "src/constants/ui";
import {
  drawerWidthTransitionClassName,
  pressFeedbackGroupChildClassName,
  pressFeedbackGroupClassName,
} from "src/constants/motion";
import { useLocalStorage } from "src/hooks";
import { cn } from "src/utils";

type FloatingDrawerSide = "left" | "right";

const sidePositionClassName: Record<FloatingDrawerSide, string> = {
  left: "sm:bottom-6 sm:left-6",
  right: "sm:bottom-6 sm:right-6",
};

type FloatingDrawerProps = {
  side: FloatingDrawerSide;
  storageKey: string;
  defaultOpen?: boolean;
  ariaLabel: string;
  panelId: string;
  renderToggle: (isOpen: boolean) => ReactNode;
  headerTrailing?: ReactNode;
  compactHeaderTrailing?: boolean;
  children: (actions: { close: () => void }) => ReactNode;
};

export function FloatingDrawer({
  side,
  storageKey,
  defaultOpen = true,
  ariaLabel,
  panelId,
  renderToggle,
  headerTrailing,
  compactHeaderTrailing,
  children,
}: FloatingDrawerProps) {
  const [isOpen, setIsOpen] = useLocalStorage(storageKey, defaultOpen);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen((open) => !open);

  const panelContent = children({ close });
  const shouldShowHeaderAction = isOpen && headerTrailing;
  const headerActionBeforeToggle = shouldShowHeaderAction && side === "right";

  const toggleButtonClassName = cn(
    DRAWER_HEADER_HOVER,
    isOpen
      ? headerTrailing
        ? DRAWER_HEADER_BUTTON
        : cn(DRAWER_HEADER_BUTTON, "w-full")
      : cn(DRAWER_COLLAPSED_BUTTON, "inline-flex"),
    headerActionBeforeToggle && "justify-end",
    isOpen && side === "right" && !headerTrailing && "justify-end",
    isOpen && !headerTrailing && DRAWER_TOGGLE_DIVIDER
  );

  const toggleButton = (
    <button
      aria-expanded={isOpen}
      aria-controls={panelId}
      onClick={toggle}
      className={cn(
        pressFeedbackGroupClassName("drawer-toggle"),
        toggleButtonClassName
      )}
    >
      <span
        className={cn(
          "flex items-center gap-2",
          pressFeedbackGroupChildClassName("drawer-toggle")
        )}
      >
        {renderToggle(isOpen)}
      </span>
    </button>
  );

  return (
    <aside
      className={cn(
        FLOATING_CHROME_Z,
        "pointer-events-auto fixed hidden sm:block",
        sidePositionClassName[side]
      )}
      aria-label={ariaLabel}
    >
      <div
        className={cn(
          "drawer-shell task-panel flex w-fit flex-col-reverse overflow-hidden",
          drawerWidthTransitionClassName
        )}
      >
        {shouldShowHeaderAction ? (
          <div
            className={cn(
              headerActionBeforeToggle
                ? compactHeaderTrailing
                  ? DRAWER_ICON_HEADER_GRID_REVERSED
                  : DRAWER_HEADER_GRID_REVERSED
                : compactHeaderTrailing
                  ? DRAWER_ICON_HEADER_GRID
                  : DRAWER_HEADER_GRID,
              DRAWER_SURFACE,
              DRAWER_TOGGLE_DIVIDER
            )}
          >
            {headerActionBeforeToggle ? (
              <>
                {headerTrailing}
                {toggleButton}
              </>
            ) : (
              <>
                {toggleButton}
                {headerTrailing}
              </>
            )}
          </div>
        ) : (
          toggleButton
        )}
        {isOpen && (
          <div
            id={panelId}
            role="region"
            className={cn(DRAWER_WIDTH, DRAWER_BODY)}
          >
            {panelContent}
          </div>
        )}
      </div>
    </aside>
  );
}
