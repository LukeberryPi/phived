import { LogoProps } from "./Logo.types"

export const Logo = ({ phi, title }: LogoProps) => {
  return <h1 className="font-bold text-3xl">{phi} {title}</h1>;
}