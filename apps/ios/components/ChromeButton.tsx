import { type Icon as IconType } from "phosphor-react-native";
import { Pressable, Text } from "react-native";
import type { Palette, Styles } from "../theme";

type ChromeButtonProps = {
  label: string;
  icon: IconType;
  onPress: () => void;
  palette: Palette;
  styles: Styles;
  /** Render a square icon-only button (label becomes the accessibility name). */
  iconOnly?: boolean;
};

export function ChromeButton({
  label,
  icon: Icon,
  onPress,
  palette,
  styles,
  iconOnly = false,
}: ChromeButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        iconOnly ? styles.iconChromeButton : styles.chromeButton,
        pressed && styles.pressFeedback,
      ]}
    >
      <Icon
        size={iconOnly ? 22 : 20}
        color={palette.primaryText}
        weight={iconOnly ? "bold" : "regular"}
      />
      {!iconOnly && <Text style={styles.chromeButtonText}>{label}</Text>}
    </Pressable>
  );
}
