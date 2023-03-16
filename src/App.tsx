import { useEffect } from "react";
import { Footer, Header, Logo, Tasks } from "src/components";
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
    setTasks(tasks.map((task) => ""));
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-lightWhite selection:bg-berryBlue dark:bg-darkerBlack dark:selection:bg-purpleRain">
      <Header clearTasks={clearTasks} />
      <span aria-hidden="true" className="top-16 mb-6 block text-xs dark:text-lightWhite md:hidden">
        🚧 touch functionality under work 🚧
      </span>
      <Tasks tasks={tasks} setTasks={setTasks} />
      <Logo />
      <Footer />
    </div>
  );
}
