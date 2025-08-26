import { useState, useEffect, useCallback } from 'react';

interface PushNotificationState {
  isSupported: boolean;
  permission: NotificationPermission;
  isSubscribed: boolean;
  subscription: PushSubscription | null;
}

export const usePushNotifications = () => {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    permission: 'default',
    isSubscribed: false,
    subscription: null
  });

  // Check support and permission on mount
  useEffect(() => {
    const checkSupport = () => {
      const isSupported = 'Notification' in window && 'serviceWorker' in navigator;
      const permission = isSupported ? Notification.permission : 'denied';
      
      setState(prev => ({
        ...prev,
        isSupported,
        permission
      }));
    };

    checkSupport();
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!state.isSupported) {
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      setState(prev => ({ ...prev, permission }));
      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }, [state.isSupported]);

  // Subscribe to push notifications
  const subscribe = useCallback(async (vapidKey?: string): Promise<PushSubscription | null> => {
    if (!state.isSupported || state.permission !== 'granted') {
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey
      });

      setState(prev => ({
        ...prev,
        isSubscribed: true,
        subscription
      }));

      return subscription;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return null;
    }
  }, [state.isSupported, state.permission]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!state.subscription) {
      return false;
    }

    try {
      const success = await state.subscription.unsubscribe();
      if (success) {
        setState(prev => ({
          ...prev,
          isSubscribed: false,
          subscription: null
        }));
      }
      return success;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      return false;
    }
  }, [state.subscription]);

  // Send a test notification
  const sendTestNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (state.permission === 'granted') {
      new Notification(title, {
        body: 'This is a test notification from VerifyCert',
        icon: '/favicon.ico',
        ...options
      });
    }
  }, [state.permission]);

  // Check if already subscribed
  useEffect(() => {
    const checkSubscription = async () => {
      if (!state.isSupported || state.permission !== 'granted') {
        return;
      }

      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        
        setState(prev => ({
          ...prev,
          isSubscribed: !!subscription,
          subscription
        }));
      } catch (error) {
        console.error('Error checking push subscription:', error);
      }
    };

    checkSubscription();
  }, [state.isSupported, state.permission]);

  return {
    ...state,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification
  };
};

export default usePushNotifications;