import type { PropsWithChildren } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";
import type { ThemePreference } from "src/utils/handleSetTheme";
import { getStoredThemePreference, handleSetTheme } from "src/utils";

type ThemeContextValue = {
  isDarkMode: boolean;
  themePreference: ThemePreference;
  toggleDarkMode: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const systemDarkModeQuery = "(prefers-color-scheme: dark)";
const themePreferenceCycle: ThemePreference[] = ["system", "dark", "light"];

const themeToastMessages: Record<ThemePreference, string> = {
  system: 'set to "follow your OS preference"',
  dark: 'set to "always dark mode"',
  light: 'set to "always light mode"',
};

function getSystemPrefersDark() {
  return window.matchMedia(systemDarkModeQuery).matches;
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const [themePreference, setThemePreference] = useState(
    getStoredThemePreference
  );
  const [systemPrefersDark, setSystemPrefersDark] =
    useState(getSystemPrefersDark);
  const isDarkMode =
    themePreference === "dark" ||
    (themePreference === "system" && systemPrefersDark);

  useEffect(() => {
    const mediaQuery = window.matchMedia(systemDarkModeQuery);
    const handleChange = (event: MediaQueryListEvent) => {
      setSystemPrefersDark(event.matches);
    };

    setSystemPrefersDark(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    handleSetTheme(themePreference, isDarkMode);
  }, [isDarkMode, themePreference]);

  const toggleDarkMode = useCallback(() => {
    setThemePreference((current) => {
      const currentIndex = themePreferenceCycle.indexOf(current);
      const next =
        themePreferenceCycle[
          (currentIndex + 1) % themePreferenceCycle.length
        ];
      toast(themeToastMessages[next]);
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider
      value={{ isDarkMode, themePreference, toggleDarkMode }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useDarkMode() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useDarkMode must be used within ThemeProvider");
  }

  return context;
}
