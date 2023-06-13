import { type DefaultIconProps } from "src/utils/defaultIconProps";

export function InstallIcon({ className, widthAndHeight = 22 }: DefaultIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={widthAndHeight}
      height={widthAndHeight}
      viewBox="0 0 256 256"
    >
      <path
        className={className}
        d="M224 152v56a16 16 0 0 1-16 16H48a16 16 0 0 1-16-16v-56a8 8 0 0 1 16 0v56h160v-56a8 8 0 0 1 16 0Zm-101.66 5.66a8 8 0 0 0 11.32 0l40-40a8 8 0 0 0-11.32-11.32L136 132.69V40a8 8 0 0 0-16 0v92.69l-26.34-26.35a8 8 0 0 0-11.32 11.32Z"
      />
    </svg>
  );
}
