import { useState, useEffect } from "react";
import { Footer, Header, Logo, Tasks } from "src/components";
import { reloadPage } from "src/utils";
import { footerContent, headerContent, logoContent } from "src/content";

export default function App() {
  const [taskList, setTaskList] = useState<Array<string>>(
    localStorage.getItem("persistentTasks")
      ? JSON.parse(localStorage.getItem("persistentTasks") || "")
      : Array(5).fill("")
  );
  const [darkMode, setDarkMode] = useState<boolean>(
    localStorage.getItem("darkMode") === "dark" ? true : false
  );

  useEffect(() => {
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    const title = document.querySelector("title") as HTMLTitleElement;
    if (taskList.some((task) => !!task)) {
      link.href = "/favicon-alert.png";
      title.innerText = `[${taskList.filter((e) => !!e).length}] phived`;
    } else {
      link.href = "/favicon-default.png";
      title.innerText = "phived";
    }
  }, [taskList]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "light");
    }
  }, [darkMode]);

  const clearTasks = () => {
    setTaskList(taskList.map((_) => ""));
    document.querySelector("input")?.focus();
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-sushiWhite selection:bg-berryBlue dark:bg-blackDawn dark:selection:bg-petrolBlue">
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
