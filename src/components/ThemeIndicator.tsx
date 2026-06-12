import { Computer, Moon, Sun } from "src/icons";
import type { ThemePreference } from "src/utils/handleSetTheme";

type ThemeIndicatorProps = {
  preference: ThemePreference;
  className?: string;
  showLabel?: boolean;
};

export function ThemeIndicator({
  preference,
  className,
  showLabel = false,
}: ThemeIndicatorProps) {
  const Icon =
    preference === "system" ? Computer : preference === "dark" ? Moon : Sun;

  return (
    <>
      <Icon size={20} className={className} />
      {showLabel && preference}
    </>
  );
}
