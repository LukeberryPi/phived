import { type DefaultIconProps } from "src/utils/defaultIconProps";

export function ScreenshotIcon({ className, squareWidthAndHeight = 26 }: DefaultIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={squareWidthAndHeight}
      height={squareWidthAndHeight}
      viewBox="0 -960 960 960"
    >
      <path
        className={className}
        d="M479.5-266q72.5 0 121.5-49t49-121.5q0-72.5-49-121T479.5-606q-72.5 0-121 48.5t-48.5 121q0 72.5 48.5 121.5t121 49Zm0-60q-47.5 0-78.5-31.5t-31-79q0-47.5 31-78.5t78.5-31q47.5 0 79 31t31.5 78.5q0 47.5-31.5 79t-79 31.5ZM140-120q-24 0-42-18t-18-42v-513q0-23 18-41.5t42-18.5h147l73-87h240l73 87h147q23 0 41.5 18.5T880-693v513q0 24-18.5 42T820-120H140Zm680-60v-513H645l-73-87H388l-73 87H140v513h680ZM480-436Z"
      />
    </svg>
  );
}
