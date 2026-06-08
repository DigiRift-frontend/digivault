# DigiVault - Dokumentation fuer Claude Sessions

## Was ist DigiVault?

DigiVault ist eine Multi-Tenant HTML-Datei-Sharing-Plattform von DigiRift. Admins verwalten mehrere Kunden, jeder Kunde loggt sich ein und sieht nur seine zugewiesenen HTML-Dokumente. Eine REST API erlaubt es Claude Code, Dateien hochzuladen und Kunden zuzuweisen.

**Typischer Anwendungsfall:** Claude erstellt ein HTML-Dokument (z.B. Dashboard, Report, Praesentation) und laedt es ueber die API direkt in DigiVault hoch, damit der Kunde es sofort sehen kann.

## Live-Instanz

- **URL:** https://vault.wirbauensoftware.de
- **GitHub:** https://github.com/DigiRift-frontend/digivault
- **Hosting:** Coolify auf Hetzner Server

## API-Zugang

**API Token (Bearer Token):**
```
fed0f9eef7ecffee81e73cd39886424b8872dedf688c7e735abc918b1437fba4
```

Alle API-Requests benoetigen den Header:
```
Authorization: Bearer fed0f9eef7ecffee81e73cd39886424b8872dedf688c7e735abc918b1437fba4
```

## Admin-Zugang

- **Email:** admin@digirift.de
- **Passwort:** Wird ueber die Umgebungsvariable ADMIN_PASSWORD gesetzt
- **Login-URL:** https://vault.wirbauensoftware.de/admin/login

## Technischer Stack

- **Runtime:** Node.js 20 (Alpine Docker)
- **Framework:** Express.js mit server-gerendertem HTML (kein React, kein Build-Step)
- **Datenbank:** SQLite via better-sqlite3 (WAL mode)
- **Auth:** express-session mit SQLite Session Store, bcryptjs fuer Passwort-Hashing
- **Sicherheit:** helmet (CSP), express-rate-limit, CSRF-Protection
- **Uploads:** multer (HTML-Dateien auf Disk, pro Client ein Unterordner)

## Projektstruktur

```
digivault/
  server.js              -- Express App, alle Routes, Middleware
  db.js                  -- SQLite Setup, Migrationen, Query-Helpers
  views/
    layout.js            -- HTML Base-Template (Head, Fonts, CSS)
    login.js             -- Client Login (60/40 Split Design)
    admin-login.js       -- Admin Login
    admin-dashboard.js   -- Admin: Kundenliste, Stats
    admin-client.js      -- Admin: Einzelner Kunde, Dateiliste
    client-dashboard.js  -- Client: Dokumenten-Dashboard
    client-viewer.js     -- Client: iframe Viewer fuer HTML-Dateien
  uploads/               -- Gespeicherte HTML-Dateien (pro Client ein Ordner)
  data/                  -- SQLite Datenbanken (digivault.db, sessions.db)
  public/                -- Statische Assets (Logo)
  Dockerfile
  package.json
```

## Datenbank-Schema

```sql
-- Admin-Account (ein einziger Admin)
CREATE TABLE admin (
  id INTEGER PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL
);

-- Kunden (jeder bekommt Login-Daten)
CREATE TABLE clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,           -- Anzeigename (z.B. "UK Aachen")
  slug TEXT UNIQUE NOT NULL,    -- URL-sicherer Identifier
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  password_plain TEXT,          -- Wird nicht mehr gespeichert (Security)
  created_at TEXT DEFAULT (datetime('now'))
);

-- HTML-Dateien, Kunden zugewiesen
CREATE TABLE files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,          -- Anzeige-Titel
  filename TEXT NOT NULL,       -- Gespeicherter Dateiname auf Disk
  original_name TEXT,           -- Original Upload-Dateiname
  description TEXT,
  is_new INTEGER NOT NULL DEFAULT 1,  -- 1 = Neu/Ungelesen, 0 = Gelesen
  created_at TEXT DEFAULT (datetime('now'))
);

-- API Tokens fuer programmatischen Zugriff
CREATE TABLE api_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  token TEXT UNIQUE NOT NULL,
  label TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
```

## API Endpoints

Basis-URL: `https://vault.wirbauensoftware.de`

### Kunden auflisten
```bash
curl -H "Authorization: Bearer fed0f9eef7ecffee81e73cd39886424b8872dedf688c7e735abc918b1437fba4" \
  https://vault.wirbauensoftware.de/api/clients
```

Response:
```json
{
  "clients": [
    { "id": 1, "name": "UK Aachen", "slug": "uk-aachen", "username": "ukaachen", "created_at": "..." }
  ]
}
```

### Neuen Kunden anlegen
```bash
curl -X POST \
  -H "Authorization: Bearer fed0f9eef7ecffee81e73cd39886424b8872dedf688c7e735abc918b1437fba4" \
  -H "Content-Type: application/json" \
  -d '{"name": "Firmenname", "slug": "firmen-slug", "username": "benutzername", "password": "kundenpasswort"}' \
  https://vault.wirbauensoftware.de/api/clients
```

- `slug` darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten
- `username` muss eindeutig sein

### Kunden loeschen
```bash
curl -X DELETE \
  -H "Authorization: Bearer fed0f9eef7ecffee81e73cd39886424b8872dedf688c7e735abc918b1437fba4" \
  https://vault.wirbauensoftware.de/api/clients/{id}
```

### Dateien eines Kunden auflisten
```bash
curl -H "Authorization: Bearer fed0f9eef7ecffee81e73cd39886424b8872dedf688c7e735abc918b1437fba4" \
  https://vault.wirbauensoftware.de/api/clients/{id}/files
```

### HTML-Datei hochladen (JSON mit Base64)
```bash
curl -X POST \
  -H "Authorization: Bearer fed0f9eef7ecffee81e73cd39886424b8872dedf688c7e735abc918b1437fba4" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Dokument-Titel",
    "filename": "dokument.html",
    "content": "<base64-encoded-html-content>",
    "description": "Optionale Beschreibung"
  }' \
  https://vault.wirbauensoftware.de/api/clients/{id}/files
```

Der `content`-Wert muss Base64-encoded sein. Beispiel zum Encoden:
```bash
base64 -i datei.html
```

Oder in Node.js:
```javascript
const content = Buffer.from(htmlString).toString('base64');
```

### HTML-Datei hochladen (Multipart)
```bash
curl -X POST \
  -H "Authorization: Bearer fed0f9eef7ecffee81e73cd39886424b8872dedf688c7e735abc918b1437fba4" \
  -F "file=@dokument.html" \
  -F "title=Dokument-Titel" \
  -F "description=Optionale Beschreibung" \
  https://vault.wirbauensoftware.de/api/clients/{id}/files
```

### Datei loeschen
```bash
curl -X DELETE \
  -H "Authorization: Bearer fed0f9eef7ecffee81e73cd39886424b8872dedf688c7e735abc918b1437fba4" \
  https://vault.wirbauensoftware.de/api/files/{id}
```

## Features

- **Neu-Markierung:** Hochgeladene Dokumente werden automatisch als "Neu" markiert und oben angezeigt
- **Gelesen/Ungelesen:** Kunden koennen Dokumente als gelesen/ungelesen markieren. Dokumente werden automatisch als gelesen markiert wenn sie geoeffnet werden
- **Admin-Viewer:** Admin kann Dokumente direkt im Browser oeffnen
- **CSRF-Schutz:** Alle Formulare sind CSRF-geschuetzt
- **Rate Limiting:** Login-Routen haben Rate Limiting (10 Versuche / 15 Min)

## Coolify Deployment Details

- **Coolify URL:** https://admin.wirbauensoftware.de
- **Coolify API Token:** 38|yhjyhCj5O470PyWm5NopybGdcRnePakfvcBRgZHO61658c0c
- **App UUID:** r13yxkjes93li8lticahlj39
- **Projekt UUID:** ljmumtoa3j07dh8ug72jujqx
- **Environment UUID:** p9u9km40dlrgt2vsjkb19fur
- **Server UUID:** w8kw4w0swkk0o4o88kgckw48

### Deployment ausloesen
```bash
curl -X POST \
  -H "Authorization: Bearer 38|yhjyhCj5O470PyWm5NopybGdcRnePakfvcBRgZHO61658c0c" \
  -H "Content-Type: application/json" \
  -d '{"uuid": "r13yxkjes93li8lticahlj39"}' \
  https://admin.wirbauensoftware.de/api/v1/deploy
```

### Deployment-Status pruefen
```bash
curl -H "Authorization: Bearer 38|yhjyhCj5O470PyWm5NopybGdcRnePakfvcBRgZHO61658c0c" \
  https://admin.wirbauensoftware.de/api/v1/deployments/{deployment_uuid}
```

### Container-Logs abrufen
```bash
curl -H "Authorization: Bearer 38|yhjyhCj5O470PyWm5NopybGdcRnePakfvcBRgZHO61658c0c" \
  "https://admin.wirbauensoftware.de/api/v1/applications/r13yxkjes93li8lticahlj39/logs?since=300"
```

## Persistente Volumes

Die Daten ueberleben Redeployments durch Coolify Persistent Volumes:
- `/app/data` (Volume: digivault-data) - SQLite Datenbank
- `/app/uploads` (Volume: digivault-uploads) - HTML-Dateien

## Umgebungsvariablen

| Variable | Pflicht | Beschreibung |
|----------|---------|-------------|
| ADMIN_PASSWORD | Ja | Passwort fuer den Admin-Account |
| ADMIN_EMAIL | Nein | Admin E-Mail (Standard: admin@digirift.de) |
| SESSION_SECRET | Ja (Prod) | Secret fuer Session-Cookies |
| NODE_ENV | Nein | "production" fuer sichere Cookies |
| PORT | Nein | Server-Port (Standard: 3000) |

## Workflow: HTML-Dokument fuer einen Kunden bereitstellen

1. **Kunde existiert schon?** Pruefen mit GET `/api/clients`
2. **Kunde anlegen** (falls noetig) mit POST `/api/clients`
3. **HTML erstellen** - Das HTML-Dokument generieren
4. **Base64 encoden** - `Buffer.from(html).toString('base64')`
5. **Hochladen** mit POST `/api/clients/{id}/files`
6. Der Kunde sieht das Dokument sofort als "Neu" in seinem Dashboard
