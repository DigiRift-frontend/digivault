const layout = require('./layout');
const { esc } = layout;

module.exports = function adminClientPage({ client, files, message = '', error = '', csrfToken = '' }) {
  const messageHtml = message ? `<div class="alert alert-success">${esc(message)}</div>` : '';
  const errorHtml = error ? `<div class="alert alert-error">${esc(error)}</div>` : '';

  const fileRows = files.map(f => `
    <tr>
      <td>
        <strong>${esc(f.title)}</strong>
        ${f.is_new ? '<span style="display:inline-block;background:#0A3E76;color:#fff;font-size:0.65rem;font-weight:700;padding:0.1rem 0.4rem;border-radius:3px;margin-left:0.4rem;vertical-align:middle;text-transform:uppercase;">Neu</span>' : ''}
      </td>
      <td>${esc(f.original_name || f.filename)}</td>
      <td>${esc(f.description || '\u2013')}</td>
      <td>${esc(f.created_at)}</td>
      <td style="white-space:nowrap;">
        <a href="/admin/view/${f.id}" class="btn btn-primary btn-sm" style="margin-right:0.25rem;">&Ouml;ffnen</a>
        <form method="POST" action="/admin/files/${f.id}/delete" style="display:inline;" onsubmit="return confirm('Datei wirklich l&ouml;schen?')">
          <input type="hidden" name="_csrf" value="${csrfToken}">
          <button type="submit" class="btn btn-danger btn-sm">L&ouml;schen</button>
        </form>
      </td>
    </tr>
  `).join('');

  const body = `
  <style>
    .credentials-card {
      background: #FAFBFF;
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 1rem 1.25rem;
      margin-bottom: 2rem;
      display: flex;
      gap: 2rem;
      align-items: center;
      flex-wrap: wrap;
    }
    .credentials-card .cred-item {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }
    .credentials-card .cred-label {
      font-size: 0.72rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      color: var(--text-secondary);
    }
    .credentials-card .cred-value {
      font-size: 0.9rem;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      color: var(--text);
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 4px;
      padding: 0.25rem 0.5rem;
    }
  </style>

  <div class="container fade-in">
    ${messageHtml}
    ${errorHtml}

    <div style="margin-bottom:2rem;">
      <a href="/admin" style="color:var(--accent); text-decoration:none; font-size:0.9rem;">&larr; Zur&uuml;ck zum Dashboard</a>
    </div>

    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
      <div>
        <h1 style="font-size:1.6rem; color:var(--primary);">${esc(client.name)}</h1>
        <p style="color:var(--text-secondary); font-size:0.9rem; margin-top:0.25rem;">
          Slug: <code>${esc(client.slug)}</code>
        </p>
      </div>
      <form method="POST" action="/admin/clients/${client.id}/delete" onsubmit="return confirm('Kunden und alle Dateien wirklich l&ouml;schen?')">
        <input type="hidden" name="_csrf" value="${csrfToken}">
        <button type="submit" class="btn btn-danger">Kunden l&ouml;schen</button>
      </form>
    </div>

    <div class="credentials-card">
      <div class="cred-item">
        <span class="cred-label">Benutzername</span>
        <span class="cred-value">${esc(client.username)}</span>
      </div>
    </div>

    <div class="card" style="margin-bottom:2rem;">
      <h3 style="margin-bottom:1rem; font-size:1.1rem;">HTML-Datei hochladen</h3>
      <form method="POST" action="/admin/clients/${client.id}/upload" enctype="multipart/form-data" style="display:grid; grid-template-columns:1fr 1fr 1fr auto; gap:0.75rem; align-items:end;">
        <input type="hidden" name="_csrf" value="${csrfToken}">
        <div class="form-group" style="margin-bottom:0;">
          <label>Titel</label>
          <input type="text" name="title" required placeholder="Anzeige-Titel">
        </div>
        <div class="form-group" style="margin-bottom:0;">
          <label>Beschreibung</label>
          <input type="text" name="description" placeholder="Kurzbeschreibung (optional)">
        </div>
        <div class="form-group" style="margin-bottom:0;">
          <label>HTML-Datei</label>
          <input type="file" name="file" accept=".html,.htm" required style="padding:0.45rem;">
        </div>
        <button type="submit" class="btn btn-primary" style="height:40px;">Hochladen</button>
      </form>
    </div>

    <div class="card">
      <h3 style="margin-bottom:1rem; font-size:1.1rem;">Dokumente (${files.length})</h3>
      ${files.length === 0
        ? '<p style="color:var(--text-secondary); font-size:0.9rem;">Noch keine Dokumente hochgeladen.</p>'
        : `<div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Titel</th>
                  <th>Dateiname</th>
                  <th>Beschreibung</th>
                  <th>Erstellt</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                ${fileRows}
              </tbody>
            </table>
          </div>`
      }
    </div>
  </div>`;

  return layout(`${client.name} - Admin`, body, { includeNav: true, navType: 'admin' });
};
