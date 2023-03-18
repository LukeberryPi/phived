import React, { Dispatch, useRef, useEffect } from "react";

export const Alert = ({
  children,
  setShowAlert,
}: {
  children: React.ReactNode;
  setShowAlert: Dispatch<boolean>;
}) => {
  const alertBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (alertBtnRef.current) {
      alertBtnRef.current.focus();
    }

    setTimeout(() => {
      setShowAlert(false);
    }, 5000);
  }, []);

  const handleDismiss = () => {
    setShowAlert(false);
  };

  return (
    <div
      role="alert"
      className="absolute bottom-2  right-2 mb-4  flex gap-2 rounded-lg border-2 bg-lighterWhite py-5 px-6 text-base text-darkBlack dark:bg-darkBlack dark:text-lighterWhite"
    >
      {children}
      <button onClick={handleDismiss} ref={alertBtnRef}>
        <span aria-hidden="true">&#10006;</span>
        <span className="sr-only">close alert</span>
      </button>
    </div>
  );
};
