const layout = require('./layout');
const { esc } = layout;

module.exports = function clientDashboardPage({ client, files }) {
  const fileCards = files.map(f => `
    <a href="/view/${f.id}" class="doc-card">
      <div class="doc-card-icon">
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#4A90E2" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
        </svg>
      </div>
      <h3>${esc(f.title)}</h3>
      ${f.description ? `<p>${esc(f.description)}</p>` : ''}
      <span class="doc-card-link">Dokument &ouml;ffnen &rarr;</span>
    </a>
  `).join('');

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
    .doc-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.25rem;
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
    }
    .doc-card:hover {
      box-shadow: 0 4px 16px rgba(0,0,0,0.08);
      transform: translateY(-2px);
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
      : `<div class="doc-grid">${fileCards}</div>`
    }
  </div>`;

  return layout(client.name, body, { includeNav: true, navType: 'client', clientName: client.name });
};
