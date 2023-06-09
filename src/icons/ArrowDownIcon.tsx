import { type DefaultIconProps } from "src/utils/defaultIconProps";

export function ArrowDownIcon({ className, squareWidthAndHeight = 28 }: DefaultIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={squareWidthAndHeight}
      height={squareWidthAndHeight}
      viewBox="1 0 24 24"
      // viewBox="8 8 16 8"
    >
      <path className={className} d="M16.59 8.59L12 13.17L7.41 8.59L6 10l6 6l6-6z" />
    </svg>
  );
}
