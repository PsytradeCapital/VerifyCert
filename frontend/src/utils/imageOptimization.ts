export const generateSrcSet = (src: string, widths: number[]): string => {
  return widths.map(width => src + ' ' + width + 'w').join(', ');
};

export const lazyLoadImage = (img: HTMLImageElement, src: string) => {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          img.src = src;
          observer.unobserve(img);
        }
      });
    });
    observer.observe(img);
  } else {
    img.src = src;
  }
};
