const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const db = require('./db');

// Views
const loginPage = require('./views/login');
const adminLoginPage = require('./views/admin-login');
const adminDashboardPage = require('./views/admin-dashboard');
const adminClientPage = require('./views/admin-client');
const clientDashboardPage = require('./views/client-dashboard');
const clientViewerPage = require('./views/client-viewer');

const app = express();
const PORT = process.env.PORT || 3000;
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// --- Middleware ---

const isProduction = process.env.NODE_ENV === 'production';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:"],
      frameSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
    },
  },
}));

if (isProduction) {
  app.set('trust proxy', 1);
  if (!process.env.SESSION_SECRET) {
    console.error('[DigiVault] FATAL: SESSION_SECRET environment variable is required in production.');
    process.exit(1);
  }
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '50mb' }));
app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(session({
  store: new SQLiteStore({ dir: path.join(__dirname, 'data'), db: 'sessions.db' }),
  secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
  },
}));

// --- CSRF Protection ---

function generateCsrfToken(req) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }
  return req.session.csrfToken;
}

function verifyCsrf(req, res, next) {
  const token = req.body._csrf || req.headers['x-csrf-token'];
  if (!token || token !== req.session.csrfToken) {
    return res.status(403).send('Ungültige Anfrage (CSRF).');
  }
  next();
}

// Make CSRF token available to all views
app.use((req, res, next) => {
  res.locals.csrfToken = generateCsrfToken(req);
  next();
});

// --- Rate Limiting ---

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: 'Zu viele Login-Versuche. Bitte versuchen Sie es später erneut.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Multer setup for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination(req, _file, cb) {
      const client = db.getClientById(req.params.id);
      if (!client) return cb(new Error('Client not found'));
      const dir = path.join(UPLOADS_DIR, client.slug);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename(_req, file, cb) {
      const unique = crypto.randomBytes(8).toString('hex');
      const ext = path.extname(file.originalname);
      cb(null, `${unique}${ext}`);
    }
  }),
  fileFilter(_req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.html' || ext === '.htm') return cb(null, true);
    cb(new Error('Nur HTML-Dateien erlaubt'));
  },
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// --- Auth Middleware ---

function requireClient(req, res, next) {
  if (req.session && req.session.clientId) return next();
  res.redirect('/login');
}

function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  res.redirect('/admin/login');
}

function requireApiToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  const token = auth.slice(7);
  const found = db.getTokenByValue(token);
  if (!found) {
    return res.status(401).json({ error: 'Invalid API token' });
  }
  next();
}

// =====================
// CLIENT ROUTES
// =====================

app.get('/login', (req, res) => {
  if (req.session && req.session.clientId) return res.redirect('/');
  res.send(loginPage(req.query.error === '1' ? 'Benutzername oder Passwort falsch.' : '', res.locals.csrfToken));
});

app.post('/login', loginLimiter, verifyCsrf, (req, res) => {
  const { username, password } = req.body;
  const client = db.getClientByUsername(username);
  if (!client || !bcrypt.compareSync(password, client.password_hash)) {
    return res.redirect('/login?error=1');
  }
  req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  req.session.clientId = client.id;
  res.redirect('/');
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

app.get('/', requireClient, (req, res) => {
  const client = db.getClientById(req.session.clientId);
  if (!client) return req.session.destroy(() => res.redirect('/login'));
  const files = db.getFilesByClientId(client.id);
  res.send(clientDashboardPage({ client, files, csrfToken: res.locals.csrfToken }));
});

app.get('/view/:fileId', requireClient, (req, res) => {
  const file = db.getFileById(req.params.fileId);
  if (!file || file.client_id !== req.session.clientId) return res.status(404).send('Nicht gefunden');
  const client = db.getClientById(req.session.clientId);
  // Auto-mark as read when opened
  if (file.is_new) db.markFileRead(file.id);
  res.send(clientViewerPage({ file, client }));
});

app.post('/files/:fileId/mark-unread', requireClient, verifyCsrf, (req, res) => {
  const file = db.getFileById(req.params.fileId);
  if (!file || file.client_id !== req.session.clientId) return res.status(404).send('Nicht gefunden');
  db.markFileUnread(file.id);
  res.redirect('/');
});

app.post('/files/:fileId/mark-read', requireClient, verifyCsrf, (req, res) => {
  const file = db.getFileById(req.params.fileId);
  if (!file || file.client_id !== req.session.clientId) return res.status(404).send('Nicht gefunden');
  db.markFileRead(file.id);
  res.redirect('/');
});

app.get('/raw/:fileId', requireClient, (req, res) => {
  const file = db.getFileById(req.params.fileId);
  if (!file || file.client_id !== req.session.clientId) return res.status(404).send('Nicht gefunden');
  const client = db.getClientById(file.client_id);
  const filePath = path.join(UPLOADS_DIR, client.slug, file.filename);
  if (!fs.existsSync(filePath)) return res.status(404).send('Datei nicht gefunden');
  res.sendFile(filePath);
});

// =====================
// ADMIN ROUTES
// =====================

app.get('/admin/login', (req, res) => {
  if (req.session && req.session.isAdmin) return res.redirect('/admin');
  res.send(adminLoginPage(req.query.error === '1' ? 'E-Mail oder Passwort falsch.' : '', res.locals.csrfToken));
});

app.post('/admin/login', verifyCsrf, (req, res) => {
  const { email, password } = req.body;
  const admin = db.getAdmin(email);
  console.log(`[DigiVault] Admin login attempt: email="${email}", admin_found=${!!admin}, password_length=${password ? password.length : 0}, password_first4="${password ? password.substring(0,4) : ''}", password_last4="${password ? password.substring(password.length-4) : ''}"`);
  if (admin) {
    console.log(`[DigiVault] bcrypt compare result: ${bcrypt.compareSync(password, admin.password_hash)}`);
  }
  if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
    return res.redirect('/admin/login?error=1');
  }
  req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  req.session.isAdmin = true;
  res.redirect('/admin');
});

app.get('/admin/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/admin/login'));
});

app.get('/admin', requireAdmin, (req, res) => {
  const clients = db.getAllClients();
  // Enrich with file counts
  const enriched = clients.map(c => ({
    ...c,
    file_count: db.getFilesByClientId(c.id).length,
  }));
  const clientCount = db.getClientCount();
  const fileCount = db.getFileCount();
  res.send(adminDashboardPage({
    clients: enriched,
    clientCount,
    fileCount,
    message: req.query.msg || '',
    error: req.query.err || '',
    csrfToken: res.locals.csrfToken,
  }));
});

app.post('/admin/clients', requireAdmin, verifyCsrf, (req, res) => {
  const { name, slug, username, password } = req.body;
  if (!name || !slug || !username || !password) {
    return res.redirect('/admin?err=Alle Felder sind erforderlich');
  }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return res.redirect('/admin?err=Slug darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten');
  }
  try {
    const hash = bcrypt.hashSync(password, 10);
    db.createClient(name, slug, username, hash);
    res.redirect('/admin?msg=Kunde erfolgreich angelegt');
  } catch (err) {
    res.redirect(`/admin?err=${encodeURIComponent(err.message)}`);
  }
});

app.get('/admin/clients/:id', requireAdmin, (req, res) => {
  const client = db.getClientById(req.params.id);
  if (!client) return res.redirect('/admin?err=Kunde nicht gefunden');
  const files = db.getFilesByClientId(client.id);
  res.send(adminClientPage({
    client,
    files,
    message: req.query.msg || '',
    error: req.query.err || '',
    csrfToken: res.locals.csrfToken,
  }));
});

app.get('/admin/view/:fileId', requireAdmin, (req, res) => {
  const file = db.getFileById(req.params.fileId);
  if (!file) return res.status(404).send('Nicht gefunden');
  const client = db.getClientById(file.client_id);
  res.send(clientViewerPage({ file, client, backUrl: `/admin/clients/${client.id}` }));
});

app.get('/admin/raw/:fileId', requireAdmin, (req, res) => {
  const file = db.getFileById(req.params.fileId);
  if (!file) return res.status(404).send('Nicht gefunden');
  const client = db.getClientById(file.client_id);
  const filePath = path.join(UPLOADS_DIR, client.slug, file.filename);
  if (!fs.existsSync(filePath)) return res.status(404).send('Datei nicht gefunden');
  res.sendFile(filePath);
});

app.post('/admin/clients/:id/delete', requireAdmin, verifyCsrf, (req, res) => {
  const client = db.getClientById(req.params.id);
  if (!client) return res.redirect('/admin?err=Kunde nicht gefunden');
  // Delete files on disk
  const uploadDir = path.join(UPLOADS_DIR, client.slug);
  if (fs.existsSync(uploadDir)) {
    fs.rmSync(uploadDir, { recursive: true, force: true });
  }
  db.deleteClient(client.id);
  res.redirect('/admin?msg=Kunde gelöscht');
});

app.post('/admin/clients/:id/upload', requireAdmin, (req, res) => {
  const clientCheck = db.getClientById(req.params.id);
  if (!clientCheck) return res.redirect('/admin?err=Kunde nicht gefunden');

  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.redirect(`/admin/clients/${req.params.id}?err=${encodeURIComponent(err.message)}`);
    }
    // Verify CSRF after multer has parsed the multipart body
    const csrfToken = req.body._csrf;
    if (!csrfToken || csrfToken !== req.session.csrfToken) {
      return res.status(403).send('Ungültige Anfrage (CSRF).');
    }
    if (!req.file) {
      return res.redirect(`/admin/clients/${req.params.id}?err=Keine Datei ausgewählt`);
    }
    const { title, description } = req.body;
    db.createFile(
      parseInt(req.params.id),
      title || req.file.originalname,
      req.file.filename,
      req.file.originalname,
      description || null
    );
    res.redirect(`/admin/clients/${req.params.id}?msg=Datei hochgeladen`);
  });
});

app.post('/admin/files/:id/delete', requireAdmin, verifyCsrf, (req, res) => {
  const file = db.getFileById(req.params.id);
  if (!file) return res.redirect('/admin?err=Datei nicht gefunden');
  const client = db.getClientById(file.client_id);
  if (client) {
    const filePath = path.join(UPLOADS_DIR, client.slug, file.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
  db.deleteFile(file.id);
  if (client) {
    res.redirect(`/admin/clients/${client.id}?msg=Datei gelöscht`);
  } else {
    res.redirect('/admin?msg=Datei gelöscht');
  }
});

// =====================
// API ROUTES
// =====================

app.get('/api/clients', requireApiToken, (req, res) => {
  const clients = db.getAllClients().map(c => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    username: c.username,
    created_at: c.created_at,
  }));
  res.json({ clients });
});

app.post('/api/clients', requireApiToken, (req, res) => {
  const { name, slug, username, password } = req.body;
  if (!name || !slug || !username || !password) {
    return res.status(400).json({ error: 'name, slug, username, and password are required' });
  }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return res.status(400).json({ error: 'slug must only contain lowercase letters, numbers, and hyphens' });
  }
  try {
    const hash = bcrypt.hashSync(password, 10);
    const result = db.createClient(name, slug, username, hash);
    const client = db.getClientById(result.lastInsertRowid);
    res.status(201).json({ client: { id: client.id, name: client.name, slug: client.slug, username: client.username } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/clients/:id', requireApiToken, (req, res) => {
  const client = db.getClientById(req.params.id);
  if (!client) return res.status(404).json({ error: 'Client not found' });
  const uploadDir = path.join(UPLOADS_DIR, client.slug);
  if (fs.existsSync(uploadDir)) {
    fs.rmSync(uploadDir, { recursive: true, force: true });
  }
  db.deleteClient(client.id);
  res.json({ success: true });
});

// API file upload - multipart or base64 JSON
app.post('/api/clients/:id/files', requireApiToken, (req, res) => {
  const client = db.getClientById(req.params.id);
  if (!client) return res.status(404).json({ error: 'Client not found' });

  const contentType = req.headers['content-type'] || '';

  if (contentType.includes('multipart/form-data')) {
    upload.single('file')(req, res, (err) => {
      if (err) return res.status(400).json({ error: err.message });
      if (!req.file) return res.status(400).json({ error: 'No file provided' });
      const { title, description } = req.body;
      const result = db.createFile(
        client.id,
        title || req.file.originalname,
        req.file.filename,
        req.file.originalname,
        description || null
      );
      const file = db.getFileById(result.lastInsertRowid);
      res.status(201).json({ file });
    });
  } else {
    // JSON with base64 content
    const { title, filename, content, description } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'title and content (base64) are required' });
    }
    const dir = path.join(UPLOADS_DIR, client.slug);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const storedName = `${crypto.randomBytes(8).toString('hex')}.html`;
    const buffer = Buffer.from(content, 'base64');
    fs.writeFileSync(path.join(dir, storedName), buffer);

    const result = db.createFile(
      client.id,
      title,
      storedName,
      filename || `${title}.html`,
      description || null
    );
    const file = db.getFileById(result.lastInsertRowid);
    res.status(201).json({ file });
  }
});

app.get('/api/clients/:id/files', requireApiToken, (req, res) => {
  const client = db.getClientById(req.params.id);
  if (!client) return res.status(404).json({ error: 'Client not found' });
  const files = db.getFilesByClientId(client.id);
  res.json({ files });
});

app.delete('/api/files/:id', requireApiToken, (req, res) => {
  const file = db.getFileById(req.params.id);
  if (!file) return res.status(404).json({ error: 'File not found' });
  const client = db.getClientById(file.client_id);
  if (client) {
    const filePath = path.join(UPLOADS_DIR, client.slug, file.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
  db.deleteFile(file.id);
  res.json({ success: true });
});

// =====================
// START
// =====================

app.listen(PORT, () => {
  console.log(`[DigiVault] Server running on http://localhost:${PORT}`);
});
