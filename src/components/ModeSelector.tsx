import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUp, OpenApp } from "src/icons";

export function ModeSelector() {
  const [showModes, setShowModes] = useState(false);

  const toggleShowModes = () => {
    setShowModes((showModes) => !showModes);
  };

  function isDailyPage() {
    return window.location.href.includes("daily");
  }

  return (
    <div className="relative hidden lg:flex">
      <div className="flex flex-col">
        <button onClick={toggleShowModes} className="flex items-center gap-3 text-sm xs:text-lg">
          <p>switch mode</p>
          <span className={`h-fit w-fit ${showModes ? "rotate-0" : "rotate-180"} transition-all`}>
            <ArrowUp />
          </span>
        </button>
      </div>
      {showModes && (
        <div className="absolute top-11 flex h-fit w-48 flex-col divide-y divide-trueBlack overflow-hidden rounded-2xl border border-trueBlack shadow-brutalist-dark">
          <Link
            to="/"
            onClick={toggleShowModes}
            className="flex items-center justify-between px-5 py-3 text-sm xs:text-lg"
          >
            general
            {isDailyPage() && <OpenApp size={24} />}
          </Link>
          <Link
            to="/daily"
            onClick={toggleShowModes}
            className="relative flex items-center justify-between px-5 py-3 text-sm xs:text-lg"
          >
            daily
            {!isDailyPage() && <OpenApp size={24} />}
          </Link>
        </div>
      )}
    </div>
  );
}
