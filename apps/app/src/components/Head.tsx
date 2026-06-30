import { useEffect } from "react";
import { useCanvasTasksContext } from "src/contexts";
import { countFilledTasks } from "src/utils";

// Keeps the document title in sync with the number of ongoing tasks. The static
// title and favicons live in index.html; only the task count is dynamic, so a
// plain effect replaces what react-helmet-async used to do here.
export function Head() {
  const { lists } = useCanvasTasksContext();

  const ongoingTaskCount = lists.reduce(
    (total, list) => total + countFilledTasks(list.tasks),
    0
  );

  const titlePrefix = ongoingTaskCount ? `[${ongoingTaskCount}]` : "";
  const title =
    `${titlePrefix} phived, the anti-procrastination to-do list`.trim();

  useEffect(() => {
    document.title = title;
  }, [title]);

  return null;
}
