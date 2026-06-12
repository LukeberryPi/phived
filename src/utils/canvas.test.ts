/// <reference types="bun" />

import { describe, expect, test } from "bun:test";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  MAX_ZOOM,
  MIN_ZOOM,
  clampListPosition,
  clampViewport,
  LIST_WIDTH,
  buildListsFromLegacyTasks,
  clampZoom,
  createTaskList,
  orderListsForRender,
} from "src/utils/canvas";
import type { TaskLists } from "src/types/canvas";

function bringToFront(lists: TaskLists, listId: string): TaskLists {
  // Mirrors the provider's bring-to-front: moves the list to the array end.
  const list = lists.find((item) => item.id === listId);
  return list ? [...lists.filter((item) => item !== list), list] : lists;
}

describe("canvas utilities", () => {
  test("clamps zoom at and beyond both limits", () => {
    expect(clampZoom(MIN_ZOOM - 1)).toBe(MIN_ZOOM);
    expect(clampZoom(MIN_ZOOM)).toBe(MIN_ZOOM);
    expect(clampZoom(MAX_ZOOM)).toBe(MAX_ZOOM);
    expect(clampZoom(MAX_ZOOM + 1)).toBe(MAX_ZOOM);
  });

  test("clamps list positions within canvas boundaries", () => {
    expect(clampListPosition(-100, -200)).toEqual({ x: 16, y: 16 });
    expect(clampListPosition(CANVAS_WIDTH, CANVAS_HEIGHT)).toEqual({
      x: 5644,
      y: 3624,
    });
  });

  test("centers canvas axes smaller than the viewport", () => {
    expect(
      clampViewport(
        { x: -100, y: -200, zoom: MIN_ZOOM },
        CANVAS_WIDTH,
        CANVAS_HEIGHT
      )
    ).toEqual({
      x: (CANVAS_WIDTH - CANVAS_WIDTH * MIN_ZOOM) / 2,
      y: (CANVAS_HEIGHT - CANVAS_HEIGHT * MIN_ZOOM) / 2,
      zoom: MIN_ZOOM,
    });
  });

  test("constrains canvas axes larger than the viewport", () => {
    expect(clampViewport({ x: 100, y: -10000, zoom: 1 }, 1000, 800)).toEqual({
      x: 0,
      y: 800 - CANVAS_HEIGHT,
      zoom: 1,
    });
  });
});

describe("buildListsFromLegacyTasks", () => {
  test("starts with one empty centered list when nothing was stored", () => {
    const lists = buildListsFromLegacyTasks(null, null);

    expect(lists).toHaveLength(1);
    expect(lists[0].tag).toBe("");
    expect(lists[0].tasks.every((task) => task === "")).toBe(true);
  });

  test("migrates general tasks into the centered list", () => {
    const lists = buildListsFromLegacyTasks(["one", "two"], null);

    expect(lists).toHaveLength(1);
    expect(lists[0].tasks.slice(0, 2)).toEqual(["one", "two"]);
  });

  test("migrates daily tasks into a second list tagged daily beside it", () => {
    const lists = buildListsFromLegacyTasks(["one"], ["water plants"]);

    expect(lists).toHaveLength(2);
    expect(lists[1].tag).toBe("daily");
    expect(lists[1].tasks[0]).toBe("water plants");
    expect(lists[1].x).toBeGreaterThanOrEqual(lists[0].x + LIST_WIDTH);
    expect(lists[1].y).toBe(lists[0].y);
  });

  test("migrates dailies even when no general tasks were stored", () => {
    const lists = buildListsFromLegacyTasks(null, ["water plants"]);

    expect(lists).toHaveLength(2);
    expect(lists[0].tasks.every((task) => task === "")).toBe(true);
    expect(lists[1].tag).toBe("daily");
  });
});

describe("orderListsForRender", () => {
  test("stacks lists in array order", () => {
    const lists = [createTaskList(0, 0), createTaskList(0, 0)];

    const ordered = orderListsForRender(lists);

    for (const { list, stackIndex } of ordered) {
      expect(lists[stackIndex]).toBe(list);
    }
  });

  /**
   * Regression test: bringing a list to front fires on pointerdown. If it
   * changed render (DOM) order, the browser would cancel the in-flight
   * click and swallow the first press of buttons inside the card (e.g.
   * "delete list"). Only stackIndex (z-index) may change.
   */
  test("render order is unchanged when a list is brought to front", () => {
    const lists = [
      createTaskList(0, 0),
      createTaskList(0, 0),
      createTaskList(0, 0),
    ];
    const renderOrder = orderListsForRender(lists).map(({ list }) => list.id);

    for (const { id } of lists) {
      const reordered = bringToFront(lists, id);
      const next = orderListsForRender(reordered);

      expect(next.map(({ list }) => list.id)).toEqual(renderOrder);
      expect(next.find(({ list }) => list.id === id)?.stackIndex).toBe(
        lists.length - 1
      );
    }
  });
});
