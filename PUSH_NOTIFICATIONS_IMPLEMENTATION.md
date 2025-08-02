# Push Notifications Implementation

This document describes the push notification system implemented for VerifyCert to notify users about certificate updates.

## Overview

The push notification system allows VerifyCert to send real-time notifications to users when:
- A new certificate is issued to them
- Their certificate is verified by someone
- Their certificate status changes (e.g., revoked)

## Architecture

### Backend Components

1. **Push Notification Service** (`backend/src/services/pushNotificationService.js`)
   - Manages push subscriptions
   - Sends notifications using web-push library
   - Handles VAPID keys for secure communication

2. **Notification Routes** (`backend/src/routes/notifications.js`)
   - `/api/v1/notifications/vapid-public-key` - Get VAPID public key
   - `/api/v1/notifications/subscribe` - Subscribe to notifications
   - `/api/v1/notifications/unsubscribe` - Unsubscribe from notifications
   - `/api/v1/notifications/send` - Send notifications (admin)
   - `/api/v1/notifications/test` - Send test notification
   - `/api/v1/notifications/stats` - Get subscription statistics

3. **Integration with Certificate Operations**
   - Certificate minting automatically triggers push notifications
   - Verification events can trigger notifications
   - Revocation events send status update notifications

### Frontend Components

1. **Push Notification Manager** (`frontend/src/utils/pushNotifications.ts`)
   - Handles subscription management
   - Manages VAPID keys and service worker communication
   - Provides methods for subscribing/unsubscribing

2. **React Hook** (`frontend/src/hooks/usePushNotifications.ts`)
   - Provides React integration for push notifications
   - Manages state and provides convenient methods
   - Handles permission requests and error states

3. **Settings Component** (`frontend/src/components/ui/PushNotificationSettings.tsx`)
   - User interface for managing notification preferences
   - Shows subscription status and permission state
   - Allows testing notifications

4. **Service Worker Integration** (`frontend/public/sw.js`)
   - Handles incoming push notifications
   - Manages notification display and user interactions
   - Handles notification click events

## Features

### Notification Types

1. **Certificate Issued**
   - Sent when a new certificate is minted for a user
   - Includes certificate details and view/share actions
   - Links directly to the certificate page

2. **Certificate Verified**
   - Sent when someone verifies a user's certificate
   - Provides verification confirmation
   - Links to certificate details

3. **Certificate Revoked**
   - Sent when a certificate is revoked
   - Includes support contact action
   - Explains the status change

### User Experience

- **Permission Management**: Users can grant/deny notification permissions
- **Subscription Control**: Easy subscribe/unsubscribe functionality
- **Test Notifications**: Users can send test notifications to verify setup
- **Action Buttons**: Notifications include relevant action buttons
- **Offline Support**: Notifications work even when the app is closed

## Setup Instructions

### 1. Generate VAPID Keys

```bash
npx web-push generate-vapid-keys
```

Add the generated keys to your `.env` file:

```env
VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
```

### 2. Backend Setup

The backend automatically initializes the push notification service when started. No additional setup is required.

### 3. Frontend Setup

The frontend automatically initializes push notifications when the app loads. Users need to:

1. Grant notification permissions
2. Subscribe to push notifications
3. Optionally test the setup

## Usage

### For Users

1. Visit `/notifications` or `/push-demo` to manage notification settings
2. Click "Request Permission" to allow notifications
3. Click "Subscribe" to start receiving notifications
4. Use "Send Test" to verify everything is working

### For Developers

#### Sending Custom Notifications

```javascript
const pushNotificationService = require('./src/services/pushNotificationService');

// Send to specific user
await pushNotificationService.sendNotificationToUser('user-id', {
  title: 'Custom Notification',
  body: 'This is a custom message',
  data: { customData: 'value' }
});

// Send to multiple users
await pushNotificationService.sendNotificationToUsers(['user1', 'user2'], payload);

// Send to all subscribed users
await pushNotificationService.sendNotificationToAll(payload);
```

#### Certificate-Specific Notifications

```javascript
// Certificate issued
await pushNotificationService.notifyCertificateIssued('recipient-id', {
  tokenId: '123',
  courseName: 'Course Name',
  institutionName: 'Institution Name'
});

// Certificate verified
await pushNotificationService.notifyCertificateVerified('user-id', certificateData);

// Certificate revoked
await pushNotificationService.notifyCertificateRevoked('user-id', certificateData);
```

## Browser Support

Push notifications are supported in:
- Chrome 42+
- Firefox 44+
- Safari 16+ (macOS 13+, iOS 16.4+)
- Edge 17+

## Security

- Uses VAPID (Voluntary Application Server Identification) for secure communication
- Subscriptions are validated before storing
- Rate limiting prevents abuse
- No sensitive data is stored in notification payloads

## Testing

### Demo Page

Visit `/push-demo` to access the comprehensive testing interface that includes:
- Subscription management
- Permission status
- Test notification sending
- Certificate notification simulation
- Real-time results display

### Manual Testing

1. Subscribe to notifications
2. Send test notifications
3. Verify notifications appear
4. Test notification actions
5. Check offline functionality

## Troubleshooting

### Common Issues

1. **Notifications not appearing**
   - Check browser permissions
   - Verify subscription status
   - Check browser console for errors

2. **Permission denied**
   - Reset browser permissions
   - Try in a different browser
   - Check if notifications are blocked system-wide

3. **Service worker issues**
   - Clear browser cache
   - Unregister and re-register service worker
   - Check service worker console

### Debug Information

The system provides detailed logging:
- Backend: Check server console for push notification logs
- Frontend: Check browser console for subscription status
- Service Worker: Check service worker console for notification handling

## Future Enhancements

Potential improvements for the push notification system:

1. **Database Storage**: Replace in-memory subscription storage with persistent database
2. **Notification Preferences**: Allow users to customize notification types
3. **Batch Notifications**: Optimize for sending to large numbers of users
4. **Analytics**: Track notification delivery and engagement rates
5. **Rich Notifications**: Add images and more interactive elements
6. **Scheduled Notifications**: Support for delayed/scheduled notifications

## API Reference

### Backend Endpoints

- `GET /api/v1/notifications/vapid-public-key` - Get VAPID public key
- `POST /api/v1/notifications/subscribe` - Subscribe user to notifications
- `POST /api/v1/notifications/unsubscribe` - Unsubscribe user from notifications
- `POST /api/v1/notifications/send` - Send notification to users
- `POST /api/v1/notifications/test` - Send test notification
- `GET /api/v1/notifications/stats` - Get subscription statistics

### Frontend Methods

- `pushNotificationManager.subscribe(userId)` - Subscribe to notifications
- `pushNotificationManager.unsubscribe()` - Unsubscribe from notifications
- `pushNotificationManager.sendTestNotification(userId)` - Send test notification
- `pushNotificationManager.getSubscriptionStatus()` - Get current status

### React Hook

```javascript
const {
  isSupported,
  isSubscribed,
  permission,
  isLoading,
  error,
  subscribe,
  unsubscribe,
  sendTestNotification,
  requestPermission,
  clearError
} = usePushNotifications();
```

This implementation provides a complete push notification system that enhances the user experience by keeping users informed about their certificate activities in real-time.