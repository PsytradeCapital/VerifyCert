import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
}
}
}
  children: React.ReactNode;
  requireVerified?: boolean;
  requiredRole?: 'user' | 'issuer' | 'admin';
  requireAuth?: boolean;
  requireVerification?: boolean;
  allowedRoles?: string[];

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireVerified = true,
  requiredRole,
  requireAuth = true,
  requireVerification = true,
  allowedRoles
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );

  // Redirect to login if not authenticated and auth is required
  if (requireAuth && (!isAuthenticated || !user)) {
    return <Navigate to="/login" state={{ from: location }} replace />;

  // Redirect to verification if account is not verified and verification is required
  if ((requireVerified || requireVerification) && user && !user.isVerified) {
    return <Navigate to="/verify-otp" replace />;

  // Check role requirements
  if (requiredRole) {
    const roleHierarchy = {
      'user': 1,
      'issuer': 2,
      'admin': 3
    };

    const userLevel = roleHierarchy[user?.role || 'user'] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;

    if (userLevel < requiredLevel) {
      return <Navigate to="/unauthorized" replace />;

  // Check allowed roles
  if (allowedRoles && user) {
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/unauthorized" replace />;

  return <>{children}</>;
};
}
}}}}