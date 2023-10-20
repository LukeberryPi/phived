import { useState } from "react";
import { ArrowUp } from "src/icons";

export function ModeSelector() {
  const [showModes, setShowModes] = useState(false);

  const toggleShowModes = () => {
    setShowModes((showModes) => !showModes);
  };

  return (
    <div className="flex flex-col">
      <button
        onClick={toggleShowModes}
        className="group relative flex items-center gap-2 text-sm xs:text-lg"
      >
        <p>general</p>
        <span className={`h-fit w-fit ${showModes ? "rotate-0" : "rotate-180"} transition-all`}>
          <ArrowUp />
        </span>
      </button>
      {showModes && <button className="h-fit w-full">switch to daily</button>}
    </div>
  );
}
