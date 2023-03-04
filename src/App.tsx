import { placeholders } from "./content";
import { getRandomElement, resetAllInputs, reloadPage } from "./utils";

export default function App(content: any) {
  const { ok } = content;

  return (
    <main className="flex h-screen flex-col items-center justify-center bg-sushiWhite selection:bg-berryBlue">
      <nav className="fixed top-0 flex h-16 w-full justify-center px-10 md:justify-end">
        <div className="flex w-[300px] justify-between md:w-1/5">
          <button className="text-lg decoration-berryBlue hover:underline">
            lights off
          </button>
          <button
            onClick={resetAllInputs}
            className="text-lg decoration-berryBlue hover:underline"
          >
            reset list
          </button>
          <button className="text-lg decoration-berryBlue hover:underline">
            why?
          </button>
        </div>
      </nav>
      <div className="border-black box-shadow-dark w-[360px] rounded-2xl border border-solid">
        <input
          type="text"
          autoFocus
          placeholder={getRandomElement(placeholders)}
          className="w-full rounded-t-2xl border-b py-4 px-5 text-lg focus:outline-none"
        />
        <input
          type="text"
          className="w-full border-b py-4 px-5 text-lg focus:outline-none"
        />
        <input
          type="text"
          className="w-full border-b py-4 px-5 text-lg focus:outline-none"
        />
        <input
          type="text"
          className="w-full border-b py-4 px-5 text-lg focus:outline-none"
        />
        <input
          type="text"
          className="w-full rounded-b-2xl py-4 px-5 text-lg focus:outline-none"
        />
      </div>
      <span
        onClick={reloadPage}
        className="mt-5 cursor-pointer text-5xl font-bold"
      >
        &#632; phived
      </span>
      <footer className=" fixed bottom-0 flex h-20 w-full justify-center px-10 md:justify-start">
        <div className="flex w-[300px] items-center justify-between md:w-1/5">
          <a
            className="text-lg decoration-berryBlue hover:underline"
            target="_blank"
            href="https://github.com/LukeberryPi/phived"
          >
            github
          </a>
          <a
            className="text-lg decoration-berryBlue hover:underline"
            target="_blank"
            href="https://twitter.com/phivedphived"
          >
            twitter
          </a>
          <a
            className="text-lg decoration-berryBlue hover:underline"
            target="_blank"
            href="https://twitter.com/lukeberrypi"
          >
            @lukeberrypi
          </a>
        </div>
      </footer>
    </main>
  );
}
