import type { DefaultSvgProps } from 'src/utils';

export function CaretUp({ className, size = 20 }: DefaultSvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Arrow Icon"
      width={size}
      height={size}
      viewBox="0 0 256 256"
    >
      <path
        className={className}
        d="M213.66 165.66a8 8 0 0 1-11.32 0L128 91.31l-74.34 74.35a8 8 0 0 1-11.32-11.32l80-80a8 8 0 0 1 11.32 0l80 80a8 8 0 0 1 0 11.32Z"
      />
    </svg>
  );
}
