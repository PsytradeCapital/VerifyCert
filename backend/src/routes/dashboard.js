const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const db = require('../models/database');
const router = express.Router();

// GET /api/dashboard/certificates - Get user's issued certificates
router.get('/certificates', authenticateToken, async (req, res) => {
  try {
    const certificates = await db.all(`
      SELECT 
        id,
        token_id,
        transaction_hash,
        recipient_address,
        recipient_name,
        course_name,
        institution_name,
        issuer_address,
        block_number,
        created_at
      FROM certificate_issuances 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `, [req.user.id]);

    res.json({
      success: true,
      data: {
        certificates,
        total: certificates.length
      }
    });

  } catch (error) {
    console.error('Error fetching user certificates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch certificates'
    });
  }
});

// GET /api/dashboard/stats - Get user's dashboard statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await db.get(`
      SELECT 
        COUNT(*) as total_certificates,
        COUNT(CASE WHEN DATE(created_at) = DATE('now') THEN 1 END) as today_certificates,
        COUNT(CASE WHEN DATE(created_at) >= DATE('now', '-7 days') THEN 1 END) as week_certificates,
        COUNT(CASE WHEN DATE(created_at) >= DATE('now', '-30 days') THEN 1 END) as month_certificates
      FROM certificate_issuances 
      WHERE user_id = ?
    `, [req.user.id]);

    // Get recent certificates
    const recentCertificates = await db.all(`
      SELECT 
        recipient_name,
        course_name,
        created_at
      FROM certificate_issuances 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 5
    `, [req.user.id]);

    res.json({
      success: true,
      data: {
        stats: {
          totalCertificates: stats.total_certificates || 0,
          todayCertificates: stats.today_certificates || 0,
          weekCertificates: stats.week_certificates || 0,
          monthCertificates: stats.month_certificates || 0
        },
        recentCertificates
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard statistics'
    });
  }
});

// GET /api/dashboard/profile - Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await db.get(`
      SELECT id, name, email, phone, region, role, is_verified, created_at
      FROM users 
      WHERE id = ?
    `, [req.user.id]);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile'
    });
  }
});

// PUT /api/dashboard/profile - Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, region } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Name is required'
      });
    }

    await db.run(`
      UPDATE users 
      SET name = ?, region = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name.trim(), region || 'US', req.user.id]);

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
});

module.exports = router;