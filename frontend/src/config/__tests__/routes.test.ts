import { getRouteConfig, matchRoute, routeConfig } from '../routes';

describe('routes configuration', () => {
  describe('getRouteConfig', () => {
    it('returns config for exact static routes', () => {
      const config = getRouteConfig('/');
      expect(config).toEqual({
        path: '/',
        label: 'Home'
      });
    });

    it('returns config for dynamic routes', () => {
      const config = getRouteConfig('/certificate/123');
      expect(config).toEqual({
        path: '/certificate/:tokenId',
        label: 'Certificate Details',
        dynamic: true,
        generateLabel: expect.any(Function)
      });
    });

    it('returns undefined for non-existent routes', () => {
      const config = getRouteConfig('/non-existent');
      expect(config).toBeUndefined();
    });
  });

  describe('matchRoute', () => {
    it('matches static routes correctly', () => {
      const match = matchRoute('/dashboard');
      expect(match).toEqual({
        config: {
          path: '/dashboard',
          label: 'Issuer Dashboard'
        },
        params: {}
      });
    });

    it('matches dynamic routes and extracts parameters', () => {
      const match = matchRoute('/certificate/123');
      expect(match).toEqual({
        config: {
          path: '/certificate/:tokenId',
          label: 'Certificate Details',
          dynamic: true,
          generateLabel: expect.any(Function)
        },
        params: {
          tokenId: '123'
      });
    });

    it('matches routes with multiple parameters', () => {
      // Add a test route with multiple params for this test
      const originalConfig = [...routeConfig];
      routeConfig.push({
        path: '/user/:userId/post/:postId',
        label: 'User Post',
        dynamic: true,
        generateLabel: (params) => `Post ${params.postId} by User ${params.userId}`
      });

      const match = matchRoute('/user/456/post/789');
      expect(match).toEqual({
        config: {
          path: '/user/:userId/post/:postId',
          label: 'User Post',
          dynamic: true,
          generateLabel: expect.any(Function)
        },
        params: {
          userId: '456',
          postId: '789'
      });

      // Restore original config
      routeConfig.length = 0;
      routeConfig.push(...originalConfig);
    });

    it('returns null for non-matching routes', () => {
      const match = matchRoute('/non-existent');
      expect(match).toBeNull();
    });

    it('prioritizes exact matches over dynamic matches', () => {
      // Add a test to ensure static routes are matched before dynamic ones
      const match = matchRoute('/verify');
      expect(match).toEqual({
        config: {
          path: '/verify',
          label: 'Verify Certificate'
        },
        params: {}
      });
    });
  });

  describe('generateLabel function', () => {
    it('generates labels for certificate routes', () => {
      const match = matchRoute('/certificate/123');
      if (match && match.config.generateLabel) {
        const label = match.config.generateLabel(match.params);
        expect(label).toBe('Certificate #123');
    });

    it('generates labels for verify routes', () => {
      const match = matchRoute('/verify/456');
      if (match && match.config.generateLabel) {
        const label = match.config.generateLabel(match.params);
        expect(label).toBe('Verify Certificate #456');
    });
  });

  describe('route configuration completeness', () => {
    it('includes all expected routes', () => {
      const expectedPaths = [
        '/',
        '/verify',
        '/verify/:tokenId',
        '/certificate/:tokenId',
        '/dashboard',
        '/layout-demo'
      ];

      const configPaths = routeConfig.map(config => config.path);
      expectedPaths.forEach(path => {
        expect(configPaths).toContain(path);
      });
    });

    it('has proper parent relationships', () => {
      const verifyTokenRoute = routeConfig.find(r => r.path === '/verify/:tokenId');
      expect(verifyTokenRoute?.parent).toBe('/verify');
    });

    it('marks dynamic routes correctly', () => {
      const dynamicRoutes = routeConfig.filter(r => r.dynamic);
      expect(dynamicRoutes).toHaveLength(2);
      expect(dynamicRoutes.map(r => r.path)).toEqual([
        '/verify/:tokenId',
        '/certificate/:tokenId'
      ]);
    });
  });
});
}
}}}