import { type DefaultIconProps } from "src/utils/defaultIconProps";

export function DownloadDoneIcon({ className, squareWidthAndHeight = 26 }: DefaultIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={squareWidthAndHeight}
      height={squareWidthAndHeight}
      viewBox="0 0 24 24"
    >
      <path
        className={className}
        d="M20.13 5.41L18.72 4l-9.19 9.19l-4.25-4.24l-1.41 1.41l5.66 5.66zM5 18h14v2H5z"
      />
    </svg>
  );
}
