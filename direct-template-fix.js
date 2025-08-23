const fs = require('fs');

console.log('🔧 Direct Template Literal Fix...');

// Fix interactionAnimations.ts
const interactionAnimations = `export interface AnimationConfig {
  duration?: number;
  easing?: string;
  delay?: number;
}

export const createHoverAnimation = (config: AnimationConfig = {}) => {
  const { duration = 200, easing = 'ease-in-out' } = config;
  return {
    transition: \`all \${duration}ms \${easing}\`,
    transform: 'scale(1.02)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
  };
};

export const createClickAnimation = (config: AnimationConfig = {}) => {
  const { duration = 150, easing = 'ease-out' } = config;
  return {
    transition: \`transform \${duration}ms \${easing}\`,
    transform: 'scale(0.98)'
  };
};

export const fadeIn = (config: AnimationConfig = {}) => {
  const { duration = 300, delay = 0 } = config;
  return {
    opacity: 0,
    animation: \`fadeIn \${duration}ms ease-in-out \${delay}ms forwards\`
  };
};

export const slideIn = (direction: 'left' | 'right' | 'up' | 'down' = 'up', config: AnimationConfig = {}) => {
  const { duration = 400, delay = 0 } = config;
  const transforms = {
    left: 'translateX(-20px)',
    right: 'translateX(20px)',
    up: 'translateY(20px)',
    down: 'translateY(-20px)'
  };
  
  const directionCapitalized = direction.charAt(0).toUpperCase() + direction.slice(1);
  
  return {
    opacity: 0,
    transform: transforms[direction],
    animation: \`slideIn\${directionCapitalized} \${duration}ms ease-out \${delay}ms forwards\`
  };
};
`;

// Fix monitoredFetch.ts
const monitoredFetch = `export interface MonitoredFetchOptions extends RequestInit {
  skipMonitoring?: boolean;
  operationName?: string;
}

export const monitoredFetch = async (
  input: RequestInfo | URL,
  init?: MonitoredFetchOptions
): Promise<Response> => {
  const startTime = performance.now();
  const operationName = init?.operationName || 'fetch';
  
  try {
    if (init?.skipMonitoring) {
      return await fetch(input, init);
    }
    
    console.log('Starting ' + operationName + ':', input);
    
    const response = await fetch(input, init);
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(operationName + ' completed in ' + duration.toFixed(2) + 'ms', {
      status: response.status,
      statusText: response.statusText,
      url: response.url
    });
    
    return response;
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.error(operationName + ' failed after ' + duration.toFixed(2) + 'ms:', error);
    throw error;
  }
};

export default monitoredFetch;
`;

// Fix accessibility.ts
const accessibility = `export const announceToScreenReader = (message: string) => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

export const addSkipLink = (targetId: string, linkText: string) => {
  const skipLink = document.createElement('a');
  skipLink.href = '#' + targetId;
  skipLink.textContent = linkText;
  skipLink.className = 'sr-only focus:not-sr-only';
  
  document.body.insertBefore(skipLink, document.body.firstChild);
};
`;

// Fix ariaUtils.ts
const ariaUtils = `let idCounter = 0;

export const generateAriaId = (prefix: string = 'aria'): string => {
  idCounter++;
  return prefix + '-' + idCounter;
};

export const createFieldAriaAttributes = (fieldId: string) => {
  const labelId = generateAriaId(fieldId + '-label');
  const errorId = generateAriaId(fieldId + '-error');
  const helpId = generateAriaId(fieldId + '-help');
  
  return {
    labelId,
    errorId,
    helpId
  };
};
`;

// Fix bundleOptimization.ts
const bundleOptimization = `export const loadChunk = async (chunkName: string) => {
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
`;

// Fix imageOptimization.ts
const imageOptimization = `export const generateSrcSet = (src: string, widths: number[]): string => {
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
`;

// Fix theme.ts
const theme = `export const applyTheme = (theme: Record<string, string>) => {
  const root = document.documentElement;
  
  Object.entries(theme).forEach(([key, value]) => {
    root.style.setProperty('--color-' + key, value);
  });
};
`;

// Write all fixes
const fixes = [
  { path: 'frontend/src/utils/interactionAnimations.ts', content: interactionAnimations },
  { path: 'frontend/src/utils/monitoredFetch.ts', content: monitoredFetch },
  { path: 'frontend/src/utils/accessibility.ts', content: accessibility },
  { path: 'frontend/src/utils/ariaUtils.ts', content: ariaUtils },
  { path: 'frontend/src/utils/bundleOptimization.ts', content: bundleOptimization },
  { path: 'frontend/src/utils/imageOptimization.ts', content: imageOptimization },
  { path: 'frontend/src/utils/theme.ts', content: theme }
];

fixes.forEach(({ path, content }) => {
  try {
    fs.writeFileSync(path, content);
    console.log('✅ Fixed:', path);
  } catch (error) {
    console.error('❌ Failed to fix:', path, error.message);
  }
});

console.log('✅ Direct template literal fixes completed!');