/** @type {import('dependency-cruiser').IConfiguration} */
export default {
  forbidden: [
    {
      name: 'no-cross-feature',
      severity: 'error',
      comment:
        'Features must be self-contained. Promote shared code to src/lib, src/components or src/hooks.',
      from: { path: '^src/features/([^/]+)/' },
      to: {
        path: '^src/features/([^/]+)/',
        pathNot: '^src/features/$1/',
      },
    },
    {
      name: 'no-feature-to-route',
      severity: 'error',
      comment: 'features/ must not depend on app/ routes — direction is app -> features.',
      from: { path: '^src/features/' },
      to: { path: '^src/app/' },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsConfig: { fileName: 'tsconfig.json' },
  },
}
