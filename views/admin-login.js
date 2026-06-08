const { esc } = require('./layout');

module.exports = function adminLoginPage(error = '', csrfToken = '') {
  const errorHtml = error ? `<div class="login-alert">${esc(error)}</div>` : '';

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Login - DigiVault</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      min-height: 100vh;
      display: flex;
    }
    .login-left {
      width: 60%;
      background: linear-gradient(135deg, #082F5A 0%, #0A3E76 50%, #0D4D91 100%);
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      padding: 2.5rem;
      color: #fff;
    }
    .login-left::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h60v60H0z' fill='none'/%3E%3Cpath d='M0 60V0h60' fill='none' stroke='%23fff' stroke-width='0.5'/%3E%3C/svg%3E");
      background-size: 60px 60px;
      opacity: 0.05;
    }
    .login-left::after {
      content: '';
      position: absolute;
      width: 400px;
      height: 400px;
      border-radius: 50%;
      border: 1px solid rgba(255,255,255,0.06);
      bottom: -100px;
      right: -100px;
    }
    .deco-circle {
      position: absolute;
      border-radius: 50%;
      border: 1px solid rgba(255,255,255,0.06);
    }
    .deco-circle-1 { width: 300px; height: 300px; top: -80px; left: -80px; }
    .deco-circle-2 { width: 200px; height: 200px; bottom: 100px; left: 40%; }

    .login-left-logo {
      position: relative;
      z-index: 1;
      animation: fadeIn 0.6s ease-out;
    }
    .login-left-logo img {
      height: 32px;
      width: auto;
    }

    .product-name {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      margin-top: 3rem;
      margin-bottom: 1.5rem;
      animation: fadeIn 0.65s ease-out;
    }
    .product-name .lock-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: rgba(255,255,255,0.12);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .product-name span {
      font-family: 'Poppins', sans-serif;
      font-weight: 700;
      font-size: 1.8rem;
      letter-spacing: -0.5px;
    }
    .login-left-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      position: relative;
      z-index: 1;
      max-width: 500px;
      animation: slideIn 0.7s ease-out;
    }
    .login-left-content h1 {
      font-family: 'Poppins', sans-serif;
      font-size: 2.2rem;
      font-weight: 700;
      line-height: 1.2;
      margin-bottom: 1rem;
    }
    .login-left-content .tagline {
      font-size: 1.05rem;
      opacity: 0.8;
      line-height: 1.6;
      margin-bottom: 2rem;
    }
    .feature-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .feature-list li {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.95rem;
      opacity: 0.85;
    }
    .feature-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: rgba(255,255,255,0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .login-left-footer {
      position: relative;
      z-index: 1;
      font-size: 0.8rem;
      opacity: 0.5;
      animation: fadeIn 0.8s ease-out;
    }

    .login-right {
      width: 40%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: #fff;
    }
    .login-form-wrap {
      width: 100%;
      max-width: 380px;
      animation: fadeIn 0.6s ease-out;
    }
    .login-form-wrap h2 {
      font-family: 'Poppins', sans-serif;
      font-size: 1.6rem;
      font-weight: 700;
      color: #0A3E76;
      margin-bottom: 0.5rem;
    }
    .login-form-wrap .subtitle {
      font-size: 0.9rem;
      color: #6B7280;
      margin-bottom: 2rem;
    }
    .admin-badge {
      display: inline-block;
      background: #EFF6FF;
      color: #0A3E76;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.25rem 0.6rem;
      border-radius: 4px;
      margin-bottom: 1rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .login-alert {
      background: #FEF2F2;
      border: 1px solid #FECACA;
      color: #DC2626;
      padding: 0.65rem 1rem;
      border-radius: 8px;
      font-size: 0.85rem;
      margin-bottom: 1.25rem;
    }
    .form-group {
      margin-bottom: 1.25rem;
    }
    .form-group label {
      display: block;
      font-size: 0.82rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 0.4rem;
    }
    .form-group input {
      width: 100%;
      padding: 0.7rem 0.9rem;
      border: 1px solid #E5E7EB;
      border-radius: 8px;
      font-size: 0.9rem;
      font-family: 'Inter', sans-serif;
      color: #333;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .form-group input:focus {
      border-color: #4A90E2;
      box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.12);
    }
    .login-btn {
      width: 100%;
      padding: 0.75rem;
      background: #0A3E76;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 600;
      font-family: 'Inter', sans-serif;
      cursor: pointer;
      transition: background 0.2s;
      margin-top: 0.5rem;
    }
    .login-btn:hover { background: #0D4D91; }
    .login-footer {
      text-align: center;
      margin-top: 2rem;
      font-size: 0.8rem;
      color: #9CA3AF;
    }
    .login-footer a {
      color: #4A90E2;
      text-decoration: none;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(-20px); }
      to { opacity: 1; transform: translateX(0); }
    }

    @media (max-width: 900px) {
      body { flex-direction: column; }
      .login-left { display: none; }
      .login-right {
        width: 100%;
        min-height: 100vh;
        background: linear-gradient(135deg, #082F5A 0%, #0A3E76 50%, #0D4D91 100%);
      }
      .login-form-wrap {
        background: #fff;
        padding: 2.5rem 2rem;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.15);
      }
    }
  </style>
</head>
<body>
  <div class="login-left">
    <div class="deco-circle deco-circle-1"></div>
    <div class="deco-circle deco-circle-2"></div>

    <div class="login-left-logo">
      <img src="/public/digirift-logo-white.png" alt="DigiRift">
    </div>

    <div class="login-left-content">
      <div class="product-name">
        <span class="lock-icon">
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#fff" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
        </span>
        <span>DigiVault</span>
      </div>
      <h1>Verwaltungszugang</h1>
      <p class="tagline">Verwalten Sie Kunden, Dokumente und Zugriffsrechte &uuml;ber das Admin-Panel.</p>
      <ul class="feature-list">
        <li>
          <span class="feature-icon">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#fff" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          </span>
          Kundenverwaltung
        </li>
        <li>
          <span class="feature-icon">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#fff" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
          </span>
          Datei-Upload &amp; Zuweisung
        </li>
        <li>
          <span class="feature-icon">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#fff" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
          </span>
          REST API f&uuml;r Automatisierung
        </li>
      </ul>
    </div>

    <div class="login-left-footer">
      &copy; ${new Date().getFullYear()} DigiRift GmbH. Alle Rechte vorbehalten.
    </div>
  </div>

  <div class="login-right">
    <div class="login-form-wrap">
      <span class="admin-badge">Admin-Bereich</span>
      <h2>Admin Login</h2>
      <p class="subtitle">Melden Sie sich mit Ihren Admin-Zugangsdaten an.</p>
      ${errorHtml}
      <form method="POST" action="/admin/login">
        <input type="hidden" name="_csrf" value="${csrfToken}">
        <div class="form-group">
          <label>E-Mail</label>
          <input type="email" name="email" required autocomplete="email" autofocus placeholder="admin@digirift.de">
        </div>
        <div class="form-group">
          <label>Passwort</label>
          <input type="password" name="password" required autocomplete="current-password" placeholder="Ihr Passwort">
        </div>
        <button type="submit" class="login-btn">Anmelden</button>
      </form>
      <div class="login-footer">
        <a href="/login">&larr; Zur&uuml;ck zum Kunden-Login</a>
      </div>
    </div>
  </div>
</body>
</html>`;
};
