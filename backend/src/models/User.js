const database = require('./database');
const bcrypt = require('bcryptjs');

class User {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.phone = data.phone;
    this.password_hash = data.password_hash;
    this.is_verified = data.is_verified;
    this.region = data.region;
    this.role = data.role;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new user
  static async create(userData) {
    const { name, email, phone, password, region = 'US', role = 'user' } = userData;
    
    // Hash password
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);
    
    const sql = `
      INSERT INTO users (name, email, phone, password_hash, region, role)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const result = await database.run(sql, [name, email, phone, password_hash, region, role]);
    
    // Return the created user
    return await User.findById(result.id);
  }

  // Find user by ID
  static async findById(id) {
    const sql = 'SELECT * FROM users WHERE id = ?';
    const row = await database.get(sql, [id]);
    return row ? new User(row) : null;
  }

  // Find user by email
  static async findByEmail(email) {
    const sql = 'SELECT * FROM users WHERE email = ?';
    const row = await database.get(sql, [email]);
    return row ? new User(row) : null;
  }

  // Find user by phone
  static async findByPhone(phone) {
    const sql = 'SELECT * FROM users WHERE phone = ?';
    const row = await database.get(sql, [phone]);
    return row ? new User(row) : null;
  }

  // Find user by email or phone
  static async findByIdentifier(identifier) {
    const sql = 'SELECT * FROM users WHERE email = ? OR phone = ?';
    const row = await database.get(sql, [identifier, identifier]);
    return row ? new User(row) : null;
  }

  // Verify password
  async verifyPassword(password) {
    return await bcrypt.compare(password, this.password_hash);
  }

  // Update user verification status
  async markAsVerified() {
    const sql = 'UPDATE users SET is_verified = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    await database.run(sql, [this.id]);
    this.is_verified = true;
  }

  // Update password
  async updatePassword(newPassword) {
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(newPassword, saltRounds);
    
    const sql = 'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    await database.run(sql, [password_hash, this.id]);
    this.password_hash = password_hash;
  }

  // Update user profile
  async update(updateData) {
    const allowedFields = ['name', 'email', 'phone', 'region'];
    const updates = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        updates.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });

    if (updates.length === 0) {
      return this;
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(this.id);

    const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    await database.run(sql, values);

    // Refresh user data
    return await User.findById(this.id);
  }

  // Get user's public data (without sensitive information)
  toPublicJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      phone: this.phone,
      is_verified: Boolean(this.is_verified),
      region: this.region,
      role: this.role,
      created_at: this.created_at
    };
  }

  // Check if user exists by email or phone
  static async exists(email, phone) {
    const sql = 'SELECT id FROM users WHERE email = ? OR phone = ?';
    const row = await database.get(sql, [email, phone]);
    return !!row;
  }

  // Get all users (admin function)
  static async findAll(limit = 50, offset = 0) {
    const sql = 'SELECT * FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const rows = await database.all(sql, [limit, offset]);
    return rows.map(row => new User(row));
  }

  // Count total users
  static async count() {
    const sql = 'SELECT COUNT(*) as count FROM users';
    const result = await database.get(sql);
    return result.count;
  }
}

module.exports = User;