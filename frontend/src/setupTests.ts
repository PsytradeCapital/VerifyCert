import React from 'react';
import '@testing-library/jest-dom';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => React.createElement('div', props, children),
    button: ({ children, ...props }: any) => React.createElement('button', props, children),
    nav: ({ children, ...props }: any) => React.createElement('nav', props, children),
    section: ({ children, ...props }: any) => React.createElement('section', props, children),
    article: ({ children, ...props }: any) => React.createElement('article', props, children),
  },
  AnimatePresence: ({ children }: any) => React.createElement(React.Fragment, null, children),
}));

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock clipboard API
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: jest.fn().mockResolvedValue(undefined),
    readText: jest.fn().mockResolvedValue(''),
  },
});

// Mock Web Share API
Object.defineProperty(navigator, 'share', {
  value: jest.fn().mockResolvedValue(undefined),
});

// Mock getUserMedia for QR scanner
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: jest.fn().mockResolvedValue({
      getTracks: () => [{ stop: jest.fn() }],
    }),
  },
});

// Global test utilities
global.testUtils = {
  createMockCertificate: (overrides = {}) => ({
    id: '123',
    recipientName: 'John Doe',
    courseName: 'React Development',
    institution: 'Tech Academy',
    issueDate: '2024-01-15',
    isValid: true,
    ...overrides,
  }),
  
  createMockAnalyticsData: (overrides = {}) => ({
    totalCertificates: 150,
    validCertificates: 145,
    invalidCertificates: 5,
    recentActivity: [
      { date: '2024-01-15', count: 10 },
      { date: '2024-01-14', count: 8 },
    ],
    topInstitutions: [
      { name: 'Tech Academy', count: 50 },
      { name: 'Code School', count: 30 },
    ],
    ...overrides,
  }),
};

// Suppress console warnings in tests
const originalWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('React does not recognize')
  ) {
    return;
  originalWarn.call(console, ...args);
};
}