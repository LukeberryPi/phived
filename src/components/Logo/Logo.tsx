import { LogoProps } from "./Logo.types";

export function Logo({ content, onClick }: LogoProps) {
  const handleLogoClick = () => {
    onClick && onClick();
  };

  return (
    <span
      onClick={handleLogoClick}
      className="mt-5 hidden cursor-pointer text-6xl font-bold text-blackDawn dark:text-snowWhite xs:block"
    >
      {content.logoName}
    </span>
  );
}
