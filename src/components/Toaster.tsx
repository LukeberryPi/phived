import { Toaster as Sonner } from "sonner";
import { TOAST_WIDTH } from "src/constants/ui";
import { cn } from "src/utils";

const toastClassName = cn(
  "toast-panel flex justify-center px-5 py-3.5",
  TOAST_WIDTH,
  "text-base font-light text-black dark:text-white"
);

export function Toaster() {
  return (
    <Sonner
      position="top-center"
      expand={false}
      duration={4000}
      closeButton={false}
      visibleToasts={3}
      offset={{ top: 16, bottom: 88 }}
      mobileOffset={{ top: 16, bottom: 112 }}
      icons={{
        success: null,
        info: null,
        warning: null,
        error: null,
        loading: null,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: toastClassName,
          title: "text-center",
          error: cn(toastClassName, "border-red-400 dark:border-red-400"),
        },
      }}
    />
  );
}
