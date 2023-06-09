import { useTasksContext } from "src/contexts";

export function Message() {
  const { message } = useTasksContext();

  return (
    <span
      className={
        "mt-5 inline-block h-16 text-3xl font-bold text-darkerBlack dark:text-lighterWhite xs:text-4xl sm:text-5xl"
      }
    >
      {message}
    </span>
  );
}
