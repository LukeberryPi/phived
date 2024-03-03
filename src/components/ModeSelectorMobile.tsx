import { Link } from 'react-router-dom';
import { ArrowRight } from 'src/icons';
import { isDailyPage } from 'src/utils';

export function ModeSelectorMobile() {
  return (
    <Link
      aria-keyshortcuts="esc+g+g"
      to={isDailyPage() ? '/' : '/daily'}
      className={`absolute top-6 flex items-center gap-2 rounded-2xl px-4 py-2 text-trueBlack ring-2 transition-transform active:scale-95 dark:text-trueWhite sm:hidden ${
        isDailyPage()
          ? 'ring-berryBlue dark:ring-purpleRain'
          : 'ring-dailyGreen dark:ring-dailyPurple'
      }`}
    >
      go to {isDailyPage() ? 'general' : 'daily'}
      <ArrowRight />
    </Link>
  );
}
