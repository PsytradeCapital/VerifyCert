export const themes = {
  light: {
    primary: '#3b82f6',
    secondary: '#64748b',
    background: '#ffffff',
    text: '#1f2937'
  },
  dark: {
    primary: '#60a5fa',
    secondary: '#94a3b8',
    background: '#1f2937',
    text: '#f9fafb'
  }
};

export function applyTheme(theme: keyof typeof themes) {
  const root = document.documentElement;
  const themeColors = themes[theme];
  
  Object.entries(themeColors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });
}
