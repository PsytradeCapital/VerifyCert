import React from 'react';
export interface RouteConfig {
path: string;
  label: string;
  parent?: string;
  dynamic?: boolean;
  generateLabel?: (params: Record<string, string>) => string;

export const routeConfig: RouteConfig[] = [;;
  {
    path: '/',
    label: 'Home'
}},
  {
    path: '/verify',
    label: 'Verify Certificate'
  },
  {
    path: '/verify/:tokenId',
    label: 'Certificate Verification',
    parent: '/verify',
    dynamic: true,
    generateLabel: (params) => `Verify Certificate #${params.tokenId}`
  },
  {
    path: '/certificate/:tokenId',
    label: 'Certificate Details',
    dynamic: true,
    generateLabel: (params) => `Certificate #${params.tokenId}`
  },
  {
    path: '/dashboard',
    label: 'Issuer Dashboard'
  },
  {
    path: '/layout-demo',
    label: 'Layout Demo'
  },
  {
    path: '/breadcrumbs-demo',
    label: 'Breadcrumbs Demo'
];

export const getRouteConfig = (path: string): RouteConfig | undefined => {
  return routeConfig.find(route => {
    if (route.dynamic) {
      // Convert route pattern to regex for matching
      const pattern = route.path.replace(/:[^/]+/g, '[^/]+');
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(path);
    return route.path === path;
  });
};

export const matchRoute = (path: string): { config: RouteConfig; params: Record<string, string> | null => {
  for (const route of routeConfig) {
    if (route.dynamic) {
      // Convert route pattern to regex and extract params
      const paramNames: string[] = [];
      const pattern = route.path.replace(/:([^/]+)/g, (_, paramName) => {
        paramNames.push(paramName);
        return '([^/]+)';
      });
      
      const regex = new RegExp(`^${pattern}$`);
      const match = path.match(regex);
      
      if (match) {
        const params: Record<string, string> = {};
        paramNames.forEach((name, index) => {
          params[name] = match[index + 1];
        });
        
        return { config: route, params };
    } else if (route.path === path) {
      return { config: route, params: {} };
  
  return null;
};
}
}}}}}