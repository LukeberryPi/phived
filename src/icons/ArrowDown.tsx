import { type DefaultSvgProps } from "src/utils/defaultSvgProps";

export function ArrowDown({ className, size = 26 }: DefaultSvgProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24">
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
