import { useCallback, useMemo, useRef } from "react";
import {
  Animated,
  PanResponder,
  type PanResponderInstance,
  type PointerEvent,
} from "react-native";
import { IS_WEB, ROW_HEIGHT, USE_NATIVE_DRIVER } from "../constants";

function stepFromDelta(dy: number): number {
  return Math.trunc(dy / ROW_HEIGHT);
}

type WebPointerHandlers = {
  onPointerDownCapture: (event: PointerEvent) => void;
  onPointerMoveCapture: (event: PointerEvent) => void;
  onPointerUpCapture: (event: PointerEvent) => void;
  onPointerCancelCapture: (event: PointerEvent) => void;
};

type DragToReorder = {
  dragY: Animated.Value;
  panHandlers: PanResponderInstance["panHandlers"];
  webHandlers: WebPointerHandlers;
};

type Options = {
  enabled: boolean;
  onStart: () => void;
  onStep: (direction: -1 | 1) => void;
  onEnd: () => void;
};

/**
 * Vertical drag-to-reorder for a task row. As with the swipe hook, the native
 * PanResponder and web pointer handlers share one step/settle implementation.
 */
export function useDragToReorder({
  enabled,
  onStart,
  onStep,
  onEnd,
}: Options): DragToReorder {
  const dragY = useRef(new Animated.Value(0)).current;
  const lastStepRef = useRef(0);
  const pointerActiveRef = useRef(false);
  const startYRef = useRef(0);

  const beginDrag = useCallback(() => {
    lastStepRef.current = 0;
    dragY.setValue(0);
    onStart();
  }, [dragY, onStart]);

  const applyDelta = useCallback(
    (dy: number) => {
      dragY.setValue(dy);
      const step = stepFromDelta(dy);

      if (step === lastStepRef.current || step === 0) {
        return;
      }

      onStep(step > lastStepRef.current ? 1 : -1);
      lastStepRef.current = step;
    },
    [dragY, onStep]
  );

  const endDrag = useCallback(() => {
    Animated.spring(dragY, {
      toValue: 0,
      damping: 20,
      stiffness: 280,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();
    lastStepRef.current = 0;
    onEnd();
  }, [dragY, onEnd]);

  const panHandlers = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => enabled,
        onMoveShouldSetPanResponder: () => enabled,
        onPanResponderGrant: beginDrag,
        onPanResponderMove: (_event, gesture) => applyDelta(gesture.dy),
        onPanResponderRelease: endDrag,
        onPanResponderTerminate: endDrag,
      }).panHandlers,
    [applyDelta, beginDrag, enabled, endDrag]
  );

  const onPointerDownCapture = useCallback(
    (event: PointerEvent) => {
      if (!IS_WEB || !enabled) {
        return;
      }

      event.preventDefault();
      pointerActiveRef.current = true;
      startYRef.current = event.nativeEvent.pageY;
      beginDrag();
    },
    [beginDrag, enabled]
  );

  const onPointerMoveCapture = useCallback(
    (event: PointerEvent) => {
      if (!IS_WEB || !pointerActiveRef.current) {
        return;
      }

      event.preventDefault();
      applyDelta(event.nativeEvent.pageY - startYRef.current);
    },
    [applyDelta]
  );

  const onPointerUpCapture = useCallback(
    (event: PointerEvent) => {
      if (!IS_WEB || !pointerActiveRef.current) {
        return;
      }

      event.preventDefault();
      pointerActiveRef.current = false;
      endDrag();
    },
    [endDrag]
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

  return { dragY, panHandlers, webHandlers };
}
