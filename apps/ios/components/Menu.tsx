import {
  ArrowCounterClockwise,
  Globe,
  Moon,
  Sun,
  type Icon as IconType,
} from "phosphor-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Palette, Styles, ThemeName } from "../theme";

type MenuProps = {
  open: boolean;
  theme: ThemeName;
  palette: Palette;
  styles: Styles;
  onClose: () => void;
  onSwitchTheme: () => void;
  onReset: () => void;
  onOpenWebsite: () => void;
};

export function Menu({
  open,
  theme,
  palette,
  styles,
  onClose,
  onSwitchTheme,
  onReset,
  onOpenWebsite,
}: MenuProps) {
  if (!open) {
    return null;
  }

  return (
    <View style={styles.menuLayer}>
      <Pressable
        accessibilityLabel="close menu"
        style={StyleSheet.absoluteFill}
        onPress={onClose}
      />
      <View style={styles.menuSurface}>
        <MenuItem
          label={`switch to ${theme === "dark" ? "light" : "dark"}`}
          icon={theme === "dark" ? Sun : Moon}
          onPress={onSwitchTheme}
          palette={palette}
          styles={styles}
        />
        <MenuItem
          label="reset tasks"
          icon={ArrowCounterClockwise}
          onPress={onReset}
          palette={palette}
          styles={styles}
        />
        <MenuItem
          label="go to website"
          icon={Globe}
          onPress={onOpenWebsite}
          palette={palette}
          styles={styles}
        />
      </View>
    </View>
  );
}

type MenuItemProps = {
  label: string;
  icon: IconType;
  onPress: () => void;
  palette: Palette;
  styles: Styles;
};

function MenuItem({
  label,
  icon: Icon,
  onPress,
  palette,
  styles,
}: MenuItemProps) {
  return (
    <Pressable
      accessibilityRole="menuitem"
      onPress={onPress}
      style={({ pressed }) => [styles.menuItem, pressed && styles.menuPress]}
    >
      <Icon size={16} color={palette.primaryText} />
      <Text style={styles.menuItemText}>{label}</Text>
    </Pressable>
  );
}
