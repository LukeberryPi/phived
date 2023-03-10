import { FooterProps } from "./Footer.types";

export function Footer({ content }: FooterProps) {
  const anchorMap = content.map((anchor, i) => {
    return (
      <a
        key={i}
        className="flex h-full items-center text-base text-blackDawn decoration-petrolBlue hover:underline dark:text-snowWhite dark:decoration-berryBlue xs:pr-2 xs:text-lg"
        target="_blank"
        href={anchor.link}
      >
        {anchor.name}
      </a>
    );
  });

  return (
    <footer className="fixed bottom-0 flex h-20 w-full items-center justify-center xs:justify-start">
      <div className="flex h-full w-64 items-center justify-between xs:w-96 xs:pl-10">
        {anchorMap}
      </div>
    </footer>
  );
}
