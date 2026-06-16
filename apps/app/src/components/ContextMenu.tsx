import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef, ElementRef } from "react";
import {
  pressFeedbackGroupChildClassName,
  pressFeedbackGroupClassName,
} from "src/constants/motion";
import {
  DESTRUCTIVE_ACTION,
  DRAWER_HEADER_HOVER,
  DRAWER_MUTED_TEXT,
  DRAWER_SURFACE,
  DRAWER_TEXT,
} from "src/constants/ui";
import { CaretRight } from "src/icons";
import { cn } from "src/utils";

export const ContextMenu = ContextMenuPrimitive.Root;
export const ContextMenuTrigger = ContextMenuPrimitive.Trigger;
export const ContextMenuSub = ContextMenuPrimitive.Sub;

const menuSurfaceClassName = cn(
  "context-menu-content custom-scrollbar z-[70] min-w-52 overflow-hidden rounded-2xl shadow-none",
  "border border-line-light dark:border-hairline-dark",
  DRAWER_SURFACE
);

// The row itself only carries the hover background + group marker; the inner
// content scales on press (like the `done` button) so the text moves, not the
// whole row. Exported so `asChild` items (e.g. links) can match the layout.
const menuItemClassName = cn(
  "relative flex min-h-12 w-full select-none items-center px-4 text-sm outline-none",
  DRAWER_TEXT,
  DRAWER_HEADER_HOVER,
  pressFeedbackGroupClassName("menu-item"),
  "data-[disabled]:pointer-events-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-45"
);

export const menuItemContentClassName = cn(
  "flex flex-1 items-center gap-2",
  pressFeedbackGroupChildClassName("menu-item")
);

export const ContextMenuContent = forwardRef<
  ElementRef<typeof ContextMenuPrimitive.Content>,
  ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Portal>
    <ContextMenuPrimitive.Content
      ref={ref}
      className={cn(menuSurfaceClassName, className)}
      {...props}
    />
  </ContextMenuPrimitive.Portal>
));
ContextMenuContent.displayName = ContextMenuPrimitive.Content.displayName;

type ContextMenuItemProps = ComponentPropsWithoutRef<
  typeof ContextMenuPrimitive.Item
> & {
  destructive?: boolean;
};

export const ContextMenuItem = forwardRef<
  ElementRef<typeof ContextMenuPrimitive.Item>,
  ContextMenuItemProps
>(({ className, destructive, children, ...props }, ref) => (
  <ContextMenuPrimitive.Item
    ref={ref}
    className={cn(
      menuItemClassName,
      destructive && DESTRUCTIVE_ACTION,
      className
    )}
    {...props}
  >
    {props.asChild ? (
      children
    ) : (
      <span className={menuItemContentClassName}>{children}</span>
    )}
  </ContextMenuPrimitive.Item>
));
ContextMenuItem.displayName = ContextMenuPrimitive.Item.displayName;

export const ContextMenuSubTrigger = forwardRef<
  ElementRef<typeof ContextMenuPrimitive.SubTrigger>,
  ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubTrigger>
>(({ className, children, ...props }, ref) => (
  <ContextMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      menuItemClassName,
      "data-[state=open]:bg-surface-hover-light dark:data-[state=open]:bg-surface-hover-dark",
      className
    )}
    {...props}
  >
    <span className={menuItemContentClassName}>
      {children}
      <CaretRight size={16} className={cn("ml-auto", DRAWER_MUTED_TEXT)} />
    </span>
  </ContextMenuPrimitive.SubTrigger>
));
ContextMenuSubTrigger.displayName = ContextMenuPrimitive.SubTrigger.displayName;

export const ContextMenuSubContent = forwardRef<
  ElementRef<typeof ContextMenuPrimitive.SubContent>,
  ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Portal>
    <ContextMenuPrimitive.SubContent
      ref={ref}
      className={cn(menuSurfaceClassName, "min-w-36", className)}
      {...props}
    />
  </ContextMenuPrimitive.Portal>
));
ContextMenuSubContent.displayName = ContextMenuPrimitive.SubContent.displayName;

export const ContextMenuSeparator = forwardRef<
  ElementRef<typeof ContextMenuPrimitive.Separator>,
  ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Separator
    ref={ref}
    className={cn("bg-line-light dark:bg-hairline-dark h-px", className)}
    {...props}
  />
));
ContextMenuSeparator.displayName = ContextMenuPrimitive.Separator.displayName;
