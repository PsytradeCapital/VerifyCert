const webpush = require('web-push');

class PushNotificationService {
  constructor() {
    // Initialize web-push with VAPID keys
    this.initializeWebPush();
    
    // In-memory storage for subscriptions (in production, use a database)
    this.subscriptions = new Map();
  }

  initializeWebPush() {
    // VAPID keys should be generated once and stored securely
    const vapidKeys = {
      publicKey: process.env.VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa40HI95Q23LpHyLtZBt4ZWWBjKck-jZlhAONWG4GGQGdr3QW0LqPXJJ_tqsAI',
      privateKey: process.env.VAPID_PRIVATE_KEY || 'VCqVlWnbMFUFxUFSoGDh2oRzKUu_N2lFXi2lQvrtDkQ'
    };

    webpush.setVapidDetails(
      'mailto:admin@verifycert.com',
      vapidKeys.publicKey,
      vapidKeys.privateKey
    );

    this.vapidPublicKey = vapidKeys.publicKey;
  }

  // Subscribe a user to push notifications
  subscribe(userId, subscription) {
    try {
      // Validate subscription object
      if (!subscription || !subscription.endpoint || !subscription.keys) {
        throw new Error('Invalid subscription object');
      }

      // Store subscription (in production, save to database)
      this.subscriptions.set(userId, subscription);
      
      console.log(`User ${userId} subscribed to push notifications`);
      return { success: true, message: 'Successfully subscribed to notifications' };
    } catch (error) {
      console.error('Subscription error:', error);
      throw new Error('Failed to subscribe to notifications');
    }
  }

  // Unsubscribe a user from push notifications
  unsubscribe(userId) {
    try {
      const removed = this.subscriptions.delete(userId);
      console.log(`User ${userId} unsubscribed from push notifications`);
      return { success: true, message: 'Successfully unsubscribed from notifications' };
    } catch (error) {
      console.error('Unsubscription error:', error);
      throw new Error('Failed to unsubscribe from notifications');
    }
  }

  // Send notification to a specific user
  async sendNotificationToUser(userId, payload) {
    try {
      const subscription = this.subscriptions.get(userId);
      
      if (!subscription) {
        console.log(`No subscription found for user ${userId}`);
        return { success: false, message: 'User not subscribed' };
      }

      const result = await webpush.sendNotification(subscription, JSON.stringify(payload));
      console.log(`Notification sent to user ${userId}:`, result);
      
      return { success: true, message: 'Notification sent successfully' };
    } catch (error) {
      console.error(`Failed to send notification to user ${userId}:`, error);
      
      // Handle subscription errors (expired, invalid, etc.)
      if (error.statusCode === 410 || error.statusCode === 404) {
        // Subscription is no longer valid, remove it
        this.subscriptions.delete(userId);
        console.log(`Removed invalid subscription for user ${userId}`);
      }
      
      throw new Error('Failed to send notification');
    }
  }

  // Send notification to multiple users
  async sendNotificationToUsers(userIds, payload) {
    const results = [];
    
    for (const userId of userIds) {
      try {
        const result = await this.sendNotificationToUser(userId, payload);
        results.push({ userId, ...result });
      } catch (error) {
        results.push({ 
          userId, 
          success: false, 
          message: error.message 
        });
      }
    }
    
    return results;
  }

  // Send notification to all subscribed users
  async sendNotificationToAll(payload) {
    const userIds = Array.from(this.subscriptions.keys());
    return await this.sendNotificationToUsers(userIds, payload);
  }

  // Certificate-specific notification methods
  async notifyCertificateIssued(recipientId, certificateData) {
    const payload = {
      title: 'New Certificate Issued',
      body: `You have received a new certificate for ${certificateData.courseName}`,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'certificate-issued',
      data: {
        type: 'certificate-issued',
        certificateId: certificateData.tokenId,
        courseName: certificateData.courseName,
        institutionName: certificateData.institutionName,
        url: `/certificate/${certificateData.tokenId}`
      },
      actions: [
        {
          action: 'view',
          title: 'View Certificate',
          icon: '/icon-192.png'
        },
        {
          action: 'share',
          title: 'Share',
          icon: '/icon-192.png'
        }
      ]
    };

    return await this.sendNotificationToUser(recipientId, payload);
  }

  async notifyCertificateVerified(userId, certificateData) {
    const payload = {
      title: 'Certificate Verified',
      body: `Your certificate for ${certificateData.courseName} has been verified`,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'certificate-verified',
      data: {
        type: 'certificate-verified',
        certificateId: certificateData.tokenId,
        courseName: certificateData.courseName,
        url: `/certificate/${certificateData.tokenId}`
      },
      actions: [
        {
          action: 'view',
          title: 'View Details',
          icon: '/icon-192.png'
        }
      ]
    };

    return await this.sendNotificationToUser(userId, payload);
  }

  async notifyCertificateRevoked(userId, certificateData) {
    const payload = {
      title: 'Certificate Status Update',
      body: `Your certificate for ${certificateData.courseName} has been revoked`,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'certificate-revoked',
      data: {
        type: 'certificate-revoked',
        certificateId: certificateData.tokenId,
        courseName: certificateData.courseName,
        url: `/certificate/${certificateData.tokenId}`
      },
      actions: [
        {
          action: 'view',
          title: 'View Details',
          icon: '/icon-192.png'
        },
        {
          action: 'contact',
          title: 'Contact Support',
          icon: '/icon-192.png'
        }
      ]
    };

    return await this.sendNotificationToUser(userId, payload);
  }

  // Get VAPID public key for frontend
  getVapidPublicKey() {
    return this.vapidPublicKey;
  }

  // Get subscription count
  getSubscriptionCount() {
    return this.subscriptions.size;
  }

  // Get all subscriptions (for admin purposes)
  getAllSubscriptions() {
    return Array.from(this.subscriptions.entries()).map(([userId, subscription]) => ({
      userId,
      endpoint: subscription.endpoint,
      subscribed: true
    }));
  }
}

// Create singleton instance
const pushNotificationService = new PushNotificationService();

module.exports = pushNotificationService;