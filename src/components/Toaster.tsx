import { Toaster as Sonner } from "sonner";
import { cn } from "src/utils";

const toastClassName = cn(
  "phived-surface flex w-full justify-center px-5 py-3.5",
  "text-base font-medium text-black dark:text-white"
);

export function Toaster() {
  return (
    <Sonner
      position="top-center"
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
