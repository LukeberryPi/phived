import { type DefaultIconProps } from "src/utils/defaultIconProps";

export function DownloadPromptIcon({ className, squareWidthAndHeight = 26 }: DefaultIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={squareWidthAndHeight}
      height={squareWidthAndHeight}
      viewBox="0 0 26 26"
    >
      <path
        className={className}
        d="M18 15v3H6v-3H4v3c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-3h-2zm-1-4l-1.41-1.41L13 12.17V4h-2v8.17L8.41 9.59L7 11l5 5l5-5z"
      />
    </svg>
  );
}
