import { useEffect } from "react";
import { Footer, Header, Logo, Tasks } from "src/components";
import { reloadPage } from "src/utils";
import { footerContent, headerContent, logoContent } from "src/content";
import { useLocalStorage } from "src/hooks";

export default function App() {
  const [tasks, setTasks] = useLocalStorage("persistentTasks", Array(5).fill(""));

  useEffect(() => {
    const icon = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    const title = document.querySelector("title") as HTMLTitleElement;

    if (tasks.some((task) => !!task)) {
      icon.href = "/favicon-alert.png";
      title.innerText = `[${tasks.filter((task) => !!task).length}] phived`;
    } else {
      icon.href = "/favicon-default.png";
      title.innerText = "phived";
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
