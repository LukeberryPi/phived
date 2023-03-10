import { LogoProps } from "./Logo.types";

export function Logo({ content, onClick }: LogoProps) {
  const handleLogoClick = () => {
    onClick && onClick();
  };

  return (
    <h1
      onClick={handleLogoClick}
      className="mt-5 cursor-pointer text-5xl font-bold dark:text-snowWhite sm:text-6xl"
    >
      &#632; {content.logoName}
    </h1>
  );
}
