// verify-json.js
// ───────────────
// Prüft ob der letzte Claude-Kommentar auf einem Issue
// einen validen JSON-Block enthält.
//
// Usage: node verify-json.js <issue-nummer>

import { getComments, parseResultJson, owner, repo } from "./github.js";

const issueNumber = parseInt(process.argv[2]);

if (!issueNumber) {
  console.error("Usage: node verify-json.js <issue-nummer>");
  console.error("Beispiel: node verify-json.js 3");
  process.exit(1);
}

async function main() {
  console.log("═══════════════════════════════════════════");
  console.log(`  VERIFY: JSON-Block in Issue #${issueNumber}`);
  console.log("═══════════════════════════════════════════\n");

  // 1. Kommentare laden
  console.log("1. Kommentare laden...");
  const comments = await getComments(issueNumber);

  if (comments.length === 0) {
    console.log("   ❌ Keine Kommentare gefunden.");
    console.log("   → Warte bis Claude Code Action durchgelaufen ist.");
    process.exit(1);
  }

  console.log(`   ${comments.length} Kommentar(e) gefunden ✓`);

  // 2. Letzten Kommentar analysieren (Claude's Antwort)
  const lastComment = comments[comments.length - 1];
  console.log(`\n2. Letzter Kommentar von: ${lastComment.user.login}`);
  console.log(`   Erstellt: ${lastComment.created_at}`);
  console.log(`   Länge: ${lastComment.body.length} Zeichen`);

  // 3. JSON-Block extrahieren
  console.log("\n3. JSON-Block suchen...");
  const result = parseResultJson(lastComment.body);

  if (!result) {
    console.log("   ❌ Kein valider JSON-Block gefunden!");
    console.log("\n   --- Kommentar-Text (letzte 500 Zeichen): ---");
    console.log(lastComment.body.slice(-500));
    console.log("   --- Ende ---");
    process.exit(1);
  }

  console.log("   ✅ JSON-Block gefunden und geparst!");

  // 4. Struktur validieren
  console.log("\n4. Struktur prüfen...");
  console.log(`   ${JSON.stringify(result, null, 2)}`);

  const checks = [
    {
      name: 'Feld "status" vorhanden',
      pass: "status" in result,
    },
    {
      name: 'Status ist "done" oder "needs_input"',
      pass: result.status === "done" || result.status === "needs_input",
    },
    {
      name: 'Feld "summary" vorhanden',
      pass: "summary" in result,
    },
    {
      name: '"summary" ist nicht leer',
      pass: result.summary && result.summary.length > 0,
    },
    {
      name: 'Bei needs_input: "question" vorhanden',
      pass: result.status !== "needs_input" || "question" in result,
    },
    {
      name: 'Bei done: "files_changed" vorhanden',
      pass: result.status !== "done" || "files_changed" in result,
    },
  ];

  console.log("\n5. Validierung:");
  let allPassed = true;
  for (const check of checks) {
    const icon = check.pass ? "✅" : "❌";
    console.log(`   ${icon} ${check.name}`);
    if (!check.pass) allPassed = false;
  }

  // 5. Fazit
  console.log("\n═══════════════════════════════════════════");
  if (allPassed) {
    console.log("  ✅ ALLE CHECKS BESTANDEN");
    console.log(`  Status: ${result.status}`);
    console.log(`  Summary: ${result.summary}`);
    if (result.question) console.log(`  Question: ${result.question}`);
  } else {
    console.log("  ⚠️  NICHT ALLE CHECKS BESTANDEN");
    console.log("  Prompt muss ggf. angepasst werden.");
  }
  console.log("═══════════════════════════════════════════");
}

main().catch((e) => {
  console.error("❌ Fehler:", e.message);
  process.exit(1);
});
