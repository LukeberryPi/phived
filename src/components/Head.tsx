import { Helmet } from "react-helmet-async";
import { useTasksContext } from "src/contexts";

const headConstants = {
  icons: {
    default: "favicon-default.ico",
    alert: "favicon-alert.ico",
  },
  baseTitle: "phived · the anti-procrastination to-do list",
};

export function Head() {
  const { tasks } = useTasksContext();
  const { baseTitle, icons } = headConstants;
  const ongoingTasks = tasks.filter((task) => task.trim() !== "");

  const titlePrefix = ongoingTasks.length ? `[${ongoingTasks.length}]` : "";
  const title = `${titlePrefix} ${baseTitle}`.trim();
  const iconPath = `/${ongoingTasks.length ? icons.alert : icons.default}`;

  return (
    <Helmet>
      <title>{title}</title>
      <link rel="icon" type="image/x-icon" href={iconPath} />
    </Helmet>
  );
}
