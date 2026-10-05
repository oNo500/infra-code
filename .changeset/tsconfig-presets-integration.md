---
'@infra-x/tsconfig': patch
---

Consume shared TypeScript atoms, merge controls, input types and Electron recipes from `@infra-x/tsconfig-presets`. Keep a fixed development tarball while the preset is unpublished, so standalone source checkouts can build. Bundle the preset into the generator so packed CLI and declaration consumers do not require it. Preserve existing generation and conflict behavior.

Refresh the snapshot to restrict array controls to lib/types/plugins and preserve scalar module none and paths.merge. Verify the bundled renderer output and a real TypeScript consumer.
