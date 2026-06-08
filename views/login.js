const { esc } = require('./layout');

module.exports = function loginPage(error = '') {
  const errorHtml = error ? `<div class="login-alert">${esc(error)}</div>` : '';

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login - DigiVault</title>
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

    /* Left panel - 60% */
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
    /* Decorative circles */
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

    /* CTA Banner */
    .cta-banner {
      position: relative;
      z-index: 1;
      margin-top: 2.5rem;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 12px;
      padding: 1.25rem 1.5rem;
      animation: fadeIn 1s ease-out;
      backdrop-filter: blur(8px);
    }
    .cta-banner p {
      font-size: 0.95rem;
      opacity: 0.9;
      margin-bottom: 0.75rem;
      line-height: 1.5;
    }
    .cta-banner .cta-link {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255,255,255,0.15);
      color: #fff;
      text-decoration: none;
      padding: 0.5rem 1.1rem;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 600;
      transition: background 0.2s;
    }
    .cta-banner .cta-link:hover {
      background: rgba(255,255,255,0.25);
    }

    /* Right panel - 40% */
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

    /* Animations */
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(-20px); }
      to { opacity: 1; transform: translateX(0); }
    }

    /* Mobile */
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
      <h1>Ihre Dokumente. Sicher bereitgestellt.</h1>
      <p class="tagline">Greifen Sie auf alle Projektdokumente, Berichte und Pr&auml;sentationen zu &ndash; jederzeit und &uuml;berall.</p>
      <ul class="feature-list">
        <li>
          <span class="feature-icon">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#fff" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
          </span>
          Sichere Authentifizierung
        </li>
        <li>
          <span class="feature-icon">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#fff" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
          </span>
          Dokumente sofort verf&uuml;gbar
        </li>
        <li>
          <span class="feature-icon">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#fff" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          </span>
          Individuelle Zugangsdaten
        </li>
      </ul>

      <div class="cta-banner">
        <p>Gef&auml;llt Ihnen dieses Portal? Wir entwickeln individuelle Softwarelösungen f&uuml;r Ihr Unternehmen.</p>
        <a href="https://inquiry.digirift.com" target="_blank" rel="noopener" class="cta-link">
          Jetzt unverbindlich anfragen
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
        </a>
      </div>
    </div>

    <div class="login-left-footer">
      &copy; ${new Date().getFullYear()} DigiRift GmbH. Alle Rechte vorbehalten.
    </div>
  </div>

  <div class="login-right">
    <div class="login-form-wrap">
      <h2>Willkommen</h2>
      <p class="subtitle">Melden Sie sich an, um Ihre Dokumente einzusehen.</p>
      ${errorHtml}
      <form method="POST" action="/login">
        <div class="form-group">
          <label>Benutzername</label>
          <input type="text" name="username" required autocomplete="username" autofocus placeholder="Ihr Benutzername">
        </div>
        <div class="form-group">
          <label>Passwort</label>
          <input type="password" name="password" required autocomplete="current-password" placeholder="Ihr Passwort">
        </div>
        <button type="submit" class="login-btn">Anmelden</button>
      </form>
      <div class="login-footer">
        <a href="/admin/login">Admin-Zugang</a>
      </div>
    </div>
  </div>
</body>
</html>`;
};
