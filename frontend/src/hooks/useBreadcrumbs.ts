import React from 'react';
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { matchRoute, routeConfig, RouteConfig } from '../config/routes';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;

export const useBreadcrumbs = (): BreadcrumbItem[] => {
  const location = useLocation();

  return useMemo(() => {
    const breadcrumbs: BreadcrumbItem[] = [];
    const currentPath = location.pathname;

    // Find the current route configuration
    const routeMatch = matchRoute(currentPath);
    
    if (!routeMatch) {
      // If no route config found, create a simple breadcrumb
      return [
        { label: 'Home', href: '/' },
        { label: 'Unknown Page', active: true
      ];

    const { config, params } = routeMatch;

    // Build breadcrumb trail (currently unused but kept for potential future use)
    const buildBreadcrumbTrail = (routeConfigItem: RouteConfig, params: Record<string, string>): BreadcrumbItem[] => {
      const trail: BreadcrumbItem[] = [];

      // Add parent breadcrumbs recursively
      if (routeConfigItem.parent) {
        const parentConfig = routeConfig.find(r => r.path === routeConfigItem.parent);
        if (parentConfig) {
          trail.push(...buildBreadcrumbTrail(parentConfig, {}));

      // Add current breadcrumb
      const label = routeConfigItem.generateLabel ? routeConfigItem.generateLabel(params) : routeConfigItem.label;
      trail.push({
        label,
        href: routeConfigItem.path === currentPath ? undefined : routeConfigItem.path,
        active: routeConfigItem.path === currentPath
      });

      return trail;
    };

    // Always start with Home if not already there
    if (currentPath !== '/') {
      breadcrumbs.push({
        label: 'Home',
        href: '/'
      });

    // Add the route-specific breadcrumbs
    if (config.parent) {
      // Find parent config and add it
      const parentConfig = routeConfig.find(r => r.path === config.parent);
      if (parentConfig && parentConfig.path !== '/') {
        breadcrumbs.push({
          label: parentConfig.label,
          href: parentConfig.path
        });

    // Add current page
    const currentLabel = config.generateLabel ? config.generateLabel(params) : config.label;
    breadcrumbs.push({
      label: currentLabel,
      active: true
    });

    return breadcrumbs;
  }, [location.pathname]);
};

export default useBreadcrumbs;
}}}}}}}}