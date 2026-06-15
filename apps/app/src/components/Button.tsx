import type { ButtonHTMLAttributes } from "react";
import { forwardRef } from "react";
import {
  buttonVariants,
  type ButtonVariants,
} from "@phived/ui/button-variants";
import { cn } from "src/utils";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonVariants;

/**
 * Thin local wrapper over the shared @phived/ui button-variants. The JSX lives
 * here (in the app's own source) so Vite's React transform applies normally —
 * the shared package stays pure TypeScript. forwardRef lets this be used
 * directly as a <Tooltip> child.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
);

Button.displayName = "Button";
