import { Link } from "react-router-dom";
import { ArrowRight } from "src/icons";
import { isDailyPage } from "src/utils";

export function ModeSelector() {
  return (
    <Link
      to={isDailyPage() ? "/" : "/daily"}
      className={`flex items-center gap-2 rounded-lg px-3 py-1 text-trueBlack transition-transform active:scale-95 dark:text-trueWhite ${
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
