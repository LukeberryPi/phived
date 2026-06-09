import {
  DESKTOP_BREAKPOINT,
  MOBILE_PANEL_HORIZONTAL_INSET_PX,
} from "src/constants/ui";

const DESKTOP_TASK_LIST_WIDTH = 400;

export function setTasksDefaultWidth() {
  const viewportWidth = window.innerWidth;

  if (viewportWidth < DESKTOP_BREAKPOINT) {
    return Math.min(
      DESKTOP_TASK_LIST_WIDTH,
      viewportWidth - MOBILE_PANEL_HORIZONTAL_INSET_PX
    );
  }

  return DESKTOP_TASK_LIST_WIDTH;
}
