import { Helmet } from "react-helmet-async";
import { useTasksContext } from "src/contexts";

const ALERT_ICON = "favicon-alert.ico"
const DEFAULT_ICON = "favicon-default.ico"
const BASE_PAGE_TITLE = "phived - the anti-procrastination to-do list"

export const Head = () => {
  const { tasks } = useTasksContext();
  const enableTasks = tasks.filter(Boolean)
  const titlePrefix= enableTasks.length ? `[${enableTasks.length}]` : ''
  const title = `${titlePrefix} ${BASE_PAGE_TITLE}`.trim();
  const iconPath = `/${enableTasks.length ? ALERT_ICON : DEFAULT_ICON}`;

  return (
    <Helmet>
      <title>{title}</title>
      <link 
        rel="icon" 
        type="image/x-icon" 
        href={iconPath} 
      />
    </Helmet>
  );
};
