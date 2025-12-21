export const setTheme = (theme) => {
  localStorage.setItem("theme", theme);
  document.documentElement.setAttribute("data-theme", theme);
};

export const getTheme = () => {
  return localStorage.getItem("theme") || "light"; // Default to light theme
};

export const toggleTheme = () => {
  const currentTheme = getTheme();
  const newTheme = currentTheme === "light" ? "dark" : "light";
  setTheme(newTheme);
};
