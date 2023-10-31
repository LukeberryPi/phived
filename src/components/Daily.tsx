import { HelmetProvider } from "react-helmet-async";
import { Footer, Header, Message, DailyTasks, Head } from "src/components";

export function Daily() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-softWhite dark:bg-trueBlack">
      <HelmetProvider>
        <Head />
      </HelmetProvider>
      <Header />
      <DailyTasks />
      <Message />
      <Footer />
    </div>
  );
}
