const layout = require('./layout');
const { esc } = layout;

module.exports = function adminDashboardPage({ clients, clientCount, fileCount, message = '', error = '' }) {
  const messageHtml = message ? `<div class="alert alert-success">${esc(message)}</div>` : '';
  const errorHtml = error ? `<div class="alert alert-error">${esc(error)}</div>` : '';

  const clientRows = clients.map(c => {
    const fileCountForClient = c.file_count || 0;
    return `
      <tr>
        <td><strong>${esc(c.name)}</strong></td>
        <td><code>${esc(c.slug)}</code></td>
        <td><code>${esc(c.username)}</code></td>
        <td><code>${c.password_plain ? esc(c.password_plain) : '\u2013'}</code></td>
        <td>${fileCountForClient} Datei${fileCountForClient !== 1 ? 'en' : ''}</td>
        <td>${esc(c.created_at)}</td>
        <td>
          <a href="/admin/clients/${c.id}" class="btn btn-primary btn-sm">Verwalten</a>
        </td>
      </tr>`;
  }).join('');

  const body = `
  <div class="container fade-in">
    ${messageHtml}
    ${errorHtml}

    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2rem;">
      <div>
        <h1 style="font-size:1.6rem; color:var(--primary);">Dashboard</h1>
        <p style="color:var(--text-secondary); font-size:0.9rem; margin-top:0.25rem;">&Uuml;bersicht aller Kunden und Dokumente</p>
      </div>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-value">${clientCount}</div>
        <div class="stat-label">Kunden</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${fileCount}</div>
        <div class="stat-label">Dokumente</div>
      </div>
    </div>

    <div class="card" style="margin-bottom:2rem;">
      <h3 style="margin-bottom:1rem; font-size:1.1rem;">Neuen Kunden anlegen</h3>
      <form method="POST" action="/admin/clients" style="display:grid; grid-template-columns:1fr 1fr 1fr 1fr auto; gap:0.75rem; align-items:end;">
        <div class="form-group" style="margin-bottom:0;">
          <label>Name</label>
          <input type="text" name="name" required placeholder="z.B. UK Aachen">
        </div>
        <div class="form-group" style="margin-bottom:0;">
          <label>Slug</label>
          <input type="text" name="slug" required placeholder="z.B. uk-aachen" pattern="[a-z0-9-]+">
        </div>
        <div class="form-group" style="margin-bottom:0;">
          <label>Benutzername</label>
          <input type="text" name="username" required placeholder="Login-Name">
        </div>
        <div class="form-group" style="margin-bottom:0;">
          <label>Passwort</label>
          <input type="text" name="password" required placeholder="Login-Passwort" autocomplete="off">
        </div>
        <button type="submit" class="btn btn-primary" style="height:40px;">Anlegen</button>
      </form>
    </div>

    <div class="card">
      <h3 style="margin-bottom:1rem; font-size:1.1rem;">Alle Kunden</h3>
      ${clients.length === 0
        ? '<p style="color:var(--text-secondary); font-size:0.9rem;">Noch keine Kunden angelegt.</p>'
        : `<div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Benutzername</th>
                  <th>Passwort</th>
                  <th>Dateien</th>
                  <th>Erstellt</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                ${clientRows}
              </tbody>
            </table>
          </div>`
      }
    </div>
  </div>`;

  return layout('Admin Dashboard', body, { includeNav: true, navType: 'admin' });
};
