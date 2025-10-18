import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const bots = pgTable("bots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  fileName: text("file_name").notNull(),
  status: text("status").notNull().default("stopped"),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  logs: text("logs").default(""),
});

export const insertBotSchema = createInsertSchema(bots).omit({
  id: true,
  uploadedAt: true,
});

export type InsertBot = z.infer<typeof insertBotSchema>;
export type Bot = typeof bots.$inferSelect;

export const accessCodeSchema = z.object({
  code: z.string().min(1, "Access code is required"),
});

export type AccessCode = z.infer<typeof accessCodeSchema>;
