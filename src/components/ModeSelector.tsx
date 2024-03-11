import { Link } from "react-router-dom";
import { ArrowRight } from "src/icons";
import { isDailyPage } from "src/utils";

export function ModeSelector() {
  return (
    <Link
      aria-keyshortcuts="esc+g+g"
      to={isDailyPage() ? "/" : "/daily"}
      className={`text-trueBlack dark:text-trueWhite flex items-center gap-2 rounded-2xl px-4 py-2 transition-transform active:scale-95 ${
        isDailyPage()
          ? "ring-berryBlue hover:dark:ring-purpleRain hover:ring-2"
          : "hover:ring-dailyGreen hover:dark:ring-dailyPurple hover:ring-2"
      }`}
    >
      go to {isDailyPage() ? "general" : "daily"}
      <ArrowRight />
    </Link>
  );
}
