export const themes = {
  light: {
    primary: '#2563eb',
    background: '#ffffff',
    text: '#1f2937'
  },
  dark: {
    primary: '#3b82f6',
    background: '#1f2937',
    text: '#f9fafb'
};

export function applyTheme(theme: keyof typeof themes) {
  const root = document.documentElement;
  const themeColors = themes[theme];
  
  Object.entries(themeColors).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value);
  });
}}