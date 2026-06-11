import {
  ArrowsOutCardinal,
  CaretDown as CaretDownIcon,
  CaretUpDown,
  Clock as ClockIcon,
  Desktop,
  Keyboard as KeyboardIcon,
  Minus as MinusIcon,
  Moon as MoonIcon,
  Plus as PlusIcon,
  Question as QuestionIcon,
  Sun as SunIcon,
  Trash as TrashIcon,
  X,
} from "@phosphor-icons/react";
import type { DefaultSvgProps } from "src/utils";

type IconProps = DefaultSvgProps;

/** Phosphor icons use currentColor; map legacy fill-* classes from hand-rolled SVGs. */
function phosphorClassName(className?: string) {
  return className?.replace(/\bfill-/g, "text-");
}

export function ArrowsMove({ className, size = 24 }: IconProps) {
  return (
    <ArrowsOutCardinal
      size={size}
      className={phosphorClassName(className)}
      aria-hidden
    />
  );
}

export function DragVertical({ className, size = 20 }: IconProps) {
  return (
    <CaretUpDown
      size={size}
      className={phosphorClassName(className)}
      aria-hidden
    />
  );
}

export function CaretDown({ className, size = 24 }: IconProps) {
  return (
    <CaretDownIcon
      size={size}
      className={phosphorClassName(className)}
      aria-hidden
    />
  );
}

export function Moon({ className, size = 24 }: IconProps) {
  return (
    <MoonIcon
      size={size}
      className={phosphorClassName(className)}
      aria-hidden
    />
  );
}

export function Sun({ className, size = 24 }: IconProps) {
  return (
    <SunIcon size={size} className={phosphorClassName(className)} aria-hidden />
  );
}

export function Trash({ className, size = 24 }: IconProps) {
  return (
    <TrashIcon
      size={size}
      className={phosphorClassName(className)}
      aria-hidden
    />
  );
}

export function Question({ className, size = 24 }: IconProps) {
  return (
    <QuestionIcon
      size={size}
      className={phosphorClassName(className)}
      aria-hidden
    />
  );
}

export function Clock({ className, size = 20 }: IconProps) {
  return (
    <ClockIcon
      size={size}
      className={phosphorClassName(className)}
      aria-hidden
    />
  );
}

export function Computer({ className, size = 24 }: IconProps) {
  return (
    <Desktop size={size} className={phosphorClassName(className)} aria-hidden />
  );
}

export function Keyboard({ className, size = 24 }: IconProps) {
  return (
    <KeyboardIcon
      size={size}
      className={phosphorClassName(className)}
      aria-hidden
    />
  );
}

export function Close({ className, size = 24 }: IconProps) {
  return <X size={size} className={phosphorClassName(className)} aria-hidden />;
}

export function Plus({ className, size = 24 }: IconProps) {
  return (
    <PlusIcon
      size={size}
      className={phosphorClassName(className)}
      aria-hidden
    />
  );
}

export function Minus({ className, size = 24 }: IconProps) {
  return (
    <MinusIcon
      size={size}
      className={phosphorClassName(className)}
      aria-hidden
    />
  );
}
