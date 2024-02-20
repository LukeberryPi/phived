import { Link } from "react-router-dom";
import { ArrowRight } from "src/icons";
import { isDailyPage } from "src/utils";

export function ModeSelectorMobile() {
  return (
    <Link
      to={isDailyPage() ? "/" : "/daily"}
      className={`absolute top-6 flex items-center gap-2 rounded-2xl px-4 py-2 text-trueBlack outline transition-transform active:scale-95 dark:text-trueWhite sm:hidden ${
        isDailyPage()
          ? "outline-berryBlue dark:outline-purpleRain"
          : "outline-dailyGreen dark:outline-dailyPurple"
      }`}
    >
      go to {isDailyPage() ? "general" : "daily"}
      <ArrowRight />
    </Link>
  );
}
