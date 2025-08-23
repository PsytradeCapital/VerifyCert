import { lazy } from 'react';

export const lazyLoad = (importFunc: () => Promise<any>) => {
  return lazy(importFunc);
};

export const preloadRoute = (importFunc: () => Promise<any>) => {
  importFunc().catch(() => {
    // Ignore preload errors
  });
};
