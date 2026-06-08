export function confirmDeletion(subject: string, type: "tasks" | "history") {
  return window.confirm(
    `Are you sure you want to DELETE ${subject}? ${type === "tasks" ? "They will not go to your task history." : "This action cannot be undone."}`
  );
}
