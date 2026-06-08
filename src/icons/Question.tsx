import type { DefaultSvgProps } from "src/utils";
import { cn } from "src/utils";

export function Question({ className, size = 20 }: DefaultSvgProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center font-light leading-none",
        className
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.85) }}
    >
      ?
    </span>
  );
}
