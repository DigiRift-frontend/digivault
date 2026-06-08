const layout = require('./layout');
const { esc } = layout;

module.exports = function adminClientPage({ client, files, message = '', error = '' }) {
  const messageHtml = message ? `<div class="alert alert-success">${esc(message)}</div>` : '';
  const errorHtml = error ? `<div class="alert alert-error">${esc(error)}</div>` : '';

  const fileRows = files.map(f => `
    <tr>
      <td><strong>${esc(f.title)}</strong></td>
      <td>${esc(f.original_name || f.filename)}</td>
      <td>${esc(f.description || '–')}</td>
      <td>${esc(f.created_at)}</td>
      <td>
        <form method="POST" action="/admin/files/${f.id}/delete" style="display:inline;" onsubmit="return confirm('Datei wirklich l&ouml;schen?')">
          <button type="submit" class="btn btn-danger btn-sm">L&ouml;schen</button>
        </form>
      </td>
    </tr>
  `).join('');

  const body = `
  <div class="container fade-in">
    ${messageHtml}
    ${errorHtml}

    <div style="margin-bottom:2rem;">
      <a href="/admin" style="color:var(--accent); text-decoration:none; font-size:0.9rem;">&larr; Zur&uuml;ck zum Dashboard</a>
    </div>

    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2rem;">
      <div>
        <h1 style="font-size:1.6rem; color:var(--primary);">${esc(client.name)}</h1>
        <p style="color:var(--text-secondary); font-size:0.9rem; margin-top:0.25rem;">
          Slug: <code>${esc(client.slug)}</code> &middot; Benutzername: <code>${esc(client.username)}</code>
        </p>
      </div>
      <form method="POST" action="/admin/clients/${client.id}/delete" onsubmit="return confirm('Kunden und alle Dateien wirklich l&ouml;schen?')">
        <button type="submit" class="btn btn-danger">Kunden l&ouml;schen</button>
      </form>
    </div>

    <div class="card" style="margin-bottom:2rem;">
      <h3 style="margin-bottom:1rem; font-size:1.1rem;">HTML-Datei hochladen</h3>
      <form method="POST" action="/admin/clients/${client.id}/upload" enctype="multipart/form-data" style="display:grid; grid-template-columns:1fr 1fr 1fr auto; gap:0.75rem; align-items:end;">
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
