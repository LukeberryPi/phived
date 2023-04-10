export function Logo() {
  const reloadPage = () => {
    location.reload();
    return;
  };

  return (
    <span
      onClick={reloadPage}
      className={
        "hidden cursor-pointer text-3xl font-bold text-darkerBlack dark:text-lighterWhite sm:block"
      }
    >
      phived
    </span>
  );
}
