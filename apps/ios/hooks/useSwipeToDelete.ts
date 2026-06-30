import { useCallback, useMemo, useRef } from "react";
import {
  Animated,
  PanResponder,
  type PanResponderInstance,
  type PointerEvent,
} from "react-native";
import {
  IS_WEB,
  OUT_STRONG,
  SWIPE_CLAIM_THRESHOLD,
  SWIPE_DELETE_DISTANCE,
  SWIPE_DELETE_WIDTH_RATIO,
  SWIPE_FLICK_VELOCITY,
  USE_NATIVE_DRIVER,
} from "../constants";

/** Single source of truth for the swipe decision, shared by both transports. */
function shouldCommitDelete(dx: number, vx: number, rowWidth: number): boolean {
  return (
    dx > SWIPE_DELETE_DISTANCE ||
    vx > SWIPE_FLICK_VELOCITY ||
    dx > rowWidth * SWIPE_DELETE_WIDTH_RATIO
  );
}

function isHorizontalSwipe(dx: number, dy: number): boolean {
  return dx > SWIPE_CLAIM_THRESHOLD && Math.abs(dx) > Math.abs(dy);
}

type WebPointerHandlers = {
  onPointerDownCapture: (event: PointerEvent) => void;
  onPointerMoveCapture: (event: PointerEvent) => void;
  onPointerUpCapture: (event: PointerEvent) => void;
  onPointerCancelCapture: (event: PointerEvent) => void;
};

type SwipeToDelete = {
  swipeX: Animated.Value;
  panHandlers: PanResponderInstance["panHandlers"];
  webHandlers: WebPointerHandlers;
};

type Options = {
  enabled: boolean;
  rowWidthRef: { current: number };
  onDelete: () => void;
};

/**
 * Swipe-right-to-delete for a task row. The native PanResponder and the web
 * pointer handlers share the same thresholds and commit decision, so the two
 * platform transports can't drift apart.
 */
export function useSwipeToDelete({
  enabled,
  rowWidthRef,
  onDelete,
}: Options): SwipeToDelete {
  const swipeX = useRef(new Animated.Value(0)).current;
  const pointerRef = useRef<{
    claimed: boolean;
    startX: number;
    startY: number;
    x: number;
  } | null>(null);

  const closeSwipe = useCallback(() => {
    Animated.spring(swipeX, {
      toValue: 0,
      damping: 22,
      stiffness: 260,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();
  }, [swipeX]);

  const commitDelete = useCallback(() => {
    Animated.timing(swipeX, {
      toValue: rowWidthRef.current,
      duration: 150,
      easing: OUT_STRONG,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start(onDelete);
  }, [onDelete, rowWidthRef, swipeX]);

  const panHandlers = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponderCapture: (_event, gesture) =>
          enabled && isHorizontalSwipe(gesture.dx, gesture.dy),
        onMoveShouldSetPanResponder: (_event, gesture) =>
          enabled && isHorizontalSwipe(gesture.dx, gesture.dy),
        onPanResponderMove: (_event, gesture) => {
          swipeX.setValue(Math.max(0, gesture.dx));
        },
        onPanResponderRelease: (_event, gesture) => {
          if (shouldCommitDelete(gesture.dx, gesture.vx, rowWidthRef.current)) {
            commitDelete();
            return;
          }

          closeSwipe();
        },
        onPanResponderTerminate: closeSwipe,
      }).panHandlers,
    [closeSwipe, commitDelete, enabled, rowWidthRef, swipeX]
  );

  const onPointerDownCapture = useCallback(
    (event: PointerEvent) => {
      if (!IS_WEB || !enabled) {
        return;
      }

      pointerRef.current = {
        claimed: false,
        startX: event.nativeEvent.pageX,
        startY: event.nativeEvent.pageY,
        x: event.nativeEvent.pageX,
      };
    },
    [enabled]
  );

  const onPointerMoveCapture = useCallback(
    (event: PointerEvent) => {
      const pointer = pointerRef.current;

      if (!IS_WEB || !pointer) {
        return;
      }

      pointer.x = event.nativeEvent.pageX;
      const dx = pointer.x - pointer.startX;
      const dy = event.nativeEvent.pageY - pointer.startY;

      if (!pointer.claimed) {
        if (!isHorizontalSwipe(dx, dy)) {
          return;
        }

        pointer.claimed = true;
      }

      event.preventDefault();
      swipeX.setValue(Math.max(0, dx));
    },
    [swipeX]
  );

  const onPointerUpCapture = useCallback(
    (event: PointerEvent) => {
      const pointer = pointerRef.current;
      pointerRef.current = null;

      if (!IS_WEB || !pointer?.claimed) {
        return;
      }

      event.preventDefault();
      const dx = pointer.x - pointer.startX;

      // No velocity tracking on the web pointer path; distance thresholds only.
      if (shouldCommitDelete(dx, 0, rowWidthRef.current)) {
        commitDelete();
        return;
      }

      closeSwipe();
    },
    [closeSwipe, commitDelete, rowWidthRef]
  );

  const webHandlers = useMemo<WebPointerHandlers>(
    () => ({
      onPointerDownCapture,
      onPointerMoveCapture,
      onPointerUpCapture,
      onPointerCancelCapture: onPointerUpCapture,
    }),
    [onPointerDownCapture, onPointerMoveCapture, onPointerUpCapture]
  );

  return { swipeX, panHandlers, webHandlers };
}
