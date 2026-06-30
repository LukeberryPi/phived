import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
  useFonts,
} from "@expo-google-fonts/dm-sans";
import type { Task } from "@phived/tasks";
import { fonts } from "@phived/tokens";
import { StatusBar } from "expo-status-bar";
import { DotsThreeVertical, Moon, Sun } from "phosphor-react-native";
import { useCallback, useMemo, useState } from "react";
import {
  Linking,
  Pressable,
  SafeAreaView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { CanvasDots } from "./components/CanvasDots";
import { ChromeButton } from "./components/ChromeButton";
import { Menu } from "./components/Menu";
import { TaskRow } from "./components/TaskRow";
import {
  createInitialTasks,
  deleteTask,
  editTask,
  reorderByDirection,
} from "./tasks";
import { createStyles, getPalette, type ThemeName } from "./theme";

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
  const dimensions = useWindowDimensions();
  const palette = useMemo(() => getPalette(theme), [theme]);
  const styles = useMemo(() => createStyles(theme), [theme]);

  const updateTaskText = useCallback((taskId: string, text: string) => {
    setTasks((current) => editTask(current, taskId, text));
  }, []);

  const removeTask = useCallback((taskId: string) => {
    setTasks((current) => deleteTask(current, taskId));
  }, []);

  const reorderTask = useCallback((taskId: string, direction: -1 | 1) => {
    setTasks((current) => reorderByDirection(current, taskId, direction));
  }, []);

  const resetTasks = useCallback(() => {
    setTasks(createInitialTasks());
    setMenuOpen(false);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }, []);

  const openWebsite = useCallback(() => {
    setMenuOpen(false);
    Linking.openURL("https://www.phived.com/");
  }, []);

  const switchThemeFromMenu = useCallback(() => {
    toggleTheme();
    setMenuOpen(false);
  }, [toggleTheme]);

  if (!fontsLoaded) {
    return <View style={styles.loading} />;
  }

  const cardWidth = Math.min(dimensions.width - 32, 392);

  return (
    <View style={styles.app}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <CanvasDots palette={palette} />
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
              palette={palette}
              styles={styles}
            />
            <ChromeButton
              label="open menu"
              icon={DotsThreeVertical}
              onPress={() => setMenuOpen(true)}
              palette={palette}
              styles={styles}
              iconOnly
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
                  palette={palette}
                  styles={styles}
                  onChangeText={updateTaskText}
                  onRemove={removeTask}
                  onReorder={reorderTask}
                  setDraggingTaskId={setDraggingTaskId}
                />
              ))}
            </View>
          </View>
        </View>
      </SafeAreaView>

      <Menu
        open={menuOpen}
        theme={theme}
        palette={palette}
        styles={styles}
        onClose={() => setMenuOpen(false)}
        onSwitchTheme={switchThemeFromMenu}
        onReset={resetTasks}
        onOpenWebsite={openWebsite}
      />
    </View>
  );
}
