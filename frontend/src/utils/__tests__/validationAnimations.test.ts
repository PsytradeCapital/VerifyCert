import {
  triggerValidationAnimation,
  getValidationAnimationClasses,
  validationAnimationClasses,
  validationStateAnimations,;
  validationSequences,;;
  createStaggeredDelay,;;
  defaultAnimationConfig;;
} from '../validationAnimations';

// Mock DOM methods
const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();
const mockClassListAdd = jest.fn();
const mockClassListRemove = jest.fn();

const createMockElement = () => ({
  addEventListener: mockAddEventListener,
  removeEventListener: mockRemoveEventListener,
  classList: {
    add: mockClassListAdd,
    remove: mockClassListRemove
  },
  style: {}
} as any);

describe('validationAnimations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('triggerValidationAnimation', () => {
    it('applies animation class to element', async () => {
      const mockElement = createMockElement();
      
      // Mock animation end event
      mockAddEventListener.mockImplementation((event, callback) => {
        if (event === 'animationend') {
          setTimeout(callback, 10);
      });

      await triggerValidationAnimation(mockElement, 'errorShake');

      expect(mockClassListAdd).toHaveBeenCalledWith('animate-error-shake');
      expect(mockAddEventListener).toHaveBeenCalledWith('animationend', expect.any(Function));
    });

    it('removes animation class after animation ends', async () => {
      const mockElement = createMockElement();
      
      mockAddEventListener.mockImplementation((event, callback) => {
        if (event === 'animationend') {
          setTimeout(callback, 10);
      });

      await triggerValidationAnimation(mockElement, 'errorShake');

      // Wait for animation to complete
      await new Promise(resolve => setTimeout(resolve, 20));

      expect(mockClassListRemove).toHaveBeenCalledWith('animate-error-shake');
      expect(mockRemoveEventListener).toHaveBeenCalledWith('animationend', expect.any(Function));
    });

    it('applies custom animation configuration', async () => {
      const mockElement = createMockElement();
      const customConfig = {
        duration: 500,
        easing: 'ease-out',
        delay: 100
      };

      mockAddEventListener.mockImplementation((event, callback) => {
        if (event === 'animationend') {
          setTimeout(callback, 10);
      });

      await triggerValidationAnimation(mockElement, 'errorShake', customConfig);

      expect(mockElement.style.animationDuration).toBe('500ms');
      expect(mockElement.style.animationTimingFunction).toBe('ease-out');
      expect(mockElement.style.animationDelay).toBe('100ms');
    });

    it('cleans up custom styles after animation', async () => {
      const mockElement = createMockElement();
      const customConfig = { duration: 500 };

      mockAddEventListener.mockImplementation((event, callback) => {
        if (event === 'animationend') {
          setTimeout(callback, 10);
      });

      await triggerValidationAnimation(mockElement, 'errorShake', customConfig);

      // Wait for cleanup
      await new Promise(resolve => setTimeout(resolve, 20));

      expect(mockElement.style.animationDuration).toBe('');
      expect(mockElement.style.animationTimingFunction).toBe('');
      expect(mockElement.style.animationDelay).toBe('');
    });
  });

  describe('getValidationAnimationClasses', () => {
    it('returns correct animation classes for validation states', () => {
      expect(getValidationAnimationClasses('error', 'field')).toBe('animate-error-shake');
      expect(getValidationAnimationClasses('error', 'message')).toBe('animate-slide-in-error');
      expect(getValidationAnimationClasses('error', 'icon')).toBe('animate-error-pulse');

      expect(getValidationAnimationClasses('success', 'field')).toBe('animate-success-glow');
      expect(getValidationAnimationClasses('success', 'message')).toBe('animate-slide-in-success');
      expect(getValidationAnimationClasses('success', 'icon')).toBe('animate-success-bounce');

      expect(getValidationAnimationClasses('warning', 'field')).toBe('animate-warning-glow');
      expect(getValidationAnimationClasses('warning', 'message')).toBe('animate-slide-in-warning');
      expect(getValidationAnimationClasses('warning', 'icon')).toBe('animate-warning-wiggle');

      expect(getValidationAnimationClasses('default', 'field')).toBe('');
      expect(getValidationAnimationClasses('default', 'message')).toBe('animate-fade-in');
      expect(getValidationAnimationClasses('default', 'icon')).toBe('animate-fade-in');
    });
  });

  describe('validationAnimationClasses', () => {
    it('contains all expected animation classes', () => {
      expect(validationAnimationClasses).toHaveProperty('errorShake');
      expect(validationAnimationClasses).toHaveProperty('errorPulse');
      expect(validationAnimationClasses).toHaveProperty('successBounce');
      expect(validationAnimationClasses).toHaveProperty('warningWiggle');
      expect(validationAnimationClasses).toHaveProperty('fadeIn');
      expect(validationAnimationClasses).toHaveProperty('slideUp');
      expect(validationAnimationClasses).toHaveProperty('scaleIn');

      expect(validationAnimationClasses.errorShake).toBe('animate-shake');
      expect(validationAnimationClasses.successBounce).toBe('animate-success-bounce');
    });
  });

  describe('validationStateAnimations', () => {
    it('maps validation states to appropriate animations', () => {
      expect(validationStateAnimations.error).toEqual({
        field: 'animate-error-shake',
        message: 'animate-slide-in-error',
        icon: 'animate-error-pulse'
      });

      expect(validationStateAnimations.success).toEqual({
        field: 'animate-success-glow',
        message: 'animate-slide-in-success',
        icon: 'animate-success-bounce'
      });

      expect(validationStateAnimations.warning).toEqual({
        field: 'animate-warning-glow',
        message: 'animate-slide-in-warning',
        icon: 'animate-warning-wiggle'
      });

      expect(validationStateAnimations.default).toEqual({
        field: '',
        message: 'animate-fade-in',
        icon: 'animate-fade-in'
      });
    });
  });

  describe('validationSequences', () => {
    it('defines animation sequences for each validation state', () => {
      expect(validationSequences.errorSequence).toEqual([
        { element: 'field', animation: 'errorShake', delay: 0 },
        { element: 'message', animation: 'errorSlideIn', delay: 100 },
        { element: 'icon', animation: 'errorPulse', delay: 150
      ]);

      expect(validationSequences.successSequence).toEqual([
        { element: 'field', animation: 'successBounce', delay: 0 },
        { element: 'icon', animation: 'successBounce', delay: 50 },
        { element: 'message', animation: 'successFadeIn', delay: 100
      ]);

      expect(validationSequences.warningSequence).toEqual([
        { element: 'field', animation: 'warningWiggle', delay: 0 },
        { element: 'message', animation: 'warningFadeIn', delay: 100 },
        { element: 'icon', animation: 'warningWiggle', delay: 150
      ]);
    });
  });

  describe('createStaggeredDelay', () => {
    it('creates staggered delays based on index', () => {
      expect(createStaggeredDelay(0)).toBe(0);
      expect(createStaggeredDelay(1)).toBe(50);
      expect(createStaggeredDelay(2)).toBe(100);
      expect(createStaggeredDelay(3)).toBe(150);
    });

    it('accepts custom base delay', () => {
      expect(createStaggeredDelay(0, 100)).toBe(0);
      expect(createStaggeredDelay(1, 100)).toBe(100);
      expect(createStaggeredDelay(2, 100)).toBe(200);
    });
  });

  describe('defaultAnimationConfig', () => {
    it('provides sensible default values', () => {
      expect(defaultAnimationConfig).toEqual({
        duration: 300,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        delay: 0
      });
    });
  });
});
}}}}}}}