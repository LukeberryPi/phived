import { useEffect, useState } from "react";
import { createPortal } from 'react-dom';
import { Footer, Header, Logo, Tasks, Alert } from "src/components";
import { useLocalStorage } from "src/hooks";

export default function App() {
  const [tasks, setTasks] = useLocalStorage("persistentTasks", Array(5).fill(""));
  const [showAlert, setShowAlert] = useState<boolean>(false);

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

  const clearTasks = () => {
    setTasks(tasks.map((task) => ""));
    setShowAlert(true);
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-lightWhite selection:bg-berryBlue dark:bg-darkerBlack dark:selection:bg-purpleRain">
      <Header clearTasks={clearTasks} />
      <Tasks tasks={tasks} setTasks={setTasks} />
      <Logo />
      <Footer />
      {showAlert && createPortal(
        <Alert setShowAlert={setShowAlert}>Tasks cleared successfully</Alert>,
        document.body
      )}
    </div>
  );
}
