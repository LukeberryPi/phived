import { useGeneralTasksContext } from "src/contexts";

export function Message() {
  const { message } = useGeneralTasksContext();

  return (
    <span
      className={`-mt-14 flex xs:-mt-16 ${
        !message && "invisible"
      } z-10 h-16 items-center rounded-2xl bg-softWhite px-4 text-3xl font-bold text-trueBlack dark:bg-trueBlack dark:text-trueWhite xs:text-4xl sm:text-5xl`}
    >
      {message}
    </span>
  );
}
