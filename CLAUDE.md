# DigiVault - Dokumentation

## Was ist DigiVault?

DigiVault ist eine Multi-Tenant HTML-Datei-Sharing-Plattform von DigiRift. Admins verwalten mehrere Kunden, jeder Kunde loggt sich ein und sieht nur seine zugewiesenen HTML-Dokumente. Eine REST API erlaubt es Claude Code, Dateien hochzuladen und Kunden zuzuweisen.

**Typischer Anwendungsfall:** Claude erstellt ein HTML-Dokument (z.B. Dashboard, Report, Praesentation) und laedt es ueber die API direkt in DigiVault hoch, damit der Kunde es sofort sehen kann.

## Live-Instanz

- **URL:** https://vault.wirbauensoftware.de
- **GitHub:** https://github.com/DigiRift-frontend/digivault
- **Hosting:** Coolify auf Hetzner Server

## API-Zugang

API Token und Zugangsdaten befinden sich in der lokalen Datei `DOKU-LOKAL.md` (nicht im Repo enthalten).

Alle API-Requests benoetigen den Header:
```
Authorization: Bearer <API_TOKEN>
```

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
CREATE TABLE admin (
  id INTEGER PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL
);

CREATE TABLE clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  filename TEXT NOT NULL,
  original_name TEXT,
  description TEXT,
  is_new INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE api_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  token TEXT UNIQUE NOT NULL,
  label TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
```

## API Endpoints

Basis-URL: `https://vault.wirbauensoftware.de`

| Methode | Pfad | Beschreibung |
|---------|------|-------------|
| GET | `/api/clients` | Alle Kunden auflisten |
| POST | `/api/clients` | Neuen Kunden anlegen (name, slug, username, password) |
| DELETE | `/api/clients/:id` | Kunden loeschen |
| GET | `/api/clients/:id/files` | Dateien eines Kunden auflisten |
| POST | `/api/clients/:id/files` | HTML-Datei hochladen (multipart oder base64 JSON) |
| DELETE | `/api/files/:id` | Datei loeschen |

### Kunden anlegen
```bash
curl -X POST \
  -H "Authorization: Bearer <API_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Firmenname", "slug": "firmen-slug", "username": "benutzername", "password": "kundenpasswort"}' \
  https://vault.wirbauensoftware.de/api/clients
```

### HTML-Datei hochladen (JSON mit Base64)
```bash
curl -X POST \
  -H "Authorization: Bearer <API_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Titel", "filename": "doc.html", "content": "<base64>", "description": "Optional"}' \
  https://vault.wirbauensoftware.de/api/clients/{id}/files
```

### HTML-Datei hochladen (Multipart)
```bash
curl -X POST \
  -H "Authorization: Bearer <API_TOKEN>" \
  -F "file=@dokument.html" \
  -F "title=Titel" \
  -F "description=Optional" \
  https://vault.wirbauensoftware.de/api/clients/{id}/files
```

## Features

- **Neu-Markierung:** Hochgeladene Dokumente werden automatisch als "Neu" markiert und oben angezeigt
- **Gelesen/Ungelesen:** Kunden koennen Dokumente als gelesen/ungelesen markieren
- **Admin-Viewer:** Admin kann Dokumente direkt im Browser oeffnen
- **CSRF-Schutz:** Alle Formulare sind CSRF-geschuetzt
- **Rate Limiting:** Login-Routen haben Rate Limiting (10 Versuche / 15 Min)

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
