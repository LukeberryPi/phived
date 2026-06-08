import { DESKTOP_BREAKPOINT } from "src/constants/ui";
import { getViewportWidth } from "src/utils/getViewportWidth";

export const DESKTOP_TASK_LIST_WIDTH = 400;

export function setTasksDefaultWidth() {
  const viewportWidth = getViewportWidth();

  if (viewportWidth < DESKTOP_BREAKPOINT) {
    if (viewportWidth < 400) {
      return 300;
    }
    if (viewportWidth < 500) {
      return 320;
    }
    return 384;
  }

  return DESKTOP_TASK_LIST_WIDTH;
}
