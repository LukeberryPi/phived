import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { useTasksContext } from "src/contexts";

export const Head = () => {
  const { tasks } = useTasksContext();
  const [title, setTitle] = useState("phived");
  const [icon, setIcon] = useState("/favicon-default.ico");

  useEffect(() => {
    if (tasks.some((task) => !!task)) {
      setIcon("/favicon-alert.ico");
      setTitle(
        `[${tasks.filter((task) => !!task).length}] phived · the anti-procrastination to-do list`
      );
    } else {
      setIcon("/favicon-default.ico");
      setTitle("phived · the anti-procrastination to-do list");
    }
  }, [tasks]);

  return (
    <Helmet>
      <title>{title}</title>
      <link rel="icon" type="image/x-icon" href={icon} />
    </Helmet>
  );
};
