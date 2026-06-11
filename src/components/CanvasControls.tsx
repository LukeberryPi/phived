import { pressFeedbackClassName } from "src/constants/motion";
import { CANVAS_CONTROLS_Z, DRAWER_HEADER_HOVER } from "src/constants/ui";
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
  "text-sm font-medium text-black dark:text-ink",
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
        "bottom-28 right-4",
        "sm:bottom-6 sm:left-1/2 sm:right-auto sm:-translate-x-1/2"
      )}
    >
      <button
        aria-label="new list"
        onClick={onNewList}
        className={cn(
          "task-panel overflow-hidden shadow-none",
          controlButtonClassName,
          "gap-2 px-4"
        )}
      >
        <Plus size={16} className="fill-black dark:fill-ink" />
        new list
      </button>

      <div
        className="task-panel flex items-stretch overflow-hidden shadow-none"
        role="group"
        aria-label="zoom controls"
      >
        <button
          aria-label="zoom out"
          onClick={onZoomOut}
          className={controlButtonClassName}
        >
          <Minus size={16} className="fill-black dark:fill-ink" />
        </button>
        <button
          aria-label="reset zoom"
          title="reset zoom"
          onClick={onResetZoom}
          className={cn(
            controlButtonClassName,
            "min-w-14 border-x border-line tabular-nums dark:border-hairline"
          )}
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          aria-label="zoom in"
          onClick={onZoomIn}
          className={controlButtonClassName}
        >
          <Plus size={16} className="fill-black dark:fill-ink" />
        </button>
      </div>
    </div>
  );
}
