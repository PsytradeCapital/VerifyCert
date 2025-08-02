const express = require('express');
const rateLimit = require('express-rate-limit');
const Joi = require('joi');
const pushNotificationService = require('../services/pushNotificationService');

const router = express.Router();

// Rate limiting for notification endpoints
const notificationRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per windowMs
  message: {
    error: 'Too many notification requests, please try again later'
  }
});

// Validation schemas
const subscriptionSchema = Joi.object({
  endpoint: Joi.string().uri().required(),
  keys: Joi.object({
    p256dh: Joi.string().required(),
    auth: Joi.string().required()
  }).required(),
  expirationTime: Joi.number().allow(null).optional()
});

const notificationPayloadSchema = Joi.object({
  title: Joi.string().max(100).required(),
  body: Joi.string().max(300).required(),
  icon: Joi.string().uri().optional(),
  badge: Joi.string().uri().optional(),
  tag: Joi.string().max(50).optional(),
  data: Joi.object().optional(),
  actions: Joi.array().items(
    Joi.object({
      action: Joi.string().required(),
      title: Joi.string().required(),
      icon: Joi.string().uri().optional()
    })
  ).max(2).optional()
});

/**
 * @route GET /api/v1/notifications/vapid-public-key
 * @desc Get VAPID public key for push notifications
 * @access Public
 */
router.get('/vapid-public-key', (req, res) => {
  try {
    const publicKey = pushNotificationService.getVapidPublicKey();
    
    res.json({
      success: true,
      data: {
        publicKey
      }
    });
  } catch (error) {
    console.error('Error getting VAPID public key:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get VAPID public key'
    });
  }
});

/**
 * @route POST /api/v1/notifications/subscribe
 * @desc Subscribe to push notifications
 * @access Public
 */
router.post('/subscribe', notificationRateLimit, async (req, res) => {
  try {
    const { userId, subscription } = req.body;

    // Validate input
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const { error } = subscriptionSchema.validate(subscription);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid subscription object',
        details: error.details.map(detail => detail.message)
      });
    }

    // Subscribe user
    const result = pushNotificationService.subscribe(userId, subscription);

    res.status(201).json({
      success: true,
      message: result.message,
      data: {
        userId,
        subscribed: true,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to subscribe to notifications'
    });
  }
});

/**
 * @route POST /api/v1/notifications/unsubscribe
 * @desc Unsubscribe from push notifications
 * @access Public
 */
router.post('/unsubscribe', notificationRateLimit, async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const result = pushNotificationService.unsubscribe(userId);

    res.json({
      success: true,
      message: result.message,
      data: {
        userId,
        subscribed: false,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Unsubscription error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to unsubscribe from notifications'
    });
  }
});

/**
 * @route POST /api/v1/notifications/send
 * @desc Send a push notification to specific users
 * @access Private (Admin only)
 */
router.post('/send', notificationRateLimit, async (req, res) => {
  try {
    const { userIds, payload } = req.body;

    // Validate payload
    const { error } = notificationPayloadSchema.validate(payload);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid notification payload',
        details: error.details.map(detail => detail.message)
      });
    }

    let results;

    if (userIds && Array.isArray(userIds)) {
      // Send to specific users
      results = await pushNotificationService.sendNotificationToUsers(userIds, payload);
    } else {
      // Send to all users
      results = await pushNotificationService.sendNotificationToAll(payload);
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    res.json({
      success: true,
      message: `Notification sent. ${successful} successful, ${failed} failed.`,
      data: {
        results,
        summary: {
          total: results.length,
          successful,
          failed
        }
      }
    });

  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send notification'
    });
  }
});

/**
 * @route POST /api/v1/notifications/test
 * @desc Send a test notification
 * @access Public (for development/testing)
 */
router.post('/test', notificationRateLimit, async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const testPayload = {
      title: 'VerifyCert Test Notification',
      body: 'This is a test notification to verify push notifications are working correctly.',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'test-notification',
      data: {
        type: 'test',
        timestamp: Date.now(),
        url: '/dashboard'
      },
      actions: [
        {
          action: 'view',
          title: 'View Dashboard',
          icon: '/icon-192.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/icon-192.png'
        }
      ]
    };

    const result = await pushNotificationService.sendNotificationToUser(userId, testPayload);

    res.json({
      success: true,
      message: 'Test notification sent',
      data: result
    });

  } catch (error) {
    console.error('Test notification error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send test notification'
    });
  }
});

/**
 * @route GET /api/v1/notifications/stats
 * @desc Get notification statistics
 * @access Private (Admin only)
 */
router.get('/stats', (req, res) => {
  try {
    const subscriptionCount = pushNotificationService.getSubscriptionCount();
    const subscriptions = pushNotificationService.getAllSubscriptions();

    res.json({
      success: true,
      data: {
        totalSubscriptions: subscriptionCount,
        subscriptions: subscriptions.map(sub => ({
          userId: sub.userId,
          subscribed: sub.subscribed
        }))
      }
    });

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get notification statistics'
    });
  }
});

module.exports = router;