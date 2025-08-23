import React from 'react';

// Tree-shakable utility functions
export const utils = {
  // Array utilities
  chunk: <T>(array: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    return chunks;
  },

  // Object utilities
  pick: <T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
    const result = {} as Pick<T, K>;
    keys.forEach(key => {
      if (key in obj) {
        result[key] = obj[key];
    });
    return result;
  },

  omit: <T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
    const result = { ...obj };
    keys.forEach(key => {
      delete result[key];
    });
    return result;
};

// Tree-shakable React utilities
export const createReactUtils = () => {
  return {
    memo: React.memo,
    useCallback: React.useCallback,
    useMemo: React.useMemo,
    useState: React.useState,
    useEffect: React.useEffect
  };
};

// Tree-shakable icon imports
export const createIconUtils = () => {
  return {
    // Placeholder for icon utilities
    getIcon: (name: string) => name
  };
};

// Bundle size monitoring
export const monitorBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    const logBundleInfo = () => {
      console.log('Bundle monitoring active');
    };
    logBundleInfo();
};
