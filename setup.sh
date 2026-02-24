#!/bin/bash
# setup.sh
# ────────
# Schnelles Setup: Kopiert alle PoC-Dateien in ein frisch geklontes Repo.
#
# Usage:
#   1. Klone dein Repo: git clone https://github.com/USER/mindvaults-poc-claude.git
#   2. Kopiere den poc/ Ordner neben das Repo
#   3. Führe aus: ./setup.sh /pfad/zum/mindvaults-poc-claude

set -e

REPO_DIR="${1:-.}"

if [ ! -d "$REPO_DIR/.git" ]; then
  echo "❌ $REPO_DIR ist kein Git-Repository!"
  echo "Usage: ./setup.sh /pfad/zum/mindvaults-poc-claude"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "═══════════════════════════════════════════"
echo "  MindVaults PoC Setup"
echo "═══════════════════════════════════════════"
echo ""
echo "  Repo: $REPO_DIR"
echo ""

# 1. Workflow
echo "1. GitHub Action Workflow kopieren..."
mkdir -p "$REPO_DIR/.github/workflows"
cp "$SCRIPT_DIR/workflows/claude-ticket.yml" "$REPO_DIR/.github/workflows/claude-ticket.yml"
echo "   ✓ .github/workflows/claude-ticket.yml"

# 2. Scripts
echo ""
echo "2. Test-Scripts kopieren..."
mkdir -p "$REPO_DIR/scripts"
cp "$SCRIPT_DIR/scripts/package.json" "$REPO_DIR/scripts/"
cp "$SCRIPT_DIR/scripts/github.js" "$REPO_DIR/scripts/"
cp "$SCRIPT_DIR/scripts/test-a-create-issue.js" "$REPO_DIR/scripts/"
cp "$SCRIPT_DIR/scripts/test-c-structured-issue.js" "$REPO_DIR/scripts/"
cp "$SCRIPT_DIR/scripts/test-e-needs-input.js" "$REPO_DIR/scripts/"
cp "$SCRIPT_DIR/scripts/verify-json.js" "$REPO_DIR/scripts/"
cp "$SCRIPT_DIR/scripts/analyze-webhook-payload.js" "$REPO_DIR/scripts/"
cp "$SCRIPT_DIR/scripts/cleanup.js" "$REPO_DIR/scripts/"
cp "$SCRIPT_DIR/scripts/.env.example" "$REPO_DIR/scripts/"
echo "   ✓ 8 Scripts + .env.example"

# 3. Gitignore
echo ""
echo "3. .gitignore kopieren..."
cp "$SCRIPT_DIR/.gitignore" "$REPO_DIR/.gitignore"
echo "   ✓ .gitignore"

# 4. Dependencies
echo ""
echo "4. npm install..."
cd "$REPO_DIR/scripts"
npm install --silent
echo "   ✓ Dependencies installiert"

# 5. Zusammenfassung
echo ""
echo "═══════════════════════════════════════════"
echo "  ✅ Setup abgeschlossen!"
echo "═══════════════════════════════════════════"
echo ""
echo "  Nächste Schritte:"
echo ""
echo "  1. Claude GitHub App installieren (WICHTIG!):"
echo "     → https://github.com/apps/claude"
echo "     → Install → Repo auswählen → Bestätigen"
echo ""
echo "  2. Repo Actions-Einstellungen prüfen:"
echo "     → Repo Settings → Actions → General"
echo "     → Actions permissions: 'Allow all actions'"
echo "     → Workflow permissions: 'Read and write' (ganz unten!)"
echo ""
echo "  3. ANTHROPIC_API_KEY als GitHub Secret setzen:"
echo "     → Repo Settings → Secrets → Actions → New"
echo ""
echo "  4. .env konfigurieren:"
echo "     cd $REPO_DIR/scripts"
echo "     cp .env.example .env"
echo "     # Token + Username eintragen"
echo ""
echo "  5. Webhook einrichten:"
echo "     → https://webhook.site (URL kopieren)"
echo "     → Repo Settings → Webhooks → Add"
echo "     → Event: Issue comments"
echo ""
echo "  6. Workflow committen + pushen:"
echo "     cd $REPO_DIR"
echo "     git add -A"
echo "     git commit -m 'feat: PoC Claude Code Action setup'"
echo "     git push"
echo ""
echo "  7. Ersten Test starten:"
echo "     cd scripts/"
echo "     node test-a-create-issue.js"
echo ""
