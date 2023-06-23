import type { DefaultSvgProps } from "src/utils/defaultSvgProps";

export function OpenApp({ className, size = 26 }: DefaultSvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Open App Icon"
      width={size}
      height={size}
      viewBox="0 0 500 500"
    >
      <g transform="translate(0, 500) scale(0.1, -0.1)" className={className}>
        <path
          d="M1145 3981 c-52 -23 -103 -74 -126 -126 -18 -38 -19 -103 -19 -1365
0 -1262 1 -1327 19 -1365 23 -52 74 -103 126 -126 38 -18 103 -19 1365 -19
1262 0 1327 1 1365 19 52 23 103 74 126 126 17 37 19 83 19 703 l0 662 -120 0
-120 0 -2 -632 -3 -633 -1265 0 -1265 0 0 1265 0 1265 633 3 632 2 0 120 0
120 -662 0 c-620 0 -666 -2 -703 -19z"
        />
        <path
          d="M3020 3880 l0 -120 285 0 c157 0 285 -3 285 -7 0 -5 -242 -250 -537
-545 l-538 -538 88 -87 87 -88 538 538 c295 295 540 537 545 537 4 0 7 -128 7
-285 l0 -285 120 0 121 0 -3 470 -3 470 -28 27 -27 28 -470 3 -470 3 0 -121z"
        />
      </g>
    </svg>
  );
}
