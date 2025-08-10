const express = require('express');
const router = express.Router();
const { authenticateToken, requireVerified } = require('../middleware/auth');

// GET /api/dashboard/stats - Get user dashboard statistics
router.get('/stats',
  authenticateToken,
  requireVerified,
  async (req, res) => {
    try {
      const database = require('../models/database');
      
      // Get user's certificate issuances
      const certificateStats = await database.get(`
        SELECT COUNT(*) as total_issued
        FROM certificate_issuances 
        WHERE user_id = ?
      `, [req.user.id]);

      // Get recent certificate issuances
      const recentCertificates = await database.all(`
        SELECT * FROM certificate_issuances 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT 5
      `, [req.user.id]);

      res.json({
        success: true,
        data: {
          user: req.user.toPublicJSON(),
          stats: {
            totalCertificatesIssued: certificateStats.total_issued || 0
          },
          recentCertificates: recentCertificates || []
        }
      });

    } catch (error) {
      console.error('Dashboard stats error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'DASHBOARD_STATS_FAILED',
          message: 'Failed to fetch dashboard statistics'
        }
      });
    }
  }
);

// GET /api/dashboard/certificates - Get user's issued certificates
router.get('/certificates',
  authenticateToken,
  requireVerified,
  async (req, res) => {
    try {
      const database = require('../models/database');
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      // Get user's certificate issuances with pagination
      const certificates = await database.all(`
        SELECT * FROM certificate_issuances 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `, [req.user.id, limit, offset]);

      // Get total count
      const totalResult = await database.get(`
        SELECT COUNT(*) as total 
        FROM certificate_issuances 
        WHERE user_id = ?
      `, [req.user.id]);

      res.json({
        success: true,
        data: {
          certificates: certificates || [],
          pagination: {
            page,
            limit,
            total: totalResult.total || 0,
            totalPages: Math.ceil((totalResult.total || 0) / limit)
          }
        }
      });

    } catch (error) {
      console.error('Dashboard certificates error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'DASHBOARD_CERTIFICATES_FAILED',
          message: 'Failed to fetch certificates'
        }
      });
    }
  }
);

module.exports = router;