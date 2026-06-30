import { colors, fonts, shadows } from "@phived/tokens";
import { Platform, StyleSheet } from "react-native";
import { ROW_HEIGHT } from "./constants";

export type ThemeName = "light" | "dark";

// Frosted-chrome and alpha values that aren't 1:1 design tokens. Named here so
// the styles below stay free of inline magic numbers.
const FROSTED_SURFACE_DARK = "rgba(10, 12, 16, 0.88)";
const FROSTED_SURFACE_LIGHT = "rgba(249, 250, 251, 0.88)";
const PLACEHOLDER_DARK = "rgba(226, 229, 234, 0.45)";
const PLACEHOLDER_LIGHT = "rgba(8, 8, 17, 0.45)";
const ACCENT_PRESSED_DARK = "#0e7490";
const ACCENT_PRESSED_LIGHT = "#67c7ee";
const DRAG_BORDER_LIGHT = "rgba(8, 8, 17, 0.3)";
const CANVAS_DOT_DARK = "rgba(226, 229, 234, 0.07)";
const CANVAS_DOT_LIGHT = "rgba(0, 0, 0, 0.12)";

export function getPalette(theme: ThemeName) {
  const dark = theme === "dark";

  return {
    appBackground: dark ? colors.canvasDark : colors.canvasLight,
    panelBackground: dark ? colors.surfaceDark : "#ffffff",
    panelBorder: dark ? colors.edgeDark : colors.inkLight,
    panelHairline: dark ? colors.hairlineDark : colors.lineLight,
    primaryText: dark ? colors.inkDark : colors.inkLight,
    mutedText: dark ? colors.mutedDark : colors.mutedLight,
    placeholderText: dark ? PLACEHOLDER_DARK : PLACEHOLDER_LIGHT,
    hoverSurface: dark ? colors.surfaceHoverDark : colors.surfaceHoverLight,
    accent: dark ? colors.actionDark : colors.actionLight,
    accentPressed: dark ? ACCENT_PRESSED_DARK : ACCENT_PRESSED_LIGHT,
    destructiveText: dark ? colors.destructiveDark : colors.destructiveLight,
    destructiveSurface: dark
      ? colors.destructiveSurfaceDark
      : colors.destructiveSurfaceLight,
    canvasDot: dark ? CANVAS_DOT_DARK : CANVAS_DOT_LIGHT,
  };
}

export type Palette = ReturnType<typeof getPalette>;
export type Styles = ReturnType<typeof createStyles>;

export function createStyles(theme: ThemeName) {
  const palette = getPalette(theme);
  const isDark = theme === "dark";
  const panelShadow = isDark ? {} : shadows.brutalistDark;
  const webFocusReset = {
    outlineStyle: "solid" as const,
    outlineWidth: 0,
  };
  const controlSurface = {
    backgroundColor: isDark ? FROSTED_SURFACE_DARK : FROSTED_SURFACE_LIGHT,
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
      borderBottomColor: isDark ? colors.actionDark : colors.actionLight,
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
      // Matches the panel so a reordering row lifts over a clean surface; the
      // red delete backdrop lives on `deleteReveal`, shown only while swiping.
      backgroundColor: palette.panelBackground,
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
      right: 0,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-start",
      paddingLeft: 30,
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
      borderColor: isDark ? colors.edgeDark : DRAG_BORDER_LIGHT,
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
