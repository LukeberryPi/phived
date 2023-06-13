import { type DefaultIconProps } from "src/utils/defaultIconProps";

export function ArrowDownIcon({ className, widthAndHeight = 26 }: DefaultIconProps) {
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
        d="m7 10l5 5l5-5"
      />
    </svg>
  );
}
