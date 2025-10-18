import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { spawn, ChildProcess } from "child_process";
import { accessCodeSchema, insertBotSchema } from "@shared/schema";

const VALID_ACCESS_CODES = ["DPX1432"];
const BOTS_DIR = path.join(process.cwd(), "bots");
const botProcesses = new Map<string, ChildProcess>();

async function ensureBotsDir() {
  try {
    await fs.access(BOTS_DIR);
  } catch {
    await fs.mkdir(BOTS_DIR, { recursive: true });
  }
}

const upload = multer({
  storage: multer.diskStorage({
    destination: async (req, file, cb) => {
      await ensureBotsDir();
      cb(null, BOTS_DIR);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
  }),
});

async function installRequirements(botDir: string, requirementsPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const pip = spawn("pip", ["install", "-r", requirementsPath], {
      cwd: botDir,
    });

    let output = "";

    pip.stdout?.on("data", (data) => {
      output += data.toString();
    });

    pip.stderr?.on("data", (data) => {
      output += data.toString();
    });

    pip.on("close", (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(`Failed to install requirements: ${output}`));
      }
    });
  });
}

async function startBot(botId: string, botPath: string): Promise<void> {
  if (botProcesses.has(botId)) {
    stopBot(botId);
  }

  const process = spawn("python", [botPath], {
    cwd: path.dirname(botPath),
  });

  let logs = "";

  process.stdout?.on("data", (data) => {
    const output = data.toString();
    logs += output;
    storage.updateBot(botId, { logs });
  });

  process.stderr?.on("data", (data) => {
    const output = data.toString();
    logs += output;
    storage.updateBot(botId, { logs });
  });

  process.on("exit", (code) => {
    botProcesses.delete(botId);
    storage.updateBot(botId, { 
      status: code === 0 ? "stopped" : "error",
      logs: logs + `\n[Process exited with code ${code}]`
    });
  });

  botProcesses.set(botId, process);
  await storage.updateBot(botId, { status: "running", logs: "[Bot started]\n" });
}

function stopBot(botId: string): void {
  const process = botProcesses.get(botId);
  if (process) {
    process.kill();
    botProcesses.delete(botId);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  await ensureBotsDir();

  app.post("/api/validate-access", async (req, res) => {
    try {
      const { code } = accessCodeSchema.parse(req.body);
      
      if (VALID_ACCESS_CODES.includes(code)) {
        res.json({ valid: true });
      } else {
        res.status(401).json({ valid: false, message: "Invalid access code" });
      }
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  app.get("/api/bots", async (req, res) => {
    try {
      const bots = await storage.getBots();
      res.json(bots);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bots" });
    }
  });

  app.post("/api/bots/upload", upload.fields([
    { name: "botFile", maxCount: 1 },
    { name: "requirementsFile", maxCount: 1 }
  ]), async (req, res) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const { name } = req.body;

      if (!files.botFile || !files.botFile[0]) {
        return res.status(400).send("Bot file is required");
      }

      const botFile = files.botFile[0];
      const botDir = path.dirname(botFile.path);

      let installLogs = "";
      
      if (files.requirementsFile && files.requirementsFile[0]) {
        try {
          installLogs = await installRequirements(botDir, files.requirementsFile[0].path);
        } catch (error) {
          installLogs = `Failed to install requirements: ${error}`;
        }
      }

      const bot = await storage.createBot({
        name,
        fileName: botFile.filename,
        status: "stopped",
        logs: installLogs || "Bot uploaded successfully. Ready to run.",
      });

      res.json(bot);
    } catch (error) {
      res.status(500).send("Failed to upload bot");
    }
  });

  app.post("/api/bots/:id/start", async (req, res) => {
    try {
      const bot = await storage.getBot(req.params.id);
      if (!bot) {
        return res.status(404).json({ error: "Bot not found" });
      }

      const botPath = path.join(BOTS_DIR, bot.fileName);
      await startBot(bot.id, botPath);
      
      const updatedBot = await storage.getBot(bot.id);
// server/routes.ts
import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { auth } from './firebaseAdmin';
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { spawn, ChildProcess } from "child_process";

const ADMIN_EMAIL = "durgeshbhaithakor@gmail.com";
const BOTS_DIR = path.join(process.cwd(), "bots");
const botProcesses = new Map<string, ChildProcess>();

// Authentication Middleware
const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).send('Unauthorized');
  
  try {
    const decodedToken = await auth.verifyIdToken(token);
    (req as any).user = decodedToken;
    next();
  } catch (error) {
    res.status(401).send('Unauthorized');
  }
};

// ... Baaki functions jaise ensureBotsDir, upload, etc. yahan rahenge ...
// ... Inme koi badlav nahi karna hai ...

export async function registerRoutes(app: Express): Promise<Server> {
  // ... ensureBotsDir() call ...

  // NORMAL USERS ke liye: Sirf unke apne bots dikhayega
  app.get("/api/my-bots", authMiddleware, async (req, res) => {
    const user = (req as any).user;
    const userBots = await storage.getBots(user.email);
    res.json(userBots);
  });

  // ADMIN ke liye: Saare bots dikhayega
  app.get("/api/all-bots", authMiddleware, async (req, res) => {
    const user = (req as any).user;
    if (user.email !== ADMIN_EMAIL) {
      return res.status(403).send('Forbidden: Admin access required');
    }
    const allBots = await storage.getBots();
    res.json(allBots);
  });

  // Bot Upload: Ab yeh owner ka email bhi save karega
  app.post("/api/bots/upload", authMiddleware, upload.single('botFile'), async (req, res) => {
    const user = (req as any).user;
    const { name } = req.body;
    const botFile = req.file;

    if (!botFile) return res.status(400).send("Bot file is required");

    const bot = await storage.createBot({
      name,
      fileName: botFile.filename,
      status: "stopped",
      logs: "Bot uploaded successfully.",
      ownerEmail: user.email, // Bot ka malik save karein
    });
    res.json(bot);
  });

  // ... /start, /stop, /delete routes yahan rahenge. Unhe authMiddleware se protect karna hai ...
  
  app.post("/api/bots/:id/start", authMiddleware, async (req, res) => {
      //... logic ...
  });
  
  app.delete("/api/bots/:id", authMiddleware, async (req, res) => {
      //... logic ...
  });
  
  const httpServer = createServer(app);
  return httpServer;
}
