const layout = require('./layout');
const { esc } = layout;

module.exports = function clientDashboardPage({ client, files }) {
  const newFiles = files.filter(f => f.is_new);
  const readFiles = files.filter(f => !f.is_new);

  function renderCard(f) {
    return `
    <div class="doc-card-wrap">
      <a href="/view/${f.id}" class="doc-card${f.is_new ? ' doc-card-new' : ''}">
        <div class="doc-card-top">
          <div class="doc-card-icon">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="${f.is_new ? '#0A3E76' : '#4A90E2'}" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
            </svg>
          </div>
          ${f.is_new ? '<span class="new-badge">Neu</span>' : ''}
        </div>
        <h3>${esc(f.title)}</h3>
        ${f.description ? `<p>${esc(f.description)}</p>` : ''}
        <span class="doc-card-link">Dokument &ouml;ffnen &rarr;</span>
      </a>
      <div class="doc-card-actions">
        ${f.is_new
          ? `<form method="POST" action="/files/${f.id}/mark-read"><button type="submit" class="mark-btn" title="Als gelesen markieren">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
              Als gelesen markieren</button></form>`
          : `<form method="POST" action="/files/${f.id}/mark-unread"><button type="submit" class="mark-btn" title="Als ungelesen markieren">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/></svg>
              Als ungelesen markieren</button></form>`
        }
      </div>
    </div>`;
  }

  const body = `
  <style>
    .welcome-section {
      margin-bottom: 2rem;
    }
    .welcome-section h1 {
      font-size: 1.6rem;
      color: var(--primary);
      margin-bottom: 0.3rem;
    }
    .welcome-section p {
      color: var(--text-secondary);
      font-size: 0.95rem;
    }
    .section-label {
      font-size: 0.85rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      color: var(--text-secondary);
      margin-bottom: 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .section-label .count {
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 0.1rem 0.5rem;
      font-size: 0.75rem;
    }
    .section-divider {
      margin: 2rem 0 1.5rem;
      border: none;
      border-top: 1px solid var(--border);
    }
    .doc-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.25rem;
    }
    .doc-card-wrap {
      display: flex;
      flex-direction: column;
    }
    .doc-card {
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.5rem;
      text-decoration: none;
      color: inherit;
      transition: box-shadow 0.2s, transform 0.2s;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      flex: 1;
    }
    .doc-card:hover {
      box-shadow: 0 4px 16px rgba(0,0,0,0.08);
      transform: translateY(-2px);
    }
    .doc-card-new {
      border-color: var(--primary);
      border-width: 2px;
      background: linear-gradient(135deg, #FAFBFF 0%, #F0F4FF 100%);
    }
    .doc-card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .doc-card-icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      background: #EFF6FF;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .new-badge {
      display: inline-block;
      background: var(--primary);
      color: #fff;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.2rem 0.6rem;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .doc-card h3 {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--text);
    }
    .doc-card p {
      font-size: 0.9rem;
      color: var(--text-secondary);
      line-height: 1.5;
      flex: 1;
    }
    .doc-card-link {
      font-size: 0.9rem;
      color: var(--accent);
      font-weight: 600;
    }
    .doc-card-actions {
      padding: 0.4rem 0 0;
    }
    .mark-btn {
      background: none;
      border: none;
      color: var(--text-secondary);
      font-size: 0.78rem;
      font-family: 'Inter', sans-serif;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      transition: color 0.2s, background 0.2s;
    }
    .mark-btn:hover {
      color: var(--primary);
      background: var(--bg-secondary);
    }
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: var(--text-secondary);
    }
    .empty-state svg {
      margin-bottom: 1rem;
      opacity: 0.4;
    }
  </style>

  <div class="container fade-in">
    <div class="welcome-section">
      <h1>${esc(client.name)}</h1>
      <p>&Uuml;bersicht aller Ihrer Projektdokumente</p>
    </div>

    ${files.length === 0
      ? `<div class="empty-state">
          <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
            <path stroke-linecap="round" stroke-linejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
          </svg>
          <p>Noch keine Dokumente verf&uuml;gbar.</p>
        </div>`
      : `
        ${newFiles.length > 0
          ? `<div class="section-label">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4" fill="var(--primary)"/></svg>
              Neue Dokumente <span class="count">${newFiles.length}</span>
            </div>
            <div class="doc-grid">${newFiles.map(renderCard).join('')}</div>`
          : ''
        }
        ${newFiles.length > 0 && readFiles.length > 0 ? '<hr class="section-divider">' : ''}
        ${readFiles.length > 0
          ? `<div class="section-label">Archiv <span class="count">${readFiles.length}</span></div>
            <div class="doc-grid">${readFiles.map(renderCard).join('')}</div>`
          : ''
        }
      `
    }
  </div>`;

  return layout(client.name, body, { includeNav: true, navType: 'client', clientName: client.name });
};
