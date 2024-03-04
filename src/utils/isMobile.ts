export function isMobile() {
  // Regular expression to check if the user agent contains 'Mobile' or is a common mobile browser
  const mobileRegex =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

  // Check if the user agent matches the mobileRegex
  return navigator.userAgent.match(mobileRegex) !== null;
}
