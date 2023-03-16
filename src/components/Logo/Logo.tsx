export function Logo() {
  const reloadPage = () => {
    location.reload();
    return;
  };

  return (
    <span
      onClick={reloadPage}
      className="mt-5 hidden cursor-pointer text-6xl font-bold text-darkerBlack dark:text-lighterWhite xs:block"
    >
      phived
    </span>
  );
}
