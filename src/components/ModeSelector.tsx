import { Link } from "react-router-dom";
import { ArrowRight } from "src/icons";
import { isDailyPage } from "src/utils";

export function ModeSelector() {
  return (
    <Link
      aria-keyshortcuts="esc+g+g"
      to={isDailyPage() ? "/" : "/daily"}
      className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-trueBlack transition-transform active:scale-95 dark:text-trueWhite ${
        isDailyPage()
          ? "hover:outline hover:outline-berryBlue hover:dark:outline-purpleRain"
          : "hover:outline hover:outline-dailyGreen hover:dark:outline-dailyPurple"
      }`}
    >
      go to {isDailyPage() ? "general" : "daily"}
      <ArrowRight />
    </Link>
  );
}
