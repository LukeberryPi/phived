import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUp, Open } from "src/icons";
import { isDailyPage } from "src/utils";

export function ModeSelector() {
  const [showModes, setShowModes] = useState(false);

  const toggleShowModes = () => {
    setShowModes((showModes) => !showModes);
  };

  return (
    <div className="relative hidden md:flex">
      <div className="flex flex-col">
        <button onClick={toggleShowModes} className="flex items-center gap-3 text-sm xs:text-lg">
          <p className="text-trueBlack dark:text-trueWhite">switch tasks</p>
          <span className={`h-fit w-fit ${showModes ? "rotate-0" : "rotate-180"} transition-all`}>
            <ArrowUp className="fill-trueBlack dark:fill-trueWhite" />
          </span>
        </button>
      </div>
      {showModes && (
        <div className="absolute top-11 flex h-fit w-48 flex-col divide-y divide-trueBlack overflow-hidden rounded-2xl border border-trueBlack bg-softWhite shadow-brutalist-dark dark:divide-trueWhite dark:border-trueWhite dark:bg-softBlack dark:text-trueWhite dark:shadow-brutalist-light">
          <Link
            to="/"
            onClick={toggleShowModes}
            className="flex items-center justify-between px-5 py-3 text-sm xs:text-lg"
          >
            <div className="flex items-center gap-2">
              general
              <span className="h-2 w-2 rounded-full bg-berryBlue dark:bg-purpleRain" />
            </div>
            {isDailyPage() && <Open className="fill-trueBlack dark:fill-trueWhite" size={24} />}
          </Link>
          <Link
            to="/daily"
            onClick={toggleShowModes}
            className="relative flex items-center justify-between px-5 py-3 text-sm xs:text-lg"
          >
            <div className="flex items-center gap-2">
              daily
              <span className="h-2 w-2 rounded-full bg-dailyGreen dark:bg-dailyOrange" />
            </div>
            {!isDailyPage() && <Open className="fill-trueBlack dark:fill-trueWhite" size={24} />}
          </Link>
        </div>
      )}
    </div>
  );
}
