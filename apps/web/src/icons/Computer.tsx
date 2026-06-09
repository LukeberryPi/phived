import type { DefaultSvgProps } from "src/utils";

export function Computer({ className, size = 24 }: DefaultSvgProps) {
  return (
    <svg
      aria-label="Computer Icon"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 256 256"
    >
      <path
        className={className}
        d="M216 48H40a16 16 0 0 0-16 16v112a16 16 0 0 0 16 16h72v16H88a8 8 0 0 0 0 16h80a8 8 0 0 0 0-16h-24v-16h72a16 16 0 0 0 16-16V64a16 16 0 0 0-16-16Zm0 128H40V64h176Z"
      />
    </svg>
  );
}
