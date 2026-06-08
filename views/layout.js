module.exports = function layout(title, bodyHtml, { includeNav = false, navType = 'client', clientName = '' } = {}) {
  let navHtml = '';

  const lockSvg = '<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>';

  if (includeNav && navType === 'admin') {
    navHtml = `
    <header class="top-bar">
      <div class="top-bar-inner">
        <a href="/admin" class="top-bar-logo">
          <img src="/public/digirift-logo-blue.png" alt="DigiRift" style="height:26px;width:auto;">
        </a>
        <div class="top-bar-center">
          <span class="top-bar-lock">${lockSvg}</span>
          <span class="top-bar-title">DigiVault</span>
          <span class="top-bar-subtitle">Admin</span>
        </div>
        <nav class="top-bar-nav">
          <a href="/admin">Dashboard</a>
          <a href="/admin/logout" class="btn-logout">Abmelden</a>
        </nav>
      </div>
    </header>`;
  } else if (includeNav && navType === 'client') {
    navHtml = `
    <header class="top-bar">
      <div class="top-bar-inner">
        <a href="/" class="top-bar-logo">
          <img src="/public/digirift-logo-blue.png" alt="DigiRift" style="height:26px;width:auto;">
        </a>
        <div class="top-bar-center">
          <span class="top-bar-lock">${lockSvg}</span>
          <span class="top-bar-title">DigiVault</span>
        </div>
        <nav class="top-bar-nav">
          <a href="/">Dokumente</a>
          <a href="/logout" class="btn-logout">Abmelden</a>
        </nav>
      </div>
    </header>`;
  }

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)} - DigiVault</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #0A3E76;
      --primary-light: #0D4D91;
      --primary-dark: #082F5A;
      --accent: #4A90E2;
      --bg: #FFFFFF;
      --bg-secondary: #F3F4F6;
      --text: #333333;
      --text-secondary: #6B7280;
      --border: #E5E7EB;
      --success: #10B981;
      --danger: #EF4444;
      --warning: #F59E0B;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--bg-secondary);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    h1, h2, h3, h4 { font-family: 'Poppins', sans-serif; }

    /* Top bar */
    .top-bar {
      background: var(--bg);
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .top-bar-inner {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .top-bar-logo {
      text-decoration: none;
      display: flex;
      align-items: center;
      flex-shrink: 0;
      min-width: 120px;
    }
    .top-bar-center {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .top-bar-lock {
      width: 30px;
      height: 30px;
      border-radius: 7px;
      background: #EFF6FF;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary);
      flex-shrink: 0;
    }
    .top-bar-title {
      font-family: 'Poppins', sans-serif;
      font-weight: 700;
      font-size: 1.1rem;
      color: var(--primary);
      letter-spacing: -0.3px;
    }
    .top-bar-subtitle {
      font-weight: 500;
      font-size: 0.75rem;
      color: var(--text-secondary);
      margin-left: 0.1rem;
    }
    .top-bar-nav {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      flex-shrink: 0;
      min-width: 120px;
      justify-content: flex-end;
    }
    .top-bar-nav a {
      text-decoration: none;
      color: var(--text-secondary);
      font-size: 0.9rem;
      font-weight: 500;
      transition: color 0.2s;
    }
    .top-bar-nav a:hover { color: var(--primary); }
    .btn-logout {
      padding: 0.4rem 1rem;
      border: 1px solid var(--border);
      border-radius: 6px;
      font-size: 0.85rem !important;
      transition: all 0.2s !important;
    }
    .btn-logout:hover {
      border-color: var(--danger) !important;
      color: var(--danger) !important;
    }

    /* Main content area */
    .page-content {
      flex: 1;
    }

    /* Container */
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    /* Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 1.2rem;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 600;
      font-family: 'Inter', sans-serif;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
      text-decoration: none;
    }
    .btn-primary {
      background: var(--primary);
      color: #fff;
    }
    .btn-primary:hover { background: var(--primary-light); }
    .btn-danger {
      background: transparent;
      color: var(--danger);
      border: 1px solid var(--danger);
    }
    .btn-danger:hover { background: var(--danger); color: #fff; }
    .btn-sm {
      padding: 0.35rem 0.75rem;
      font-size: 0.8rem;
    }

    /* Cards */
    .card {
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.5rem;
    }

    /* Forms */
    .form-group {
      margin-bottom: 1rem;
    }
    .form-group label {
      display: block;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 0.4rem;
    }
    .form-group input,
    .form-group textarea,
    .form-group select {
      width: 100%;
      padding: 0.65rem 0.9rem;
      border: 1px solid var(--border);
      border-radius: 8px;
      font-size: 0.9rem;
      font-family: 'Inter', sans-serif;
      color: var(--text);
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .form-group input:focus,
    .form-group textarea:focus,
    .form-group select:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.12);
    }

    /* Alerts */
    .alert {
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-size: 0.9rem;
      margin-bottom: 1.5rem;
    }
    .alert-error {
      background: #FEF2F2;
      border: 1px solid #FECACA;
      color: #DC2626;
    }
    .alert-success {
      background: #F0FDF4;
      border: 1px solid #BBF7D0;
      color: #16A34A;
    }

    /* Table */
    .table-wrap {
      overflow-x: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      padding: 0.75rem 1rem;
      text-align: left;
      border-bottom: 1px solid var(--border);
      font-size: 0.9rem;
    }
    th {
      font-weight: 600;
      color: var(--text-secondary);
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    tr:last-child td { border-bottom: none; }

    /* Stats */
    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .stat-card {
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.25rem;
    }
    .stat-card .stat-value {
      font-family: 'Poppins', sans-serif;
      font-size: 2rem;
      font-weight: 700;
      color: var(--primary);
    }
    .stat-card .stat-label {
      font-size: 0.85rem;
      color: var(--text-secondary);
      margin-top: 0.25rem;
    }

    /* Animations */
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(-20px); }
      to { opacity: 1; transform: translateX(0); }
    }
    .fade-in { animation: fadeIn 0.5s ease-out; }
    .slide-in { animation: slideIn 0.5s ease-out; }

    /* Footer CTA */
    .footer-cta {
      max-width: 600px;
      margin: 0 auto 1rem;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 1.25rem 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 0.75rem;
    }
    .footer-cta p {
      font-size: 0.85rem;
      color: var(--text);
      line-height: 1.4;
    }
    .footer-cta-link {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: var(--primary);
      color: #fff !important;
      text-decoration: none !important;
      padding: 0.45rem 1rem;
      border-radius: 6px;
      font-size: 0.82rem;
      font-weight: 600;
      white-space: nowrap;
      transition: background 0.2s;
    }
    .footer-cta-link:hover { background: var(--primary-light); }

    /* Powered-by footer */
    .powered-footer {
      text-align: center;
      padding: 1.5rem 1rem 1.5rem;
      font-size: 0.8rem;
      color: var(--text-secondary);
      flex-shrink: 0;
    }
    .powered-footer a {
      color: var(--accent);
      text-decoration: none;
      font-weight: 500;
    }
    .powered-footer a:hover { text-decoration: underline; }
    .powered-footer img {
      height: 16px;
      width: auto;
      vertical-align: middle;
      margin-right: 0.25rem;
      opacity: 0.6;
    }

    @media (max-width: 768px) {
      .container { padding: 1rem; }
      .top-bar-inner { padding: 0 1rem; }
      .top-bar-center { position: static; transform: none; }
      .top-bar-inner { gap: 0.5rem; }
      .top-bar-logo img { height: 20px; }
      .top-bar-title { font-size: 0.95rem; }
      .top-bar-nav { gap: 0.75rem; min-width: auto; }
    }
  </style>
</head>
<body>
${navHtml}
<div class="page-content">
${bodyHtml}
</div>
<footer class="powered-footer">
  <div class="footer-cta">
    <p>Gef&auml;llt Ihnen dieses Portal? Wir entwickeln individuelle Softwarel&ouml;sungen f&uuml;r Ihr Unternehmen.</p>
    <a href="https://digirift.com" target="_blank" rel="noopener" class="footer-cta-link">
      Jetzt unverbindlich anfragen
      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
    </a>
  </div>
  <img src="/public/digirift-logo-blue.png" alt="DigiRift"> Powered by <a href="https://digirift.com" target="_blank" rel="noopener">DigiRift GmbH</a>
  &nbsp;&middot;&nbsp;
  <a href="https://digirift.de" target="_blank" rel="noopener">digirift.de</a>
</footer>
</body>
</html>`;
};

function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

module.exports.esc = esc;
