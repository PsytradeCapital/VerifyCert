export const getBrowserInfo = () => {
  const userAgent = navigator.userAgent;
  
  const isChrome = /Chrome/.test(userAgent) && /Google Inc/.test(navigator.vendor);
  const isFirefox = /Firefox/.test(userAgent);
  const isSafari = /Safari/.test(userAgent) && /Apple Computer/.test(navigator.vendor);
  const isEdge = /Edg/.test(userAgent);
  
  return {
    isChrome,
    isFirefox,
    isSafari,
    isEdge,
    userAgent,
    isMobile: /Mobi|Android/i.test(userAgent)
  };
};

export const supportsWebP = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

export const getViewportSize = () => ({
  width: window.innerWidth,
  height: window.innerHeight
});
