export function Logo() {
  const reloadPage = () => {
    location.reload();
    return;
  };

  return (
    <span
      onClick={reloadPage}
      className={
        "mt-5 hidden cursor-pointer text-5xl font-bold text-darkerBlack transition-opacity duration-200 dark:text-lighterWhite xs:block"
      }
    >
      phived
    </span>
  );
}
