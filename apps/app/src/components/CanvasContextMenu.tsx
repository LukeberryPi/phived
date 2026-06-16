import type { ReactNode } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
  menuItemContentClassName,
} from "src/components/ContextMenu";
import { DESTRUCTIVE_TRASH_ICON, DRAWER_MUTED_TEXT } from "src/constants/ui";
import {
  CircleX,
  Export,
  Focus,
  Globe,
  JsonFile,
  MarkdownFile,
  Plus,
  Trash,
} from "src/icons";
import type { CanvasExportFormat } from "src/utils";

export type FocusListOption = {
  id: string;
  label: string;
};

type CanvasContextMenuProps = {
  children: ReactNode;
  focusListOptions: FocusListOption[];
  focusedListId: string | null;
  onNewListHere: () => void;
  onFocusList: (listId: string) => void;
  onRemoveFocus: () => void;
  onExport: (format: CanvasExportFormat) => void;
  onClearHistory: () => void;
  onClearCanvas: () => void;
  clearHistoryDisabled?: boolean;
  clearCanvasDisabled?: boolean;
};

const iconClassName = "text-current";

export function CanvasContextMenu({
  children,
  focusListOptions,
  focusedListId,
  onNewListHere,
  onFocusList,
  onRemoveFocus,
  onExport,
  onClearHistory,
  onClearCanvas,
  clearHistoryDisabled = false,
  clearCanvasDisabled = false,
}: CanvasContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onSelect={onNewListHere}>
          <Plus size={16} className={iconClassName} />
          new list here
        </ContextMenuItem>

        {focusedListId ? (
          <ContextMenuItem onSelect={onRemoveFocus}>
            <CircleX size={16} className={iconClassName} />
            remove focus
          </ContextMenuItem>
        ) : (
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <Focus size={16} className={iconClassName} />
              focus list
            </ContextMenuSubTrigger>
            <ContextMenuSubContent sideOffset={8} alignOffset={-4}>
              {focusListOptions.map((option) => (
                <ContextMenuItem
                  key={option.id}
                  onSelect={() => onFocusList(option.id)}
                >
                  {option.label}
                </ContextMenuItem>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>
        )}

        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Export size={16} className={iconClassName} />
            export as
          </ContextMenuSubTrigger>
          <ContextMenuSubContent sideOffset={8} alignOffset={-4}>
            <ContextMenuItem onSelect={() => onExport("md")}>
              <MarkdownFile size={16} className={DRAWER_MUTED_TEXT} />
              .md
            </ContextMenuItem>
            <ContextMenuItem onSelect={() => onExport("json")}>
              <JsonFile size={16} className={DRAWER_MUTED_TEXT} />
              .json
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuItem asChild>
          <a href="/">
            <span className={menuItemContentClassName}>
              <Globe size={16} className={iconClassName} />
              go to website
            </span>
          </a>
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem
          destructive
          disabled={clearHistoryDisabled}
          onSelect={onClearHistory}
        >
          <Trash size={16} className={DESTRUCTIVE_TRASH_ICON} />
          clear history
        </ContextMenuItem>
        <ContextMenuItem
          destructive
          disabled={clearCanvasDisabled}
          onSelect={onClearCanvas}
        >
          <Trash size={16} className={DESTRUCTIVE_TRASH_ICON} />
          clear canvas
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
