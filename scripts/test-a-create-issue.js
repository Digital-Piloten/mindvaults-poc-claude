// test-a-create-issue.js
// ──────────────────────
// Test A: Kann ein Issue mit Label "claude" per API erstellt werden?
// Triggert die GitHub Action?
//
// Erwartetes Ergebnis:
//   - Issue erscheint auf GitHub mit Label "claude"
//   - GitHub Action "Claude Ticket Processing" startet im Actions Tab
//   - Claude postet einen Kommentar auf das Issue

import { ensureLabel, createIssueWithLabel, owner, repo } from "./github.js";

async function main() {
  console.log("═══════════════════════════════════════════");
  console.log("  TEST A: Issue + Label erstellen");
  console.log("═══════════════════════════════════════════\n");

  // 1. Label sicherstellen
  console.log("1. Label 'claude' sicherstellen...");
  await ensureLabel();

  // 2. Simples Test-Issue erstellen
  console.log("\n2. Issue erstellen...");
  const issue = await createIssueWithLabel(
    "[PoC Test A] Einfacher Test — Hello World",
    `## Aufgabe

Erstelle eine Datei \`hello.txt\` im Root des Repositories mit dem Inhalt "Hello from MindVaults PoC!".

Das ist ein simpler Test um zu prüfen ob Claude Code Action korrekt triggert.`
  );

  console.log(`   Issue #${issue.number} erstellt ✓`);
  console.log(`   URL: ${issue.html_url}`);
  console.log(`   Labels: ${issue.labels.map((l) => l.name).join(", ")}`);

  // 3. Hinweise
  console.log("\n═══════════════════════════════════════════");
  console.log("  NÄCHSTE SCHRITTE:");
  console.log("═══════════════════════════════════════════");
  console.log(`
  1. Öffne den Actions-Tab:
     https://github.com/${owner}/${repo}/actions

  2. Prüfe ob "Claude Ticket Processing" gestartet wurde

  3. Warte bis die Action durchgelaufen ist (~2-5 min)

  4. Prüfe ob Claude einen Kommentar gepostet hat:
     ${issue.html_url}

  5. Prüfe auf webhook.site ob ein POST ankam
     (Event: issue_comment, Action: created)
  `);
}

main().catch((e) => {
  console.error("❌ Fehler:", e.message);
  process.exit(1);
});
