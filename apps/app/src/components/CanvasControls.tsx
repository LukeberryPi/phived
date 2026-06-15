import { Tooltip } from "src/components/Tooltip";
import { pressFeedbackClassName } from "src/constants/motion";
import {
  CANVAS_CONTROLS_Z,
  DRAWER_HEADER_HOVER,
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

const controlButtonClassName = cn(
  "flex min-h-11 select-none items-center justify-center px-3",
  "text-sm font-medium text-black dark:text-ink-dark",
  DRAWER_HEADER_HOVER,
  pressFeedbackClassName
);

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
      className={cn(
        CANVAS_CONTROLS_Z,
        "pointer-events-auto fixed flex items-stretch gap-3",
        "right-4 bottom-28",
        "sm:right-auto sm:bottom-6 sm:left-1/2 sm:-translate-x-1/2"
      )}
    >
      <button
        aria-label="new list"
        onClick={onNewList}
        className={cn(
          FLOATING_CONTROL_SURFACE,
          "overflow-hidden shadow-none",
          controlButtonClassName,
          "gap-2 px-4"
        )}
      >
        <Plus size={16} className="dark:fill-ink-dark fill-black" />
        new list
      </button>

      <div
        className={cn(
          FLOATING_CONTROL_SURFACE,
          "flex items-stretch overflow-hidden shadow-none"
        )}
        role="group"
        aria-label="zoom controls"
      >
        <Tooltip label="zoom out">
          <button
            aria-label="zoom out"
            onClick={onZoomOut}
            className={controlButtonClassName}
          >
            <Minus size={16} className="dark:fill-ink-dark fill-black" />
          </button>
        </Tooltip>
        <Tooltip label="reset zoom">
          <button
            aria-label="reset zoom"
            onClick={onResetZoom}
            className={cn(
              controlButtonClassName,
              "border-line-light dark:border-hairline-dark min-w-14 border-x tabular-nums"
            )}
          >
            {Math.round(zoom * 100)}%
          </button>
        </Tooltip>
        <Tooltip label="zoom in">
          <button
            aria-label="zoom in"
            onClick={onZoomIn}
            className={controlButtonClassName}
          >
            <Plus size={16} className="dark:fill-ink-dark fill-black" />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}
