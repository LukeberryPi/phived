import { type DefaultIconProps } from "src/utils/defaultIconProps";

export function ArrowUpIcon({ className, squareWidthAndHeight = 30 }: DefaultIconProps) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={squareWidthAndHeight}
      height={squareWidthAndHeight}
      viewBox="1 0 24 24"
    >
      <path className={className} d="m12 8l-6 6l1.41 1.41L12 10.83l4.59 4.58L18 14z" />
    </svg>
  );
}
