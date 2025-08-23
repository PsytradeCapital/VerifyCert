export const applyTheme = (theme: Record<string, string>) => {
  const root = document.documentElement;
  
  Object.entries(theme).forEach(([key, value]) => {
    root.style.setProperty('--color-' + key, value);
  });
};
