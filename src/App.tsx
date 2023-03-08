import { useState, useEffect } from "react";
import { Footer, Header, Logo, Tasks } from "src/components";
import { reloadPage } from "src/utils";
import { footerContent, headerContent, logoContent } from "src/content";

export default function App() {
  const [taskList, setTaskList] = useState(["", "", "", "", ""]);
  const [darkMode, setDarkMode] = useState<boolean>(true);

  useEffect(() => {
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    const title = document.querySelector("title") as HTMLTitleElement;
    if (taskList.some((task) => !!task)) {
      link.href = "/alert-icon.png";
      title.innerText = `[${taskList.filter((e) => !!e).length}] phived`;
    } else {
      link.href = "/default-icon.png";
      title.innerText = "phived";
    }
  }, [taskList]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const clearTasks = () => {
    setTaskList(taskList.map((_) => ""));
    document.querySelector("input")?.focus();
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-sushiWhite selection:bg-berryBlue dark:bg-blackDawn dark:selection:bg-channelOrange">
      <Header
        clearTasks={clearTasks}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        content={headerContent}
      />
      <Tasks taskList={taskList} setTaskList={setTaskList} />
      <Logo content={logoContent} onClick={reloadPage} />
      <Footer content={footerContent} />
    </div>
  );
}
