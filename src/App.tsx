import { HelmetProvider } from "react-helmet-async";
import { Footer, Header, Logo, Tasks, Head } from "src/components";

export default function App() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-lightWhite selection:bg-berryBlue dark:bg-darkerBlack dark:selection:bg-purpleRain">
      <HelmetProvider>
        <Head />
      </HelmetProvider>
      <Header />
      <Tasks />
      <Logo />
      <Footer />
    </div>
  );
}
