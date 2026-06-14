import { Helmet } from "react-helmet-async";
import { useCanvasTasksContext } from "src/contexts";
import { countFilledTasks } from "src/utils";

export function Head() {
  const { lists } = useCanvasTasksContext();

  const ongoingTaskCount = lists.reduce(
    (total, list) => total + countFilledTasks(list.tasks),
    0
  );

  const titlePrefix = ongoingTaskCount ? `[${ongoingTaskCount}]` : "";
  const title =
    `${titlePrefix} phived, the anti-procrastination to-do list`.trim();

  return (
    <Helmet>
      <title>{title}</title>
      <link rel="icon" href="/favicon-16.png" sizes="16x16" />
      <link rel="icon" href="/favicon-32.png" sizes="32x32" />
    </Helmet>
  );
}
