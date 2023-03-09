import { FooterProps } from "./Footer.types";

export const Footer = ({ content }: FooterProps) => {
  const anchorMap = content.map((anchor, i) => {
    return (
      <a
        key={i}
        className="text-lg decoration-berryBlue hover:underline dark:text-snowWhite dark:decoration-channelOrange"
        target="_blank"
        href={anchor.link}
      >
        {anchor.name}
      </a>
    );
  });

  return (
    <footer className=" fixed bottom-0 flex h-20 w-full justify-center px-10 md:justify-start">
      <div className="flex w-[320px] items-center justify-between text-center lg:w-1/4">
        {anchorMap}
      </div>
    </footer>
  );
};
