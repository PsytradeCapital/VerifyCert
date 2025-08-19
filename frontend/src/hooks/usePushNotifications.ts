import { useState, useEffect, useCallback } from 'react';
import pushNotificationManager from '../utils/pushNotifications';

interface PushNotificationState {
  isSupported: boolean;
  isSubscribed: boolean;
  permission: NotificationPermission;
  isLoading: boolean;
  error: string | null;

interface UsePushNotificationsReturn extends PushNotificationState {
  subscribe: (userId: string) => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  sendTestNotification: (userId: string) => Promise<boolean>;
  requestPermission: () => Promise<NotificationPermission>;
  clearError: () => void;

export const usePushNotifications = (): UsePushNotificationsReturn => {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    isSubscribed: false,
    permission: 'default',
    isLoading: true,
    error: null
  });

  // Initialize push notifications
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        // Check if push notifications are supported
        const isSupported = pushNotificationManager.isSupported();
        
        if (!isSupported) {
          setState(prev => ({
            ...prev,
            isSupported: false,
            isLoading: false,
            error: 'Push notifications are not supported in this browser'
          }));
          return;

        // Initialize the notification manager
        await pushNotificationManager.initializeNotifications();

        // Get current status
        const status = pushNotificationManager.getSubscriptionStatus();

        setState(prev => ({
          ...prev,
          isSupported: true,
          isSubscribed: status.isSubscribed,
          permission: status.permission,
          isLoading: false
        }));

      } catch (error) {
        console.error('Failed to initialize push notifications:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to initialize push notifications'
        }));
    };

    initializeNotifications();
  }, []);

  // Subscribe to push notifications
  const subscribe = useCallback(async (userId: string): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const success = await pushNotificationManager.subscribe(userId);
      
      if (success) {
        const status = pushNotificationManager.getSubscriptionStatus();
        setState(prev => ({
          ...prev,
          isSubscribed: status.isSubscribed,
          permission: status.permission,
          isLoading: false
        }));
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to subscribe to push notifications'
        }));

      return success;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to subscribe to push notifications'
      }));
      return false;
  }, []);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const success = await pushNotificationManager.unsubscribe();
      
      if (success) {
        const status = pushNotificationManager.getSubscriptionStatus();
        setState(prev => ({
          ...prev,
          isSubscribed: status.isSubscribed,
          permission: status.permission,
          isLoading: false
        }));
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to unsubscribe from push notifications'
        }));

      return success;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to unsubscribe from push notifications'
      }));
      return false;
  }, []);

  // Send test notification
  const sendTestNotification = useCallback(async (userId: string): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, error: null }));
      
      const success = await pushNotificationManager.sendTestNotification(userId);
      
      if (!success) {
        setState(prev => ({
          ...prev,
          error: 'Failed to send test notification'
        }));

      return success;
    } catch (error) {
      console.error('Error sending test notification:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to send test notification'
      }));
      return false;
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    try {
      setState(prev => ({ ...prev, error: null }));
      
      const permission = await pushNotificationManager.requestPermission();
      
      setState(prev => ({
        ...prev,
        permission
      }));

      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to request notification permission'
      }));
      return 'denied';
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    subscribe,
    unsubscribe,
    sendTestNotification,
    requestPermission,
    clearError
  };
};

export default usePushNotifications;