var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/config.ts
var config_exports = {};
__export(config_exports, {
  config: () => config
});
var config;
var init_config = __esm({
  "server/config.ts"() {
    "use strict";
    config = {
      // إعدادات الخادم
      port: parseInt(process.env.PORT || "5000", 10),
      host: "0.0.0.0",
      nodeEnv: process.env.NODE_ENV || "development",
      // إعدادات Firebase (يجب تحديث هذه القيم بقيمك الفعلية)
      firebase: {
        apiKey: process.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
        authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
        projectId: process.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
        storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
        messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
        appId: process.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID"
      },
      // إعدادات قاعدة البيانات
      database: {
        url: process.env.DATABASE_URL || ""
      },
      // إعدادات الجلسة
      session: {
        secret: process.env.SESSION_SECRET || "your-secret-key-change-in-production"
      },
      // معلومات Replit
      replit: {
        slug: process.env.REPL_SLUG || "",
        owner: process.env.REPL_OWNER || "",
        devDomain: process.env.REPLIT_DEV_DOMAIN || ""
      },
      // البريد الإلكتروني للمدير الرئيسي
      superAdmin: {
        email: "bouazzasalah120120@gmail.com"
      }
    };
  }
});

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// server/firestore.ts
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
var adminApp;
var db;
function initializeFirestore() {
  if (db) {
    return db;
  }
  try {
    if (!getApps().length) {
      const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      if (!serviceAccountKey) {
        throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY environment variable is required");
      }
      const serviceAccount = JSON.parse(serviceAccountKey);
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
      }
      adminApp = initializeApp({
        credential: cert(serviceAccount)
      });
    } else {
      adminApp = getApps()[0];
    }
    db = getFirestore(adminApp);
    return db;
  } catch (error) {
    console.error("Failed to initialize Firestore:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      hasServiceAccountKey: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    });
    throw error;
  }
}
function getDb() {
  if (!db) {
    return initializeFirestore();
  }
  return db;
}

// shared/schema.ts
import { z } from "zod";
var sheepCategories = ["\u0645\u062D\u0644\u064A", "\u0631\u0648\u0645\u0627\u0646\u064A", "\u0625\u0633\u0628\u0627\u0646\u064A"];
var insertImageSchema = z.object({
  imageUrl: z.string().url("\u0631\u0627\u0628\u0637 \u0627\u0644\u0635\u0648\u0631\u0629 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0635\u0627\u0644\u062D\u0627\u064B"),
  thumbnailUrl: z.string().url().optional(),
  deleteUrl: z.string().url().optional(),
  originalFileName: z.string().optional(),
  mimeType: z.string(),
  fileSize: z.number().optional()
});
var insertSheepSchema = z.object({
  name: z.string().min(1, "\u0627\u0633\u0645 \u0627\u0644\u062E\u0631\u0648\u0641 \u0645\u0637\u0644\u0648\u0628"),
  category: z.enum(sheepCategories),
  price: z.number().min(0, "\u0627\u0644\u0633\u0639\u0631 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0645\u0648\u062C\u0628\u0627\u064B"),
  discountPercentage: z.number().min(0).max(100, "\u0627\u0644\u0646\u0633\u0628\u0629 \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 \u0628\u064A\u0646 0 \u0648 100").optional(),
  imageIds: z.array(z.string()).min(1, "\u064A\u062C\u0628 \u0625\u0636\u0627\u0641\u0629 \u0635\u0648\u0631\u0629 \u0648\u0627\u062D\u062F\u0629 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644"),
  age: z.string().min(1, "\u0627\u0644\u0639\u0645\u0631 \u0645\u0637\u0644\u0648\u0628"),
  weight: z.string().min(1, "\u0627\u0644\u0648\u0632\u0646 \u0645\u0637\u0644\u0648\u0628"),
  breed: z.string().min(1, "\u0627\u0644\u0633\u0644\u0627\u0644\u0629 \u0645\u0637\u0644\u0648\u0628\u0629"),
  healthStatus: z.string().min(1, "\u0627\u0644\u062D\u0627\u0644\u0629 \u0627\u0644\u0635\u062D\u064A\u0629 \u0645\u0637\u0644\u0648\u0628\u0629"),
  description: z.string().min(10, "\u0627\u0644\u0648\u0635\u0641 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 10 \u0623\u062D\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644"),
  isFeatured: z.boolean().default(false)
});
var orderStatuses = ["pending", "processing", "completed", "cancelled"];
var insertOrderSchema = z.object({
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
    sheepImageId: z.string(),
    price: z.number(),
    quantity: z.number().min(1)
  })).min(1, "\u064A\u062C\u0628 \u0625\u0636\u0627\u0641\u0629 \u0645\u0646\u062A\u062C \u0648\u0627\u062D\u062F \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644"),
  totalAmount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, "\u0627\u0644\u0645\u0628\u0644\u063A \u063A\u064A\u0631 \u0635\u0627\u0644\u062D"),
  notes: z.string().optional(),
  status: z.enum(orderStatuses).default("pending")
});
var userTypes = ["buyer", "seller", "admin", "guest"];
var insertUserProfileSchema = z.object({
  uid: z.string(),
  email: z.string().email("\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u063A\u064A\u0631 \u0635\u0627\u0644\u062D").nullable(),
  displayName: z.string().nullable(),
  photoURL: z.string().url().nullable().optional(),
  userType: z.enum(userTypes)
});
var insertAdminSchema = z.object({
  email: z.string().email("\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u063A\u064A\u0631 \u0635\u0627\u0644\u062D"),
  role: z.enum(["primary", "secondary"]).default("secondary")
});

// server/routes.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
async function registerRoutes(app2) {
  let db2;
  const ensureDb = () => {
    if (!db2) {
      db2 = getDb();
    }
    return db2;
  };
  app2.use((req, res, next) => {
    try {
      ensureDb();
      next();
    } catch (error) {
      console.error("Failed to initialize Firestore:", error);
      res.status(500).json({ message: "Database initialization failed" });
    }
  });
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
  app2.post("/api/images", async (req, res) => {
    try {
      const { imageData, mimeType, originalFileName } = req.body;
      if (!imageData || !mimeType) {
        return res.status(400).json({ message: "\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0635\u0648\u0631\u0629 \u0645\u0637\u0644\u0648\u0628\u0629" });
      }
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/bmp"];
      if (!allowedTypes.includes(mimeType.toLowerCase())) {
        return res.status(400).json({ message: "\u0646\u0648\u0639 \u0627\u0644\u0635\u0648\u0631\u0629 \u063A\u064A\u0631 \u0645\u062F\u0639\u0648\u0645" });
      }
      if (typeof imageData !== "string" || imageData.length === 0) {
        return res.status(400).json({ message: "\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0635\u0648\u0631\u0629 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D\u0629" });
      }
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
      const apiKey = process.env.IMGBB_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ message: "\u0645\u0641\u062A\u0627\u062D IMGBB_API_KEY \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F \u0641\u064A \u0645\u062A\u063A\u064A\u0631\u0627\u062A \u0627\u0644\u0628\u064A\u0626\u0629" });
      }
      const formData = new URLSearchParams();
      formData.append("key", apiKey);
      formData.append("image", base64Data);
      if (originalFileName) {
        formData.append("name", originalFileName);
      }
      const imgbbResponse = await fetch("https://api.imgbb.com/1/upload", {
        method: "POST",
        body: formData
      });
      if (!imgbbResponse.ok) {
        const errorData = await imgbbResponse.json();
        throw new Error(errorData.error?.message || "\u0641\u0634\u0644 \u0641\u064A \u0631\u0641\u0639 \u0627\u0644\u0635\u0648\u0631\u0629 \u0625\u0644\u0649 ImgBB");
      }
      const imgbbData = await imgbbResponse.json();
      if (!imgbbData.success || !imgbbData.data) {
        throw new Error("\u0641\u0634\u0644 \u0641\u064A \u0631\u0641\u0639 \u0627\u0644\u0635\u0648\u0631\u0629 \u0625\u0644\u0649 ImgBB");
      }
      const imageDoc = await db2.collection("images").add({
        imageUrl: imgbbData.data.url,
        thumbnailUrl: imgbbData.data.thumb?.url || imgbbData.data.url,
        deleteUrl: imgbbData.data.delete_url,
        originalFileName: originalFileName || imgbbData.data.title || null,
        mimeType,
        fileSize: imgbbData.data.size || null,
        createdAt: /* @__PURE__ */ new Date()
      });
      res.json({
        id: imageDoc.id,
        imageUrl: imgbbData.data.url,
        thumbnailUrl: imgbbData.data.thumb?.url || imgbbData.data.url
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ message: error.message || "\u0641\u0634\u0644 \u0641\u064A \u0631\u0641\u0639 \u0627\u0644\u0635\u0648\u0631\u0629" });
    }
  });
  app2.get("/api/images/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const imageDoc = await db2.collection("images").doc(id).get();
      if (!imageDoc.exists) {
        return res.status(404).json({ message: "\u0627\u0644\u0635\u0648\u0631\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629" });
      }
      const image = { id: imageDoc.id, ...imageDoc.data() };
      res.json({
        id: image.id,
        imageUrl: image.imageUrl,
        thumbnailUrl: image.thumbnailUrl || image.imageUrl,
        mimeType: image.mimeType,
        originalFileName: image.originalFileName,
        fileSize: image.fileSize,
        createdAt: image.createdAt
      });
    } catch (error) {
      console.error("Error fetching image:", error);
      res.status(500).json({ message: error.message || "\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0627\u0644\u0635\u0648\u0631\u0629" });
    }
  });
  app2.get("/api/admins/check", async (req, res) => {
    try {
      const email = req.query.email;
      if (!email) {
        return res.status(400).json({ message: "\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u0645\u0637\u0644\u0648\u0628" });
      }
      const adminsSnapshot = await db2.collection("admins").where("email", "==", email).limit(1).get();
      if (adminsSnapshot.empty) {
        return res.status(404).json({ message: "\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0644\u064A\u0633 \u0645\u0634\u0631\u0641\u0627\u064B" });
      }
      const adminData = adminsSnapshot.docs[0].data();
      res.json({
        email,
        role: adminData.role || "secondary"
      });
    } catch (error) {
      console.error("Error checking admin:", error);
      res.status(500).json({ message: error.message || "\u0641\u0634\u0644 \u0641\u064A \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0627\u062A" });
    }
  });
  app2.get("/api/admins", async (req, res) => {
    try {
      const adminsSnapshot = await db2.collection("admins").get();
      const admins = adminsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      res.json(admins);
    } catch (error) {
      console.error("Error fetching admins:", error);
      res.status(500).json({ message: error.message || "\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0627\u0644\u0645\u0634\u0631\u0641\u064A\u0646" });
    }
  });
  app2.post("/api/admins", async (req, res) => {
    try {
      const { email, role } = req.body;
      if (!email) {
        return res.status(400).json({ message: "\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u0645\u0637\u0644\u0648\u0628" });
      }
      const existingSnapshot = await db2.collection("admins").where("email", "==", email).limit(1).get();
      if (!existingSnapshot.empty) {
        return res.status(400).json({ message: "\u0627\u0644\u0645\u0634\u0631\u0641 \u0645\u0648\u062C\u0648\u062F \u0645\u0633\u0628\u0642\u0627\u064B" });
      }
      const adminDoc = await db2.collection("admins").add({
        email,
        role: role || "secondary",
        addedAt: /* @__PURE__ */ new Date()
      });
      const newAdmin = await db2.collection("admins").doc(adminDoc.id).get();
      res.json({ id: newAdmin.id, ...newAdmin.data() });
    } catch (error) {
      console.error("Error adding admin:", error);
      res.status(500).json({ message: error.message || "\u0641\u0634\u0644 \u0641\u064A \u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0645\u0634\u0631\u0641" });
    }
  });
  app2.delete("/api/admins/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db2.collection("admins").doc(id).delete();
      res.json({ message: "\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0645\u0634\u0631\u0641 \u0628\u0646\u062C\u0627\u062D" });
    } catch (error) {
      console.error("Error deleting admin:", error);
      res.status(500).json({ message: error.message || "\u0641\u0634\u0644 \u0641\u064A \u062D\u0630\u0641 \u0627\u0644\u0645\u0634\u0631\u0641" });
    }
  });
  app2.get("/api/users/:uid", async (req, res) => {
    try {
      const { uid } = req.params;
      const userDoc = await db2.collection("users").doc(uid).get();
      if (!userDoc.exists) {
        return res.status(404).json({ message: "\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
      }
      const userData = userDoc.data();
      res.json({ ...userData, uid: userDoc.id });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: error.message || "\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645" });
    }
  });
  app2.post("/api/users", async (req, res) => {
    try {
      const validatedData = insertUserProfileSchema.parse(req.body);
      const existingUser = await db2.collection("users").doc(validatedData.uid).get();
      if (existingUser.exists) {
        return res.status(400).json({ message: "\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0645\u0648\u062C\u0648\u062F \u0645\u0633\u0628\u0642\u0627\u064B" });
      }
      let finalUserType = validatedData.userType;
      if (validatedData.email) {
        const adminsSnapshot = await db2.collection("admins").where("email", "==", validatedData.email).get();
        if (!adminsSnapshot.empty) {
          finalUserType = "admin";
        }
      }
      const userData = {
        ...validatedData,
        userType: finalUserType,
        createdAt: /* @__PURE__ */ new Date()
      };
      await db2.collection("users").doc(validatedData.uid).set(userData);
      res.json(userData);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: error.message || "\u0641\u0634\u0644 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645" });
    }
  });
  app2.patch("/api/users/:uid", async (req, res) => {
    try {
      const { uid } = req.params;
      const { userType } = req.body;
      if (!userType || !["buyer", "seller", "admin"].includes(userType)) {
        return res.status(400).json({ message: "\u0646\u0648\u0639 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D" });
      }
      const userDoc = await db2.collection("users").doc(uid).get();
      if (!userDoc.exists) {
        return res.status(404).json({ message: "\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
      }
      await db2.collection("users").doc(uid).update({
        userType
      });
      const updatedUser = await db2.collection("users").doc(uid).get();
      res.json({ ...updatedUser.data(), uid: updatedUser.id });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: error.message || "\u0641\u0634\u0644 \u0641\u064A \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645" });
    }
  });
  app2.get("/api/sheep", async (req, res) => {
    try {
      const sheepSnapshot = await db2.collection("sheep").get();
      const allSheep = await Promise.all(sheepSnapshot.docs.map(async (doc) => {
        const sheepData = doc.data();
        const imageUrls = [];
        if (sheepData.imageIds && sheepData.imageIds.length > 0) {
          for (const imageId of sheepData.imageIds) {
            try {
              const imageDoc = await db2.collection("images").doc(imageId).get();
              if (imageDoc.exists) {
                const imageData = imageDoc.data();
                imageUrls.push(imageData.imageUrl);
              }
            } catch (err) {
              console.error(`Error fetching image ${imageId}:`, err);
            }
          }
        }
        return {
          ...sheepData,
          id: doc.id,
          images: imageUrls
        };
      }));
      res.json(allSheep);
    } catch (error) {
      console.error("Error fetching sheep:", error);
      res.status(500).json({ message: error.message || "\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0627\u0644\u0623\u063A\u0646\u0627\u0645" });
    }
  });
  app2.get("/api/sheep/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const sheepDoc = await db2.collection("sheep").doc(id).get();
      if (!sheepDoc.exists) {
        return res.status(404).json({ message: "\u0627\u0644\u062E\u0631\u0648\u0641 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
      }
      const sheepData = sheepDoc.data();
      const imageUrls = [];
      if (sheepData.imageIds && sheepData.imageIds.length > 0) {
        for (const imageId of sheepData.imageIds) {
          try {
            const imageDoc = await db2.collection("images").doc(imageId).get();
            if (imageDoc.exists) {
              const imageData = imageDoc.data();
              imageUrls.push(imageData.imageUrl);
            }
          } catch (err) {
            console.error(`Error fetching image ${imageId}:`, err);
          }
        }
      }
      res.json({
        ...sheepData,
        id: sheepDoc.id,
        images: imageUrls
      });
    } catch (error) {
      console.error("Error fetching sheep:", error);
      res.status(500).json({ message: error.message || "\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0627\u0644\u062E\u0631\u0648\u0641" });
    }
  });
  app2.post("/api/sheep", async (req, res) => {
    try {
      const validation = insertSheepSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          message: validation.error.errors[0].message
        });
      }
      const data = validation.data;
      const sheepDoc = await db2.collection("sheep").add({
        ...data,
        isFeatured: data.isFeatured || false,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      });
      const newSheep = await db2.collection("sheep").doc(sheepDoc.id).get();
      res.json({ id: newSheep.id, ...newSheep.data() });
    } catch (error) {
      console.error("Error creating sheep:", error);
      res.status(500).json({ message: error.message || "\u0641\u0634\u0644 \u0641\u064A \u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u062E\u0631\u0648\u0641" });
    }
  });
  app2.patch("/api/sheep/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const sheepDoc = await db2.collection("sheep").doc(id).get();
      if (!sheepDoc.exists) {
        return res.status(404).json({ message: "\u0627\u0644\u062E\u0631\u0648\u0641 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
      }
      const validation = insertSheepSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          message: validation.error.errors[0].message
        });
      }
      const data = validation.data;
      await db2.collection("sheep").doc(id).update({
        ...data,
        updatedAt: /* @__PURE__ */ new Date()
      });
      const updatedSheep = await db2.collection("sheep").doc(id).get();
      res.json({ id: updatedSheep.id, ...updatedSheep.data() });
    } catch (error) {
      console.error("Error updating sheep:", error);
      res.status(500).json({ message: error.message || "\u0641\u0634\u0644 \u0641\u064A \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u062E\u0631\u0648\u0641" });
    }
  });
  app2.delete("/api/sheep/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db2.collection("sheep").doc(id).delete();
      res.json({ message: "\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u062E\u0631\u0648\u0641 \u0628\u0646\u062C\u0627\u062D" });
    } catch (error) {
      console.error("Error deleting sheep:", error);
      res.status(500).json({ message: error.message || "\u0641\u0634\u0644 \u0641\u064A \u062D\u0630\u0641 \u0627\u0644\u062E\u0631\u0648\u0641" });
    }
  });
  app2.get("/api/orders", async (_req, res) => {
    try {
      const ordersSnapshot = await db2.collection("orders").orderBy("createdAt", "desc").get();
      const orders = ordersSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt
        };
      });
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: error.message || "\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0627\u0644\u0637\u0644\u0628\u0627\u062A" });
    }
  });
  app2.get("/api/orders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const orderDoc = await db2.collection("orders").doc(id).get();
      if (!orderDoc.exists) {
        return res.status(404).json({ message: "\u0627\u0644\u0637\u0644\u0628 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
      }
      const order = { id: orderDoc.id, ...orderDoc.data() };
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: error.message || "\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0627\u0644\u0637\u0644\u0628" });
    }
  });
  app2.post("/api/orders", async (req, res) => {
    try {
      const validation = insertOrderSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          message: validation.error.errors[0].message
        });
      }
      const data = validation.data;
      const orderDoc = await db2.collection("orders").add({
        ...data,
        status: data.status || "pending",
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      });
      const newOrder = await db2.collection("orders").doc(orderDoc.id).get();
      res.json({ id: newOrder.id, ...newOrder.data() });
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: error.message || "\u0641\u0634\u0644 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0637\u0644\u0628" });
    }
  });
  app2.patch("/api/orders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ message: "\u0627\u0644\u062D\u0627\u0644\u0629 \u0645\u0637\u0644\u0648\u0628\u0629" });
      }
      const orderDoc = await db2.collection("orders").doc(id).get();
      if (!orderDoc.exists) {
        return res.status(404).json({ message: "\u0627\u0644\u0637\u0644\u0628 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
      }
      await db2.collection("orders").doc(id).update({
        status,
        updatedAt: /* @__PURE__ */ new Date()
      });
      const updatedOrder = await db2.collection("orders").doc(id).get();
      res.json({ id: updatedOrder.id, ...updatedOrder.data() });
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).json({ message: error.message || "\u0641\u0634\u0644 \u0641\u064A \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0637\u0644\u0628" });
    }
  });
  app2.delete("/api/orders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db2.collection("orders").doc(id).delete();
      res.json({ message: "\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0637\u0644\u0628 \u0628\u0646\u062C\u0627\u062D" });
    } catch (error) {
      console.error("Error deleting order:", error);
      res.status(500).json({ message: error.message || "\u0641\u0634\u0644 \u0641\u064A \u062D\u0630\u0641 \u0627\u0644\u0637\u0644\u0628" });
    }
  });
  return createServer(app2);
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
  limit: "10mb",
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express2.urlencoded({ extended: false, limit: "10mb" }));
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
  const { config: config2 } = await Promise.resolve().then(() => (init_config(), config_exports));
  server.listen({
    port: config2.port,
    host: config2.host,
    reusePort: true
  }, () => {
    log(`serving on port ${config2.port}`);
  });
})();
