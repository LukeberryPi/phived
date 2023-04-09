import { useTasksContext } from "src/contexts";

export function Message() {
  const { message } = useTasksContext();

  return (
    <div className="flex items-center justify-center">
      <span
        className={
          "mt-5 hidden h-16 cursor-pointer text-5xl font-bold text-darkerBlack dark:text-lighterWhite xs:block"
        }
      >
        {message}
      </span>
      {message && (
        <button className="ml-5 cursor-pointer self-center rounded-2xl bg-alertRed p-1 dark:bg-alertRed dark:text-lighterWhite xs:text-lg">
          undo
        </button>
      )}
    </div>
  );
}
