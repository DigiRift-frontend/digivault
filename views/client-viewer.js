const { esc } = require('./layout');

module.exports = function clientViewerPage({ file, client }) {
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(file.title)} - DigiVault</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .viewer-bar {
      background: #fff;
      border-bottom: 1px solid #E5E7EB;
      padding: 0 1.5rem;
      height: 52px;
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-shrink: 0;
    }
    .viewer-back {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      text-decoration: none;
      color: #4A90E2;
      font-size: 0.9rem;
      font-weight: 500;
      padding: 0.35rem 0.75rem;
      border-radius: 6px;
      transition: background 0.2s;
    }
    .viewer-back:hover { background: #F3F4F6; }
    .viewer-title {
      font-family: 'Poppins', sans-serif;
      font-size: 0.95rem;
      font-weight: 600;
      color: #333;
    }
    .viewer-meta {
      margin-left: auto;
      font-size: 0.8rem;
      color: #6B7280;
    }
    iframe {
      flex: 1;
      border: none;
      width: 100%;
    }
  </style>
</head>
<body>
  <div class="viewer-bar">
    <a href="/" class="viewer-back">
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
      Zur&uuml;ck
    </a>
    <span class="viewer-title">${esc(file.title)}</span>
    <span class="viewer-meta">${esc(client.name)}</span>
  </div>
  <iframe src="/raw/${file.id}" title="${esc(file.title)}"></iframe>
</body>
</html>`;
};
