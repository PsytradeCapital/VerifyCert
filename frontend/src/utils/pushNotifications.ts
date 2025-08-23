export interface PushNotificationConfig {
  apiEndpoint: string;
  vapidKey: string;
}

export class PushNotificationManager {
  private config: PushNotificationConfig;
  
  constructor(config: PushNotificationConfig) {
    this.config = config;
  }
  
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported');
    }
    
    return await Notification.requestPermission();
  }
  
  async subscribe(): Promise<PushSubscription | null> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      throw new Error('Push messaging not supported');
    }
    
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.config.vapidKey
      });
      
      const response = await fetch(this.config.apiEndpoint + '/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscription)
      });
      
      if (!response.ok) {
        throw new Error('Failed to subscribe');
      }
      
      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  }
}
