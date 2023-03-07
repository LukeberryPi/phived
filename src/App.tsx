import { useState, useEffect } from "react";
import { Footer, Header, Logo, Tasks } from "src/components";
import { reloadPage } from "src/utils";
import { footerContent, headerContent, logoContent } from "src/content";

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(true);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  return (
    <main className="flex h-screen flex-col items-center justify-center bg-sushiWhite selection:bg-berryBlue dark:bg-blackDawn dark:selection:bg-channelOrange">
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        content={headerContent}
      />
      <Tasks />
      <Logo content={logoContent} onClick={reloadPage} />
      <Footer content={footerContent} />
    </main>
  );
}
