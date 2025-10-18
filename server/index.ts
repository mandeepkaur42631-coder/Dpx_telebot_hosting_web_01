import express, { type Request, Response, NextFunction } from "express";
import { spawn } from "child_process";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware to log API requests
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Endpoint to run bots dynamically
  app.post('/api/run-bot', (req, res) => {
    const { bot_script_path, bot_token, api_id, api_hash } = req.body;

    // Spawn Python bot process with env vars
    const botProcess = spawn('python3', [bot_script_path], {
      env: {
        ...process.env, // Render ke saare variables
        BOT_TOKEN: bot_token, // Is bot ka specific token
        API_ID: api_id,
        API_HASH: api_hash,
      }
    });

    botProcess.stdout.on('data', (data) => {
      console.log(`Bot Log: ${data}`);
    });

    botProcess.stderr.on('data', (data) => {
      console.error(`Bot Error: ${data}`);
    });

    res.json({ message: `${bot_script_path} started successfully!` });
  });

  // Server listen default port
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
