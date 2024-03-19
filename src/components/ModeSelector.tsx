import { Link } from "react-router-dom";
import { ArrowRight } from "src/icons";
import { isDailyPage } from "src/utils";

export function ModeSelector() {
  return (
    <Link
      aria-keyshortcuts="esc+g+g"
      to={isDailyPage() ? "/" : "/daily"}
      className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-black transition-transform active:scale-95 dark:text-white ${
        isDailyPage()
          ? "ring-sky-300 hover:ring-2 hover:dark:ring-cyan-800"
          : "hover:ring-2 hover:ring-teal-300 hover:dark:ring-emerald-800"
      }`}
    >
      go to {isDailyPage() ? "general" : "daily"}
      <ArrowRight />
    </Link>
  );
}
