import tailwind from 'bun-plugin-tailwind'

const result = await Bun.build({
  entrypoints: ['./index.html'],
  outdir: './dist',
  target: 'browser',
  plugins: [tailwind],
  minify: true,
})

if (!result.success) {
  for (const log of result.logs) console.error(log)
  throw new Error('Build failed')
}

console.log(`Built ${result.outputs.length} files to ./dist`)
