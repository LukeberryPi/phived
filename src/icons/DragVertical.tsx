import type { DefaultSvgProps } from "src/utils/defaultSvgProps";

export function DragVertical({ className, size = 26 }: DefaultSvgProps) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Drag Icon"
      width={size}
      height={size}
      viewBox="0 0 256 256"
    >
      <path
        className={className}
        d="M178.83 173.17a4 4 0 0 1 0 5.66l-48 48a4 4 0 0 1-5.66 0l-48-48a4 4 0 0 1 5.66-5.66L128 218.34l45.17-45.17a4 4 0 0 1 5.66 0Zm-96-90.34L128 37.66l45.17 45.17a4 4 0 1 0 5.66-5.66l-48-48a4 4 0 0 0-5.66 0l-48 48a4 4 0 0 0 5.66 5.66Z"
      />
    </svg>
  );
}
