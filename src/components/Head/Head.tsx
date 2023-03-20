import { Helmet } from "react-helmet-async";
import type { HeadProps } from "src/components/Head/Head.types";

const ALERT_ICON = "/favicon-alert.ico"
const DEFAULT_ICON = "/favicon-default.ico"

export const Head = ({ tasks }: HeadProps) => {
  const enableTasks = tasks.filter((task) => Boolean(task))
  const titlePrefix= enableTasks.length ? `[${enableTasks.length}]` : undefined
  const defaultTitle = "phived - the anti-procrastination to-do list"

  return (
    <Helmet>
      <title>{
        [titlePrefix, defaultTitle].join(' ')
      }</title>
      <link rel="icon" type="image/x-icon" href={enableTasks.length ? ALERT_ICON : DEFAULT_ICON} />
    </Helmet>
  );
};
