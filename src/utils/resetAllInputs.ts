export const resetAllInputs = () => {
  const inputs = document.querySelectorAll("input");
  inputs.forEach((input) => (input.value = ""));
  inputs[0].focus();
  return;
};
