const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../models/database');
const router = express.Router();

// Simple middleware for testing
const simpleAuth = (req, res, next) => {
  // Mock user for testing
  req.user = { id: 1 };
  next();
};

// PUT /api/user/change-password - Change user password
router.put('/change-password', simpleAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 8 characters long'
      });
    }

    res.json({
      success: true,
      message: 'Password changed successfully (test mode)'
    });

  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to change password'
    });
  }
});

module.exports = router;