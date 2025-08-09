const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    const dbPath = path.join(__dirname, '../../data/verifycert.db');
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
      } else {
        console.log('Connected to SQLite database');
        this.initializeTables();
      }
    });
  }

  initializeTables() {
    // Create users table
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        phone TEXT UNIQUE,
        password_hash TEXT NOT NULL,
        is_verified BOOLEAN DEFAULT 0,
        region TEXT DEFAULT 'US',
        role TEXT DEFAULT 'user' CHECK(role IN ('user', 'issuer', 'admin')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT check_email_or_phone CHECK (email IS NOT NULL OR phone IS NOT NULL)
      )
    `;

    // Create otps table
    const createOtpsTable = `
      CREATE TABLE IF NOT EXISTS otps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        code TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('email', 'sms', 'password_reset')),
        expires_at DATETIME NOT NULL,
        is_used BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `;

    // Create certificate issuances table
    const createCertificatesTable = `
      CREATE TABLE IF NOT EXISTS certificate_issuances (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token_id TEXT,
        transaction_hash TEXT NOT NULL,
        recipient_address TEXT NOT NULL,
        recipient_name TEXT NOT NULL,
        course_name TEXT NOT NULL,
        institution_name TEXT NOT NULL,
        issuer_address TEXT NOT NULL,
        block_number INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `;

    // Create indexes for performance
    const createIndexes = [
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
      'CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone)',
      'CREATE INDEX IF NOT EXISTS idx_otps_user_id ON otps(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_otps_code ON otps(code)',
      'CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificate_issuances(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_certificates_token_id ON certificate_issuances(token_id)',
      'CREATE INDEX IF NOT EXISTS idx_certificates_tx_hash ON certificate_issuances(transaction_hash)'
    ];

    this.db.serialize(() => {
      this.db.run(createUsersTable);
      this.db.run(createOtpsTable);
      this.db.run(createCertificatesTable);
      
      createIndexes.forEach(indexQuery => {
        this.db.run(indexQuery);
      });
    });
  }

  // Promisify database operations
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

// Create singleton instance
const database = new Database();

module.exports = database;