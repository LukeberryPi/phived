import type { DefaultSvgProps } from "src/utils";

export function Lock({ className, size = 20 }: DefaultSvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      className={className}
      height={size}
      viewBox="0 0 256 256"
    >
      <path
        fill="currentColor"
        d="M208 80h-32V56a48 48 0 0 0-96 0v24H48a16 16 0 0 0-16 16v112a16 16 0 0 0 16 16h160a16 16 0 0 0 16-16V96a16 16 0 0 0-16-16M96 56a32 32 0 0 1 64 0v24H96Zm112 152H48V96h160zm-68-56a12 12 0 1 1-12-12a12 12 0 0 1 12 12"
      />
    </svg>
  );
}
