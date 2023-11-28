import { useEffect, useState } from "react";
import { Clock } from "src/icons";

function getTimeRemainingUntilMidnight() {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);

  const timeRemaining = midnight.getTime() - now.getTime();

  const hours = Math.floor((timeRemaining / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((timeRemaining / 1000 / 60) % 60);
  const seconds = Math.floor((timeRemaining / 1000) % 60);

  return {
    total: timeRemaining,
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
  };
}

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState(getTimeRemainingUntilMidnight());

  useEffect(() => {
    const interval = setInterval(() => {
      const time = getTimeRemainingUntilMidnight();
      setTimeLeft(time);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  return (
    <div className="mx-auto flex items-center gap-2">
      <Clock className="text-trueBlack dark:text-trueWhite" />
      <p className="tabular-nums text-trueBlack dark:text-trueWhite">
        {timeLeft.hours}:{timeLeft.minutes}:{timeLeft.seconds}
      </p>
    </div>
  );
}
