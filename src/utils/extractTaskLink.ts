const URL_REGEX =
  /\b(?:https?:\/\/)?(?:www\.)?([a-z0-9.-]+)\.([a-z0-9]{2,})(?:\/\S*)?\b/i;

export function extractTaskLink(task: string) {
  const match = task.match(URL_REGEX);

  if (!match) {
    return null;
  }

  return match[0];
}
