import { Tooltip } from "src/components/Tooltip";
import {
  CANVAS_CONTROLS_Z,
  CONTROL_BUTTON,
  CONTROL_SEGMENT,
  FLOATING_CONTROL_SURFACE,
} from "src/constants/ui";
import { Minus, Plus } from "src/icons";
import { cn } from "src/utils";

type CanvasControlsProps = {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onNewList: () => void;
};

export function CanvasControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onNewList,
}: CanvasControlsProps) {
  return (
    <div
      data-canvas-ui
      onContextMenu={(event) => event.stopPropagation()}
      className={cn(
        CANVAS_CONTROLS_Z,
        "pointer-events-auto fixed flex items-stretch gap-3",
        "right-4 bottom-28",
        "sm:right-auto sm:bottom-6 sm:left-1/2 sm:-translate-x-1/2"
      )}
    >
      <button
        type="button"
        aria-label="new list"
        onClick={onNewList}
        className={CONTROL_BUTTON}
      >
        <Plus size={16} className="dark:text-ink-dark text-black" />
        new list
      </button>

      <div
        className={cn(
          FLOATING_CONTROL_SURFACE,
          "box-border flex h-11 items-stretch overflow-hidden shadow-none"
        )}
        role="group"
        aria-label="zoom controls"
      >
        <Tooltip label="zoom out">
          <button
            type="button"
            aria-label="zoom out"
            onClick={onZoomOut}
            className={CONTROL_SEGMENT}
          >
            <Minus size={16} className="dark:text-ink-dark text-black" />
          </button>
        </Tooltip>
        <Tooltip label="reset zoom">
          <button
            type="button"
            aria-label="reset zoom"
            onClick={onResetZoom}
            className={cn(
              CONTROL_SEGMENT,
              "border-line-light dark:border-hairline-dark min-w-14 border-x"
            )}
          >
            {/* DM Sans has no tabular figures, so `tabular-nums` is a no-op and
                proportional digits (e.g. 1 vs 2) reflow the centered bar. Render
                the value in DM Mono instead for equal-width digits. */}
            <span className="font-mono text-[0.8125rem] tabular-nums">
              {Math.round(zoom * 100)}%
            </span>
          </button>
        </Tooltip>
        <Tooltip label="zoom in">
          <button
            type="button"
            aria-label="zoom in"
            onClick={onZoomIn}
            className={CONTROL_SEGMENT}
          >
            <Plus size={16} className="dark:text-ink-dark text-black" />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}
