import { useDailyTasksContext, useGeneralTasksContext } from 'src/contexts';

export function Message() {
  const { generalMessage } = useGeneralTasksContext();
  const { dailyMessage } = useDailyTasksContext();

  return (
    <span
      className={`-mt-14 flex xs:-mt-16 ${
        !generalMessage && !dailyMessage && 'invisible'
      } h-24 items-center px-4 text-3xl font-bold text-trueBlack dark:text-trueWhite xs:text-4xl sm:text-5xl`}
    >
      {generalMessage || dailyMessage}
    </span>
  );
}
