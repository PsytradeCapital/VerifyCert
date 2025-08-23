import React from 'react';
// Push Notification Utilities
// Handles push notification subscription, management, and interaction

interface PushSubscriptionData {
}
}
}
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  expirationTime?: number | null;

interface NotificationPayload {
}
}
}
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;

class PushNotificationManager {
  private vapidPublicKey: string | null = null;
  private subscription: PushSubscription | null = null;
  private userId: string | null = null;

  constructor() {
    this.initializeNotifications();

  // Initialize push notifications
  async initializeNotifications(): Promise<void> {
    try {
      // Check if service worker and push notifications are supported
      if (!this.isSupported()) {
        console.log('Push notifications are not supported');
        return;

      // Get VAPID public key from backend
      await this.fetchVapidPublicKey();

      // Check if user is already subscribed
      await this.checkExistingSubscription();

    } catch (error) {
      console.error('Failed to initialize push notifications:', error);

  // Check if push notifications are supported
  isSupported(): boolean {
    return (
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );

  // Get VAPID public key from backend
  async fetchVapidPublicKey(): Promise<void> {
    try {
      const response = await fetch('/api/v1/notifications/vapid-public-key');
      const data = await response.json();
      
      if (data.success) {
        this.vapidPublicKey = data.data.publicKey;
      } else {
        throw new Error('Failed to get VAPID public key');
    } catch (error) {
      console.error('Error fetching VAPID public key:', error);
      throw error;

  // Check for existing subscription
  async checkExistingSubscription(): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        this.subscription = subscription;
        console.log('Existing push subscription found');
    } catch (error) {
      console.error('Error checking existing subscription:', error);

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported');

    let permission = Notification.permission;

    if (permission === 'default') {
      permission = await Notification.requestPermission();

    return permission;

  // Subscribe to push notifications
  async subscribe(userId: string): Promise<boolean> {
    try {
      // Check permission
      const permission = await this.requestPermission();
      
      if (permission !== 'granted') {
        console.log('Notification permission denied');
        return false;

      // Check if already subscribed
      if (this.subscription && this.userId === userId) {
        console.log('Already subscribed to push notifications');
        return true;

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey!)
      });

      // Send subscription to backend
      const response = await fetch('/api/v1/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          subscription: subscription.toJSON()
        })
      });

      const data = await response.json();

      if (data.success) {
        this.subscription = subscription;
        this.userId = userId;
        console.log('Successfully subscribed to push notifications');
        return true;
      } else {
        throw new Error(data.error || 'Failed to subscribe');

    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return false;

  // Unsubscribe from push notifications
  async unsubscribe(): Promise<boolean> {
    try {
      if (!this.subscription || !this.userId) {
        console.log('No active subscription to unsubscribe');
        return true;

      // Unsubscribe from push manager
      await this.subscription.unsubscribe();

      // Notify backend
      const response = await fetch('/api/v1/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: this.userId
        })
      });

      const data = await response.json();

      if (data.success) {
        this.subscription = null;
        this.userId = null;
        console.log('Successfully unsubscribed from push notifications');
        return true;
      } else {
        throw new Error(data.error || 'Failed to unsubscribe');

    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      return false;

  // Send test notification
  async sendTestNotification(userId: string): Promise<boolean> {
    try {
      const response = await fetch('/api/v1/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      });

      const data = await response.json();
      return data.success;

    } catch (error) {
      console.error('Error sending test notification:', error);
      return false;

  // Get subscription status
  getSubscriptionStatus(): {
    isSubscribed: boolean;
    userId: string | null;
    permission: NotificationPermission;
  } {
    return {
      isSubscribed: !!this.subscription,
      userId: this.userId,
      permission: Notification.permission
    };

  // Convert VAPID key to Uint8Array
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    return outputArray;

  // Show local notification (fallback)
  showLocalNotification(title: string, options: NotificationOptions = {}): void {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        ...options
      });

// Notification event handlers for service worker communication
export class NotificationEventHandler {;
  static handleNotificationClick(event: any): void {
    console.log('Notification clicked:', event);
    
    event.notification.close();

    const data = event.notification.data || {};
    const action = event.action;

    // Handle different actions
    switch (action) {
      case 'view':
        if (data.url && typeof globalThis !== 'undefined' && 'clients' in globalThis) {
          event.waitUntil(
            (globalThis as any).clients.openWindow(data.url)
          );
        break;
      case 'share':
        // Handle share action
        if (data.certificateId && typeof globalThis !== 'undefined' && 'clients' in globalThis) {
          event.waitUntil(
            (globalThis as any).clients.openWindow(`/certificate/${data.certificateId}/share`)
          );
        break;
      case 'dismiss':
        // Just close the notification
        break;
      default:
        // Default action - open the app
        if (typeof globalThis !== 'undefined' && 'clients' in globalThis) {
          if (data.url) {
            event.waitUntil(
              (globalThis as any).clients.openWindow(data.url)
            );
          } else {
            event.waitUntil(
              (globalThis as any).clients.openWindow('/')
            );

  static handleNotificationClose(event: any): void {
    console.log('Notification closed:', event);
    // Track notification dismissal if needed

// Create singleton instance
const pushNotificationManager = new PushNotificationManager();

export default pushNotificationManager;
export { PushNotificationManager };
export type { PushSubscriptionData, NotificationPayload };
}
}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}