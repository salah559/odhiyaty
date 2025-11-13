var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/admin.ts
import admin from "firebase-admin";
if (!admin.apps.length) {
  try {
    const serviceAccountJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    if (serviceAccountJson) {
      const serviceAccount = JSON.parse(serviceAccountJson);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } else {
      admin.initializeApp();
    }
  } catch (error) {
    console.error("Failed to initialize Firebase Admin:", error);
  }
}
var auth = admin.apps.length ? admin.auth() : null;
var firestore = admin.apps.length ? admin.firestore() : null;
async function getUserByEmail(email) {
  if (!auth) {
    throw new Error("Firebase Admin SDK is not configured. Please add GOOGLE_APPLICATION_CREDENTIALS_JSON to your secrets.");
  }
  try {
    const user = await auth.getUserByEmail(email);
    return { uid: user.uid, email: user.email };
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      return null;
    }
    throw error;
  }
}

// server/routes.ts
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// server/db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  admins: () => admins,
  insertAdminSchema: () => insertAdminSchema,
  insertOrderSchema: () => insertOrderSchema,
  insertSheepSchema: () => insertSheepSchema,
  orderStatuses: () => orderStatuses,
  orders: () => orders,
  sheep: () => sheep,
  sheepCategories: () => sheepCategories
});
import { pgTable, serial, text, numeric, boolean, timestamp, json, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var sheep = pgTable("sheep", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  // "محلي", "روماني", "إسباني"
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  discountPercentage: numeric("discount_percentage", { precision: 5, scale: 2 }),
  images: json("images").$type().notNull(),
  age: text("age").notNull(),
  weight: text("weight").notNull(),
  breed: text("breed").notNull(),
  healthStatus: text("health_status").notNull(),
  description: text("description").notNull(),
  isFeatured: boolean("is_featured").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
var orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  userName: text("user_name").notNull(),
  userPhone: text("user_phone").notNull(),
  wilayaCode: text("wilaya_code").notNull(),
  wilayaName: text("wilaya_name").notNull(),
  communeId: integer("commune_id").notNull(),
  communeName: text("commune_name").notNull(),
  items: json("items").$type().notNull(),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  // pending, processing, completed, cancelled
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
var admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  // Firebase UID
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("secondary"),
  // primary or secondary
  addedAt: timestamp("added_at").notNull().defaultNow()
});
var sheepCategories = ["\u0645\u062D\u0644\u064A", "\u0631\u0648\u0645\u0627\u0646\u064A", "\u0625\u0633\u0628\u0627\u0646\u064A"];
var orderStatuses = ["pending", "processing", "completed", "cancelled"];
var insertSheepSchema = createInsertSchema(sheep, {
  name: z.string().min(1, "\u0627\u0633\u0645 \u0627\u0644\u062E\u0631\u0648\u0641 \u0645\u0637\u0644\u0648\u0628"),
  category: z.enum(sheepCategories),
  price: z.string().or(z.number()).transform((val) => typeof val === "string" ? parseFloat(val) : val),
  discountPercentage: z.string().or(z.number()).transform((val) => typeof val === "string" ? parseFloat(val) : val).optional(),
  images: z.array(z.string()).min(1, "\u064A\u062C\u0628 \u0625\u0636\u0627\u0641\u0629 \u0635\u0648\u0631\u0629 \u0648\u0627\u062D\u062F\u0629 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644"),
  age: z.string().min(1, "\u0627\u0644\u0639\u0645\u0631 \u0645\u0637\u0644\u0648\u0628"),
  weight: z.string().min(1, "\u0627\u0644\u0648\u0632\u0646 \u0645\u0637\u0644\u0648\u0628"),
  breed: z.string().min(1, "\u0627\u0644\u0633\u0644\u0627\u0644\u0629 \u0645\u0637\u0644\u0648\u0628\u0629"),
  healthStatus: z.string().min(1, "\u0627\u0644\u062D\u0627\u0644\u0629 \u0627\u0644\u0635\u062D\u064A\u0629 \u0645\u0637\u0644\u0648\u0628\u0629"),
  description: z.string().min(10, "\u0627\u0644\u0648\u0635\u0641 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 10 \u0623\u062D\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644"),
  isFeatured: z.boolean().default(false)
}).omit({ id: true, createdAt: true, updatedAt: true });
var insertOrderSchema = createInsertSchema(orders, {
  userId: z.string().optional(),
  userName: z.string().min(1, "\u0627\u0644\u0627\u0633\u0645 \u0645\u0637\u0644\u0648\u0628"),
  userPhone: z.string().min(10, "\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D"),
  wilayaCode: z.string().min(1, "\u0627\u0644\u0648\u0644\u0627\u064A\u0629 \u0645\u0637\u0644\u0648\u0628\u0629"),
  wilayaName: z.string().min(1, "\u0627\u0644\u0648\u0644\u0627\u064A\u0629 \u0645\u0637\u0644\u0648\u0628\u0629"),
  communeId: z.number().min(1, "\u0627\u0644\u0628\u0644\u062F\u064A\u0629 \u0645\u0637\u0644\u0648\u0628\u0629"),
  communeName: z.string().min(1, "\u0627\u0644\u0628\u0644\u062F\u064A\u0629 \u0645\u0637\u0644\u0648\u0628\u0629"),
  items: z.array(z.object({
    sheepId: z.string(),
    sheepName: z.string(),
    sheepImage: z.string(),
    price: z.number(),
    quantity: z.number().min(1)
  })).min(1, "\u064A\u062C\u0628 \u0625\u0636\u0627\u0641\u0629 \u0645\u0646\u062A\u062C \u0648\u0627\u062D\u062F \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644"),
  totalAmount: z.string().or(z.number()).transform((val) => typeof val === "string" ? parseFloat(val) : val),
  notes: z.string().optional(),
  status: z.enum(orderStatuses).default("pending")
}).omit({ id: true, createdAt: true, updatedAt: true });
var insertAdminSchema = createInsertSchema(admins, {
  userId: z.string().min(1, "\u0645\u0639\u0631\u0641 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0645\u0637\u0644\u0648\u0628"),
  email: z.string().email("\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u063A\u064A\u0631 \u0635\u0627\u0644\u062D"),
  role: z.enum(["primary", "secondary"]).default("secondary")
}).omit({ id: true, addedAt: true });

// server/db.ts
var { Pool } = pkg;
var pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // للبيئة المحلية
  // ssl: false,
  // للإنتاج على cPanel (قد تحتاج لضبط SSL)
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});
var db = drizzle(pool, { schema: schema_exports });
pool.on("connect", () => {
  console.log("\u2705 Connected to PostgreSQL database");
});
pool.on("error", (err) => {
  console.error("\u274C PostgreSQL connection error:", err);
});

// server/storage.ts
import { eq, desc } from "drizzle-orm";
async function getAllSheep() {
  const allSheep = await db.select().from(sheep).orderBy(desc(sheep.createdAt));
  return allSheep.map((s) => ({
    ...s,
    id: s.id.toString(),
    category: s.category,
    price: parseFloat(s.price),
    discountPercentage: s.discountPercentage ? parseFloat(s.discountPercentage) : void 0,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString()
  }));
}
async function getSheep(id) {
  const result = await db.select().from(sheep).where(eq(sheep.id, parseInt(id))).limit(1);
  if (result.length === 0) {
    return null;
  }
  const s = result[0];
  return {
    ...s,
    id: s.id.toString(),
    category: s.category,
    price: parseFloat(s.price),
    discountPercentage: s.discountPercentage ? parseFloat(s.discountPercentage) : void 0,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString()
  };
}
async function createSheep(data) {
  const result = await db.insert(sheep).values({
    ...data,
    price: data.price.toString(),
    discountPercentage: data.discountPercentage?.toString()
  }).returning();
  const s = result[0];
  return {
    ...s,
    id: s.id.toString(),
    category: s.category,
    price: parseFloat(s.price),
    discountPercentage: s.discountPercentage ? parseFloat(s.discountPercentage) : void 0,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString()
  };
}
async function updateSheep(id, data) {
  const result = await db.update(sheep).set({
    ...data,
    price: data.price.toString(),
    discountPercentage: data.discountPercentage?.toString(),
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq(sheep.id, parseInt(id))).returning();
  if (result.length === 0) {
    throw new Error("Sheep not found");
  }
  const s = result[0];
  return {
    ...s,
    id: s.id.toString(),
    category: s.category,
    price: parseFloat(s.price),
    discountPercentage: s.discountPercentage ? parseFloat(s.discountPercentage) : void 0,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString()
  };
}
async function deleteSheep(id) {
  await db.delete(sheep).where(eq(sheep.id, parseInt(id)));
}
async function getAllOrders() {
  const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
  return allOrders.map((o) => ({
    ...o,
    id: o.id.toString(),
    status: o.status,
    notes: o.notes || void 0,
    totalAmount: parseFloat(o.totalAmount),
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString()
  }));
}
async function createOrder(data) {
  const result = await db.insert(orders).values({
    ...data,
    totalAmount: data.totalAmount.toString()
  }).returning();
  return result[0].id.toString();
}
async function updateOrder(id, data) {
  const updateData = {
    ...data,
    updatedAt: /* @__PURE__ */ new Date()
  };
  if (data.totalAmount !== void 0) {
    updateData.totalAmount = data.totalAmount.toString();
  }
  const result = await db.update(orders).set(updateData).where(eq(orders.id, parseInt(id))).returning();
  if (result.length === 0) {
    throw new Error("Order not found");
  }
  const o = result[0];
  return {
    ...o,
    id: o.id.toString(),
    status: o.status,
    notes: o.notes || void 0,
    totalAmount: parseFloat(o.totalAmount),
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString()
  };
}
async function updateOrderStatus(id, status) {
  return updateOrder(id, { status });
}
async function getAllAdmins() {
  const allAdmins = await db.select().from(admins).orderBy(desc(admins.addedAt));
  return allAdmins.map((a) => ({
    ...a,
    id: a.id.toString(),
    role: a.role,
    addedAt: a.addedAt.toISOString()
  }));
}
async function getAdminByUserId(userId) {
  const result = await db.select().from(admins).where(eq(admins.userId, userId)).limit(1);
  if (result.length === 0) {
    return null;
  }
  const a = result[0];
  return {
    ...a,
    id: a.id.toString(),
    role: a.role,
    addedAt: a.addedAt.toISOString()
  };
}
async function createAdmin(data) {
  const result = await db.insert(admins).values(data).returning();
  const a = result[0];
  return {
    ...a,
    id: a.id.toString(),
    role: a.role,
    addedAt: a.addedAt.toISOString()
  };
}
async function deleteAdmin(userId) {
  await db.delete(admins).where(eq(admins.userId, userId));
}
async function isAdmin(userId) {
  const result = await getAdminByUserId(userId);
  return result !== null;
}

// server/routes.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
async function verifyAdmin(uid) {
  if (!uid) return false;
  try {
    const userRecord = await auth?.getUser(uid);
    if (!userRecord) return false;
    if (userRecord.email === "bouazzasalah120120@gmail.com") {
      return true;
    }
    const isAdmin2 = await isAdmin(uid);
    return isAdmin2;
  } catch (error) {
    console.error("Error verifying admin:", error);
    return false;
  }
}
async function registerRoutes(app2) {
  app2.get("/api/download-app", (req, res) => {
    try {
      const apkPath = path.join(__dirname, "..", "attached_assets", "app-release_1762910223541.apk");
      if (!fs.existsSync(apkPath)) {
        return res.status(404).json({ message: "APK file not found" });
      }
      res.setHeader("Content-Type", "application/vnd.android.package-archive");
      res.setHeader("Content-Disposition", "attachment; filename=adhiati-app.apk");
      const fileStream = fs.createReadStream(apkPath);
      fileStream.pipe(res);
    } catch (error) {
      console.error("Error downloading APK:", error);
      res.status(500).json({ message: "Error downloading app" });
    }
  });
  app2.get("/api/admin/user-by-email", async (req, res) => {
    try {
      const email = req.query.email;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      const user = await getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error getting user by email:", error);
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  });
  app2.get("/api/sheep", async (req, res) => {
    try {
      const sheep2 = await getAllSheep();
      res.json(sheep2);
    } catch (error) {
      console.error("Error getting sheep:", error);
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  });
  app2.get("/api/sheep/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const sheep2 = await getSheep(id);
      if (!sheep2) {
        return res.status(404).json({ message: "Sheep not found" });
      }
      res.json(sheep2);
    } catch (error) {
      console.error("Error getting sheep:", error);
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  });
  app2.post("/api/sheep", async (req, res) => {
    try {
      const uid = req.headers["x-user-id"];
      const isAdmin2 = await verifyAdmin(uid);
      if (!isAdmin2) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      const validatedData = insertSheepSchema.parse(req.body);
      const newSheep = await createSheep(validatedData);
      res.status(201).json(newSheep);
    } catch (error) {
      console.error("Error creating sheep:", error);
      res.status(400).json({ message: error.message || "Invalid data" });
    }
  });
  app2.patch("/api/sheep/:id", async (req, res) => {
    try {
      const uid = req.headers["x-user-id"];
      const isAdmin2 = await verifyAdmin(uid);
      if (!isAdmin2) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      const { id } = req.params;
      const validatedData = insertSheepSchema.parse(req.body);
      const updatedSheep = await updateSheep(id, validatedData);
      res.json(updatedSheep);
    } catch (error) {
      console.error("Error updating sheep:", error);
      res.status(400).json({ message: error.message || "Invalid data" });
    }
  });
  app2.delete("/api/sheep/:id", async (req, res) => {
    try {
      const uid = req.headers["x-user-id"];
      const isAdmin2 = await verifyAdmin(uid);
      if (!isAdmin2) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      const { id } = req.params;
      await deleteSheep(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting sheep:", error);
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  });
  app2.get("/api/orders", async (req, res) => {
    try {
      const uid = req.headers["x-user-id"];
      const isAdmin2 = await verifyAdmin(uid);
      if (!isAdmin2) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      const orders2 = await getAllOrders();
      res.json(orders2);
    } catch (error) {
      console.error("Error getting orders:", error);
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  });
  app2.post("/api/orders", async (req, res) => {
    try {
      const validatedData = insertOrderSchema.parse(req.body);
      const orderId = await createOrder(validatedData);
      res.status(201).json({ id: orderId });
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(400).json({ message: error.message || "Invalid data" });
    }
  });
  app2.patch("/api/orders/:id", async (req, res) => {
    try {
      const uid = req.headers["x-user-id"];
      const isAdmin2 = await verifyAdmin(uid);
      if (!isAdmin2) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      const { id } = req.params;
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      const updatedOrder = await updateOrderStatus(id, status);
      res.json(updatedOrder);
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(400).json({ message: error.message || "Invalid data" });
    }
  });
  app2.get("/api/admins", async (req, res) => {
    try {
      const uid = req.headers["x-user-id"];
      const isAdmin2 = await verifyAdmin(uid);
      if (!isAdmin2) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      const admins2 = await getAllAdmins();
      res.json(admins2);
    } catch (error) {
      console.error("Error getting admins:", error);
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  });
  app2.get("/api/admins/check/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const admin2 = await getAdminByUserId(userId);
      res.json({ isAdmin: admin2 !== null, admin: admin2 });
    } catch (error) {
      console.error("Error checking admin:", error);
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  });
  app2.post("/api/admins", async (req, res) => {
    try {
      const uid = req.headers["x-user-id"];
      if (!uid) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const userRecord = await auth?.getUser(uid);
      if (userRecord?.email !== "bouazzasalah120120@gmail.com") {
        return res.status(403).json({ message: "Only primary admin can add admins" });
      }
      const validatedData = insertAdminSchema.parse(req.body);
      const newAdmin = await createAdmin(validatedData);
      res.status(201).json(newAdmin);
    } catch (error) {
      console.error("Error adding admin:", error);
      res.status(400).json({ message: error.message || "Invalid data" });
    }
  });
  app2.delete("/api/admins/:userId", async (req, res) => {
    try {
      const uid = req.headers["x-user-id"];
      if (!uid) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const userRecord = await auth?.getUser(uid);
      if (userRecord?.email !== "bouazzasalah120120@gmail.com") {
        return res.status(403).json({ message: "Only primary admin can remove admins" });
      }
      const { userId } = req.params;
      await deleteAdmin(userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing admin:", error);
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs2 from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      ),
      await import("@replit/vite-plugin-dev-banner").then(
        (m) => m.devBanner()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
