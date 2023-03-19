import { useContext, useEffect } from "react";
import { Footer, Header, Logo, Tasks } from "src/components";
import { TasksContext } from "./contexts/TasksContext";

export default function App() {
  const { tasks } = useContext(TasksContext);

  useEffect(() => {
    const icon = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    const title = document.querySelector("title") as HTMLTitleElement;
    if (tasks.some((task) => !!task)) {
      icon.href = "/favicon-alert.ico";
      title.innerText = `[${tasks.filter((task) => !!task).length}] phived`;
    } else {
      icon.href = "/favicon-default.ico";
      title.innerText = "phived";
    }
  }, [tasks]);

  return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-lightWhite selection:bg-berryBlue dark:bg-darkerBlack dark:selection:bg-purpleRain">
        <Header />
        <Tasks />
        <Logo />
        <Footer />
      </div>
  );
}
