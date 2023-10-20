import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter } from "react-router-dom";
import { Footer, Header, Message, Tasks, Head } from "src/components";

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-full w-full flex-col items-center justify-center bg-softWhite selection:bg-berryBlue dark:bg-trueBlack dark:selection:bg-purpleRain">
        <HelmetProvider>
          <Head />
        </HelmetProvider>
        <Header />
        <Tasks />
        <Message />
        <Footer />
      </div>
    </BrowserRouter>
  );
}
