import type { CSSProperties } from "react";
import { Toaster as Sonner } from "sonner";
import { cn } from "src/utils";

const toastClassName = cn(
  "toast-panel flex w-full justify-center px-5 py-3.5",
  "text-base font-light text-black dark:text-ink"
);

export function Toaster() {
  return (
    <Sonner
      position="bottom-center"
      expand={false}
      duration={4000}
      closeButton={false}
      visibleToasts={3}
      offset={{ bottom: 88 }}
      mobileOffset={{ bottom: 112 }}
      style={{ "--width": "400px" } as CSSProperties}
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
