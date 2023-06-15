import type { DefaultSvgProps } from "src/utils/defaultSvgProps";

export function Check({ className, size = 20 }: DefaultSvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Check Icon"
      width={size}
      height={size}
      viewBox="0 0 256 256"
    >
      <path d="m229.66 77.66l-128 128a8 8 0 0 1-11.32 0l-56-56a8 8 0 0 1 11.32-11.32L96 188.69L218.34 66.34a8 8 0 0 1 11.32 11.32Z" />
    </svg>
  );
}
