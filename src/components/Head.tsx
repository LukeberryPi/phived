import { Helmet } from "react-helmet-async";
import { useGeneralTasksContext } from "src/contexts";

export function Head() {
  const { generalTasks } = useGeneralTasksContext();
  // assures tasks filled with spaces are not accounted for on the tab's title
  const ongoingGeneralTasks = generalTasks.filter(
    (generalTask) => generalTask.trim() !== ""
  );

  const titlePrefix = ongoingGeneralTasks.length
    ? `[${ongoingGeneralTasks.length}]`
    : "";
  const title =
    `${titlePrefix} phived · the anti-procrastination to-do list`.trim();

  return (
    <Helmet>
      <title>{title}</title>
      <link rel="icon" type="image/x-icon" href="/favicon-default.ico" />
    </Helmet>
  );
}
