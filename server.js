// Next.js Standalone Server for Production
import { createServer } from 'http'
import { parse } from 'url'
import { NextRequest, NextResponse } from 'next/server'
import next from './dist/server.js'

const port = process.env.PORT || 3000
const hostname = process.env.HOSTNAME || '0.0.0.0'

async function startServer() {
  const app = next({
    hostname,
    port,
    dev: false,
    conf: {
      distDir: 'dist',
    },
  })

  await app.prepare()

  const handle = app.getRequestHandler()

  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      const { pathname, query } = parsedUrl

      // Health check endpoint
      if (pathname === '/api/health') {
        res.setHeader('Content-Type', 'application/json')
        res.statusCode = 200
        res.end(JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          uptime: process.uptime()
        }))
        return
      }

      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error handling request:', err)
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'Internal Server Error' }))
    }
  })

  server.listen(port, hostname, (err) => {
    if (err) {
      console.error('Error starting server:', err)
      process.exit(1)
    }
    console.log(`Server running at http://${hostname}:${port}`)
  })
}

startServer().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})