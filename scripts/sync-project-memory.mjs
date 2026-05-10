import fs from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const graphDir = path.join(rootDir, "graphify-out");

const files = {
  rootPackage: "package.json",
  readme: "README.md",
  netlify: "netlify.toml",
  render: "render.yaml",
  backendEnv: path.join("backend", ".env.example"),
  frontendEnv: path.join("frontend", ".env.example"),
  backendIndex: path.join("backend", "src", "index.js"),
  frontendApp: path.join("frontend", "src", "App.jsx"),
  frontendMain: path.join("frontend", "src", "main.jsx"),
  frontendStyles: path.join("frontend", "src", "styles.css"),
  netlifyLinks: path.join("frontend", "netlify", "functions", "links.js"),
  netlifyRedirect: path.join("frontend", "netlify", "functions", "redirect.js")
};

await fs.mkdir(graphDir, { recursive: true });

const content = await loadFiles(files);

const rootPackage = JSON.parse(content.rootPackage);
const backendEnv = parseEnv(content.backendEnv);
const frontendEnv = parseEnv(content.frontendEnv);
const backendRoutes = extractRoutes(content.backendIndex);
const netlifyRouteNotes = extractNetlifyRedirects(content.netlify);
const frontendFacts = extractFrontendFacts(content.frontendApp);
const backendUsesServiceRole = content.backendIndex.includes("SUPABASE_SERVICE_ROLE_KEY");
const netlifyUsesAnon = content.netlifyLinks.includes("SUPABASE_ANON_KEY")
  || content.netlifyRedirect.includes("SUPABASE_ANON_KEY");
const hasRecentLinksUi = /createdLink/.test(content.frontendApp) && /links\s*[:=]/.test(content.frontendApp);
const hasRecentLinksApi = content.backendIndex.includes('app.get("/api/links"');
const isGitRepo = await detectGitRepo(rootDir);
const generatedAt = new Date().toISOString();
const currentDate = generatedAt.slice(0, 10);

const model = {
  rootScripts: Object.keys(rootPackage.scripts ?? {}),
  backendEnvKeys: Object.keys(backendEnv),
  frontendEnvKeys: Object.keys(frontendEnv),
  backendRoutes,
  netlifyRouteNotes,
  frontendFacts,
  backendUsesServiceRole,
  netlifyUsesAnon,
  hasRecentLinksUi,
  hasRecentLinksApi,
  isGitRepo,
  generatedAt,
  currentDate
};

await Promise.all([
  fs.writeFile(path.join(rootDir, "CLAUDE.md"), renderClaude(model)),
  fs.writeFile(path.join(rootDir, "HANDOFF.md"), renderHandoff(model)),
  fs.writeFile(path.join(graphDir, "README.md"), renderGraphReadme()),
  fs.writeFile(path.join(graphDir, "GRAPH_REPORT.md"), renderGraphReport(model)),
  fs.writeFile(path.join(graphDir, "graph.json"), JSON.stringify(renderGraph(model), null, 2)),
  fs.writeFile(
    path.join(graphDir, "memory-status.json"),
    JSON.stringify(
      {
        generatedAt,
        watcherHint: "Run `npm run watch:memory` to keep files live-synced.",
        backendRoutes,
        hasRecentLinksUi,
        hasRecentLinksApi,
        backendUsesServiceRole,
        netlifyUsesAnon,
        isGitRepo
      },
      null,
      2
    )
  )
]);

console.log(`Memory synced ${generatedAt}`);

async function loadFiles(map) {
  const entries = await Promise.all(
    Object.entries(map).map(async ([key, relativePath]) => {
      const absolutePath = path.join(rootDir, relativePath);
      return [key, await fs.readFile(absolutePath, "utf8")];
    })
  );

  return Object.fromEntries(entries);
}

function parseEnv(raw) {
  return Object.fromEntries(
    raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index), line.slice(index + 1)];
      })
  );
}

function extractRoutes(code) {
  const matches = [...code.matchAll(/app\.(get|post|put|patch|delete)\("([^"]+)"/g)];
  return matches.map(([, method, route]) => `${method.toUpperCase()} ${route}`);
}

function extractNetlifyRedirects(raw) {
  const lines = raw.split(/\r?\n/);
  const pairs = [];

  for (let i = 0; i < lines.length; i += 1) {
    const fromMatch = lines[i].match(/from = "([^"]+)"/);
    const toMatch = lines[i + 1]?.match(/to = "([^"]+)"/);

    if (fromMatch && toMatch) {
      pairs.push(`${fromMatch[1]} -> ${toMatch[1]}`);
    }
  }

  return pairs;
}

function extractFrontendFacts(code) {
  return {
    postsToApiLinks: code.includes('fetch(getLinksEndpoint()'),
    hasCopyButton: code.includes("copyLink("),
    usesWindowOriginFallback: code.includes("window.location.origin"),
    showsCreatedLinkOnly: code.includes("createdLink") && !/\bmap\(/.test(code)
  };
}

async function detectGitRepo(dir) {
  try {
    await fs.access(path.join(dir, ".git"));
    return true;
  } catch {
    return false;
  }
}

function renderClaude(model) {
  const recentLinksStatus = model.hasRecentLinksUi
    ? "Implemented recent-links UI."
    : "Recent links list missing in UI, though backend exposes `GET /api/links`.";
  const gitNote = model.isGitRepo
    ? "Git metadata exists in workspace."
    : "This folder is not currently a git repository in local workspace, so do not assume branch history exists.";

  return `# Project Memory

## What This Repo Is

This repository is a small full-stack URL shortener split into two workspaces:

- \`frontend\`: React + Vite landing page and client for creating short links
- \`backend\`: Express API for listing, creating, and resolving short links

There is also a Netlify-only deployment path using serverless functions in \`frontend/netlify/functions\`.

${gitNote}

## Entry Points

- Frontend app: \`frontend/src/App.jsx\`
- Frontend bootstrap: \`frontend/src/main.jsx\`
- Frontend styles: \`frontend/src/styles.css\`
- Express backend: \`backend/src/index.js\`
- Netlify function for create/list: \`frontend/netlify/functions/links.js\`
- Netlify function for redirects: \`frontend/netlify/functions/redirect.js\`
- Local workspace scripts: \`package.json\`
- Netlify config: \`netlify.toml\`
- Render config: \`render.yaml\`

## How It Works

### Local dev path

Root scripts available:

${renderBulletList(model.rootScripts.map((script) => `- \`${script}\``))}

Main dev entry:

- \`npm run dev\`

This starts:

- Vite frontend on \`http://localhost:5173\`
- Express backend on \`http://localhost:4000\`

### Backend behavior

\`backend/src/index.js\` exposes:

${renderBulletList(model.backendRoutes.map((route) => `- \`${route}\``))}

If Supabase env vars are missing, backend still works in degraded mode:

- \`GET /api/links\` returns empty list
- \`POST /api/links\` returns synthetic created link without persistence
- \`GET /:shortCode\` returns \`404\`

### Netlify deploy path

Netlify does not use Express backend. It uses:

- \`frontend/netlify/functions/links.js\`
- \`frontend/netlify/functions/redirect.js\`

Redirects in \`netlify.toml\`:

${renderBulletList(model.netlifyRouteNotes.map((item) => `- \`${item}\``))}

## Environment Contracts

### Backend

${renderBulletList(model.backendEnvKeys.map((key) => `- \`${key}\``))}

### Frontend

${renderBulletList(model.frontendEnvKeys.map((key) => `- \`${key}\``))}

### Credential model

- Express backend uses \`SUPABASE_SERVICE_ROLE_KEY\`: ${String(model.backendUsesServiceRole)}
- Netlify functions use \`SUPABASE_ANON_KEY\`: ${String(model.netlifyUsesAnon)}

Important: if Netlify writes fail in production, inspect Supabase RLS/policies first.

## Product State

Implemented:

- Landing page UI
- Create short link flow
- Copy-to-clipboard action
- Redirect endpoint
- Click increment on redirect
- Local degraded mode without DB
- Netlify deployment path
- Render deployment path

Current gap:

- ${recentLinksStatus}

## Known Risks

- Express path and Netlify path do not use same Supabase credential model.
- Build artifacts under \`frontend/dist\` should usually be treated as generated.
- \`node_modules\` exists in workspace and should usually be ignored during analysis.

## Continuation Rules

When continuing work in new session:

1. Read \`HANDOFF.md\` first.
2. Read \`graphify-out/GRAPH_REPORT.md\`.
3. Ignore \`node_modules\` and \`frontend/dist\` unless task explicitly targets them.
4. If data flow changes, update both Express backend and Netlify function path unless user wants only one runtime changed.
5. Re-run \`npm run sync:memory\` after structural changes, or keep watcher running with \`npm run watch:memory\`.
`;
}

function renderHandoff(model) {
  const recentLinksGap = model.hasRecentLinksUi
    ? "Recent links UI appears present."
    : "README says recent links list exists, but current UI does not render one.";

  return `# Handoff

## Current Status

Project in working starter state for portfolio URL shortener:

- frontend and backend split into npm workspaces
- local development runs both together from repo root
- persistence depends on Supabase
- deployment split across Netlify and Render

This handoff auto-generated at \`${model.generatedAt}\`.

## Current Architecture Snapshot

- Root workspace orchestrates both apps with \`concurrently\`
- \`frontend/src/App.jsx\` contains current UI flow
- \`backend/src/index.js\` contains current API flow
- \`frontend/netlify/functions/*.js\` duplicate key backend behaviors for Netlify hosting

## What To Read First In New Session

1. \`CLAUDE.md\`
2. \`HANDOFF.md\`
3. \`graphify-out/GRAPH_REPORT.md\`
4. Relevant source file for task

## Fast Start Commands

\`\`\`powershell
npm install
npm run dev
\`\`\`

Frontend only:

\`\`\`powershell
npm run dev:frontend
\`\`\`

Backend only:

\`\`\`powershell
npm run dev:backend
\`\`\`

Build frontend:

\`\`\`powershell
npm run build
\`\`\`

Sync memory once:

\`\`\`powershell
npm run sync:memory
\`\`\`

Watch memory live:

\`\`\`powershell
npm run watch:memory
\`\`\`

## Environment Setup

- \`backend/.env.example\` -> \`backend/.env\`
- \`frontend/.env.example\` -> \`frontend/.env\`

Fill backend Supabase URL + service role key. Fill frontend API base URL + app link base URL.

## High-Value Next Tasks

1. Add missing recent-links UI using \`GET /api/links\`.
2. Unify backend and Netlify serverless data-access strategy.
3. Add tests for URL validation, short-code uniqueness, redirect/click behavior.
4. Add rate limiting and abuse protection.
5. Decide whether \`frontend/dist\` should remain committed.

## Important Mismatches

- ${recentLinksGap}
- Express uses \`SUPABASE_SERVICE_ROLE_KEY\`; Netlify functions use \`SUPABASE_ANON_KEY\`.
- Workspace git repo present: ${String(model.isGitRepo)}

## If Asked "What Next?"

Recommended order:

1. implement recent links in UI
2. harden persistence and deploy env consistency
3. add tests
4. add analytics/auth features
`;
}

function renderGraphReadme() {
  return `# graphify-out

This folder stores persistent project context for future AI sessions.

Files:

- \`GRAPH_REPORT.md\`: human-readable architecture and status summary
- \`graph.json\`: machine-readable lightweight knowledge graph

Keep fresh with:

- \`npm run sync:memory\`
- \`npm run watch:memory\`
`;
}

function renderGraphReport(model) {
  const recentLinksGap = model.hasRecentLinksUi
    ? "Recent links UI found."
    : "README claims recent links list, but current frontend does not render one.";

  return `# Graph Report

## Corpus Summary

- Scope analyzed: source, config, env examples, root scripts
- Ignored for reasoning: \`node_modules\`, generated frontend build output
- Project type: full-stack URL shortener starter
- Generated at: \`${model.generatedAt}\`

## Major Components

### Frontend App

- File: \`frontend/src/App.jsx\`
- Role: renders landing page, submits long URLs, shows created short link, copies it to clipboard
- Dependencies: \`VITE_API_BASE_URL\`, \`VITE_APP_LINK_BASE_URL\`, \`/api/links\`

### Express Backend

- File: \`backend/src/index.js\`
- Role: ${model.backendRoutes.join(", ")}
- Dependencies: \`SUPABASE_URL\`, \`SUPABASE_SERVICE_ROLE_KEY\`

### Netlify Function: Links

- File: \`frontend/netlify/functions/links.js\`
- Role: serverless alternative to \`GET /api/links\` and \`POST /api/links\`
- Dependencies: \`SUPABASE_URL\`, \`SUPABASE_ANON_KEY\`

### Netlify Function: Redirect

- File: \`frontend/netlify/functions/redirect.js\`
- Role: serverless alternative to Express redirect resolution
- Dependencies: \`SUPABASE_URL\`, \`SUPABASE_ANON_KEY\`

### Deployment Config

${renderBulletList(model.netlifyRouteNotes.map((item) => `- \`${item}\``))}
- \`render.yaml\` deploys backend workspace as Node web service

## Key Flows

### Create Link Flow

1. user enters long URL in frontend
2. frontend sends \`POST\` to \`/api/links\` or \`\${VITE_API_BASE_URL}/api/links\`
3. backend or Netlify function validates URL
4. server creates unique short code
5. record inserted into Supabase when configured
6. frontend shows \`\${VITE_APP_LINK_BASE_URL}/{short_code}\` or current origin fallback

### Redirect Flow

1. user opens \`/{shortCode}\`
2. Express backend or Netlify redirect function looks up code
3. click counter increments
4. user redirects to \`original_url\`

## Honest Audit Trail

### Extracted

- React app supports create-and-copy flow
- Express backend contains ${model.backendRoutes.join(", ")}
- Netlify deploy path duplicates core backend behavior
- Supabase is persistence layer
- root workspace script runs frontend and backend together

### Inferred

- intended production frontend host is Netlify
- intended production backend host is Render unless Netlify functions fully replace it
- repo positioned as portfolio project, not mature production service

### Ambiguous

- whether project should keep both Express and Netlify serverless paths long-term
- whether \`frontend/dist\` is intentionally checked in or only local build output

## Gaps

- ${recentLinksGap}
- no automated tests found in app source
- no rate limiting or abuse controls found
- no custom alias support found

## Recommended Next Moves

1. Decide canonical production architecture.
2. Add recent-links UI to match existing API and README.
3. Add tests around validation, uniqueness, redirects.
4. Standardize Supabase credential usage across runtimes.
`;
}

function renderGraph(model) {
  return {
    directed: true,
    multigraph: false,
    graph: {
      name: "url-shortener-project-graph",
      generated_by: "sync-project-memory.mjs",
      generated_at: model.currentDate
    },
    nodes: [
      node("root-workspace", "Root Workspace", "document", "package.json", "Runs frontend and backend workspaces together and defines top-level scripts."),
      node("frontend-app", "Frontend App", "code", "frontend/src/App.jsx", "Creates short links and displays copyable result."),
      node("backend-api", "Express Backend API", "code", "backend/src/index.js", "Health, list, create, and redirect endpoints with optional Supabase persistence."),
      node("netlify-links", "Netlify Links Function", "code", "frontend/netlify/functions/links.js", "Serverless list and create handler for Netlify deploys."),
      node("netlify-redirect", "Netlify Redirect Function", "code", "frontend/netlify/functions/redirect.js", "Serverless redirect and click increment handler."),
      node("supabase-links-table", "Supabase links table", "rationale", "README.md", "Stores original URL, short code, clicks, and creation timestamp."),
      node("netlify-config", "Netlify Config", "document", "netlify.toml", "Maps routes to serverless functions and SPA fallback."),
      node("render-config", "Render Config", "document", "render.yaml", "Deploys backend workspace as Node web service."),
      node("env-contract", "Environment Contract", "rationale", "backend/.env.example", "Defines runtime configuration for frontend, backend, and hosted deploys."),
      node("recent-links-gap", "Recent links UI gap", "rationale", "README.md", model.hasRecentLinksUi
        ? "Recent links UI appears present."
        : "README promises recent links list, but current frontend does not render one.")
    ],
    links: [
      edge("root-workspace", "frontend-app", "runs", "EXTRACTED", 1),
      edge("root-workspace", "backend-api", "runs", "EXTRACTED", 1),
      edge("frontend-app", "backend-api", "calls", "EXTRACTED", 1),
      edge("frontend-app", "netlify-links", "can_call_via_redirected_route", "INFERRED", 0.85),
      edge("backend-api", "supabase-links-table", "reads_and_writes", "EXTRACTED", 1),
      edge("netlify-links", "supabase-links-table", "reads_and_writes", "EXTRACTED", 1),
      edge("netlify-redirect", "supabase-links-table", "reads_and_updates", "EXTRACTED", 1),
      edge("netlify-config", "netlify-links", "routes_to", "EXTRACTED", 1),
      edge("netlify-config", "netlify-redirect", "routes_to", "EXTRACTED", 1),
      edge("render-config", "backend-api", "deploys", "EXTRACTED", 1),
      edge("env-contract", "frontend-app", "configures", "EXTRACTED", 1),
      edge("env-contract", "backend-api", "configures", "EXTRACTED", 1),
      edge("env-contract", "netlify-links", "configures", "INFERRED", 0.85),
      edge("env-contract", "netlify-redirect", "configures", "INFERRED", 0.85),
      edge("recent-links-gap", "frontend-app", "status_of", "EXTRACTED", 1),
      edge("recent-links-gap", "backend-api", "supported_by_existing_api", "INFERRED", 0.95)
    ]
  };
}

function node(id, label, fileType, sourceFile, summary) {
  return {
    id,
    label,
    file_type: fileType,
    source_file: sourceFile,
    summary
  };
}

function edge(source, target, relation, confidence, confidenceScore) {
  return {
    source,
    target,
    relation,
    confidence,
    confidence_score: confidenceScore
  };
}

function renderBulletList(items) {
  return items.join("\n");
}
