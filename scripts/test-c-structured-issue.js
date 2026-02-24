// test-c-structured-issue.js
// ──────────────────────────
// Test C: Produziert Claude einen parsbaren JSON-Block im Kommentar?
// Das ist der kritischste Test — davon hängt die gesamte P4-Architektur ab.
//
// Erwartetes Ergebnis:
//   - Claude-Kommentar endet mit einem ```json Block
//   - Der Block ist valides JSON
//   - Enthält mindestens: status, summary

import { ensureLabel, createIssueWithLabel, owner, repo } from "./github.js";

async function main() {
  console.log("═══════════════════════════════════════════");
  console.log("  TEST C: Strukturierter JSON-Output");
  console.log("═══════════════════════════════════════════\n");

  await ensureLabel();

  // Issue mit einem realistischen MindVaults-Ticket erstellen
  console.log("1. Issue mit realistischem Ticket erstellen...");
  const issue = await createIssueWithLabel(
    "[PoC Test C] Erstelle ein TypeScript Interface für Element-Typen",
    `## Ticket: Element-Registry Interface

### Kontext
Wir bauen eine Mind-Mapping App (MindVaults) mit React Flow. 
Jeder Knoten auf dem Canvas ist ein "Element" mit einem Typ (note, template, variable, outcome, etc.).
Wir brauchen ein zentrales TypeScript Interface das alle Element-Typen beschreibt.

### Aufgabe
Erstelle eine Datei \`src/types/element-registry.ts\` mit:

1. Ein \`ElementType\` Union-Type mit den Werten: \`note\`, \`template\`, \`variable\`, \`outcome\`, \`info\`, \`boolean\`, \`if\`, \`for\`, \`api-call\`
2. Ein \`ElementDefinition\` Interface mit:
   - \`type\`: ElementType
   - \`label\`: string (Anzeigename)
   - \`icon\`: string (Lucide Icon-Name)
   - \`category\`: \`'content' | 'logic' | 'integration'\`
   - \`ports\`: \`{ inputs: PortDefinition[], outputs: PortDefinition[] }\`
3. Ein \`PortDefinition\` Interface mit:
   - \`id\`: string
   - \`label\`: string  
   - \`type\`: \`'flow' | 'data'\`

### Akzeptanzkriterien
- Datei kompiliert ohne Fehler
- Alle 9 Element-Typen sind definiert
- Export ist korrekt`
  );

  console.log(`   Issue #${issue.number} erstellt ✓`);
  console.log(`   URL: ${issue.html_url}`);

  console.log("\n═══════════════════════════════════════════");
  console.log("  NÄCHSTE SCHRITTE:");
  console.log("═══════════════════════════════════════════");
  console.log(`
  1. Warte bis Claude den Kommentar gepostet hat (~2-5 min):
     ${issue.html_url}

  2. Prüfe den Kommentar manuell:
     - Enthält er einen \`\`\`json Block am Ende?
     - Ist "status" vorhanden? ("done" oder "needs_input")
     - Ist "summary" vorhanden?

  3. Wenn der Kommentar da ist, parse ihn mit:
     node verify-json.js ${issue.number}

  4. Prüfe auf webhook.site:
     - Ist der Kommentar-Body im Webhook-Payload?
     - Kannst du den JSON-Block aus payload.comment.body extrahieren?
  `);
}

main().catch((e) => {
  console.error("❌ Fehler:", e.message);
  process.exit(1);
});
