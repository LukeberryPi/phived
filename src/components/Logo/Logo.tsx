import { reloadPage } from "src/utils";

export function Logo() {
  return (
    <span
      onClick={reloadPage}
      className="mt-5 hidden cursor-pointer text-6xl font-bold text-blackDawn dark:text-snowWhite xs:block"
    >
      phived
    </span>
  );
}
