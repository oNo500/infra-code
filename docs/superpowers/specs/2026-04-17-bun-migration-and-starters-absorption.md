# infra-code Bun Migration + base-bun Absorption

Status: Draft (pending approval)
Date: 2026-04-17
Branch: `feat/bun-migration`
Archive tag (already created): `archive/eslint-config-v0.1.13`

## 1. Goal

Consolidate the author's personal infrastructure into a single repository. Concretely:

1. Migrate `infra-code` from pnpm + Turborepo to Bun workspaces, while keeping the published `@infra-x/*` npm packages fully Node-compatible for external consumers.
2. Absorb the `base-bun` repository into `infra-code/starters/*`, archive the `base-bun` GitHub repository.
3. Retire the unmaintained `eslint-config*` packages from the monorepo (their v0.1.x history is preserved via the `archive/eslint-config-v0.1.13` tag and via npm).

The outcome: one repo, one toolchain (Bun), two clearly separated product surfaces — **packages** (library source, published to npm, consumed by anyone) and **starters** (project skeletons fetched by `giget`, consumed only by the author).

## 2. Non-goals

- No breaking API changes to `@infra-x/code-quality` or `@infra-x/typescript-config` in this migration. Preset behaviour stays identical. The version bump that accompanies the infra change will be `patch` (maintenance), not `minor` or `major`.
- No migration of `base-bun` starters' stack — they stay on Bun, React 19, Hono, etc. Only their _location_ changes.
- No new starter added in this migration.
- No attempt to unify `packages/*` and `starters/*` under a single Bun workspace graph. The two surfaces stay independent.

## 3. End-state Repository Layout

```
infra-code/
├── .github/
│   └── workflows/
│       ├── packages-ci.yml       # packages/* typecheck/lint/test/build
│       ├── starters-ci.yml       # matrix: starters/{cli,server,web}
│       └── publish.yml           # changesets release (packages only)
├── .changeset/
├── docs/
│   └── superpowers/              # specs + plans (including this file)
├── packages/
│   ├── code-quality/             # unchanged behaviour, Bun-developed
│   └── typescript-config/        # unchanged
├── starters/
│   ├── cli/                      # ex base-bun/templates/cli
│   ├── server/                   # ex base-bun/templates/server
│   └── web/                      # ex base-bun/templates/web
├── package.json                  # root — Bun workspaces over packages/* only
├── bun.lock                      # replaces pnpm-lock.yaml
├── oxlint.config.ts              # unchanged
├── oxfmt.config.ts               # unchanged
├── CONTRIBUTING.md
├── README.md                     # rewritten to index packages + starters
├── renovate.json
└── LICENSE
```

**Removed:** `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `turbo.json`, `.turbo/` (implicit), the three old packages (`eslint-config/`, `eslint-config-test/`, `create-eslint-config/`), and `skills/setup-eslint-config/`.

## 4. Surfaces and Their Contracts

### 4.1 `packages/*` — published npm libraries

**Identity:** `@infra-x/code-quality`, `@infra-x/typescript-config` (and any future `@infra-x/*` package).

**Runtime contract (immutable):**

- Built output runs on **Node 20+ and Bun** — no `Bun.*` APIs, no `bun:*` protocol imports in source.
- ESM only, types shipped alongside JS (`.d.mts`).
- Consumed by the outside world via `npm install @infra-x/<pkg>` — we do not assume downstream users have Bun.

**Development contract (new):**

- Developed with Bun: `bun install`, `bun run build`, `bun test`, `bun publish`.
- `package.json` of each package still declares `"prepublishOnly": "bun run build"` (was `pnpm run build`).
- Versioning continues via `changesets` (`bunx changeset add` / `bunx changeset version` / `bunx changeset publish`).

**Guards against Bun-leaks into published code:**

- Each package `tsconfig.json` uses `"types": ["node"]` only (no `"bun"`). Using `Bun.*` triggers a TS error during `bun run build`.
- CI adds one Node-run smoke step per package: after `bun run build`, execute `node --input-type=module -e "import('@infra-x/<pkg>/<subpath>').then(m => console.log(Object.keys(m)))"` against the built artifacts. If a package ever accidentally emits Bun-only output, this fails.

### 4.2 `starters/*` — giget-fetched skeletons

**Identity:** `base-bun-cli`, `base-bun-server`, `base-bun-web` (package names unchanged from current base-bun templates).

**Contract:**

- Bun-first: each starter has its own `bun.lock` and is fetched by users via `bunx giget@latest gh:oNo500/infra-code/starters/<name> <dest>` (path updated from `oNo500/base-bun/templates/*`).
- **Not** part of the root Bun workspace — fetching with giget must produce a self-contained project with no lingering `workspace:*` references.
- Each starter continues to consume `@infra-x/code-quality` and `@infra-x/typescript-config` via **npm-resolved versions**, not workspace links. This preserves the "fetch and run" experience and forces the starters to dogfood the actually-published version of the presets.

**Giget URL change:** The documented fetch URLs change from `gh:oNo500/base-bun/templates/<name>` to `gh:oNo500/infra-code/starters/<name>`. The old URLs will 404 once `base-bun` is archived; this is acceptable because the only consumer is the author.

### 4.3 Interaction

- `packages/*` never depend on anything in `starters/*`.
- `starters/*` depend on `@infra-x/*` as normal npm packages (not workspace).
- When the author wants to dogfood a preset change against a starter, the workflow is:
  1. Change a package under `packages/code-quality/`.
  2. In that package: `bun run build`.
  3. In a starter: `bun install` and, temporarily, either `bun link` the package or publish a dev version and bump the starter's dependency.
     This is slightly more friction than a single Bun workspace, but avoids polluting published starters with `workspace:*` placeholders.

## 5. Package-Manager Migration Details

### 5.1 Root `package.json`

Before:

```json
{
  "name": "boilerplate",
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "oxlint",
    "lint:fix": "oxlint --fix",
    "format": "oxfmt --write .",
    "format:check": "oxfmt --check .",
    "typecheck": "turbo run typecheck",
    "release": "changeset publish"
  },
  "packageManager": "pnpm@10.33.0"
}
```

After:

```json
{
  "name": "infra-code",
  "private": true,
  "workspaces": ["packages/*"],
  "scripts": {
    "build": "bun --filter '@infra-x/*' run build",
    "typecheck": "bun --filter '@infra-x/*' run typecheck",
    "lint": "oxlint",
    "lint:fix": "oxlint --fix",
    "format": "oxfmt --write .",
    "format:check": "oxfmt --check .",
    "release": "bunx changeset publish"
  }
}
```

Notes:

- `name` renamed from `boilerplate` to `infra-code` (clarity; name is private, no publish impact).
- `"private": true` declared so `bun publish` never targets the root.
- `"workspaces"` intentionally lists only `packages/*`. Starters are deliberately excluded.
- No `dev` script at the root — it had no consumers; individual packages' `tsdown --watch` is invoked directly when needed.
- `packageManager` field removed (not honored by Bun; can be re-added as `"packageManager": "bun@1.x"` if needed for tooling, but not required).

### 5.2 Per-package changes

For each of `packages/code-quality/package.json` and `packages/typescript-config/package.json`:

- Replace `"prepublishOnly": "pnpm run build"` with `"prepublishOnly": "bun run build"`.
- No other script changes.

### 5.3 Files removed at the root

- `pnpm-workspace.yaml` — replaced by root `workspaces` field.
- `pnpm-lock.yaml` — replaced by `bun.lock` generated by `bun install`.
- `turbo.json` — responsibilities folded into `bun --filter '@infra-x/*' run <task>`.
- `.turbo/` (if any cached) — already in `.gitignore`.

### 5.4 Bun workspace semantics vs Turbo semantics

Turbo's one meaningful piece of wiring was:

```json
{ "tasks": { "typecheck": { "dependsOn": ["^build"] } } }
```

i.e. build dependencies before typechecking. With Bun workspaces the equivalent is to run the tasks sequentially at the root:

```
bun --filter '@infra-x/*' run build && bun --filter '@infra-x/*' run typecheck
```

`bun --filter` respects topological order by default when packages depend on each other via `workspace:*`, so `code-quality` (which declares `@infra-x/typescript-config: workspace:*`) will be handled after `typescript-config`. We lose Turbo's cross-run caching, which is acceptable given the tiny build matrix (2 packages).

## 6. Guarding Node Compatibility of Packages

### 6.1 TypeScript-level guard

Each published package's `tsconfig.json` pins `"types": ["node"]` (and _not_ `"bun"`). Importing `Bun.file`, `Bun.$`, `Bun.serve`, etc. surfaces as a TS error at build time. `bun:sqlite` / `bun:test` likewise fail to resolve since the Bun-specific modules aren't in the declared types.

### 6.2 Runtime-level guard

The `packages-ci.yml` workflow adds a Node-smoke step after `bun run build` for each package. Pseudo:

```yaml
- name: Verify @infra-x/code-quality loads under Node
  working-directory: packages/code-quality
  run: |
    node --input-type=module -e "
      const m = await import('./dist/lint.mjs')
      console.log(Object.keys(m).length, 'lint exports')
      const f = await import('./dist/format.mjs')
      console.log(Object.keys(f).length, 'format exports')
    "
```

If any Bun-specific API leaks through, Node throws on import and CI fails. This catches the case where both the source and the TS types somehow accept a Bun API (e.g. via `globalThis` cast).

### 6.3 No separate test suite for Node

We do **not** add a parallel Node test job; `bun test` remains the single test runner. The smoke above is sufficient for `@infra-x/*` packages because their behaviour is preset construction (pure data, no IO that could behave differently on Node vs Bun).

## 7. Starters Absorption Details

### 7.1 Source

The three starters are taken from the final `master` of `oNo500/base-bun` (commit `affda03`, which contains the `@infra-x/code-quality` migration).

### 7.2 Transport

Use `git mv` from within the `base-bun` repo to shape the directory into `starters/<name>/`, then either:

- **Option A — cp + commit** (recommended for simplicity): copy the files from base-bun's working tree into `infra-code/starters/`, create the commit directly.
- **Option B — git subtree add**: preserves base-bun's commit history in infra-code's log. Feasible, but adds 22 commits from another repo into infra-code's history, which may obscure the linear changeset log.

Decision: **Option A**. Base-bun repo stays archived and still browsable; preserving commits in infra-code's log is not worth the noise. The README entry in `starters/` will cite base-bun's final commit SHA for provenance.

### 7.3 File touches during absorption

- Update each starter's `README.md`: replace `bunx giget@latest gh:oNo500/base-bun/templates/<name>` with `bunx giget@latest gh:oNo500/infra-code/starters/<name>`.
- Update root `README.md` of infra-code: add a "Starters" section alongside existing "Packages" description; mention the new giget URLs.
- Keep each starter's `bun.lock`, `.github/workflows/ci.yml`, `.oxfmtrc.json`-era leftovers (already removed during base-bun's own code-quality migration), etc. — all unchanged.

### 7.4 `pnpm-workspace.yaml` (now gone) vs Bun `workspaces`

Because the root `package.json` declares `workspaces: ["packages/*"]`, starters are naturally excluded. No further exclusion pattern is needed. `bun install` at the root installs dependencies for the two packages only; starters are installed independently by running `bun install` inside each starter dir.

## 8. Retiring the Old eslint-config Packages

### 8.1 What gets deleted

- `packages/eslint-config/`
- `packages/eslint-config-test/`
- `packages/create-eslint-config/`
- `skills/setup-eslint-config/`

### 8.2 What stays

- The `archive/eslint-config-v0.1.13` git tag (already created at commit `3f22e00`) preserves the last working state of all three packages.
- The npm registry retains all published versions (`@infra-x/eslint-config@0.1.13` etc.) in perpetuity; downstream users who need the old preset can `npm install @infra-x/eslint-config@^0.1` forever.
- No package is formally `deprecated` on npm in this migration. If desired, the author can run `npm deprecate @infra-x/eslint-config "moved to @infra-x/code-quality"` as a follow-up — out of scope here.

### 8.3 Changesets for the deletions

Creating a changeset for package deletion is not required (changesets only versions existing packages). A single entry for `@infra-x/code-quality` and `@infra-x/typescript-config` of type `patch` accompanies this migration, describing "internal: repository migrated from pnpm to Bun, no runtime behaviour change." The deleted packages are simply absent from future releases.

## 9. CI / Workflow Changes

### 9.1 `packages-ci.yml` (new; replaces current `ci.yml`)

Triggers: PR + push to master.

Steps:

1. `actions/checkout@v4`
2. `oven-sh/setup-bun@v2`
3. `bun install --frozen-lockfile`
4. `bun --filter '@infra-x/*' run build`
5. `bun --filter '@infra-x/*' run typecheck`
6. `bun run lint`
7. `bun run format:check`
8. Node-smoke import verification for each package (§6.2)

### 9.2 `starters-ci.yml` (new)

Matrix over `[cli, server, web]`. For each:

1. `actions/checkout@v4`
2. `oven-sh/setup-bun@v2`
3. `cd starters/$TEMPLATE && bun install --frozen-lockfile`
4. `bun run typecheck`
5. `bun run lint`
6. `bun run test` (server sets `DATABASE_URL=./test.sqlite`)
7. `bun run build` (only where the script exists)

Equivalent in spirit to the existing `base-bun/.github/workflows/validate-templates.yml`, renamed and located in the absorbing repo.

### 9.3 `publish.yml` updates

Current:

```yaml
- uses: pnpm/action-setup@v5
- uses: actions/setup-node@v4
- run: pnpm install --frozen-lockfile
- run: pnpm build
- uses: changesets/action@v1
  with:
    publish: pnpm changeset publish --provenance --access public
```

After:

```yaml
- uses: oven-sh/setup-bun@v2
- uses: actions/setup-node@v4 # still needed — npm publish runs under Node
  with:
    registry-url: 'https://registry.npmjs.org'
- run: bun install --frozen-lockfile
- run: bun --filter '@infra-x/*' run build
- uses: changesets/action@v1
  with:
    publish: bunx changeset publish --provenance --access public
```

Notes:

- Node is still set up because `changesets/action@v1` invokes `npm publish` internally, which needs the Node + `registry-url` setup for auth. We don't use `bun publish` here; the changesets ecosystem around npm is more mature.
- Provenance (`--provenance`) continues to work because the underlying publish is still `npm publish`.

### 9.4 Branch trigger scope

`packages-ci.yml` and `publish.yml` run on changes anywhere (simple rule; the packages build/tests are fast). `starters-ci.yml` runs on changes anywhere too — the matrix builds are independent and cheap. Path-filtering is an optional future optimisation, explicitly deferred.

## 10. README Rewrite

The root `README.md` is rewritten to explicitly document two product surfaces:

1. **Packages** — a short table of `@infra-x/code-quality` and `@infra-x/typescript-config` with npm badges and links to each package's own README.
2. **Starters** — the table currently at `base-bun/README.md` (cli / server / web with their stacks and giget commands), paths updated to `gh:oNo500/infra-code/starters/<name>`.
3. **Development** — one short section explaining that the repo is Bun-driven (`bun install`, `bun --filter`, `bunx changeset`), that packages must stay Node-compatible, and that starters are not part of the Bun workspace.

## 11. Downstream Impact

### 11.1 External consumers of `@infra-x/*`

- `npm install @infra-x/code-quality` and `npm install @infra-x/typescript-config` continue to work with exactly the same runtime characteristics.
- New `patch` versions (e.g. `code-quality@0.4.1`, `typescript-config@0.1.7`) published as part of the migration — no API surface changes.
- Installed tarballs shrink slightly because `pnpm-lock.yaml` and Turbo files are no longer packed (they never were — `files` field already restricted to `dist` — so actually the tarball is identical).

### 11.2 The author

- Currently fetches starters via `bunx giget@latest gh:oNo500/base-bun/templates/cli my-cli`. After migration: `bunx giget@latest gh:oNo500/infra-code/starters/cli my-cli`. Muscle memory change; no other behaviour change.

### 11.3 `base-bun` repository on GitHub

- After this migration lands on `infra-code`'s master and the infra-code CI is green, the `base-bun` GitHub repo is **archived** via GitHub's "Archive this repository" setting.
- A notice is added to `base-bun`'s `README.md` header prior to archive: `> **This repository has been absorbed into [oNo500/infra-code](https://github.com/oNo500/infra-code/tree/master/starters). Archived for history.**`
- The archive is **not** deleted — old giget URLs could theoretically still fetch from the archived repo, even though we announce the new URLs. If GitHub one day deprecates access to archived repos' archives, consumers still have the new URL.

## 12. Risks and Mitigations

| Risk                                                                                                                                                       | Mitigation                                                                                                                                                                                                                                                              |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bun publish` or Bun workspace doesn't handle `@infra-x/code-quality`'s `workspace:*` dependency on `@infra-x/typescript-config` correctly at publish time | Keep `npm publish` via changesets (§9.3). Only `install` and `build` run through Bun.                                                                                                                                                                                   |
| TypeScript 6.x / tsgolint alpha incompatibility with Bun's TS pipeline                                                                                     | Pinned versions come from infra-code's existing working state. `bun install` respects the same package.json constraints that pnpm did. If the Bun-driven `bun run build` behaves differently from `pnpm run build`, the migration is reverted locally and re-evaluated. |
| Accidental Bun API leak into a published package                                                                                                           | §6.1 + §6.2 guards.                                                                                                                                                                                                                                                     |
| Starter `bun.lock` files go stale during migration because the `@infra-x/*` dep resolves differently                                                       | After each starter absorption, run `bun install` inside it and commit the refreshed `bun.lock`.                                                                                                                                                                         |
| base-bun's 24 commits of history are lost                                                                                                                  | Accepted (§7.2 Option A). Archive tag + archived GitHub repo cover historical access.                                                                                                                                                                                   |
| Readers who find the old giget URL in docs they authored earlier 404                                                                                       | Accepted — single-user consumer, announced change.                                                                                                                                                                                                                      |

## 13. Success Criteria

All of the following must hold at the end of the migration:

1. `cd infra-code && bun install` succeeds at the root; a `bun.lock` exists; no `pnpm-lock.yaml` or `turbo.json` remains.
2. `bun --filter '@infra-x/*' run build && bun --filter '@infra-x/*' run typecheck` succeed.
3. For each starter, `cd starters/<name> && bun install && bun run typecheck && bun run lint && bun run test` succeed (web + cli additionally pass `bun run build`).
4. Node-smoke import succeeds for each package's built artifacts.
5. `oxlint` + `oxfmt --check .` pass at the repo root.
6. `packages-ci.yml`, `starters-ci.yml`, and `publish.yml` workflow files parse as valid YAML (local sanity check).
7. Root `README.md` links to `starters/*` with updated giget URLs; table lists both packages.
8. A changeset entry for `@infra-x/code-quality` and `@infra-x/typescript-config` of type `patch` is present and describes the migration.
9. Packages `packages/eslint-config*` and `packages/create-eslint-config/` are absent; `archive/eslint-config-v0.1.13` git tag still resolves to their final state.
10. The `base-bun` README has a redirect notice added at top and the repo is archived on GitHub (this step is manual, happens after infra-code master is green).

## 14. Explicit Out-of-Scope

- Adding a new starter or new package
- Deprecating old npm packages via `npm deprecate`
- Migrating `infra-code` to Bun workspace with starters included (§7.4 — intentionally excluded)
- Bumping `@infra-x/*` minor or major
- Adding path filters or caching to CI
- Writing a migration guide for other people to move from pnpm/Turbo to Bun (the migration is for the author only)

## 15. Open Items to Resolve During Planning (not design)

These are details whose exact form is decided while writing the implementation plan, not here:

- The exact ordering of the 5–8 logical steps in the plan (package.json rewrite, removal of pnpm/turbo files, `bun install` rebaseline, per-package script updates, starters copy, CI update, README rewrite, changeset entry).
- The exact Node-smoke import command per package (depends on the real export surface of each built artifact).
- The exact text of the `base-bun` archive notice.
- Whether to bump `@infra-x/code-quality` / `typescript-config` in the same changeset or two separate ones.
