export const opacity = (hexColor = '#ffffff', opacity = 1) => {
  if (!/^#[0-9A-F]{6}$/i.test(hexColor) || opacity < 0 || opacity > 1) return undefined;

  let r = parseInt(hexColor.slice(1, 3), 16);
  let g = parseInt(hexColor.slice(3, 5), 16);
  let b = parseInt(hexColor.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};
