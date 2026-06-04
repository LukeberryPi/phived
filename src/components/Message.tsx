import { useGeneralTasksContext } from "src/contexts";
import { cn } from "src/utils";

export function Message() {
  const { generalMessage } = useGeneralTasksContext();

  return (
    <span
      className={cn(
        "-mt-14 flex h-24 items-center px-4 xs:-mt-16",
        "text-3xl font-bold text-black dark:text-white",
        "xs:text-4xl sm:text-5xl",
        !generalMessage && "invisible"
      )}
    >
      {generalMessage}
    </span>
  );
}
