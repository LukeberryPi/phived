import type { DefaultSvgProps } from "src/utils";

export function Keyboard({ className, size = 24 }: DefaultSvgProps) {
  return (
    <svg
      aria-label="Keyboard Icon"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 256 256"
    >
      <path
        className={className}
        fillRule="evenodd"
        d="M44 72h168a20 20 0 0 1 20 20v72a20 20 0 0 1-20 20H44a20 20 0 0 1-20-20V92a20 20 0 0 1 20-20Zm6 16h156a10 10 0 0 1 10 10v60a10 10 0 0 1-10 10H50a10 10 0 0 1-10-10V98a10 10 0 0 1 10-10Zm9 16h6a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3v-6a3 3 0 0 1 3-3Zm30 0h6a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3v-6a3 3 0 0 1 3-3Zm30 0h6a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3v-6a3 3 0 0 1 3-3Zm30 0h6a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3v-6a3 3 0 0 1 3-3Zm30 0h6a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3v-6a3 3 0 0 1 3-3Zm-133 28h104a4 4 0 0 1 4 4v4a4 4 0 0 1-4 4H76a4 4 0 0 1-4-4v-4a4 4 0 0 1 4-4Z"
      />
    </svg>
  );
}
