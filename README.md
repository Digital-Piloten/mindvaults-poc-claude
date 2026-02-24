# PoC: GitHub Issue → Claude Code → Webhook-Rückkanal

**Version:** 2.0  
**Zusammenfassung:** Schritt-für-Schritt Anleitung um den kompletten P4-Rückkanal zu testen — von Issue-Erstellung über Claude Code Execution bis zum Webhook-Empfang.

---

## Ziel

Beweisen, dass dieser Flow funktioniert:

```
Script erstellt GitHub Issue + Label
  → Claude Code Action triggert
    → Claude bearbeitet Prompt aus Issue-Body
      → Claude postet Ergebnis als Kommentar (mit JSON-Block)
        → GitHub Webhook feuert an externe URL
          → Payload enthält parsbares Ergebnis
```

## Voraussetzungen

- GitHub Account
- Anthropic API Key (für Claude Code Action)
- Node.js 18+ lokal installiert
- ~30 Minuten Zeit

## Begriffe in dieser Anleitung

- **REPO** = dein GitHub-Repo (`mindvaults-poc-claude`), lokal geklont
- **ZIP** = der entpackte PoC-Ordner (dieses ZIP)

---

## Übersicht: Was kommt wohin?

```
ZIP (entpackt)                          REPO (geklont von GitHub)
──────────────                          ──────────────────────────
poc/                                    mindvaults-poc-claude/
├── workflows/                          ├── .github/workflows/
│   └── claude-ticket.yml  ──KOPIEREN──→│   └── claude-ticket.yml    ← muss auf GitHub!
├── scripts/                            ├── scripts/                  ← lokaler Arbeitsordner
│   ├── github.js          ──KOPIEREN──→│   ├── github.js
│   ├── test-a-create-issue.js  ──→     │   ├── test-a-create-issue.js
│   ├── test-c-structured-issue.js ──→  │   ├── test-c-structured-issue.js
│   ├── test-e-needs-input.js  ──→      │   ├── test-e-needs-input.js
│   ├── verify-json.js     ──KOPIEREN──→│   ├── verify-json.js
│   ├── analyze-webhook-payload.js ──→  │   ├── analyze-webhook-payload.js
│   ├── cleanup.js         ──KOPIEREN──→│   ├── cleanup.js
│   ├── package.json       ──KOPIEREN──→│   ├── package.json          ← DIESE nehmen, nicht npm init!
│   └── .env.example       ──KOPIEREN──→│   ├── .env.example
│                                       │   ├── .env                  ← selbst anlegen (Schritt 6)
│                                       │   └── node_modules/         ← nach npm install
├── .gitignore             ──KOPIEREN──→├── .gitignore
├── setup.sh                            └── README.md
└── README.md
```

**Kurzfassung:** Alles aus dem ZIP ins Repo kopieren. Dann im Repo arbeiten.

---

## Schritt 1: Test-Repository auf GitHub erstellen

1. Gehe zu https://github.com/new
2. Name: `mindvaults-poc-claude`
3. **Public** (einfacher für Webhooks)
4. ✅ "Add a README file"
5. "Create repository"

---

## Schritt 2: Repo lokal klonen

```bash
git clone https://github.com/DEIN_USERNAME/mindvaults-poc-claude.git
cd mindvaults-poc-claude
```

---

## Schritt 3: Dateien aus dem ZIP ins Repo kopieren

```bash
# Ordner im Repo anlegen
mkdir -p .github/workflows
mkdir -p scripts

# Workflow (MUSS auf GitHub landen!)
cp /pfad/zum/zip/poc/workflows/claude-ticket.yml .github/workflows/

# Alle Scripts + package.json
cp /pfad/zum/zip/poc/scripts/*.js scripts/
cp /pfad/zum/zip/poc/scripts/package.json scripts/
cp /pfad/zum/zip/poc/scripts/.env.example scripts/

# Gitignore
cp /pfad/zum/zip/poc/.gitignore .
```

**⚠️ WICHTIG:** Nutze die `package.json` aus dem ZIP! Nicht `npm init -y` ausführen — das erzeugt eine inkompatible package.json (falsche `type`-Einstellung).

---

## Schritt 4: Dependencies installieren

```bash
cd scripts
npm install
cd ..
```

Das installiert `@octokit/rest` und `dotenv` in `scripts/node_modules/`.

---

## Schritt 5: GitHub Repo-Einstellungen (auf github.com)

### 5a. Claude GitHub App installieren (WICHTIG!)

Die `claude-code-action` braucht die offizielle Claude App.

1. Gehe zu: **https://github.com/apps/claude**
2. Klick **"Install"**
3. Wähle dein Repo `mindvaults-poc-claude` aus
4. Bestätige die Berechtigungen:
   - Contents: Read & Write
   - Issues: Read & Write
   - Pull Requests: Read & Write

> ❗ Ohne diese App funktioniert die Action nicht — sie kann dann keine Kommentare posten.

### 5b. GitHub Actions erlauben

1. Repo → **Settings** → **Actions** → **General**
2. **Actions permissions:** "Allow all actions and reusable workflows"  
   (Default bei neuen Repos — nur prüfen)
3. **Workflow permissions** (ganz unten auf der Seite!): **"Read and write permissions"** auswählen
4. **Speichern**

### 5c. Anthropic API Key als GitHub Secret

1. Repo → **Settings** → **Secrets and variables** → **Actions**
2. Klick **"New repository secret"**
3. Name: `ANTHROPIC_API_KEY`
4. Value: Dein Anthropic API Key
5. "Add secret"

---

## Schritt 6: .env Datei für die Scripts anlegen

```bash
cd scripts
cp .env.example .env
```

Öffne `scripts/.env` und trage ein:

```
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_OWNER=dein-username
GITHUB_REPO=mindvaults-poc-claude
```

**GitHub Token erstellen (falls noch keins vorhanden):**
1. https://github.com/settings/tokens → "Generate new token (classic)"
2. Scopes: ✅ `repo` (voller Zugriff)
3. Token kopieren → in `.env` einfügen

---

## Schritt 7: Workflow auf GitHub pushen

Zurück im Repo-Root:

```bash
cd ..
git add -A
git commit -m "feat: PoC Claude Code Action setup"
git push
```

**Prüfe auf GitHub:** Unter `Code` → `.github/workflows/` → `claude-ticket.yml` muss sichtbar sein.  
Ohne diesen Push passiert nichts wenn ein Issue erstellt wird!

---

## Schritt 8: Webhook einrichten

### 8a. Webhook-URL besorgen

1. Gehe zu **https://webhook.site**
2. Kopiere die angezeigte URL (z.B. `https://webhook.site/abc-123-def`)
3. **Lass den Tab offen** — hier siehst du eingehende Requests

### 8b. Webhook in GitHub konfigurieren

1. Repo → **Settings** → **Webhooks** → **"Add webhook"**
2. **Payload URL:** Die webhook.site URL von oben
3. **Content type:** `application/json`
4. **Secret:** leer lassen (für PoC okay, in Produktion: Shared Secret)
5. **Which events?** → "Let me select individual events"
   - ✅ **Issue comments** (Claude's Ergebnis)
   - ✅ **Pull requests** (falls Claude einen PR öffnet)
   - Alles andere aus
6. ✅ Active
7. **"Add webhook"**

---

## Schritt 9: Tests durchführen

**Alle Scripts werden im `scripts/` Ordner des Repos ausgeführt:**

```bash
cd scripts
```

### Test A: Issue + Label erstellen

```bash
node test-a-create-issue.js
```

**Prüfen:**
- [ ] Konsole zeigt Issue-URL → öffnen → Issue ist da mit Label "claude"?
- [ ] Actions Tab (`github.com/USER/REPO/actions`) → "Claude Ticket Processing" läuft?
- [ ] Warten (~2-5 min) → Claude hat einen Kommentar gepostet?
- [ ] webhook.site → POST mit `issue_comment` Event angekommen?

### Test B: Strukturierter Output (JSON-Block)

```bash
node test-c-structured-issue.js
```

**Prüfen:**
- [ ] Claude-Kommentar enthält einen ```json Block am Ende?
- [ ] JSON-Block prüfen: `node verify-json.js <issue-nummer>`
- [ ] Format: `{ "status": "done", "summary": "...", "files_changed": [...] }`

### Test C: Rückfrage-Szenario

```bash
node test-e-needs-input.js
```

**Prüfen:**
- [ ] Claude erkennt, dass Infos fehlen?
- [ ] JSON prüfen: `node verify-json.js <issue-nummer>`
- [ ] JSON enthält `"status": "needs_input"` und eine `"question"`?

### Test D: Webhook-Payload analysieren

1. Gehe auf webhook.site
2. Kopiere einen Payload mit einem Claude-Kommentar
3. Speichere als `scripts/webhook-payload.json`
4. `node analyze-webhook-payload.js`

**Prüfen:**
- [ ] Issue-Nummer und Repo korrekt erkannt?
- [ ] JSON-Block aus `comment.body` extrahiert?
- [ ] Simulation zeigt korrekten nächsten Schritt?

---

## Schritt 10: Ergebnis dokumentieren

### Checkliste

| Test | Ergebnis | Notizen |
|------|----------|---------|
| A: Issue + Label + Action triggert | ⬜ Pass / ⬜ Fail | |
| B: Strukturierter JSON-Output | ⬜ Pass / ⬜ Fail | |
| C: Rückfrage-Szenario | ⬜ Pass / ⬜ Fail | |
| D: Webhook-Payload parsbar | ⬜ Pass / ⬜ Fail | |

### PoC bestanden wenn:

- ✅ A + D müssen funktionieren (Grundflow)
- ✅ B muss in >80% der Fälle parsbaren JSON liefern
- ⚠️ C ist nice-to-have, kann im Prompt verfeinert werden

### PoC gescheitert wenn:

- ❌ Claude Code Action startet nicht bei Label-Trigger
- ❌ GitHub Webhook liefert keinen Kommentar-Payload
- ❌ Claude ignoriert JSON-Format-Anweisung konsistent

---

## Aufräumen

```bash
cd scripts
node cleanup.js
```

Oder: Repo löschen wenn nicht mehr benötigt  
→ GitHub → Repo Settings → Danger Zone → Delete

---

## Nächste Schritte nach erfolgreichem PoC

1. Ergebnis in `mindvaults_gesamtzusammenfassung_v2.md` dokumentieren
2. P4-Tickets auf Issue/Webhook-Architektur umschreiben
3. Webhook-Handler API Route implementieren (in MindVaults App)
4. Prompt-Template für verschiedene Ticket-Typen ausarbeiten