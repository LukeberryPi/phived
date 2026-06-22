import {
  ArrowCounterClockwise,
  ArrowDown as PhArrowDown,
  ArrowLeft as ArrowLeftIcon,
  ArrowUp as PhArrowUp,
  ArrowsOutCardinal,
  CaretDown as CaretDownIcon,
  CaretRight as CaretRightIcon,
  Check as CheckIcon,
  Crosshair,
  CaretUpDown,
  Clock as ClockIcon,
  Command as PhCommand,
  Control as PhControl,
  Desktop,
  Export as ExportIcon,
  FileCode,
  FileText,
  Globe as GlobeIcon,
  Keyboard as KeyboardIcon,
  Minus as MinusIcon,
  Moon as MoonIcon,
  Option as PhOption,
  Plus as PlusIcon,
  Question as QuestionIcon,
  Sun as SunIcon,
  Trash as TrashIcon,
  X,
  XCircle,
} from "@phosphor-icons/react";
import type { DefaultSvgProps } from "src/utils";

type IconProps = DefaultSvgProps;

export function ArrowsMove({ className, size = 24 }: IconProps) {
  return <ArrowsOutCardinal size={size} className={className} aria-hidden />;
}

export function Focus({ className, size = 24 }: IconProps) {
  return <Crosshair size={size} className={className} aria-hidden />;
}

export function DragVertical({ className, size = 16 }: IconProps) {
  return <CaretUpDown size={size} className={className} aria-hidden />;
}

export function Check({ className, size = 18 }: IconProps) {
  return <CheckIcon size={size} className={className} aria-hidden />;
}

export function CaretDown({ className, size = 24 }: IconProps) {
  return <CaretDownIcon size={size} className={className} aria-hidden />;
}

export function CaretRight({ className, size = 24 }: IconProps) {
  return <CaretRightIcon size={size} className={className} aria-hidden />;
}

export function Export({ className, size = 24 }: IconProps) {
  return <ExportIcon size={size} className={className} aria-hidden />;
}

export function MarkdownFile({ className, size = 24 }: IconProps) {
  return <FileText size={size} className={className} aria-hidden />;
}

export function JsonFile({ className, size = 24 }: IconProps) {
  return <FileCode size={size} className={className} aria-hidden />;
}

export function Globe({ className, size = 24 }: IconProps) {
  return <GlobeIcon size={size} className={className} aria-hidden />;
}

export function Moon({ className, size = 24 }: IconProps) {
  return <MoonIcon size={size} className={className} aria-hidden />;
}

export function Sun({ className, size = 24 }: IconProps) {
  return <SunIcon size={size} className={className} aria-hidden />;
}

export function Trash({ className, size = 24 }: IconProps) {
  return <TrashIcon size={size} className={className} aria-hidden />;
}

export function Restore({ className, size = 24 }: IconProps) {
  return (
    <ArrowCounterClockwise size={size} className={className} aria-hidden />
  );
}

export function Back({ className, size = 24 }: IconProps) {
  return <ArrowLeftIcon size={size} className={className} aria-hidden />;
}

export function ArrowUp({ className, size = 24 }: IconProps) {
  return <PhArrowUp size={size} className={className} aria-hidden />;
}

export function ArrowDown({ className, size = 24 }: IconProps) {
  return <PhArrowDown size={size} className={className} aria-hidden />;
}

export function Question({ className, size = 24 }: IconProps) {
  return <QuestionIcon size={size} className={className} aria-hidden />;
}

export function Clock({ className, size = 20 }: IconProps) {
  return <ClockIcon size={size} className={className} aria-hidden />;
}

export function Computer({ className, size = 24 }: IconProps) {
  return <Desktop size={size} className={className} aria-hidden />;
}

export function Keyboard({ className, size = 24 }: IconProps) {
  return <KeyboardIcon size={size} className={className} aria-hidden />;
}

export function Command({ className, size = 24 }: IconProps) {
  return <PhCommand size={size} className={className} aria-hidden />;
}

export function Option({ className, size = 24 }: IconProps) {
  return <PhOption size={size} className={className} aria-hidden />;
}

export function Control({ className, size = 24 }: IconProps) {
  return <PhControl size={size} className={className} aria-hidden />;
}

export function Close({ className, size = 24 }: IconProps) {
  return <X size={size} className={className} aria-hidden />;
}

export function CircleX({ className, size = 24 }: IconProps) {
  return <XCircle size={size} className={className} aria-hidden />;
}

export function Plus({ className, size = 24 }: IconProps) {
  return <PlusIcon size={size} className={className} aria-hidden />;
}

export function Minus({ className, size = 24 }: IconProps) {
  return <MinusIcon size={size} className={className} aria-hidden />;
}

/** Icon-suffixed aliases — same components, preferred import names. */
export {
  ArrowsMove as ArrowsMoveIcon,
  ArrowDown as ArrowDownIcon,
  ArrowUp as ArrowUpIcon,
  Back as BackIcon,
  CaretDown as CaretDownIcon,
  CaretRight as CaretRightIcon,
  Check as CheckIcon,
  CircleX as CircleXIcon,
  Clock as ClockIcon,
  Close as CloseIcon,
  Command as CommandIcon,
  Computer as ComputerIcon,
  Control as ControlIcon,
  DragVertical as DragVerticalIcon,
  Export as ExportIcon,
  Focus as FocusIcon,
  Globe as GlobeIcon,
  JsonFile as JsonFileIcon,
  Keyboard as KeyboardIcon,
  MarkdownFile as MarkdownFileIcon,
  Minus as MinusIcon,
  Moon as MoonIcon,
  Option as OptionIcon,
  Plus as PlusIcon,
  Question as QuestionIcon,
  Restore as RestoreIcon,
  Sun as SunIcon,
  Trash as TrashIcon,
  ArrowsMove as DragIcon,
  Close as XIcon,
};
