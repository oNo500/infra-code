import index from './index.html'

const server = Bun.serve({
  port: Number(Bun.env.PORT ?? 3000),
  development: true,
  routes: {
    '/': index,
    '/api/hello': () => Response.json({ message: 'Hello from Bun.serve' }),
  },
  fetch() {
    return new Response('Not found', { status: 404 })
  },
})

console.log(`Dev server: http://localhost:${server.port}`)
