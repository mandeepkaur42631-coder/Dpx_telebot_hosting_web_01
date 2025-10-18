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
      res.json(updatedBot);
    } catch (error) {
      res.status(500).json({ error: "Failed to start bot" });
    }
  });

  app.post("/api/bots/:id/stop", async (req, res) => {
    try {
      const bot = await storage.getBot(req.params.id);
      if (!bot) {
        return res.status(404).json({ error: "Bot not found" });
      }

      stopBot(bot.id);
      await storage.updateBot(bot.id, { status: "stopped", logs: bot.logs + "\n[Bot stopped by user]" });
      
      const updatedBot = await storage.getBot(bot.id);
      res.json(updatedBot);
    } catch (error) {
      res.status(500).json({ error: "Failed to stop bot" });
    }
  });

  app.post("/api/bots/:id/restart", async (req, res) => {
    try {
      const bot = await storage.getBot(req.params.id);
      if (!bot) {
        return res.status(404).json({ error: "Bot not found" });
      }

      stopBot(bot.id);
      const botPath = path.join(BOTS_DIR, bot.fileName);
      await startBot(bot.id, botPath);
      
      const updatedBot = await storage.getBot(bot.id);
      res.json(updatedBot);
    } catch (error) {
      res.status(500).json({ error: "Failed to restart bot" });
    }
  });

  app.delete("/api/bots/:id", async (req, res) => {
    try {
      const bot = await storage.getBot(req.params.id);
      if (!bot) {
        return res.status(404).json({ error: "Bot not found" });
      }

      stopBot(bot.id);
      
      const botPath = path.join(BOTS_DIR, bot.fileName);
      try {
        await fs.unlink(botPath);
      } catch (error) {
        console.error("Failed to delete bot file:", error);
      }

      await storage.deleteBot(bot.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete bot" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
