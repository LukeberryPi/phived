import { useTasksContext } from "src/contexts";

export function Message() {
  const { message } = useTasksContext();

  return (
    <span
      className={`mt-5 flex ${
        !message && "invisible"
      } h-16 items-center bg-lighterWhite p-4 text-3xl font-bold text-darkerBlack dark:bg-darkerBlack dark:text-lighterWhite xs:text-4xl sm:text-5xl`}
    >
      {message}
    </span>
  );
}
