// cleanup.js
// ──────────
// Schließt alle offenen Issues mit Label "claude" im Test-Repo.

import { listOpenClaudeIssues, closeIssue, owner, repo } from "./github.js";

async function main() {
  console.log("═══════════════════════════════════════════");
  console.log("  CLEANUP: PoC Issues schließen");
  console.log("═══════════════════════════════════════════\n");

  const issues = await listOpenClaudeIssues();

  if (issues.length === 0) {
    console.log("   Keine offenen Issues mit Label 'claude' gefunden. Alles sauber!");
    return;
  }

  console.log(`   ${issues.length} offene Issue(s) gefunden:\n`);

  for (const issue of issues) {
    console.log(`   Schließe #${issue.number}: ${issue.title}...`);
    await closeIssue(issue.number);
    console.log(`   ✓ Geschlossen`);
  }

  console.log(`\n   ✅ ${issues.length} Issue(s) geschlossen.`);
}

main().catch((e) => {
  console.error("❌ Fehler:", e.message);
  process.exit(1);
});
