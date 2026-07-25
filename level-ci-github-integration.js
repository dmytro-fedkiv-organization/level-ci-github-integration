#!/usr/bin/env node
"use strict";

/**
 * Reads Level CI reports from ./level-ci-reports and publishes a GitHub
 * Check run + a PR comment summarizing the accessibility findings.
 *
 * Auth comes from the pipeline via the GITHUB_TOKEN env var. All the
 * repo/commit/PR context is read from the standard GitHub Actions env.
 * No external dependencies — uses Node's built-in fetch (Node 18+).
 */

const fs = require("fs");
const path = require("path");

const REPORTS_DIR = path.resolve("level-ci-reports", "scope-reports");
const CHECK_NAME = "level-ci/accessibility";
const COMMENT_MARKER = "<!-- level-ci-a11y -->";
const API = process.env.GITHUB_API_URL || "https://api.github.com";

function countLines(file) {
  const text = fs.readFileSync(file, "utf8").trim();
  return text ? text.split("\n").filter(Boolean).length : 0;
}

/** Parse every scope report into a per-page + per-rule violation summary. */
function readReports() {
  if (!fs.existsSync(REPORTS_DIR)) return { pages: [], total: 0, rules: {} };

  const pages = [];
  const rules = {};
  let total = 0;

  for (const scope of fs.readdirSync(REPORTS_DIR)) {
    const scopeDir = path.join(REPORTS_DIR, scope);
    if (!fs.statSync(scopeDir).isDirectory()) continue;

    let url = scope;
    const metaPath = path.join(scopeDir, "scope-meta.json");
    if (fs.existsSync(metaPath)) {
      try {
        url = JSON.parse(fs.readFileSync(metaPath, "utf8")).env?.url || scope;
      } catch {
        /* keep hash as fallback */
      }
    }

    const issuesDir = path.join(scopeDir, "issues");
    let pageTotal = 0;
    if (fs.existsSync(issuesDir)) {
      for (const file of fs.readdirSync(issuesDir)) {
        if (!file.endsWith(".ndjson")) continue;
        const ruleId = path.basename(file, ".ndjson");
        const n = countLines(path.join(issuesDir, file));
        pageTotal += n;
        rules[ruleId] = (rules[ruleId] || 0) + n;
      }
    }

    total += pageTotal;
    pages.push({ url, issues: pageTotal });
  }

  pages.sort((a, b) => b.issues - a.issues);
  return { pages, total, rules };
}

/** Build the markdown body shared by the comment and the check summary. */
function buildSummary({ pages, total, rules }) {
  if (!pages.length) {
    return "No Level CI accessibility reports were found in `level-ci-reports`.";
  }

  const topRules = Object.entries(rules)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, n]) => `\`rule ${id}\` (${n})`)
    .join(", ");

  const rows = pages
    .map((p) => `| ${p.url} | ${p.issues} |`)
    .join("\n");

  return [
    `**${total}** accessibility ${total === 1 ? "violation" : "violations"} across **${pages.length}** ${pages.length === 1 ? "page" : "pages"}.`,
    "",
    "| Page | Violations |",
    "| --- | ---: |",
    rows,
    "",
    topRules ? `Most frequent rules: ${topRules}.` : "",
  ]
    .filter((line) => line !== "")
    .join("\n");
}

function requireContext() {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPOSITORY;
  if (!token) throw new Error("GITHUB_TOKEN is not set.");
  if (!repo) throw new Error("GITHUB_REPOSITORY is not set.");
  const [owner, name] = repo.split("/");
  return { token, owner, name, sha: process.env.GITHUB_SHA };
}

async function gh(token, method, endpoint, body) {
  const res = await fetch(`${API}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      "User-Agent": "level-ci-github-integration",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    throw new Error(`GitHub API ${method} ${endpoint} failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

async function createCheck(ctx, report, summary) {
  const conclusion = report.total === 0 ? "success" : "neutral";
  await gh(ctx.token, "POST", `/repos/${ctx.owner}/${ctx.name}/check-runs`, {
    name: CHECK_NAME,
    head_sha: ctx.sha,
    status: "completed",
    conclusion,
    output: {
      title:
        report.total === 0
          ? "No accessibility violations"
          : `${report.total} accessibility ${report.total === 1 ? "violation" : "violations"}`,
      summary,
    },
  });
  console.log(`Created check "${CHECK_NAME}" (${conclusion}).`);
}

/** Resolve the PR number from the event payload, or from the pushed commit. */
async function resolvePrNumber(ctx) {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (eventPath && fs.existsSync(eventPath)) {
    try {
      const event = JSON.parse(fs.readFileSync(eventPath, "utf8"));
      if (event.pull_request?.number) return event.pull_request.number;
    } catch {
      /* fall through */
    }
  }
  if (ctx.sha) {
    const prs = await gh(
      ctx.token,
      "GET",
      `/repos/${ctx.owner}/${ctx.name}/commits/${ctx.sha}/pulls`
    );
    if (Array.isArray(prs) && prs.length) return prs[0].number;
  }
  return null;
}

async function upsertComment(ctx, summary) {
  const prNumber = await resolvePrNumber(ctx);
  if (!prNumber) {
    console.log("No pull request in context — skipping comment.");
    return;
  }

  const body = `${COMMENT_MARKER}\n### Level CI Accessibility\n\n${summary}`;
  const base = `/repos/${ctx.owner}/${ctx.name}`;

  const existing = await gh(ctx.token, "GET", `${base}/issues/${prNumber}/comments?per_page=100`);
  const mine = existing.find((c) => c.body?.includes(COMMENT_MARKER));

  if (mine) {
    await gh(ctx.token, "PATCH", `${base}/issues/comments/${mine.id}`, { body });
    console.log(`Updated comment on PR #${prNumber}.`);
  } else {
    await gh(ctx.token, "POST", `${base}/issues/${prNumber}/comments`, { body });
    console.log(`Created comment on PR #${prNumber}.`);
  }
}

async function main() {
  const report = readReports();
  const summary = buildSummary(report);
  console.log(summary);

  const ctx = requireContext();
  // await createCheck(ctx, report, summary);
  await upsertComment(ctx, summary);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
