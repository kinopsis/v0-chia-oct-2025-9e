const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = parseInt(process.env.PORT) || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Security: Initialize security monitoring
const securityMetrics = {
  startTime: new Date(),
  requestCount: 0,
  errorCount: 0,
  lastHealthCheck: new Date()
};

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      const { pathname, query } = parsedUrl;
      
      securityMetrics.requestCount++;
      
      // Security: Enhanced healthcheck with security status
      if (pathname === "/api/health") {
        const uptime = Date.now() - securityMetrics.startTime.getTime();
        const healthStatus = {
          status: "healthy",
          timestamp: new Date().toISOString(),
          uptime: uptime,
          metrics: {
            requestCount: securityMetrics.requestCount,
            errorCount: securityMetrics.errorCount,
            uptime: uptime
          },
          security: {
            nodeVersion: process.version,
            platform: process.platform,
            arch: process.arch
          }
        };
        
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("X-Frame-Options", "DENY");
        res.setHeader("X-XSS-Protection", "1; mode=block");
        res.end(JSON.stringify(healthStatus));
        securityMetrics.lastHealthCheck = new Date();
        return;
      }
      
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Security: Error occurred handling", req.url, err);
      securityMetrics.errorCount++;
      
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.end(JSON.stringify({
        error: "Internal Server Error",
        timestamp: new Date().toISOString(),
        requestId: Math.random().toString(36).substr(2, 9)
      }));
    }
  }).listen(port, hostname, (err) => {
    if (err) {
      console.error("Security: Failed to start server", err);
      process.exit(1);
    }
    console.log(`Security: Ready on http://${hostname}:${port}`);
    console.log(`Security: Running as user: ${process.getuid()}`);
  });
}).catch((err) => {
  console.error("Security: Failed to prepare application", err);
  process.exit(1);
});