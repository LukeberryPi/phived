export const colors = {
  inkLight: "#080811",
  paperLight: "#fdfdff",
  mutedLight: "#71717a",
  lineLight: "#a1a1aa",
  canvasLight: "#f9fafb",
  surfaceHoverLight: "#f4f4f5",
  canvasDark: "#0a0c10",
  surfaceDark: "#14171d",
  surfaceHoverDark: "#1b1f27",
  surfaceActiveDark: "#21262f",
  hairlineDark: "#262b34",
  edgeDark: "#363d49",
  inkDark: "#e2e5ea",
  mutedDark: "#8b919d",
  actionLight: "#7dd3fc",
  actionDark: "#155e75",
  destructiveLight: "#dc2626",
  destructiveDark: "#f87171",
  destructiveSurfaceLight: "#fee2e2",
  destructiveSurfaceDark: "#450a0a",
} as const;

export const fonts = {
  sans: "DM Sans",
  mono: "DM Mono",
} as const;

export const easings = {
  outStrong: [0.23, 1, 0.32, 1],
} as const;

export const shadows = {
  brutalistDark: {
    shadowColor: colors.inkLight,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  brutalistLight: {
    shadowColor: colors.paperLight,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
} as const;

export const tokens = {
  colors,
  easings,
  fonts,
  shadows,
} as const;
