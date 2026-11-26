require("dotenv").config();
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");
const fs = require("fs");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and body parsing
app.use(cors());
app.use(express.json());

// Stateless Session Management (JWT using native crypto)
const SESSION_SECRET = process.env.SESSION_SECRET || "saba-shahid-default-secure-session-key-2026";
const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

function createToken(payload) {
  const tokenPayload = {
    ...payload,
    exp: Date.now() + TOKEN_EXPIRY_MS
  };
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const data = Buffer.from(JSON.stringify(tokenPayload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(`${header}.${data}`)
    .digest("base64url");
  return `${header}.${data}.${signature}`;
}

function verifyToken(token) {
  try {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, data, signature] = parts;

    const expectedSignature = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(`${header}.${data}`)
      .digest("base64url");

    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSignature);
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
    if (!payload || !payload.user) return null;
    if (payload.exp && Date.now() > payload.exp) {
      return null; // Expired token
    }
    return payload;
  } catch (e) {
    return null;
  }
}

// Helper to manually parse cookies (avoids cookie-parser dependency)
function getCookie(req, name) {
  const rc = req.headers.cookie;
  if (!rc) return null;
  const list = {};
  rc.split(";").forEach(cookie => {
    const parts = cookie.split("=");
    list[parts.shift().trim()] = decodeURI(parts.join("="));
  });
  return list[name];
}

// Authentication check middleware
function requireAuth(req, res, next) {
  const token = getCookie(req, "session_token") || (req.headers["authorization"] ? req.headers["authorization"].replace("Bearer ", "") : null);
  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
  }
  const session = verifyToken(token);
  if (!session) {
    return res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
  }
  req.session = session;
  next();
}

// --------------------------------------------------------------------------
// STATIC FILE SERVING - STRICTLY PUBLIC ASSETS ONLY
// --------------------------------------------------------------------------
app.use("/css", express.static(path.join(__dirname, "css"), { maxAge: "1h", etag: true }));
app.use("/js", express.static(path.join(__dirname, "js"), { maxAge: "1h", etag: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads"), { maxAge: "1d", etag: true }));

app.get("/favicon.ico", (req, res) => res.status(204).end());

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

// --------------------------------------------------------------------------
// MEDIA UPLOAD SETUP (MULTER - IN-MEMORY WITH STRICT VALIDATION)
// --------------------------------------------------------------------------
const storage = multer.memoryStorage();

const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".mp4", ".webm"]);
const ALLOWED_MIMES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/webm"
]);

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname || "").toLowerCase();
  const mime = (file.mimetype || "").toLowerCase();
  if (ALLOWED_EXTENSIONS.has(ext) && ALLOWED_MIMES.has(mime)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPG, PNG, WEBP, and MP4/WEBM are allowed."));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB max file size
});

// --------------------------------------------------------------------------
// PUBLIC DYNAMIC API
// --------------------------------------------------------------------------
app.get("/api/public/data", async (req, res) => {
  try {
    const publicData = await db.getPublicData();
    res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
    res.status(200).json({ success: true, data: publicData });
  } catch (error) {
    console.error("Public fetch failed:", error);
    res.status(500).json({ success: false, message: "Failed to load public website data." });
  }
});

// Inquiry Submission Route removed since frontend form was replaced with direct contact cards

// --------------------------------------------------------------------------
// ADMIN AUTHENTICATION ROUTES
// --------------------------------------------------------------------------
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Please enter both username and password." });
  }

  const user = await db.verifyUser(username, password);
  if (user) {
    const token = createToken({ user, createdAt: Date.now() });

    // Set cookie (valid for 24 hours)
    res.setHeader("Set-Cookie", `session_token=${token}; Path=/; HttpOnly; Max-Age=86400; SameSite=Lax`);
    return res.status(200).json({ success: true, token, user });
  }

  return res.status(401).json({ success: false, message: "Invalid username or password." });
});

app.post("/api/auth/logout", (req, res) => {
  res.setHeader("Set-Cookie", `session_token=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax`);
  res.status(200).json({ success: true, message: "Logged out successfully." });
});

app.get("/api/auth/check", (req, res) => {
  const token = getCookie(req, "session_token") || (req.headers["authorization"] ? req.headers["authorization"].replace("Bearer ", "") : null);
  if (token) {
    const session = verifyToken(token);
    if (session) {
      return res.status(200).json({ success: true, user: session.user });
    }
  }
  return res.status(401).json({ success: false, message: "Not authenticated" });
});

app.post("/api/auth/change-password", requireAuth, async (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.trim().length < 6) {
    return res.status(400).json({ success: false, message: "Password must be at least 6 characters long." });
  }

  const success = await db.updateUserPassword(newPassword);
  if (success) {
    return res.status(200).json({ success: true, message: "Password updated successfully." });
  }
  return res.status(500).json({ success: false, message: "Failed to update password." });
});

// --------------------------------------------------------------------------
// SECURE ADMIN CONTROL ROUTES
// --------------------------------------------------------------------------

// Dashboard statistics
app.get("/api/admin/stats", requireAuth, async (req, res) => {
  const inquiries = await db.getInquiries();
  const seo = await db.getItems("seoProjects");
  const wordpress = await db.getItems("wordpressProjects");
  
  res.status(200).json({
    success: true,
    data: {
      stats: {
        totalSeo: seo.length,
        totalFreelance: (await db.getItems("freelanceProjects")).length,
        totalWordPress: wordpress.length,
        totalAI: (await db.getItems("aiProjects")).length,
        totalVideos: (await db.getItems("videoAds")).length,
        totalInquiries: inquiries.length,
        newInquiries: inquiries.filter(i => i.status === "New").length
      },
      recentProjects: [
        ...seo.slice(-3),
        ...wordpress.slice(-3)
      ].slice(-5)
    }
  });
});

// Settings Management
app.get("/api/admin/settings", requireAuth, async (req, res) => {
  res.status(200).json({ success: true, data: await db.getSettings() });
});

app.post("/api/admin/settings", requireAuth, async (req, res) => {
  const updated = await db.updateSettings(req.body);
  if (updated) {
    res.status(200).json({ success: true, data: updated, message: "Settings updated successfully." });
  } else {
    res.status(500).json({ success: false, message: "Failed to save settings." });
  }
});

// Generic Portfolio Category Routes
app.get("/api/admin/projects/:type", requireAuth, async (req, res) => {
  const { type } = req.params;
  res.status(200).json({ success: true, data: await db.getItems(type) });
});

app.get("/api/admin/projects/:type/:id", requireAuth, async (req, res) => {
  const { type, id } = req.params;
  try {
    const item = await db.getItemById(type, id);
    if (item) {
      res.status(200).json({ success: true, data: item });
    } else {
      res.status(404).json({ success: false, message: "Project not found." });
    }
  } catch (error) {
    console.error("Fetch project failed:", error);
    res.status(500).json({ success: false, message: "Failed to fetch project." });
  }
});

app.post("/api/admin/projects/:type", requireAuth, async (req, res) => {
  const { type } = req.params;
  const created = await db.addItem(type, req.body);
  if (created) {
    res.status(201).json({ success: true, data: created, message: "Project created successfully." });
  } else {
    res.status(500).json({ success: false, message: "Failed to create project." });
  }
});

app.put("/api/admin/projects/:type/:id", requireAuth, async (req, res) => {
  const { type, id } = req.params;
  const updated = await db.updateItem(type, id, req.body);
  if (updated) {
    res.status(200).json({ success: true, data: updated, message: "Project updated successfully." });
  } else {
    res.status(500).json({ success: false, message: "Failed to update project." });
  }
});

app.delete("/api/admin/projects/:type/:id", requireAuth, async (req, res) => {
  const { type, id } = req.params;
  const success = await db.deleteItem(type, id);
  if (success) {
    res.status(200).json({ success: true, message: "Project deleted successfully." });
  } else {
    res.status(500).json({ success: false, message: "Failed to delete project." });
  }
});

app.post("/api/admin/projects/:type/:id/duplicate", requireAuth, async (req, res) => {
  const { type, id } = req.params;
  const duplicated = await db.duplicateItem(type, id);
  if (duplicated) {
    res.status(201).json({ success: true, data: duplicated, message: "Project duplicated successfully as Draft." });
  } else {
    res.status(500).json({ success: false, message: "Failed to duplicate project." });
  }
});

app.post("/api/admin/projects/:type/reorder", requireAuth, async (req, res) => {
  const { type } = req.params;
  const { ids } = req.body;
  if (!Array.isArray(ids)) {
    return res.status(400).json({ success: false, message: "Missing parameter: ids array." });
  }
  const success = await db.reorderItems(type, ids);
  if (success) {
    res.status(200).json({ success: true, message: "Ordering updated." });
  } else {
    res.status(500).json({ success: false, message: "Failed to update ordering." });
  }
});

// Testimonials management
app.get("/api/admin/testimonials", requireAuth, async (req, res) => {
  res.status(200).json({ success: true, data: await db.getItems("testimonials") });
});

app.post("/api/admin/testimonials", requireAuth, async (req, res) => {
  const created = await db.addItem("testimonials", req.body);
  if (created) {
    res.status(201).json({ success: true, data: created, message: "Testimonial created." });
  } else {
    res.status(500).json({ success: false, message: "Failed to create testimonial." });
  }
});

app.put("/api/admin/testimonials/:id", requireAuth, async (req, res) => {
  const updated = await db.updateItem("testimonials", req.params.id, req.body);
  if (updated) {
    res.status(200).json({ success: true, data: updated, message: "Testimonial updated." });
  } else {
    res.status(500).json({ success: false, message: "Failed to update testimonial." });
  }
});

app.delete("/api/admin/testimonials/:id", requireAuth, async (req, res) => {
  const success = await db.deleteItem("testimonials", req.params.id);
  if (success) {
    res.status(200).json({ success: true, message: "Testimonial deleted." });
  } else {
    res.status(500).json({ success: false, message: "Failed to delete testimonial." });
  }
});

app.post("/api/admin/testimonials/reorder", requireAuth, async (req, res) => {
  const { ids } = req.body;
  const success = await db.reorderItems("testimonials", ids);
  if (success) {
    res.status(200).json({ success: true, message: "Testimonials reordered." });
  } else {
    res.status(500).json({ success: false, message: "Failed to reorder testimonials." });
  }
});

// FAQs management
app.get("/api/admin/faqs", requireAuth, async (req, res) => {
  res.status(200).json({ success: true, data: await db.getItems("faqs") });
});

app.post("/api/admin/faqs", requireAuth, async (req, res) => {
  const created = await db.addItem("faqs", req.body);
  if (created) {
    res.status(201).json({ success: true, data: created, message: "FAQ created." });
  } else {
    res.status(500).json({ success: false, message: "Failed to create FAQ." });
  }
});

app.put("/api/admin/faqs/:id", requireAuth, async (req, res) => {
  const updated = await db.updateItem("faqs", req.params.id, req.body);
  if (updated) {
    res.status(200).json({ success: true, data: updated, message: "FAQ updated." });
  } else {
    res.status(500).json({ success: false, message: "Failed to update FAQ." });
  }
});

app.delete("/api/admin/faqs/:id", requireAuth, async (req, res) => {
  const success = await db.deleteItem("faqs", req.params.id);
  if (success) {
    res.status(200).json({ success: true, message: "FAQ deleted." });
  } else {
    res.status(500).json({ success: false, message: "Failed to delete FAQ." });
  }
});

app.post("/api/admin/faqs/reorder", requireAuth, async (req, res) => {
  const { ids } = req.body;
  const success = await db.reorderItems("faqs", ids);
  if (success) {
    res.status(200).json({ success: true, message: "FAQs reordered." });
  } else {
    res.status(500).json({ success: false, message: "Failed to reorder FAQs." });
  }
});

// Contact Inquiries management
app.get("/api/admin/inquiries", requireAuth, async (req, res) => {
  res.status(200).json({ success: true, data: await db.getInquiries() });
});

app.put("/api/admin/inquiries/:id", requireAuth, async (req, res) => {
  const { status } = req.body;
  const success = await db.updateInquiryStatus(req.params.id, status);
  if (success) {
    res.status(200).json({ success: true, message: `Inquiry status set to: ${status}.` });
  } else {
    res.status(500).json({ success: false, message: "Failed to update inquiry." });
  }
});

// Media Library
app.get("/api/admin/media", requireAuth, async (req, res) => {
  res.status(200).json({ success: true, data: await db.getMedia() });
});

app.post("/api/admin/media/upload", requireAuth, upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file was uploaded." });
  }

  try {
    let fileInfo = {};
    const ext = path.extname(req.file.originalname).toLowerCase();
    const safeExt = ALLOWED_EXTENSIONS.has(ext) ? ext : ".png";
    const uniqueSuffix = Date.now() + "-" + crypto.randomBytes(8).toString("hex");
    const filename = "media-" + uniqueSuffix + safeExt;

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { put } = require("@vercel/blob");
      const blob = await put(filename, req.file.buffer, {
        access: "public",
        contentType: req.file.mimetype,
        token: process.env.BLOB_READ_WRITE_TOKEN
      });

      fileInfo = {
        filename: filename,
        url: blob.url,
        size: req.file.size,
        mimetype: req.file.mimetype
      };
    } else if (process.env.VERCEL) {
      // Vercel deployment without Blob storage configured
      return res.status(500).json({ 
        success: false, 
        message: "Vercel Blob storage token (BLOB_READ_WRITE_TOKEN) is missing. Please configure it in your Vercel settings." 
      });
    } else {
      // Local fallback
      const uploadsDir = path.join(__dirname, "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const filePath = path.join(uploadsDir, filename);
      await fs.promises.writeFile(filePath, req.file.buffer);

      fileInfo = {
        filename: filename,
        url: `/uploads/${filename}`,
        size: req.file.size,
        mimetype: req.file.mimetype
      };
    }

    const mediaItem = await db.addMedia(fileInfo);
    if (mediaItem) {
      res.status(201).json({ success: true, data: mediaItem, message: "File uploaded successfully." });
    } else {
      res.status(500).json({ success: false, message: "Failed to index file in Media Library." });
    }
  } catch (error) {
    console.error("Upload handler failed:", error);
    res.status(500).json({ success: false, message: "File upload processing failed." });
  }
});

app.delete("/api/admin/media/:id", requireAuth, async (req, res) => {
  const success = await db.deleteMedia(req.params.id);
  if (success) {
    res.status(200).json({ success: true, message: "Media deleted successfully." });
  } else {
    res.status(500).json({ success: false, message: "Failed to delete media item." });
  }
});

// Multer error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || (err && err.message && err.message.includes("Invalid file type"))) {
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err) {
    console.error("Server error:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
  next();
});

// --------------------------------------------------------------------------
// FALLBACK SPA ROUTING
// --------------------------------------------------------------------------
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(` Saba Shahid Portfolio Server running on Port ${PORT}`);
    console.log(` Site is accessible locally at http://localhost:${PORT}`);
    console.log(` Admin panel accessible at http://localhost:${PORT}/admin`);
    console.log(`===================================================`);
  });
}

module.exports = app;
