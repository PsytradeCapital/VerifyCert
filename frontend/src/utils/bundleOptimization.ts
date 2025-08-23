export const loadChunk = async (chunkName: string) => {
  try {
    const module = await import('../components/' + chunkName);
    return module.default;
  } catch (error) {
    console.error('Failed to load chunk:', chunkName, error);
    return null;
  }
};

export const preloadChunks = (chunkNames: string[]) => {
  chunkNames.forEach(chunkName => {
    import('../components/' + chunkName).catch(error => {
      console.warn('Failed to preload chunk:', chunkName, error);
    });
  });
};
