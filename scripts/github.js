// github.js — Shared Helper für alle Test-Scripts
import { Octokit } from "@octokit/rest";
import dotenv from "dotenv";

dotenv.config();

const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO } = process.env;

if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
  console.error("❌ .env nicht konfiguriert! Kopiere .env.example → .env und fülle die Werte aus.");
  process.exit(1);
}

export const octokit = new Octokit({ auth: GITHUB_TOKEN });
export const owner = GITHUB_OWNER;
export const repo = GITHUB_REPO;

/**
 * Erstellt das Label "claude" falls es noch nicht existiert
 */
export async function ensureLabel() {
  try {
    await octokit.rest.issues.getLabel({ owner, repo, name: "claude" });
    console.log("   Label 'claude' existiert bereits ✓");
  } catch (e) {
    if (e.status === 404) {
      await octokit.rest.issues.createLabel({
        owner,
        repo,
        name: "claude",
        color: "7C3AED", // lila
        description: "Ticket wird von Claude Code bearbeitet",
      });
      console.log("   Label 'claude' erstellt ✓");
    } else {
      throw e;
    }
  }
}

/**
 * Erstellt ein Issue und weist das Label "claude" zu
 */
export async function createIssueWithLabel(title, body) {
  // Schritt 1: Issue erstellen
  const { data: issue } = await octokit.rest.issues.create({
    owner,
    repo,
    title,
    body,
    labels: ["claude"],
  });

  return issue;
}

/**
 * Liest alle Kommentare eines Issues
 */
export async function getComments(issueNumber) {
  const { data: comments } = await octokit.rest.issues.listComments({
    owner,
    repo,
    issue_number: issueNumber,
  });
  return comments;
}

/**
 * Versucht den JSON-Block aus einem Kommentar zu parsen
 */
export function parseResultJson(commentBody) {
  const jsonMatch = commentBody.match(/```json\s*\n([\s\S]*?)\n```/);
  if (!jsonMatch) return null;

  try {
    return JSON.parse(jsonMatch[1]);
  } catch (e) {
    console.error("   JSON parse error:", e.message);
    return null;
  }
}

/**
 * Schließt ein Issue
 */
export async function closeIssue(issueNumber) {
  await octokit.rest.issues.update({
    owner,
    repo,
    issue_number: issueNumber,
    state: "closed",
  });
}

/**
 * Listet alle offenen Issues mit Label "claude"
 */
export async function listOpenClaudeIssues() {
  const { data: issues } = await octokit.rest.issues.listForRepo({
    owner,
    repo,
    labels: "claude",
    state: "open",
  });
  return issues;
}
