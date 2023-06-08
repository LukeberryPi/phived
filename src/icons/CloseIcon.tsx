import { type DefaultIconProps } from "src/utils/defaultIconProps";

interface CloseIconProps extends DefaultIconProps {
  onClick?: () => void;
}

export function CloseIcon({ className, squareWidthAndHeight = 26, onClick }: CloseIconProps) {
  const onCloseIconClick = () => {
    onClick && onClick();
  };

  return (
    <svg
      onClick={onCloseIconClick}
      xmlns="http://www.w3.org/2000/svg"
      width={squareWidthAndHeight}
      height={squareWidthAndHeight}
      className={className}
      viewBox="0 0 26 26"
    >
      <path
        className={className}
        d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10s10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17L12 13.41L8.41 17L7 15.59L10.59 12L7 8.41L8.41 7L12 10.59L15.59 7L17 8.41L13.41 12L17 15.59z"
      />
    </svg>
  );
}
