import { Link } from "react-router-dom";
import { ArrowRight } from "src/icons";
import { isDailyPage } from "src/utils";

export function ModeSelectorMobile() {
  return (
    <Link
      to={isDailyPage() ? "/" : "/daily"}
      className={`absolute top-6 flex items-center gap-2 rounded-lg py-1 px-3 text-trueBlack outline dark:text-trueWhite sm:hidden ${
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
