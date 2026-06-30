import { easings } from "@phived/tokens";
import { Easing, Platform } from "react-native";

/** Fixed task row height; also the drag step size for reordering. */
export const ROW_HEIGHT = 52;

/** Horizontal travel (px) past which a swipe commits to deleting. */
export const SWIPE_DELETE_DISTANCE = 96;

/** Minimum horizontal travel before a gesture is claimed as a swipe. */
export const SWIPE_CLAIM_THRESHOLD = 6;

/** Fraction of the row width that also commits a delete on release. */
export const SWIPE_DELETE_WIDTH_RATIO = 0.38;

/** Release velocity (native only) that flicks a row away to delete. */
export const SWIPE_FLICK_VELOCITY = 0.65;

export const OUT_STRONG = Easing.bezier(...easings.outStrong);

/** Animated transforms run on the native thread everywhere except web. */
export const USE_NATIVE_DRIVER = Platform.OS !== "web";

export const IS_WEB = Platform.OS === "web";
