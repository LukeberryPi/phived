import type { DropResult } from "@hello-pangea/dnd";

export function reorderListFromDragResult<T>(
  list: T[],
  result: DropResult
): T[] | null {
  const destinationIndex = result.destination?.index;

  if (destinationIndex === undefined) {
    return null;
  }

  const next = [...list];
  const [dragged] = next.splice(result.source.index, 1);
  next.splice(destinationIndex, 0, dragged);

  return next;
}
