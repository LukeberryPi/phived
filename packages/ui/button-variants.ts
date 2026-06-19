import { cva, type VariantProps } from "class-variance-authority";

/**
 * Single styling source of truth for buttons across @phived/app and
 * @phived/web. Pure TypeScript (no JSX) so it resolves cleanly from this
 * workspace package in both Vite and Astro, exactly like @phived/tokens.
 *
 * Distilled from apps/app's real button language:
 *  - base mirrors `pressFeedbackClassName` (apps/app/src/constants/motion.ts)
 *  - `accent` is the `done` button / count badge surface (sky-300 / cyan-800)
 *  - `ghost` is the header/canvas-control hover-bg action
 *  - `surface` inlines `.task-panel` (so it needs no app-only CSS)
 *  - `destructive` is the red dialog-confirm / clear-history treatment
 *
 * Only utilities backed by @phived/tokens (surface-hover-*, edge-dark,
 * ink-dark, surface-dark) plus Tailwind defaults (sky-300, cyan-800, red-*)
 * are used, so the same class string compiles in both apps.
 */
export const buttonVariants = cva(
  [
    "inline-flex select-none items-center justify-center gap-2 font-medium",
    "transition-[transform,filter,background-color] duration-150 ease-out-strong motion-reduce:transform-none active:scale-95 active:brightness-90",
    "focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        accent:
          "border border-black bg-sky-300 text-black hover:brightness-95 dark:border-edge-dark dark:bg-cyan-800 dark:text-ink-dark dark:hover:brightness-125",
        ghost:
          "text-black hover:bg-surface-hover-light dark:text-ink-dark dark:hover:bg-surface-hover-dark",
        surface:
          "border border-black bg-white text-black hover:bg-surface-hover-light dark:border-edge-dark dark:bg-surface-dark dark:text-ink-dark dark:hover:bg-surface-hover-dark",
        destructive:
          "text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-950",
      },
      size: {
        sm: "min-h-9 rounded-xl px-3 text-sm",
        default: "min-h-12 rounded-2xl px-4 text-sm",
        lg: "rounded-2xl px-7 py-3.5 text-base",
        icon: "size-9 rounded-full",
        "icon-sm": "size-8 rounded-full",
      },
    },
    defaultVariants: {
      variant: "ghost",
      size: "default",
    },
  }
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
