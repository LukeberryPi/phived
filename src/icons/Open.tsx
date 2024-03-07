import { DefaultSvgProps } from "src/utils";

export function Open({ className, size = 32 }: DefaultSvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
    >
      <path
        fill="currentColor"
        d="M26 28H6a2.003 2.003 0 0 1-2-2V6a2.003 2.003 0 0 1 2-2h10v2H6v20h20V16h2v10a2.003 2.003 0 0 1-2 2"
      ></path>
      <path
        fill="currentColor"
        d="M20 2v2h6.586L18 12.586L19.414 14L28 5.414V12h2V2z"
      ></path>
    </svg>
  );
}
