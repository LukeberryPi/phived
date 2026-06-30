import { StyleSheet } from "react-native";
import Svg, { Circle, Defs, Pattern, Rect } from "react-native-svg";
import type { Palette } from "../theme";

export function CanvasDots({ palette }: { palette: Palette }) {
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
          <Circle cx="1.5" cy="1.5" r="1.5" fill={palette.canvasDot} />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#canvasDots)" />
    </Svg>
  );
}
