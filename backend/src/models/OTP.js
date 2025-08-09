const database = require('./database');

class OTP {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.code = data.code;
    this.type = data.type;
    this.expires_at = data.expires_at;
    this.is_used = data.is_used;
    this.created_at = data.created_at;
  }

  // Generate a 6-digit OTP code
  static generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Create a new OTP
  static async create(userId, type, expirationMinutes = 5) {
    const code = OTP.generateCode();
    const expires_at = new Date(Date.now() + expirationMinutes * 60 * 1000).toISOString();
    
    const sql = `
      INSERT INTO otps (user_id, code, type, expires_at)
      VALUES (?, ?, ?, ?)
    `;
    
    const result = await database.run(sql, [userId, code, type, expires_at]);
    
    // Return the created OTP
    return await OTP.findById(result.id);
  }

  // Find OTP by ID
  static async findById(id) {
    const sql = 'SELECT * FROM otps WHERE id = ?';
    const row = await database.get(sql, [id]);
    return row ? new OTP(row) : null;
  }

  // Find valid OTP by user ID, code, and type
  static async findValidOTP(userId, code, type) {
    const sql = `
      SELECT * FROM otps 
      WHERE user_id = ? AND code = ? AND type = ? 
      AND is_used = 0 AND expires_at > datetime('now')
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    const row = await database.get(sql, [userId, code, type]);
    return row ? new OTP(row) : null;
  }

  // Mark OTP as used
  async markAsUsed() {
    const sql = 'UPDATE otps SET is_used = 1 WHERE id = ?';
    await database.run(sql, [this.id]);
    this.is_used = true;
  }

  // Check if OTP is expired
  isExpired() {
    return new Date() > new Date(this.expires_at);
  }

  // Check if OTP is valid (not used and not expired)
  isValid() {
    return !this.is_used && !this.isExpired();
  }

  // Invalidate all OTPs for a user and type
  static async invalidateUserOTPs(userId, type) {
    const sql = 'UPDATE otps SET is_used = 1 WHERE user_id = ? AND type = ? AND is_used = 0';
    await database.run(sql, [userId, type]);
  }

  // Clean up expired OTPs (maintenance function)
  static async cleanupExpired() {
    const sql = "DELETE FROM otps WHERE expires_at < datetime('now')";
    const result = await database.run(sql);
    return result.changes;
  }

  // Get recent OTP attempts for rate limiting
  static async getRecentAttempts(userId, type, minutes = 5) {
    const since = new Date(Date.now() - minutes * 60 * 1000).toISOString();
    const sql = `
      SELECT COUNT(*) as count 
      FROM otps 
      WHERE user_id = ? AND type = ? AND created_at > ?
    `;
    
    const result = await database.get(sql, [userId, type, since]);
    return result.count;
  }

  // Verify OTP and mark as used if valid
  static async verifyAndConsume(userId, code, type) {
    const otp = await OTP.findValidOTP(userId, code, type);
    
    if (!otp) {
      return { success: false, error: 'Invalid or expired OTP' };
    }

    if (!otp.isValid()) {
      return { success: false, error: 'OTP has expired or already been used' };
    }

    // Mark as used
    await otp.markAsUsed();
    
    // Invalidate other OTPs of the same type for this user
    await OTP.invalidateUserOTPs(userId, type);

    return { success: true, otp };
  }

  // Get OTP history for a user (admin function)
  static async getUserOTPHistory(userId, limit = 10) {
    const sql = `
      SELECT * FROM otps 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `;
    
    const rows = await database.all(sql, [userId, limit]);
    return rows.map(row => new OTP(row));
  }

  // Convert to JSON (excluding sensitive data)
  toJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      type: this.type,
      expires_at: this.expires_at,
      is_used: Boolean(this.is_used),
      created_at: this.created_at,
      is_expired: this.isExpired(),
      is_valid: this.isValid()
    };
  }
}

module.exports = OTP;