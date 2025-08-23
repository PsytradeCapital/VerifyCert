export const loadComponent = async (componentPath: string) => {
  try {
    const module = await import(componentPath);
    return module.default || module;
  } catch (error) {
    console.error('Failed to load component:', componentPath, error);
    return null;
  }
};

export const preloadComponent = (componentPath: string) => {
  import(componentPath).catch(error => {
    console.warn('Failed to preload component:', componentPath, error);
  });
};
