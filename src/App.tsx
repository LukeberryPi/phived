import { HelmetProvider } from "react-helmet-async";
import { Footer, Header, Logo, Tasks, Head } from "src/components";
import { useLocalStorage } from "src/hooks";

export default function App() {
  const [tasks, setTasks] = useLocalStorage("persistentTasks", Array(5).fill(""));

  const clearTasks = () => {
    setTasks(tasks.map(() => ""));
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-lightWhite selection:bg-berryBlue dark:bg-darkerBlack dark:selection:bg-purpleRain">
      <HelmetProvider>
        <Head tasks={tasks} />
      </HelmetProvider>
      <Header clearTasks={clearTasks} />
      <Tasks tasks={tasks} setTasks={setTasks} />
      <Logo />
      <Footer />
    </div>
  );
}