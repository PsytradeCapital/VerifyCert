import {
  generateImageSrcSet,
  optimizeImageUrl,
  getResponsiveImagePropsSync,
  ImageOptimizationOptions
} from '../imageOptimization';

describe('Image Optimization Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Image URL Optimization', () => {
    it('should return original URL for external images', () => {
      const externalSrc = 'https://example.com/image.jpg';
      const result = optimizeImageUrl(externalSrc);
      expect(result).toBe(externalSrc);
    });

    it('should return original URL for data URLs', () => {
      const dataSrc = 'data:image/png;base64,mock';
      const result = optimizeImageUrl(dataSrc);
      expect(result).toBe(dataSrc);
    });

    it('should add optimization parameters for local images', () => {
      const src = '/image.jpg';
      const options: ImageOptimizationOptions = {
        quality: 70,
        width: 800,
        height: 600,
        format: 'webp'
      };
      
      const result = optimizeImageUrl(src, options);
      expect(result).toContain('q=70');
      expect(result).toContain('w=800');
      expect(result).toContain('h=600');
      expect(result).toContain('f=webp');
    });

    it('should handle default quality', () => {
      const src = '/image.jpg';
      const result = optimizeImageUrl(src, {});
      // Should not add quality parameter for default value (80)
      expect(result).toBe(src);
    });
  });

  describe('Responsive Image Generation', () => {
    it('should generate srcSet with default sizes', () => {
      const src = '/image.jpg';
      const result = generateImageSrcSet(src);
      
      expect(result).toContain('320w');
      expect(result).toContain('640w');
      expect(result).toContain('1024w');
      expect(result).toContain('1280w');
    });

    it('should generate srcSet with custom sizes', () => {
      const src = '/image.jpg';
      const sizes = [400, 800];
      const result = generateImageSrcSet(src, sizes);
      
      expect(result).toContain('400w');
      expect(result).toContain('800w');
      expect(result).not.toContain('320w');
    });

    it('should generate srcSet with WebP format', () => {
      const src = '/image.jpg';
      const result = generateImageSrcSet(src, [320, 640], 'webp');
      
      expect(result).toContain('f=webp');
      expect(result).toContain('320w');
      expect(result).toContain('640w');
    });
  });

  describe('Responsive Image Props', () => {
    it('should generate responsive image props with all options', () => {
      const src = '/image.jpg';
      const alt = 'Test image';
      const options: ImageOptimizationOptions = {
        width: 800,
        height: 600,
        lazy: false,
        quality: 85,
        sizes: '(max-width: 640px) 100vw, 50vw'
      };

      const props = getResponsiveImagePropsSync(src, alt, options);
      
      expect(props.src).toContain('q=85');
      expect(props.alt).toBe(alt);
      expect(props.width).toBe(800);
      expect(props.height).toBe(600);
      expect(props.loading).toBe('eager');
      expect(props.decoding).toBe('async');
      expect(props.srcSet).toBeDefined();
      expect(props.sizes).toBe('(max-width: 640px) 100vw, 50vw');
    });

    it('should use lazy loading by default', () => {
      const props = getResponsiveImagePropsSync('/image.jpg', 'Test');
      expect(props.loading).toBe('lazy');
    });

    it('should use default sizes when not specified', () => {
      const props = getResponsiveImagePropsSync('/image.jpg', 'Test');
      expect(props.sizes).toBe('(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw');
    });
  });

  describe('Image Format Handling', () => {
    it('should handle different image formats in srcSet', () => {
      const jpegResult = generateImageSrcSet('/image.jpg', [320, 640], 'jpeg');
      const pngResult = generateImageSrcSet('/image.png', [320, 640], 'png');
      const webpResult = generateImageSrcSet('/image.webp', [320, 640], 'webp');

      expect(jpegResult).toContain('f=jpeg');
      expect(pngResult).toContain('f=png');
      expect(webpResult).toContain('f=webp');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty src', () => {
      const result = optimizeImageUrl('');
      expect(result).toBe('');
    });

    it('should handle undefined options', () => {
      const result = optimizeImageUrl('/image.jpg');
      expect(result).toBe('/image.jpg');
    });

    it('should handle empty sizes array', () => {
      const result = generateImageSrcSet('/image.jpg', []);
      expect(result).toBe('');
    });
  });
});