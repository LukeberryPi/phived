import { FooterProps } from "./Footer.types";

export function Footer({ content }: FooterProps) {
  const anchorMap = content.map((anchor, i) => {
    return (
      <a
        key={i}
        className="underline-offset-4 font-medium flex h-full items-center text-base text-blackDawn decoration-petrolBlue hover:underline dark:text-snowWhite dark:decoration-berryBlue sm:pr-2 sm:text-lg"
        target="_blank"
        href={anchor.link}
      >
        {anchor.name}
      </a>
    );
  });

  return (
    <footer className="fixed bottom-0 flex h-16 w-full items-center justify-center sm:justify-start">
      <div className="flex h-full w-64 items-center justify-between xs:w-80 sm:w-96 sm:pl-10">
        {anchorMap}
      </div>
    </footer>
  );
}
