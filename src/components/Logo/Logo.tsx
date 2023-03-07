import { LogoProps } from "./Logo.types";

export const Logo = ({ content, onClick }: LogoProps) => {
  const handleLogoClick = () => {
    onClick && onClick();
  };

  return (
    <h1
      onClick={handleLogoClick}
      className="mt-5 cursor-pointer text-6xl font-bold dark:text-snowWhite"
    >
      &#632; {content.logoName}
    </h1>
  );
};
