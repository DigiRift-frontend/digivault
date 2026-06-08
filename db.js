const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, 'digivault.db'));

// Enable WAL mode and foreign keys
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// --- Migrations ---

db.exec(`
  CREATE TABLE IF NOT EXISTS admin (
    id INTEGER PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    password_plain TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    filename TEXT NOT NULL,
    original_name TEXT,
    description TEXT,
    is_new INTEGER NOT NULL DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS api_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token TEXT UNIQUE NOT NULL,
    label TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

// --- Safe column additions for existing databases ---

try { db.exec('ALTER TABLE files ADD COLUMN is_new INTEGER NOT NULL DEFAULT 1'); } catch {}

// --- Remove plaintext passwords from existing databases ---
try {
  db.exec('UPDATE clients SET password_plain = NULL WHERE password_plain IS NOT NULL');
} catch {}

// --- Seed admin account ---

const adminEmail = 'admin@digirift.de';
const adminPassword = process.env.ADMIN_PASSWORD;

if (!adminPassword) {
  console.error('[DigiVault] FATAL: ADMIN_PASSWORD environment variable is required.');
  process.exit(1);
}

const existingAdmin = db.prepare('SELECT id FROM admin WHERE email = ?').get(adminEmail);
if (!existingAdmin) {
  const hash = bcrypt.hashSync(adminPassword, 10);
  db.prepare('INSERT INTO admin (email, password_hash) VALUES (?, ?)').run(adminEmail, hash);
  console.log(`[DigiVault] Admin account created: ${adminEmail}`);
}

// --- Seed initial API token ---

const existingToken = db.prepare('SELECT id FROM api_tokens LIMIT 1').get();
if (!existingToken) {
  const token = crypto.randomBytes(32).toString('hex');
  db.prepare('INSERT INTO api_tokens (token, label) VALUES (?, ?)').run(token, 'Initial Token');
  console.log('[DigiVault] Initial API token created. Retrieve it via admin panel or database.');
}

// --- Query helpers ---

module.exports = {
  db,

  // Admin
  getAdmin(email) {
    return db.prepare('SELECT * FROM admin WHERE email = ?').get(email);
  },

  updateAdminPassword(email, newPasswordHash) {
    return db.prepare('UPDATE admin SET password_hash = ? WHERE email = ?').run(newPasswordHash, email);
  },

  // Clients
  getAllClients() {
    return db.prepare('SELECT * FROM clients ORDER BY created_at DESC').all();
  },

  getClientById(id) {
    return db.prepare('SELECT * FROM clients WHERE id = ?').get(id);
  },

  getClientByUsername(username) {
    return db.prepare('SELECT * FROM clients WHERE username = ?').get(username);
  },

  createClient(name, slug, username, passwordHash) {
    return db.prepare(
      'INSERT INTO clients (name, slug, username, password_hash) VALUES (?, ?, ?, ?)'
    ).run(name, slug, username, passwordHash);
  },

  deleteClient(id) {
    return db.prepare('DELETE FROM clients WHERE id = ?').run(id);
  },

  getClientCount() {
    return db.prepare('SELECT COUNT(*) as count FROM clients').get().count;
  },

  // Files
  getFilesByClientId(clientId) {
    return db.prepare('SELECT * FROM files WHERE client_id = ? ORDER BY is_new DESC, created_at DESC').all(clientId);
  },

  getFileById(id) {
    return db.prepare('SELECT * FROM files WHERE id = ?').get(id);
  },

  createFile(clientId, title, filename, originalName, description) {
    return db.prepare(
      'INSERT INTO files (client_id, title, filename, original_name, description, is_new) VALUES (?, ?, ?, ?, ?, 1)'
    ).run(clientId, title, filename, originalName, description);
  },

  markFileRead(id) {
    return db.prepare('UPDATE files SET is_new = 0 WHERE id = ?').run(id);
  },

  markFileUnread(id) {
    return db.prepare('UPDATE files SET is_new = 1 WHERE id = ?').run(id);
  },

  deleteFile(id) {
    return db.prepare('DELETE FROM files WHERE id = ?').run(id);
  },

  getFileCount() {
    return db.prepare('SELECT COUNT(*) as count FROM files').get().count;
  },

  // API Tokens
  getTokenByValue(token) {
    return db.prepare('SELECT * FROM api_tokens WHERE token = ?').get(token);
  },

  getAllTokens() {
    return db.prepare('SELECT * FROM api_tokens ORDER BY created_at DESC').all();
  },

  createToken(label) {
    const token = crypto.randomBytes(32).toString('hex');
    db.prepare('INSERT INTO api_tokens (token, label) VALUES (?, ?)').run(token, label);
    return token;
  },

  deleteToken(id) {
    return db.prepare('DELETE FROM api_tokens WHERE id = ?').run(id);
  },
};
