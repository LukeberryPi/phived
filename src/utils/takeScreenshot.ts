import { toBlob } from "html-to-image";

export async function takeScreenshot(element: HTMLElement) {
  try {
    const blob = await toBlob(element, {
      style: {
        transform: "scale(0.9)",
      },
      skipFonts: true,
      backgroundColor: "transparent",
    });

    if (!blob) throw new Error("No blob found");

    navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);

    const confirm = window.confirm(
      "The screenshot has been copied to clipboard!\n\nClick 'ok' if you also want to download it as png."
    );

    if (!confirm) return;

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "screenshot.png";
    link.click();
  } catch {
    alert("Sorry, something went wrong. Please try again.");
  }
}
