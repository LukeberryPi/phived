import { type DefaultIconProps } from "src/utils/defaultIconProps";

export function ArrowUpIcon({ className, widthAndHeight = 26 }: DefaultIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={widthAndHeight}
      height={widthAndHeight}
      viewBox="0 0 24 24"
    >
      <path
        fill="none"
        className={className}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m17 14l-5-5l-5 5"
      />
    </svg>
  );
}
