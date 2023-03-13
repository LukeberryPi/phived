import { useEffect } from "react";
import { Footer, Header, Logo, Tasks } from "src/components";
import { reloadPage } from "src/utils";
import { footerContent, headerContent, logoContent } from "src/content";
import { useLocalStorage } from "src/hooks";

export default function App() {
  const [tasks, setTasks] = useLocalStorage("persistentTasks", Array(5).fill(""));

  useEffect(() => {
    const tabIcon = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    const tabTitle = document.querySelector("title") as HTMLTitleElement;

    if (tasks.some((task) => !!task)) {
      tabIcon.href = "/favicon-alert.png";
      tabTitle.innerText = `[${tasks.filter((e) => !!e).length}] phived`;
    } else {
      tabIcon.href = "/favicon-default.png";
      tabTitle.innerText = "phived";
    }
  }, [tasks]);

  const clearTasks = () => {
    setTasks(
      tasks.map((_) => {
        return "";
      })
    );
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-sushiWhite selection:bg-berryBlue dark:bg-blackDawn dark:selection:bg-petrolBlue">
      <Header clearTasks={clearTasks} content={headerContent} />
      <Tasks tasks={tasks} setTasks={setTasks} />
      <Logo content={logoContent} onClick={reloadPage} />
      <Footer content={footerContent} />
    </div>
  );
}
