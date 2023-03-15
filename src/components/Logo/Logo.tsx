import { reloadPage } from "src/utils";

export function Logo() {
  return (
    <span
      onClick={reloadPage}
      className="text-darkerBlack mt-5 hidden cursor-pointer text-6xl font-bold dark:text-lighterWhite xs:block"
    >
      phived
    </span>
  );
}
