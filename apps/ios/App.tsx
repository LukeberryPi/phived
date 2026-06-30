import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
  useFonts,
} from "@expo-google-fonts/dm-sans";
import { colors, fonts, shadows } from "@phived/tokens";
import { StatusBar } from "expo-status-bar";
import {
  ArrowCounterClockwise,
  CaretUpDown,
  Check,
  DotsThreeVertical,
  Globe,
  Moon,
  Sun,
  Trash,
} from "phosphor-react-native";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Linking,
  PanResponder,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  type PointerEvent,
  useWindowDimensions,
  View,
} from "react-native";
import Svg, { Circle, Defs, Pattern, Rect } from "react-native-svg";

const ROW_HEIGHT = 52;
const MIN_TASK_ROWS = 5;
const SWIPE_DELETE_DISTANCE = 96;
const OUT_STRONG = Easing.bezier(0.23, 1, 0.32, 1);
const USE_NATIVE_DRIVER = Platform.OS !== "web";

const INITIAL_TASK_TEXTS = [
  "Ship the iOS MVP",
  "Match the web task card",
  "Tune dark mode colors",
  "Drag rows into order",
  "Swipe right to delete",
];

type ThemeName = "light" | "dark";

type Task = {
  id: string;
  text: string;
};

let nextTaskId = INITIAL_TASK_TEXTS.length + 1;

function createTask(text = ""): Task {
  const task = { id: `ios-task-${nextTaskId}`, text };
  nextTaskId += 1;
  return task;
}

function createInitialTasks() {
  return INITIAL_TASK_TEXTS.map((text, index) => ({
    id: `ios-task-${index + 1}`,
    text,
  }));
}

function withMinimumRows(tasks: Task[]) {
  if (tasks.length >= MIN_TASK_ROWS) {
    return tasks;
  }

  return [
    ...tasks,
    ...Array.from({ length: MIN_TASK_ROWS - tasks.length }, () => createTask()),
  ];
}

export default function App() {
  const [fontsLoaded] = useFonts({
    [fonts.sans]: DMSans_400Regular,
    "DM Sans Medium": DMSans_500Medium,
    "DM Sans Bold": DMSans_700Bold,
  });
  const [theme, setTheme] = useState<ThemeName>("light");
  const [tasks, setTasks] = useState<Task[]>(createInitialTasks);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const window = useWindowDimensions();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const palette = getPalette(theme);
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;

  const updateTaskText = useCallback((taskId: string, text: string) => {
    setTasks((current) =>
      current.map((task) => (task.id === taskId ? { ...task, text } : task))
    );
  }, []);

  const removeTask = useCallback((taskId: string) => {
    setTasks((current) =>
      withMinimumRows(current.filter((task) => task.id !== taskId))
    );
  }, []);

  const resetTasks = useCallback(() => {
    setTasks(createInitialTasks());
    setMenuOpen(false);
  }, []);

  const reorderTask = useCallback((taskId: string, direction: -1 | 1) => {
    setTasks((current) => {
      const fromIndex = current.findIndex((task) => task.id === taskId);
      const toIndex = fromIndex + direction;

      if (
        fromIndex === -1 ||
        toIndex < 0 ||
        toIndex >= current.length ||
        current[toIndex].text.trim() === ""
      ) {
        return current;
      }

      const reordered = [...current];
      const [moved] = reordered.splice(fromIndex, 1);
      reordered.splice(toIndex, 0, moved);
      return reordered;
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }, []);

  const openWebsite = useCallback(() => {
    setMenuOpen(false);
    Linking.openURL("https://www.phived.com/");
  }, []);

  if (!fontsLoaded) {
    return <View style={styles.loading} />;
  }

  const cardWidth = Math.min(window.width - 32, 392);

  return (
    <View style={styles.app}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <CanvasDots theme={theme} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="link"
            onPress={openWebsite}
            style={({ pressed }) => [
              styles.logo,
              pressed && styles.pressFeedback,
            ]}
          >
            <Text style={styles.logoText}>phived</Text>
          </Pressable>

          <View style={styles.headerActions}>
            <ChromeButton
              label={theme}
              icon={theme === "dark" ? Moon : Sun}
              onPress={toggleTheme}
              styles={styles}
              color={palette.primaryText}
            />
            <IconChromeButton
              label="open menu"
              icon={DotsThreeVertical}
              onPress={() => setMenuOpen(true)}
              styles={styles}
              color={palette.primaryText}
            />
          </View>
        </View>

        <View style={styles.content}>
          <View style={[styles.listFrame, { width: cardWidth }]}>
            <View style={styles.listTab}>
              <Text style={styles.listTabText}>today</Text>
            </View>
            <View style={styles.taskPanel}>
              {tasks.map((task, index) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  index={index}
                  isLast={index === tasks.length - 1}
                  isDragging={draggingTaskId === task.id}
                  onChangeText={updateTaskText}
                  onComplete={removeTask}
                  onDelete={removeTask}
                  onReorder={reorderTask}
                  setDraggingTaskId={setDraggingTaskId}
                  styles={styles}
                  palette={palette}
                />
              ))}
            </View>
          </View>
        </View>
      </SafeAreaView>

      {menuOpen && (
        <View style={styles.menuLayer}>
          <Pressable
            accessibilityLabel="close menu"
            style={StyleSheet.absoluteFill}
            onPress={() => setMenuOpen(false)}
          />
          <View style={styles.menuSurface}>
            <MenuItem
              label={`switch to ${theme === "dark" ? "light" : "dark"}`}
              icon={theme === "dark" ? Sun : Moon}
              onPress={() => {
                toggleTheme();
                setMenuOpen(false);
              }}
              styles={styles}
              color={palette.primaryText}
            />
            <MenuItem
              label="reset tasks"
              icon={ArrowCounterClockwise}
              onPress={resetTasks}
              styles={styles}
              color={palette.primaryText}
            />
            <MenuItem
              label="go to website"
              icon={Globe}
              onPress={openWebsite}
              styles={styles}
              color={palette.primaryText}
            />
          </View>
        </View>
      )}
    </View>
  );
}

type IconComponent = typeof Sun;

type ChromeButtonProps = {
  label: string;
  icon: IconComponent;
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
  color: string;
};

function ChromeButton({
  label,
  icon: Icon,
  onPress,
  styles,
  color,
}: ChromeButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chromeButton,
        pressed && styles.pressFeedback,
      ]}
    >
      <Icon size={20} color={color} />
      <Text style={styles.chromeButtonText}>{label}</Text>
    </Pressable>
  );
}

type IconChromeButtonProps = Omit<ChromeButtonProps, "label"> & {
  label: string;
};

function IconChromeButton({
  label,
  icon: Icon,
  onPress,
  styles,
  color,
}: IconChromeButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconChromeButton,
        pressed && styles.pressFeedback,
      ]}
    >
      <Icon size={22} color={color} weight="bold" />
    </Pressable>
  );
}

type MenuItemProps = {
  label: string;
  icon: IconComponent;
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
  color: string;
};

function MenuItem({
  label,
  icon: Icon,
  onPress,
  styles,
  color,
}: MenuItemProps) {
  return (
    <Pressable
      accessibilityRole="menuitem"
      onPress={onPress}
      style={({ pressed }) => [styles.menuItem, pressed && styles.menuPress]}
    >
      <Icon size={16} color={color} />
      <Text style={styles.menuItemText}>{label}</Text>
    </Pressable>
  );
}

type TaskRowProps = {
  task: Task;
  index: number;
  isLast: boolean;
  isDragging: boolean;
  onChangeText: (taskId: string, text: string) => void;
  onComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onReorder: (taskId: string, direction: -1 | 1) => void;
  setDraggingTaskId: (taskId: string | null) => void;
  styles: ReturnType<typeof createStyles>;
  palette: ReturnType<typeof getPalette>;
};

function TaskRow({
  task,
  index,
  isLast,
  isDragging,
  onChangeText,
  onComplete,
  onDelete,
  onReorder,
  setDraggingTaskId,
  styles,
  palette,
}: TaskRowProps) {
  const isEmpty = task.text.trim() === "";
  const swipeX = useRef(new Animated.Value(0)).current;
  const dragY = useRef(new Animated.Value(0)).current;
  const lastReorderStepRef = useRef(0);
  const rowWidthRef = useRef(360);
  const pointerSwipeRef = useRef<{
    claimed: boolean;
    startX: number;
    startY: number;
    x: number;
  } | null>(null);
  const pointerDragRef = useRef<{
    lastStep: number;
    startY: number;
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
    }).start(() => onDelete(task.id));
  }, [onDelete, swipeX, task.id]);

  const swipeResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponderCapture: (_event, gesture) =>
          !isEmpty &&
          gesture.dx > 6 &&
          Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onMoveShouldSetPanResponder: (_event, gesture) =>
          !isEmpty &&
          gesture.dx > 6 &&
          Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onPanResponderMove: (_event, gesture) => {
          swipeX.setValue(Math.max(0, gesture.dx));
        },
        onPanResponderRelease: (_event, gesture) => {
          if (
            gesture.dx > SWIPE_DELETE_DISTANCE ||
            gesture.vx > 0.65 ||
            gesture.dx > rowWidthRef.current * 0.38
          ) {
            commitDelete();
            return;
          }

          closeSwipe();
        },
        onPanResponderTerminate: closeSwipe,
      }),
    [closeSwipe, commitDelete, isEmpty, swipeX]
  );

  const handlePointerDown = useCallback(
    (event: PointerEvent) => {
      if (Platform.OS !== "web" || isEmpty) {
        return;
      }

      pointerSwipeRef.current = {
        claimed: false,
        startX: event.nativeEvent.pageX,
        startY: event.nativeEvent.pageY,
        x: event.nativeEvent.pageX,
      };
    },
    [isEmpty]
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      const swipe = pointerSwipeRef.current;

      if (Platform.OS !== "web" || !swipe) {
        return;
      }

      swipe.x = event.nativeEvent.pageX;
      const dx = swipe.x - swipe.startX;
      const dy = event.nativeEvent.pageY - swipe.startY;

      if (!swipe.claimed) {
        if (dx <= 6 || Math.abs(dx) <= Math.abs(dy)) {
          return;
        }

        swipe.claimed = true;
      }

      event.preventDefault();
      swipeX.setValue(Math.max(0, dx));
    },
    [swipeX]
  );

  const handlePointerEnd = useCallback(
    (event?: PointerEvent) => {
      const swipe = pointerSwipeRef.current;
      pointerSwipeRef.current = null;

      if (Platform.OS !== "web" || !swipe?.claimed) {
        return;
      }

      event?.preventDefault();
      const dx = swipe.x - swipe.startX;

      if (dx > SWIPE_DELETE_DISTANCE || dx > rowWidthRef.current * 0.38) {
        commitDelete();
        return;
      }

      closeSwipe();
    },
    [closeSwipe, commitDelete]
  );

  const endDrag = useCallback(() => {
    Animated.spring(dragY, {
      toValue: 0,
      damping: 20,
      stiffness: 280,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();
    lastReorderStepRef.current = 0;
    setDraggingTaskId(null);
  }, [dragY, setDraggingTaskId]);

  const dragResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !isEmpty,
        onMoveShouldSetPanResponder: () => !isEmpty,
        onPanResponderGrant: () => {
          setDraggingTaskId(task.id);
          lastReorderStepRef.current = 0;
          dragY.setValue(0);
        },
        onPanResponderMove: (_event, gesture) => {
          dragY.setValue(gesture.dy);

          const step = Math.trunc(gesture.dy / ROW_HEIGHT);

          if (step === lastReorderStepRef.current || step === 0) {
            return;
          }

          onReorder(task.id, step > lastReorderStepRef.current ? 1 : -1);
          lastReorderStepRef.current = step;
        },
        onPanResponderRelease: endDrag,
        onPanResponderTerminate: endDrag,
      }),
    [dragY, endDrag, isEmpty, onReorder, setDraggingTaskId, task.id]
  );

  const handleDragPointerDown = useCallback(
    (event: PointerEvent) => {
      if (Platform.OS !== "web" || isEmpty) {
        return;
      }

      event.preventDefault();
      setDraggingTaskId(task.id);
      pointerDragRef.current = {
        lastStep: 0,
        startY: event.nativeEvent.pageY,
      };
      dragY.setValue(0);
    },
    [dragY, isEmpty, setDraggingTaskId, task.id]
  );

  const handleDragPointerMove = useCallback(
    (event: PointerEvent) => {
      const drag = pointerDragRef.current;

      if (Platform.OS !== "web" || !drag) {
        return;
      }

      event.preventDefault();
      const dy = event.nativeEvent.pageY - drag.startY;
      dragY.setValue(dy);
      const step = Math.trunc(dy / ROW_HEIGHT);

      if (step === drag.lastStep || step === 0) {
        return;
      }

      onReorder(task.id, step > drag.lastStep ? 1 : -1);
      drag.lastStep = step;
    },
    [dragY, onReorder, task.id]
  );

  const handleDragPointerEnd = useCallback(
    (event?: PointerEvent) => {
      if (Platform.OS !== "web" || !pointerDragRef.current) {
        return;
      }

      event?.preventDefault();
      pointerDragRef.current = null;
      endDrag();
    },
    [endDrag]
  );

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
      <View style={styles.deleteReveal}>
        <Trash size={18} color={palette.destructiveText} weight="bold" />
      </View>

      <Animated.View
        {...swipeResponder.panHandlers}
        onPointerDownCapture={handlePointerDown}
        onPointerMoveCapture={handlePointerMove}
        onPointerUpCapture={handlePointerEnd}
        onPointerCancelCapture={handlePointerEnd}
        style={[
          styles.row,
          isDragging && styles.draggingRow,
          {
            transform: [
              { translateX: swipeX },
              { translateY: isDragging ? dragY : 0 },
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
              {...dragResponder.panHandlers}
              onPointerDownCapture={handleDragPointerDown}
              onPointerMoveCapture={handleDragPointerMove}
              onPointerUpCapture={handleDragPointerEnd}
              onPointerCancelCapture={handleDragPointerEnd}
              style={styles.rowHandle}
            >
              <CaretUpDown size={16} color={palette.mutedText} weight="bold" />
            </View>

            <Pressable
              accessibilityLabel={`Complete ${task.text}`}
              onPress={() => onComplete(task.id)}
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

function CanvasDots({ theme }: { theme: ThemeName }) {
  const dotColor =
    theme === "dark" ? "rgba(226, 229, 234, 0.07)" : "rgba(0, 0, 0, 0.12)";

  return (
    <Svg pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Defs>
        <Pattern
          id="canvasDots"
          x="0"
          y="0"
          width="32"
          height="32"
          patternUnits="userSpaceOnUse"
        >
          <Circle cx="1.5" cy="1.5" r="1.5" fill={dotColor} />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#canvasDots)" />
    </Svg>
  );
}

function getPalette(theme: ThemeName) {
  const dark = theme === "dark";

  return {
    appBackground: dark ? colors.canvasDark : colors.canvasLight,
    outerBackground: dark ? "#000000" : "#f4f4f5",
    panelBackground: dark ? colors.surfaceDark : "#ffffff",
    panelBorder: dark ? colors.edgeDark : colors.inkLight,
    panelHairline: dark ? colors.hairlineDark : colors.lineLight,
    primaryText: dark ? colors.inkDark : colors.inkLight,
    mutedText: dark ? colors.mutedDark : colors.mutedLight,
    placeholderText: dark
      ? "rgba(226, 229, 234, 0.45)"
      : "rgba(8, 8, 17, 0.45)",
    hoverSurface: dark ? colors.surfaceHoverDark : colors.surfaceHoverLight,
    activeSurface: dark ? colors.surfaceActiveDark : colors.surfaceHoverLight,
    accent: dark ? colors.actionDark : colors.actionLight,
    accentPressed: dark ? "#0e7490" : "#67c7ee",
    destructiveText: dark ? colors.destructiveDark : colors.destructiveLight,
    destructiveSurface: dark
      ? colors.destructiveSurfaceDark
      : colors.destructiveSurfaceLight,
  };
}

function createStyles(theme: ThemeName) {
  const palette = getPalette(theme);
  const isDark = theme === "dark";
  const panelShadow = isDark ? {} : shadows.brutalistDark;
  const webFocusReset = {
    outlineStyle: "solid" as const,
    outlineWidth: 0,
  };
  const controlSurface = {
    backgroundColor: isDark
      ? "rgba(10, 12, 16, 0.88)"
      : "rgba(249, 250, 251, 0.88)",
    borderColor: isDark ? colors.hairlineDark : colors.lineLight,
  };

  return StyleSheet.create({
    app: {
      flex: 1,
      backgroundColor: palette.appBackground,
    },
    safeArea: {
      flex: 1,
    },
    loading: {
      flex: 1,
      backgroundColor: palette.appBackground,
    },
    header: {
      height: 64,
      paddingHorizontal: 20,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      zIndex: 5,
    },
    logo: {
      paddingTop: 4,
      borderBottomWidth: 3,
      borderBottomColor: isDark ? "#155e75" : "#7dd3fc",
      ...webFocusReset,
    },
    logoText: {
      color: palette.primaryText,
      fontFamily: fonts.sans,
      fontSize: 34,
      lineHeight: 38,
      fontWeight: "400",
    },
    headerActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    chromeButton: {
      minHeight: 44,
      paddingHorizontal: 14,
      borderRadius: 16,
      borderWidth: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      ...controlSurface,
      ...webFocusReset,
    },
    iconChromeButton: {
      width: 44,
      height: 44,
      borderRadius: 16,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      ...controlSurface,
      ...webFocusReset,
    },
    chromeButtonText: {
      color: palette.primaryText,
      fontFamily: "DM Sans Medium",
      fontSize: 14,
      lineHeight: 18,
      textTransform: "lowercase",
    },
    pressFeedback: {
      transform: [{ scale: 0.95 }],
      opacity: 0.92,
    },
    content: {
      flex: 1,
      paddingHorizontal: 16,
      paddingBottom: 64,
      alignItems: "center",
      justifyContent: "center",
    },
    listFrame: {
      position: "relative",
      paddingTop: 28,
    },
    listTab: {
      position: "absolute",
      top: 1,
      left: 0,
      height: 28,
      minWidth: 78,
      maxWidth: "75%",
      paddingHorizontal: 14,
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      borderWidth: 1,
      borderBottomWidth: 0,
      borderColor: palette.panelBorder,
      backgroundColor: palette.accent,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2,
    },
    listTabText: {
      color: isDark ? colors.inkDark : colors.inkLight,
      fontFamily: "DM Sans Medium",
      fontSize: 14,
      lineHeight: 18,
    },
    taskPanel: {
      overflow: "hidden",
      borderTopLeftRadius: 0,
      borderTopRightRadius: 16,
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16,
      borderWidth: 1,
      borderColor: palette.panelBorder,
      backgroundColor: palette.panelBackground,
      ...panelShadow,
    },
    rowSlot: {
      minHeight: ROW_HEIGHT,
      overflow: "hidden",
      backgroundColor: palette.destructiveSurface,
    },
    draggingSlot: {
      overflow: "visible",
      zIndex: 4,
    },
    rowDivider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: palette.panelHairline,
    },
    deleteReveal: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      width: 84,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: palette.destructiveSurface,
    },
    row: {
      minHeight: ROW_HEIGHT,
      flexDirection: "row",
      alignItems: "stretch",
      backgroundColor: palette.panelBackground,
    },
    draggingRow: {
      marginHorizontal: 4,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: isDark ? colors.edgeDark : "rgba(8, 8, 17, 0.3)",
      overflow: "hidden",
      ...Platform.select({
        ios: {
          shadowColor: colors.inkLight,
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.18,
          shadowRadius: 8,
        },
        android: {
          elevation: 6,
        },
        default: {},
      }),
    },
    taskInput: {
      flex: 1,
      minHeight: ROW_HEIGHT,
      paddingHorizontal: 16,
      paddingVertical: 0,
      color: palette.primaryText,
      backgroundColor: palette.panelBackground,
      fontFamily: fonts.sans,
      fontSize: 16,
      lineHeight: 20,
      outlineStyle: "solid",
      outlineWidth: 0,
    },
    rowHandle: {
      width: 38,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: palette.panelBackground,
    },
    rowHandlePressed: {
      backgroundColor: palette.hoverSurface,
    },
    doneButton: {
      width: 52,
      alignItems: "center",
      justifyContent: "center",
      borderLeftWidth: StyleSheet.hairlineWidth,
      borderLeftColor: palette.panelHairline,
      backgroundColor: palette.accent,
    },
    doneButtonPressed: {
      backgroundColor: palette.accentPressed,
      transform: [{ scale: 0.96 }],
    },
    menuLayer: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      zIndex: 20,
    },
    menuSurface: {
      position: "absolute",
      top: 72,
      right: 16,
      minWidth: 214,
      overflow: "hidden",
      borderRadius: 16,
      borderWidth: 1,
      borderColor: isDark ? colors.hairlineDark : colors.lineLight,
      backgroundColor: palette.panelBackground,
    },
    menuItem: {
      minHeight: 48,
      paddingHorizontal: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: palette.panelBackground,
      ...webFocusReset,
    },
    menuPress: {
      backgroundColor: palette.hoverSurface,
    },
    menuItemText: {
      color: palette.primaryText,
      fontFamily: fonts.sans,
      fontSize: 14,
      lineHeight: 18,
    },
  });
}
