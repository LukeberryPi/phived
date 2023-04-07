import { useTasksContext } from "src/contexts";

export function Logo() {
  const { incentiveMessage } = useTasksContext();

  const reloadPage = () => {
    location.reload();
    return;
  };

  return (
    <span
      onClick={reloadPage}
      className={`mt-5 hidden ${
        incentiveMessage === "phived" ? "cursor-pointer" : ""
      } text-6xl font-bold text-darkerBlack transition-opacity duration-200 dark:text-lighterWhite xs:block`}
    >
      {incentiveMessage}
    </span>
  );
}
