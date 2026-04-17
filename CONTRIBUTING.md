# Contributing

## Development

```bash
git clone https://github.com/oNo500/infra-code.git
cd infra-code
bun install
bun run build
```

## Workflow

All changes go through a feature branch and PR:

```bash
git checkout -b feat/your-feature
# make changes
git push origin feat/your-feature
# open PR → CI must pass → merge to master
```

## Releasing

This project uses [Changesets](https://github.com/changesets/changesets) for version management.

When your change warrants a version bump, run:

```bash
bunx changeset
```

Select the affected packages, choose the change type (`patch` / `minor` / `major`), and write a short description. Commit the generated `.changeset/*.md` file along with your code changes.

After merging to `master`:

1. Changesets action automatically opens a **"Version Packages"** PR
2. Review the version bumps and changelog
3. Merge the PR → packages are published to npm and git tags are created

> [!IMPORTANT]
> Do **not** run `bunx changeset version` locally. Version bumps and publishing are handled by the CI PR flow described above.
