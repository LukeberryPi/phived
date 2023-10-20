function generateRandomHexCode() {
  const validChars = "abcdef0123456789";
  let hexcode = "#";

  for (let i = 0; i < 6; i++) {
    const char = validChars[Math.floor(Math.random() * validChars.length)];
    hexcode += char;
  }

  return hexcode;
}
