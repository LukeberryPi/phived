import type { TaskLists } from "src/types/canvas";
import type { TaskHistory } from "src/types/taskHistory";
import { formatHistoryExportWhen } from "src/utils/formatHistoryWhen";

export type CanvasExportFormat = "md" | "json";

type CanvasExportPayload = {
  exportedAt: string;
  lists: TaskLists;
  taskHistory: TaskHistory;
};

function headingText(text: string, fallback: string) {
  return text.trim() || fallback;
}

function escapeMarkdownText(text: string) {
  return text.replace(/\r?\n/g, " ").trim();
}

export function buildCanvasMarkdown(
  lists: TaskLists,
  taskHistory: TaskHistory,
  exportedAt = new Date().toISOString()
) {
  const lines = ["# phived export", "", `exported: ${exportedAt}`, ""];

  if (lists.length === 0) {
    lines.push("## canvas", "", "_no lists_", "");
  } else {
    lists.forEach((list, index) => {
      lines.push(`## ${headingText(list.tag, `list ${index + 1}`)}`, "");

      const tasks = list.tasks
        .map(escapeMarkdownText)
        .filter((task) => task.length > 0);

      if (tasks.length === 0) {
        lines.push("- [ ] _empty_", "");
        return;
      }

      tasks.forEach((task) => {
        lines.push(`- [ ] ${task}`);
      });
      lines.push("");
    });
  }

  lines.push("## history", "");

  if (taskHistory.length === 0) {
    lines.push("_no completed tasks_", "");
  } else {
    taskHistory.forEach((entry) => {
      const tag = entry.listTag?.trim() ? ` (${entry.listTag.trim()})` : "";
      const completedAt = formatHistoryExportWhen(entry.completedAt);
      lines.push(
        `- [x] ${escapeMarkdownText(entry.text)}${tag} - ${completedAt}`
      );
    });
    lines.push("");
  }

  return `${lines.join("\n").trimEnd()}\n`;
}

export function buildCanvasJson(
  lists: TaskLists,
  taskHistory: TaskHistory,
  exportedAt = new Date().toISOString()
) {
  const payload: CanvasExportPayload = {
    exportedAt,
    lists,
    taskHistory,
  };

  return `${JSON.stringify(payload, null, 2)}\n`;
}

export function downloadTextFile(
  filename: string,
  mimeType: string,
  contents: string
) {
  const blob = new Blob([contents], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportCanvas(
  format: CanvasExportFormat,
  lists: TaskLists,
  taskHistory: TaskHistory
) {
  const exportedAt = new Date().toISOString();
  const slug = exportedAt.slice(0, 10);

  if (format === "md") {
    downloadTextFile(
      `phived-export-${slug}.md`,
      "text/markdown;charset=utf-8",
      buildCanvasMarkdown(lists, taskHistory, exportedAt)
    );
    return;
  }

  downloadTextFile(
    `phived-export-${slug}.json`,
    "application/json;charset=utf-8",
    buildCanvasJson(lists, taskHistory, exportedAt)
  );
}
