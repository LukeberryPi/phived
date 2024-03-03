import { getViewportWidth } from 'src/utils/getViewportWidth';

export function setTasksDefaultWidth() {
  if (getViewportWidth() < 400) {
    return 300;
  }
  if (getViewportWidth() < 500) {
    return 320;
  }
  return 384;
}
