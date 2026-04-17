# infra-code Bun Migration + starters Absorption Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate `infra-code` from pnpm + Turborepo to Bun workspaces (preserving Node-compatible publishes for `@infra-x/*`), absorb `base-bun/templates/*` into `starters/*`, and retire the legacy eslint-config packages (whose final state is already archived under tag `archive/eslint-config-v0.1.13`).

**Architecture:** `packages/*` remain Node-compatible npm libraries developed with Bun workspaces at the root; `starters/*` are independent Bun projects (each with its own `bun.lock`) fetched by end users via `giget` — they are intentionally not part of the root workspace. Publishing continues via `changesets` + `npm publish` inside CI. The two old eslint-config packages are physically removed; their last working state lives on at git tag `archive/eslint-config-v0.1.13`.

**Tech Stack:** Bun 1.3+ (package manager, test runner, dev runtime), tsdown (package build target = Node 20+ ESM), changesets (version + publish), oxlint + oxfmt (via `@infra-x/code-quality` self-consumption), GitHub Actions (`oven-sh/setup-bun@v2`, `actions/setup-node@v4` in the publish job only).

**Reference spec:** `docs/superpowers/specs/2026-04-17-bun-migration-and-starters-absorption.md`

**Preconditions already met:**

- git tag `archive/eslint-config-v0.1.13` points to pre-migration `master` (commit `3f22e00`).
- `.gitignore` already ignores `.worktrees/`.
- Working branch: `feat/bun-migration`, inside worktree `/Users/xiu/code/infra-code/.worktrees/bun-migration`.
- base-bun's final commit is `affda03` on its `master` branch, repo path `/Users/xiu/code/base-bun`.

---

## File Structure After Migration

```
infra-code/
├── .changeset/
│   ├── config.json                        (unchanged)
│   └── YYYY-MM-DD-bun-migration.md        (new changeset, patch for both packages)
├── .github/
│   └── workflows/
│       ├── packages-ci.yml                (new, replaces ci.yml)
│       ├── starters-ci.yml                (new)
│       └── publish.yml                    (edited — pnpm → bun + npm publish via changesets)
├── docs/
│   └── superpowers/
│       ├── specs/2026-04-17-bun-migration-and-starters-absorption.md
│       └── plans/2026-04-17-bun-migration.md                               (this file)
├── packages/
│   ├── code-quality/                      (unchanged internals, prepublishOnly updated)
│   └── typescript-config/                 (unchanged)
├── starters/
│   ├── cli/                               (copied from base-bun/templates/cli)
│   ├── server/                            (copied from base-bun/templates/server)
│   └── web/                               (copied from base-bun/templates/web)
├── package.json                           (rewritten — Bun workspaces, new scripts)
├── bun.lock                               (generated)
├── oxlint.config.ts                       (unchanged)
├── oxfmt.config.ts                        (unchanged)
├── renovate.json                          (unchanged)
├── CONTRIBUTING.md                        (unchanged)
├── README.md                              (rewritten — indexes packages + starters)
└── LICENSE                                (unchanged)
```

**Files deleted during migration:**

```
pnpm-workspace.yaml
pnpm-lock.yaml
turbo.json
.github/workflows/ci.yml
packages/eslint-config/                (whole directory)
packages/eslint-config-test/           (whole directory)
packages/create-eslint-config/         (whole directory)
skills/setup-eslint-config/            (whole directory)
```

---

## Task 1 — Remove legacy eslint-config packages

**Why first:** These packages still declare `pnpm run build` scripts and pnpm-specific artifacts. Removing them before touching the root toolchain keeps later tasks simpler.

**Files:**

- Delete: `packages/eslint-config/`
- Delete: `packages/eslint-config-test/`
- Delete: `packages/create-eslint-config/`
- Delete: `skills/setup-eslint-config/`

- [ ] **Step 1: Verify the archive tag exists**

Run from worktree:

```bash
cd /Users/xiu/code/infra-code/.worktrees/bun-migration
git rev-parse archive/eslint-config-v0.1.13
```

Expected: prints `3f22e00f1d664fe23a2b106ec2bc5118afe4e1b7`. If not, STOP and escalate — the archive tag is the only recovery path.

- [ ] **Step 2: Remove directories with `git rm -r`**

```bash
cd /Users/xiu/code/infra-code/.worktrees/bun-migration
git rm -r packages/eslint-config packages/eslint-config-test packages/create-eslint-config
git rm -r skills/setup-eslint-config
```

- [ ] **Step 3: Verify nothing else references the removed packages**

```bash
cd /Users/xiu/code/infra-code/.worktrees/bun-migration
grep -rln "@infra-x/eslint-config\|@infra-x/create-eslint-config" . \
  --include='*.json' --include='*.ts' --include='*.mts' --include='*.md' \
  --include='*.yml' --include='*.yaml' \
  --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=docs || true
```

Expected: no matches. If matches appear (e.g. in the root package.json's `devDependencies` or in a README), remove them in-place with `git rm`-style edits. Do NOT touch `docs/superpowers/specs/*` or `docs/superpowers/plans/*` — those intentionally reference the old packages as archive history.

- [ ] **Step 4: Commit**

```bash
cd /Users/xiu/code/infra-code/.worktrees/bun-migration
git commit -m "chore: remove legacy eslint-config packages

The eslint-config, eslint-config-test, and create-eslint-config
packages were superseded by @infra-x/code-quality (v0.4.0) and are no
longer maintained. Their final state is preserved at git tag
archive/eslint-config-v0.1.13.

Downstream users can still install the old versions from npm
(e.g. 'npm install @infra-x/eslint-config@^0.1') in perpetuity."
```

- [ ] **Step 5: Verify**

```bash
cd /Users/xiu/code/infra-code/.worktrees/bun-migration
ls packages/            # expected: code-quality  typescript-config
ls skills/              # expected: empty or just a .gitkeep
```

---

## Task 2 — Rewrite root `package.json`

**Files:**

- Modify: `package.json`

- [ ] **Step 1: Replace the root `package.json` with the Bun-workspace form**

Write this exact content to `/Users/xiu/code/infra-code/.worktrees/bun-migration/package.json`:

```json
{
  "name": "infra-code",
  "private": true,
  "type": "module",
  "workspaces": ["packages/*"],
  "scripts": {
    "build": "bun --filter '@infra-x/*' run build",
    "typecheck": "bun --filter '@infra-x/*' run typecheck",
    "lint": "oxlint",
    "lint:fix": "oxlint --fix",
    "format": "oxfmt --write .",
    "format:check": "oxfmt --check .",
    "release": "bunx changeset publish"
  },
  "devDependencies": {
    "@changesets/cli": "^2.30.0",
    "@infra-x/code-quality": "^0.4.0",
    "oxfmt": "^0.45.0",
    "oxlint": "^1.59.0",
    "oxlint-tsgolint": "^0.21.0"
  }
}
```

Differences vs. current root `package.json`:

- `name: "boilerplate"` → `"infra-code"`
- add `"private": true`
- add `"type": "module"`
- add `"workspaces": ["packages/*"]`
- drop `dev` script (no consumers)
- `build` / `typecheck` switch from `turbo run` to `bun --filter '@infra-x/*' run`
- drop `turbo` devDependency
- bump `@infra-x/code-quality` from `^0.3.2` to `^0.4.0` (already the latest; the old pin was stale)
- bump `oxfmt` from `^0.44.0` to `^0.45.0` (aligns with starters)
- bump `oxlint-tsgolint` from `^0.20.0` to `^0.21.0` (peer of newer `@infra-x/code-quality`)
- drop `packageManager: "pnpm@10.33.0"`

- [ ] **Step 2: Commit**

```bash
cd /Users/xiu/code/infra-code/.worktrees/bun-migration
git add package.json
git commit -m "refactor: convert root package.json to Bun workspaces

- private: true + workspaces: ['packages/*']
- build/typecheck driven by 'bun --filter @infra-x/*'
- drop turbo dependency and packageManager pin
- bump @infra-x/code-quality 0.3.2 → 0.4.0 (was stale)
- bump oxfmt 0.44 → 0.45, oxlint-tsgolint 0.20 → 0.21"
```

---

## Task 3 — Delete pnpm and Turborepo artifacts

**Files:**

- Delete: `pnpm-workspace.yaml`
- Delete: `pnpm-lock.yaml`
- Delete: `turbo.json`

- [ ] **Step 1: `git rm` the three files**

```bash
cd /Users/xiu/code/infra-code/.worktrees/bun-migration
git rm pnpm-workspace.yaml pnpm-lock.yaml turbo.json
```

- [ ] **Step 2: Verify**

```bash
cd /Users/xiu/code/infra-code/.worktrees/bun-migration
ls pnpm-workspace.yaml pnpm-lock.yaml turbo.json 2>&1 | head
```

Expected: all three report `No such file or directory`.

- [ ] **Step 3: Commit**

```bash
cd /Users/xiu/code/infra-code/.worktrees/bun-migration
git commit -m "chore: remove pnpm and turbo artifacts

Replaced by Bun workspaces (see previous commit) and direct
'bun --filter' invocations."
```

---

## Task 4 — Update per-package `prepublishOnly` scripts

**Why:** Each package's `prepublishOnly` still says `pnpm run build`. Under Bun, `pnpm` is absent, so `npm publish` (which runs `prepublishOnly`) would fail.

**Files:**

- Modify: `packages/code-quality/package.json`
- Modify: `packages/typescript-config/package.json` (confirm — it has no scripts today, so no change needed; verify)

- [ ] **Step 1: Read `packages/code-quality/package.json`, find the line `"prepublishOnly": "pnpm run build"` in its scripts block, and replace with `"prepublishOnly": "bun run build"`.**

Do NOT touch any other line in the file.

- [ ] **Step 2: Confirm typescript-config has no scripts**

```bash
cd /Users/xiu/code/infra-code/.worktrees/bun-migration
cat packages/typescript-config/package.json | grep -A3 '"scripts"' || echo "no scripts block"
```

Expected: either `no scripts block` or an empty scripts object. No change required in that case.

- [ ] **Step 3: Commit**

```bash
cd /Users/xiu/code/infra-code/.worktrees/bun-migration
git add packages/code-quality/package.json
git commit -m "fix(code-quality): prepublishOnly uses bun, not pnpm"
```

---

## Task 5 — Bun install at the root, generate `bun.lock`

**Why:** All previous edits are paper-only. This step materialises `node_modules` and the lockfile.

- [ ] **Step 1: Install**

```bash
cd /Users/xiu/code/infra-code/.worktrees/bun-migration
bun install 2>&1 | tail -20
```

Expected: completes successfully, creates `bun.lock` and `node_modules/`, may warn about peer deps but must not error.

If `bun install` fails due to an unresolvable version constraint:

- If caused by one of the version bumps in Task 2 (e.g. `oxlint-tsgolint@^0.21.0` doesn't exist yet) — revert that specific bump to the closest working version, commit the revert, rerun.
- Any other failure: stop, report.

- [ ] **Step 2: Verify workspace wiring**

```bash
cd /Users/xiu/code/infra-code/.worktrees/bun-migration
ls node_modules/@infra-x/
```

Expected: `code-quality  typescript-config` — Bun has symlinked the local workspace packages. If the output shows real directories instead of symlinks (`ls -l node_modules/@infra-x/`), that means Bun resolved the published npm versions; rerun `bun install` and investigate.

- [ ] **Step 3: Commit the new lockfile**

```bash
cd /Users/xiu/code/infra-code/.worktrees/bun-migration
git add bun.lock
git commit -m "chore: generate bun.lock at repo root"
```

---

## Task 6 — Build + typecheck packages to validate the migration

**Why:** End-to-end smoke test that Bun can build the actual library code identically to pnpm + turbo did.

- [ ] **Step 1: Root build**

```bash
cd /Users/xiu/code/infra-code/.worktrees/bun-migration
bun run build 2>&1 | tail -20
```

Expected: both `@infra-x/typescript-config` (no build, succeeds trivially) and `@infra-x/code-quality` (tsdown-driven) complete. `packages/code-quality/dist/lint.mjs`, `dist/format.mjs`, and their `.d.mts` siblings must exist.

If build fails because `@infra-x/typescript-config` has no `build` script and `bun --filter` errors on missing scripts: either (a) accept the non-zero exit gracefully (Bun exits 0 if no package has the task at all, but errors if some do and others don't — depends on version), or (b) add a no-op `"build": "echo 'nothing to build'"` to `packages/typescript-config/package.json`. Prefer option (b) for uniformity; if applied, add a one-line commit to Task 4.

- [ ] **Step 2: Root typecheck**

```bash
cd /Users/xiu/code/infra-code/.worktrees/bun-migration
bun run typecheck 2>&1 | tail -10
```

Expected: both packages' `tsc --noEmit` exit 0.

- [ ] **Step 3: Root lint + format check**

```bash
cd /Users/xiu/code/infra-code/.worktrees/bun-migration
bun run lint 2>&1 | tail -5
bun run format:check 2>&1 | tail -5
```

Expected: lint 0 errors; format:check passes. If format:check reports drift, run `bun run format` and commit the reformatted files as a separate commit `style: reformat after Bun migration`.

- [ ] **Step 4: Node smoke — verify `@infra-x/code-quality` loads under raw Node**

```bash
cd /Users/xiu/code/infra-code/.worktrees/bun-migration/packages/code-quality
node --input-type=module -e "
  import('./dist/lint.mjs').then(m => console.log('lint exports:', Object.keys(m).length))
  import('./dist/format.mjs').then(m => console.log('format exports:', Object.keys(m).length))
"
```

Expected: two lines, each reporting a positive number of exports (e.g. `lint exports: 17`). If Node throws (e.g. `Cannot find package 'bun:…'`), the migration leaked Bun-only code; abort and investigate which file imports a `bun:*` module.

- [ ] **Step 5: Commit the formatted output if any**

No changes expected if format was already clean. Otherwise:

```bash
cd /Users/xiu/code/infra-code/.worktrees/bun-migration
git add -A
git commit -m "style: reformat after Bun migration" || echo "nothing to commit"
```

---

## Task 7 — Copy base-bun starters into `starters/`

**Why:** This is the repository absorption. Copy files verbatim from base-bun's final master into `starters/`. No git-subtree — history stays in base-bun.

**Source:** `/Users/xiu/code/base-bun` at commit `affda03` (current master HEAD).

**Files:**

- Create: `starters/cli/` — copy of `base-bun/templates/cli/` minus `node_modules/` and `dist/`
- Create: `starters/server/` — copy of `base-bun/templates/server/` minus `node_modules/` and `dist/`
- Create: `starters/web/` — copy of `base-bun/templates/web/` minus `node_modules/` and `dist/`

- [ ] **Step 1: Confirm base-bun source state**

```bash
cd /Users/xiu/code/base-bun
git log --oneline -1
git status -s
```

Expected: HEAD commit `affda03`, working tree clean.

If the working tree is dirty, stop and ask the human. If the HEAD is a different commit, verify it's a descendant of `affda03` via `git log --oneline affda03..HEAD`.

- [ ] **Step 2: Create the three starter directories via rsync (excludes `node_modules` and `dist`)**

```bash
cd /Users/xiu/code/infra-code/.worktrees/bun-migration
mkdir -p starters
for t in cli server web; do
  rsync -a \
    --exclude='node_modules' \
    --exclude='dist' \
    --exclude='*.sqlite' \
    --exclude='*.sqlite-shm' \
    --exclude='*.sqlite-wal' \
    /Users/xiu/code/base-bun/templates/$t/ \
    starters/$t/
done
ls starters/
ls starters/cli/
```

Expected: `starters/` contains `cli server web`; each subdirectory contains the template files (including `bun.lock`, `package.json`, `src/`, `tests/`, `.github/`, `.editorconfig`, etc.) but no `node_modules` or `dist`.

- [ ] **Step 3: Update each starter's README with the new giget URL**

Apply to `starters/cli/README.md`, `starters/server/README.md`, `starters/web/README.md`:

Find any occurrence of `gh:oNo500/base-bun/templates/` and replace with `gh:oNo500/infra-code/starters/`.

Quick sanity check:

```bash
cd /Users/xiu/code/infra-code/.worktrees/bun-migration
grep -rn "base-bun/templates" starters/ || echo "no stale refs"
```

Expected: `no stale refs`.

If any starter README still refers to `base-bun/` (e.g. as a project name), leave it — the only change is the giget path.

- [ ] **Step 4: Verify each starter still installs and tests pass**

```bash
cd /Users/xiu/code/infra-code/.worktrees/bun-migration/starters/cli
bun install 2>&1 | tail -5
bun run typecheck 2>&1 | tail -3
bun run lint 2>&1 | tail -3
bun test 2>&1 | tail -5
bun run build 2>&1 | tail -5

cd /Users/xiu/code/infra-code/.worktrees/bun-migration/starters/server
bun install 2>&1 | tail -5
bun run typecheck 2>&1 | tail -3
bun run lint 2>&1 | tail -3
DATABASE_URL=./test.sqlite bun test 2>&1 | tail -5
rm -f test.sqlite test.sqlite-shm test.sqlite-wal

cd /Users/xiu/code/infra-code/.worktrees/bun-migration/starters/web
bun install 2>&1 | tail -5
bun run typecheck 2>&1 | tail -3
bun run lint 2>&1 | tail -3
bun test 2>&1 | tail -5
rm -rf dist
bun run build 2>&1 | tail -5
rm -rf dist
```

Expected at every step: exit 0 and test counts matching base-bun's final state (cli 3 tests, server 4 tests, web 1 test).

If anything fails, the likely cause is `bun.lock` drift after copy — re-run `bun install` inside the failing starter and commit the refreshed lockfile as part of this task.

- [ ] **Step 5: Add an entry to the root `.gitignore` if necessary**

Currently `.gitignore` includes `.worktrees/` (added pre-migration). Starters bring their own `.gitignore` files, so no root entries needed. Verify with `cat .gitignore | tail -5`.

- [ ] **Step 6: Stage and commit**

Starters collectively produce many files — commit by starter for a cleaner log:

```bash
cd /Users/xiu/code/infra-code/.worktrees/bun-migration

git add starters/cli/
git commit -m "feat(starters/cli): absorb base-bun cli template

Source: oNo500/base-bun@affda03 (templates/cli)
Giget URL: gh:oNo500/infra-code/starters/cli

Stack: Bun dev + Node-compatible publish; citty + tsdown."

git add starters/server/
git commit -m "feat(starters/server): absorb base-bun server template

Source: oNo500/base-bun@affda03 (templates/server)
Giget URL: gh:oNo500/infra-code/starters/server

Stack: Bun-only; Hono + Drizzle + bun:sqlite."

git add starters/web/
git commit -m "feat(starters/web): absorb base-bun web template

Source: oNo500/base-bun@affda03 (templates/web)
Giget URL: gh:oNo500/infra-code/starters/web

Stack: Bun full-stack HTML entry; React 19 + Tailwind v4."
```

---

## Task 8 — Replace `.github/workflows/ci.yml` with `packages-ci.yml`

**Files:**

- Delete: `.github/workflows/ci.yml`
- Create: `.github/workflows/packages-ci.yml`

- [ ] **Step 1: Remove the old CI file**

```bash
cd /Users/xiu/code/infra-code/.worktrees/bun-migration
git rm .github/workflows/ci.yml
```

- [ ] **Step 2: Create `packages-ci.yml`**

Write to `/Users/xiu/code/infra-code/.worktrees/bun-migration/.github/workflows/packages-ci.yml`:

```yaml
name: Packages CI

on:
  pull_request:
    branches: [master]
  push:
    branches: [master, changeset-release/master]

jobs:
  packages:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest
      - run: bun install --frozen-lockfile
      - run: bun run build
      - run: bun run typecheck
      - run: bun run lint
      - run: bun run format:check
      - name: Node-smoke @infra-x/code-quality
        working-directory: packages/code-quality
        run: |
          node --input-type=module -e "
            const lint = await import('./dist/lint.mjs')
            const format = await import('./dist/format.mjs')
            if (Object.keys(lint).length === 0) { console.error('lint exports empty'); process.exit(1) }
            if (Object.keys(format).length === 0) { console.error('format exports empty'); process.exit(1) }
            console.log('lint:', Object.keys(lint).length, 'format:', Object.keys(format).length)
          "
```

- [ ] **Step 3: Sanity-parse the YAML**

```bash
cd /Users/xiu/code/infra-code/.worktrees/bun-migration
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/packages-ci.yml'))" && echo "YAML OK"
```

If python3 is unavailable, skip — GitHub will validate on push.

- [ ] **Step 4: Commit**

```bash
cd /Users/xiu/code/infra-code/.worktrees/bun-migration
git add .github/workflows/packages-ci.yml
git commit -m "ci: replace ci.yml with packages-ci.yml for Bun

Drives build/typecheck/lint/format:check via Bun workspaces and adds a
Node-smoke import check that guards against Bun-only API leaks into
published artifacts."
```

---

## Task 9 — Add `starters-ci.yml`

**Files:**

- Create: `.github/workflows/starters-ci.yml`

- [ ] **Step 1: Create the matrix workflow**

Write to `/Users/xiu/code/infra-code/.worktrees/bun-migration/.github/workflows/starters-ci.yml`:

```yaml
name: Starters CI

on:
  pull_request:
    branches: [master]
  push:
    branches: [master]

jobs:
  validate:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        template: [cli, server, web]
    env:
      DATABASE_URL: ./test.sqlite
    defaults:
      run:
        working-directory: starters/${{ matrix.template }}
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest
      - run: bun install --frozen-lockfile
      - run: bun run typecheck
      - run: bun run lint
      - run: bun run test
      - name: Build (if script exists)
        run: |
          if jq -e '.scripts.build' package.json >/dev/null; then
            bun run build
          else
            echo "no build script, skipping"
          fi
```

- [ ] **Step 2: Sanity-parse**

```bash
cd /Users/xiu/code/infra-code/.worktrees/bun-migration
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/starters-ci.yml'))" && echo "YAML OK"
```

- [ ] **Step 3: Commit**

```bash
cd /Users/xiu/code/infra-code/.worktrees/bun-migration
git add .github/workflows/starters-ci.yml
git commit -m "ci: add starters-ci.yml matrix validating every starter

Each starter is exercised as a fetched project: install → typecheck →
lint → test → build (if applicable). Mirrors the old
validate-templates.yml from the base-bun repo."
```

---

## Task 10 — Update `publish.yml` for Bun + changesets

**Files:**

- Modify: `.github/workflows/publish.yml`

- [ ] **Step 1: Rewrite the file**

Write this exact content to `/Users/xiu/code/infra-code/.worktrees/bun-migration/.github/workflows/publish.yml`:

```yaml
name: Publish

on:
  push:
    branches: [master]

permissions:
  id-token: write
  contents: write
  pull-requests: write

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          token: ${{ secrets.PAT_TOKEN }}
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
          registry-url: 'https://registry.npmjs.org'
      - run: bun install --frozen-lockfile
      - run: bun run build
      - uses: changesets/action@v1
        with:
          publish: bunx changeset publish --provenance --access public
        env:
          GITHUB_TOKEN: ${{ secrets.PAT_TOKEN }}
```

Key differences from the current file:

- `pnpm/action-setup@v5` → `oven-sh/setup-bun@v2`
- `cache: 'pnpm'` removed from `setup-node` (Bun manages its own cache); `setup-node` kept because `changesets/action` shells out to `npm publish` for the actual registry upload
- `pnpm install --frozen-lockfile` → `bun install --frozen-lockfile`
- `pnpm build` → `bun run build`
- `pnpm changeset publish` → `bunx changeset publish`
- No `NPM_TOKEN` env: the repo already uses npm OIDC trusted publishing (driven by `permissions: id-token: write`). Authentication is automatic.

- [ ] **Step 2: Sanity-parse**

```bash
cd /Users/xiu/code/infra-code/.worktrees/bun-migration
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/publish.yml'))" && echo "YAML OK"
```

- [ ] **Step 3: Commit**

```bash
cd /Users/xiu/code/infra-code/.worktrees/bun-migration
git add .github/workflows/publish.yml
git commit -m "ci: migrate publish workflow to Bun (npm publish via changesets)

Bun drives install + build; the actual npm registry upload continues
through changesets/action, which invokes 'npm publish --provenance'
under the hood. setup-node is kept for auth and registry-url."
```

---

## Task 11 — Write the changeset entry

**Files:**

- Create: `.changeset/2026-04-17-bun-migration.md`

- [ ] **Step 1: Create the changeset**

Write to `/Users/xiu/code/infra-code/.worktrees/bun-migration/.changeset/2026-04-17-bun-migration.md`:

```markdown
---
'@infra-x/code-quality': patch
'@infra-x/typescript-config': patch
---

Internal: migrate the repository from pnpm + Turborepo to Bun
workspaces. No runtime behaviour or API changes. Published artifacts
remain Node 20+ ESM.
```

- [ ] **Step 2: Commit**

```bash
cd /Users/xiu/code/infra-code/.worktrees/bun-migration
git add .changeset/2026-04-17-bun-migration.md
git commit -m "chore: changeset for Bun migration (patch)"
```

---

## Task 12 — Rewrite root `README.md`

**Files:**

- Modify: `README.md`

- [ ] **Step 1: Inspect the current README**

```bash
cd /Users/xiu/code/infra-code/.worktrees/bun-migration
wc -l README.md
head -60 README.md
```

Note the structure to preserve voice / formatting conventions.

- [ ] **Step 2: Rewrite**

Replace the entire content of `README.md` with:

````markdown
# infra-code

Personal infrastructure for TypeScript + Bun projects: shared lint/format/TS presets (published to npm under `@infra-x/*`) and Bun project starters.

## Packages

Published to npm.

| Package                                                      | Purpose                           |
| ------------------------------------------------------------ | --------------------------------- |
| [`@infra-x/code-quality`](./packages/code-quality)           | Composable oxlint + oxfmt presets |
| [`@infra-x/typescript-config`](./packages/typescript-config) | Shared `tsconfig.*.json` presets  |

```bash
npm install -D @infra-x/code-quality @infra-x/typescript-config
```

Both packages run on Node 20+ and Bun.

## Starters

Fetched via [`giget`](https://github.com/unjs/giget). Each starter is a self-contained Bun project.

| Starter                       | For                   | Stack                                   |
| ----------------------------- | --------------------- | --------------------------------------- |
| [`cli`](./starters/cli)       | Publishable CLI tools | Bun dev · Node publish · citty · tsdown |
| [`server`](./starters/server) | HTTP services on Bun  | Hono · zod · Drizzle · `bun:sqlite`     |
| [`web`](./starters/web)       | Quick prototype UIs   | Bun full-stack · React 19 · Tailwind v4 |

```bash
bunx giget@latest gh:oNo500/infra-code/starters/cli my-cli
bunx giget@latest gh:oNo500/infra-code/starters/server my-api
bunx giget@latest gh:oNo500/infra-code/starters/web my-ui
```

See each starter's own README for specific scripts and constraints.

## Development

This repository is Bun-driven end to end.

```bash
bun install                           # install packages/* deps at the root
bun run build                         # bun --filter '@infra-x/*' run build
bun run typecheck
bun run lint
bun run format
```

- **Packages** live under `packages/*` and are part of the root Bun workspace. They must stay Node-compatible — source code imports `node:*` only; `tsconfig.json` uses `"types": ["node"]` to block `Bun.*` usage at compile time.
- **Starters** live under `starters/*` and are **not** part of the workspace. Each has its own `bun.lock`. Run `cd starters/<name> && bun install` to work on one.
- **Releases** use [changesets](https://github.com/changesets/changesets):
  ```bash
  bunx changeset          # create a changeset
  bunx changeset version  # bump versions + update changelogs
  # master push → publish.yml publishes to npm
  ```

## History

- The `@infra-x/eslint-config`, `@infra-x/eslint-config-test`, and `@infra-x/create-eslint-config` packages were retired in favour of `@infra-x/code-quality`. Their last working source is archived at git tag `archive/eslint-config-v0.1.13`; published versions remain available on npm.
- The starters were previously hosted at [`oNo500/base-bun`](https://github.com/oNo500/base-bun) under `templates/*`. That repository was absorbed into this one on 2026-04-17.

## License

MIT — see [`LICENSE`](./LICENSE).
````

- [ ] **Step 3: Format-check the README via oxfmt**

```bash
cd /Users/xiu/code/infra-code/.worktrees/bun-migration
bun run format README.md
git diff --stat README.md
```

If oxfmt reformats anything, accept the changes — they represent the repo's formatting standard.

- [ ] **Step 4: Commit**

```bash
cd /Users/xiu/code/infra-code/.worktrees/bun-migration
git add README.md
git commit -m "docs: rewrite root README to index packages + starters"
```

---

## Task 13 — Full-tree validation before merge

**Why:** Everything has been verified in pieces. This task runs the complete test matrix one more time, cleanly, on a post-install tree.

- [ ] **Step 1: Clean install at root**

```bash
cd /Users/xiu/code/infra-code/.worktrees/bun-migration
rm -rf node_modules
bun install 2>&1 | tail -5
```

- [ ] **Step 2: Root build/typecheck/lint/format**

```bash
cd /Users/xiu/code/infra-code/.worktrees/bun-migration
bun run build 2>&1 | tail -5
bun run typecheck 2>&1 | tail -5
bun run lint 2>&1 | tail -5
bun run format:check 2>&1 | tail -5
```

All four must exit 0.

- [ ] **Step 3: Node smoke**

```bash
cd /Users/xiu/code/infra-code/.worktrees/bun-migration/packages/code-quality
node --input-type=module -e "
  const lint = await import('./dist/lint.mjs')
  const format = await import('./dist/format.mjs')
  console.log('lint:', Object.keys(lint).length, 'format:', Object.keys(format).length)
"
```

Expected: both counts > 0.

- [ ] **Step 4: All three starters**

```bash
cd /Users/xiu/code/infra-code/.worktrees/bun-migration
for t in cli server web; do
  echo "=== $t ==="
  (
    cd starters/$t
    rm -rf node_modules
    DATABASE_URL=./test.sqlite bun install --frozen-lockfile 2>&1 | tail -2
    DATABASE_URL=./test.sqlite bun run typecheck 2>&1 | tail -2
    bun run lint 2>&1 | tail -2
    DATABASE_URL=./test.sqlite bun test 2>&1 | tail -2
    if jq -e '.scripts.build' package.json >/dev/null; then
      bun run build 2>&1 | tail -2
    fi
    rm -f test.sqlite test.sqlite-shm test.sqlite-wal
    rm -rf dist
  )
done
```

Expected: every starter prints clean output; tests: cli 3 pass, server 4 pass, web 1 pass; cli + web build successfully.

- [ ] **Step 5: Git state check**

```bash
cd /Users/xiu/code/infra-code/.worktrees/bun-migration
git status -s       # expected: clean
git log --oneline | head -15
```

Expected: clean tree and a linear set of commits from this migration. If any file is dirty or untracked, resolve before merging.

- [ ] **Step 6: Confirm the archive tag still resolves**

```bash
cd /Users/xiu/code/infra-code/.worktrees/bun-migration
git show --stat archive/eslint-config-v0.1.13 -- packages/eslint-config 2>&1 | head -5
```

Expected: shows the final state of `packages/eslint-config` files. If it doesn't, the tag is broken and the old state is unrecoverable — STOP and escalate.

---

## Task 14 — Merge and clean up

**Files changed:** none (git-only operations on the main working copy).

- [ ] **Step 1: Fast-forward merge into master**

```bash
cd /Users/xiu/code/infra-code
git checkout master
git merge --ff-only feat/bun-migration 2>&1 | tail -10
```

Expected: fast-forward, no conflicts.

If not fast-forward (someone committed to master in the meantime): stop, rebase the feature branch, retry.

- [ ] **Step 2: Remove the worktree and branch**

```bash
cd /Users/xiu/code/infra-code
git worktree remove .worktrees/bun-migration
git branch -d feat/bun-migration
git worktree list
```

Expected: only one worktree remains (the main one).

- [ ] **Step 3: Local final verification**

```bash
cd /Users/xiu/code/infra-code
git log --oneline | head -15
bun install 2>&1 | tail -3
bun run build && bun run typecheck && bun run lint && bun run format:check
```

All green.

- [ ] **Step 4: Manual (human) follow-ups — NOT automated**

These steps require the human (not an agent) because they touch GitHub the web service:

1. `git push origin master` (optionally `git push --tags` to publish `archive/eslint-config-v0.1.13`)
2. Verify `packages-ci.yml`, `starters-ci.yml`, and `publish.yml` run green on the first push
3. The `publish.yml` workflow will attempt to publish the patch versions declared in Task 11's changeset. If this is undesired on first push, consume the changeset locally first: `bunx changeset version && git commit -am "chore: release" && git push`.
4. In the [base-bun repo](https://github.com/oNo500/base-bun):
   - Prepend a notice to `README.md`:
     ```markdown
     > **This repository has been absorbed into [oNo500/infra-code](https://github.com/oNo500/infra-code/tree/master/starters). Archived for history; new starters live there.**
     ```
   - Commit and push.
   - In GitHub web UI → Settings → Archive this repository.

An agent cannot do these — skip them if working in a subagent context, report in the final summary.

---

## Task 15 — Final holistic code review

Dispatch a reviewer subagent with the full diff summary against master, the spec, and this plan. Scope:

- Spec coverage
- Consistency (packages vs starters patterns)
- YAML validity of all three workflows
- Whether Node-smoke in packages-ci.yml actually catches Bun-only leaks
- Whether the changeset text is clear
- Whether the README rewrite matches the spec's §10 description

Human controller accepts or rejects the reviewer's findings, cycles fixes if needed.

---

## Done criteria (all 14 Task checkbox sections ticked)

1. Legacy eslint-config packages gone; archive tag verifies.
2. Root `package.json` is Bun-shaped; `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `turbo.json` deleted.
3. `bun install` succeeds; `bun.lock` committed.
4. `bun run build && bun run typecheck && bun run lint && bun run format:check` all green at root.
5. Node-smoke import of `@infra-x/code-quality` succeeds.
6. `starters/cli/`, `starters/server/`, `starters/web/` each pass typecheck/lint/test (and build where applicable).
7. `packages-ci.yml`, `starters-ci.yml`, `publish.yml` exist and parse as YAML.
8. Changeset entry for both packages (patch) committed.
9. Root README rewritten to index packages + starters with updated giget URLs.
10. `feat/bun-migration` fast-forward merged to master; branch + worktree removed.
11. Manual follow-ups (Task 14.4) noted in final summary for the human to execute.
