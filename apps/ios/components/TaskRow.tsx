import type { Task } from "@phived/tasks";
import { colors } from "@phived/tokens";
import { CaretUpDown, Check, Trash } from "phosphor-react-native";
import { useCallback, useRef } from "react";
import { Animated, Pressable, TextInput, View } from "react-native";
import { useDragToReorder } from "../hooks/useDragToReorder";
import { useSwipeToDelete } from "../hooks/useSwipeToDelete";
import type { Palette, Styles } from "../theme";

type TaskRowProps = {
  task: Task;
  index: number;
  isLast: boolean;
  isDragging: boolean;
  palette: Palette;
  styles: Styles;
  onChangeText: (taskId: string, text: string) => void;
  onRemove: (taskId: string) => void;
  onReorder: (taskId: string, direction: -1 | 1) => void;
  setDraggingTaskId: (taskId: string | null) => void;
};

export function TaskRow({
  task,
  index,
  isLast,
  isDragging,
  palette,
  styles,
  onChangeText,
  onRemove,
  onReorder,
  setDraggingTaskId,
}: TaskRowProps) {
  const isEmpty = task.text.trim() === "";
  const rowWidthRef = useRef(360);

  const handleRemove = useCallback(
    () => onRemove(task.id),
    [onRemove, task.id]
  );
  const handleDragStart = useCallback(
    () => setDraggingTaskId(task.id),
    [setDraggingTaskId, task.id]
  );
  const handleStep = useCallback(
    (direction: -1 | 1) => onReorder(task.id, direction),
    [onReorder, task.id]
  );
  const handleDragEnd = useCallback(
    () => setDraggingTaskId(null),
    [setDraggingTaskId]
  );

  const swipe = useSwipeToDelete({
    enabled: !isEmpty,
    rowWidthRef,
    onDelete: handleRemove,
  });
  const drag = useDragToReorder({
    enabled: !isEmpty,
    onStart: handleDragStart,
    onStep: handleStep,
    onEnd: handleDragEnd,
  });

  return (
    <View
      onLayout={(event) => {
        rowWidthRef.current = event.nativeEvent.layout.width;
      }}
      style={[
        styles.rowSlot,
        !isLast && styles.rowDivider,
        isDragging && styles.draggingSlot,
      ]}
    >
      {!isDragging && !isEmpty && (
        <View style={styles.deleteReveal}>
          <Trash size={18} color={palette.destructiveText} weight="bold" />
        </View>
      )}

      <Animated.View
        {...swipe.panHandlers}
        {...swipe.webHandlers}
        style={[
          styles.row,
          isDragging && styles.draggingRow,
          {
            transform: [
              { translateX: swipe.swipeX },
              { translateY: isDragging ? drag.dragY : 0 },
            ],
          },
        ]}
      >
        <TextInput
          value={task.text}
          onChangeText={(text) => onChangeText(task.id, text)}
          autoCapitalize="sentences"
          autoCorrect
          placeholder={index === 0 ? "what next?" : ""}
          placeholderTextColor={palette.placeholderText}
          selectionColor={palette.accent}
          style={styles.taskInput}
        />

        {!isEmpty && (
          <>
            <View
              accessible
              accessibilityLabel={`Drag ${task.text}`}
              {...drag.panHandlers}
              {...drag.webHandlers}
              style={styles.rowHandle}
            >
              <CaretUpDown size={16} color={palette.mutedText} weight="bold" />
            </View>

            <Pressable
              accessibilityLabel={`Complete ${task.text}`}
              onPress={handleRemove}
              style={({ pressed }) => [
                styles.doneButton,
                pressed && styles.doneButtonPressed,
              ]}
            >
              <Check size={18} color={colors.inkLight} weight="bold" />
            </Pressable>
          </>
        )}
      </Animated.View>
    </View>
  );
}
