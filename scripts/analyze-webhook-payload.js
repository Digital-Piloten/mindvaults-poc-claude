// analyze-webhook-payload.js
// ──────────────────────────
// Simuliert was die MindVaults API Route mit einem GitHub Webhook Payload machen würde.
// 
// Usage: 
//   1. Kopiere einen Webhook-Payload von webhook.site
//   2. Speichere ihn als webhook-payload.json
//   3. node analyze-webhook-payload.js
//
// Oder: Paste den Payload direkt via stdin:
//   pbpaste | node analyze-webhook-payload.js

import { parseResultJson } from "./github.js";
import { readFileSync, existsSync } from "fs";

async function main() {
  console.log("═══════════════════════════════════════════");
  console.log("  WEBHOOK PAYLOAD ANALYSE");
  console.log("═══════════════════════════════════════════\n");

  // Payload laden
  let payload;
  
  if (existsSync("webhook-payload.json")) {
    console.log("1. Lade webhook-payload.json...");
    payload = JSON.parse(readFileSync("webhook-payload.json", "utf-8"));
  } else {
    console.log("1. Lese von stdin... (paste JSON, dann Ctrl+D)");
    const chunks = [];
    for await (const chunk of process.stdin) {
      chunks.push(chunk);
    }
    payload = JSON.parse(Buffer.concat(chunks).toString());
  }

  // Grundinfo
  console.log("\n2. Payload-Grundinfo:");
  console.log(`   Action: ${payload.action}`);
  console.log(`   Event: ${payload.comment ? "issue_comment" : payload.issue ? "issues" : "unknown"}`);

  if (!payload.comment) {
    console.log("   ⚠️  Kein Kommentar im Payload — ist das ein issue_comment Event?");
    console.log("   Verfügbare Keys:", Object.keys(payload).join(", "));
    process.exit(1);
  }

  // Kommentar-Info
  console.log("\n3. Kommentar-Details:");
  console.log(`   Author: ${payload.comment.user.login}`);
  console.log(`   Created: ${payload.comment.created_at}`);
  console.log(`   Issue: #${payload.issue.number} — ${payload.issue.title}`);
  console.log(`   Body-Länge: ${payload.comment.body.length} Zeichen`);

  // Relevante Felder die MindVaults brauchen würde
  console.log("\n4. Für MindVaults relevante Felder:");
  const relevant = {
    issue_number: payload.issue.number,
    issue_title: payload.issue.title,
    comment_author: payload.comment.user.login,
    comment_id: payload.comment.id,
    repo: payload.repository?.full_name,
  };
  console.log(`   ${JSON.stringify(relevant, null, 2)}`);

  // JSON-Block extrahieren
  console.log("\n5. JSON-Block aus Kommentar extrahieren...");
  const result = parseResultJson(payload.comment.body);

  if (!result) {
    console.log("   ❌ Kein JSON-Block gefunden im Kommentar.");
    console.log("   Letzte 300 Zeichen des Kommentars:");
    console.log("   " + payload.comment.body.slice(-300));
    process.exit(1);
  }

  console.log("   ✅ JSON-Block erfolgreich extrahiert!");
  console.log(`   ${JSON.stringify(result, null, 2)}`);

  // Simulation: Was die MindVaults API Route machen würde
  console.log("\n═══════════════════════════════════════════");
  console.log("  SIMULATION: MindVaults Webhook-Handler");
  console.log("═══════════════════════════════════════════\n");

  if (result.status === "done") {
    console.log(`  → execution_states UPDATE: status = 'done'`);
    console.log(`  → summary speichern: "${result.summary}"`);
    if (result.files_changed?.length) {
      console.log(`  → files_changed: ${result.files_changed.join(", ")}`);
    }
    console.log(`  → Nächstes Ticket erstellen (Issue #${payload.issue.number + 1})`);
  } else if (result.status === "needs_input") {
    console.log(`  → execution_states UPDATE: status = 'waiting', waiting_for = 'user_input'`);
    console.log(`  → Rückfrage: "${result.question}"`);
    console.log(`  → Resend Email an User mit Link zur Rückfrage`);
    console.log(`  → KEIN nächstes Ticket — Flow pausiert`);
  } else {
    console.log(`  ⚠️ Unbekannter Status: "${result.status}"`);
  }

  console.log("\n  ✅ Webhook-Handler Simulation abgeschlossen.");
}

main().catch((e) => {
  console.error("❌ Fehler:", e.message);
  process.exit(1);
});
