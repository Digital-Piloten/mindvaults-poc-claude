// test-e-needs-input.js
// ─────────────────────
// Test E: Erkennt Claude wenn Infos fehlen und stellt eine Rückfrage?
// Testet den "needs_input" Pfad der P4-Architektur.
//
// Erwartetes Ergebnis:
//   - Claude erkennt dass Infos fehlen
//   - JSON-Block enthält "status": "needs_input"
//   - JSON-Block enthält eine sinnvolle "question"

import { ensureLabel, createIssueWithLabel, owner, repo } from "./github.js";

async function main() {
  console.log("═══════════════════════════════════════════");
  console.log("  TEST E: Rückfrage-Szenario (needs_input)");
  console.log("═══════════════════════════════════════════\n");

  await ensureLabel();

  // Issue mit absichtlich unvollständigen Informationen
  console.log("1. Issue mit unvollständigem Ticket erstellen...");
  const issue = await createIssueWithLabel(
    "[PoC Test E] API-Endpoint implementieren",
    `## Ticket: API-Endpoint für Datenexport

### Kontext
Wir brauchen einen neuen API-Endpoint.

### Aufgabe
Implementiere den Export-Endpoint.

### Akzeptanzkriterien
- Endpoint funktioniert
- Daten werden korrekt exportiert`
  );

  console.log(`   Issue #${issue.number} erstellt ✓`);
  console.log(`   URL: ${issue.html_url}`);

  console.log("\n═══════════════════════════════════════════");
  console.log("  NÄCHSTE SCHRITTE:");
  console.log("═══════════════════════════════════════════");
  console.log(`
  1. Warte bis Claude den Kommentar gepostet hat (~2-5 min):
     ${issue.html_url}

  2. Prüfe ob Claude eine Rückfrage stellt:
     - Welches Format? (JSON, CSV, PDF?)
     - Welche Daten genau?
     - Welcher HTTP-Pfad?
     - Authentifizierung nötig?

  3. Prüfe den JSON-Block:
     - "status" sollte "needs_input" sein
     - "question" sollte eine konkrete Rückfrage enthalten

  4. Wenn da, verifiziere mit:
     node verify-json.js ${issue.number}
  `);
}

main().catch((e) => {
  console.error("❌ Fehler:", e.message);
  process.exit(1);
});
