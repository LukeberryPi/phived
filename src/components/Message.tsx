import { useGeneralTasksContext } from "src/contexts";

export function Message() {
  const { generalMessage } = useGeneralTasksContext();

  return (
    <span
      className={`-mt-14 flex xs:-mt-16 ${
        !generalMessage && "invisible"
      } h-16 items-center rounded-2xl bg-softWhite px-4 text-3xl font-bold text-trueBlack dark:bg-trueBlack dark:text-trueWhite xs:text-4xl sm:text-5xl`}
    >
      {generalMessage}
    </span>
  );
}
