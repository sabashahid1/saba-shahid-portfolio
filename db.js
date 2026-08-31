const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DB_FILE = path.join(__dirname, "data", "db.json");

// Helper to hash passwords securely using native crypto
function hashPassword(password, salt = null) {
  if (!salt) {
    salt = crypto.randomBytes(16).toString("hex");
  }
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return { salt, hash };
}

// Default Seed Data (fallback if no local database exists)
const defaultSeedData = {
  users: [
    {
      id: "admin-user",
      username: "admin",
      email: "sabaashahidd111@gmail.com",
      ...hashPassword("SabaAdmin2026!")
    }
  ],
  settings: {
    name: "Saba Shahid",
    email: "sabaashahidd111@gmail.com",
    phone: "03232143758",
    bio: "SEO • WordPress • Social Media Marketing",
    footerDesc: "Helping businesses improve their online visibility, search rankings, website performance, and digital footprint.",
    socialLinks: {
      linkedin: "https://linkedin.com/",
      twitter: "https://twitter.com/",
      github: "https://github.com/"
    }
  },
  seoProjects: [],
  freelanceProjects: [],
  wordpressProjects: [],
  aiProjects: [],
  videoAds: [
    {
      id: "v1",
      name: "Social Media Product Ad",
      category: "Product Showcase",
      videoUrl: "https://exit109.com/~dnn/clips/RW20seconds_1.mp4",
      thumbnailUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ar=9:16",
      status: "Published",
      order: 1
    },
    {
      id: "v2",
      name: "Fashion Brand Reel",
      category: "Fashion & Lifestyle",
      videoUrl: "https://exit109.com/~dnn/clips/RW20seconds_2.mp4",
      thumbnailUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ar=9:16",
      status: "Published",
      order: 2
    },
    {
      id: "v3",
      name: "Restaurant Promotional Ad",
      category: "Food & Beverage",
      videoUrl: "https://exit109.com/~dnn/clips/RW20seconds_1.mp4",
      thumbnailUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ar=9:16",
      status: "Published",
      order: 3
    },
    {
      id: "v4",
      name: "Beauty Product Advertisement",
      category: "Cosmetics & Beauty",
      videoUrl: "https://exit109.com/~dnn/clips/RW20seconds_2.mp4",
      thumbnailUrl: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ar=9:16",
      status: "Published",
      order: 4
    },
    {
      id: "v5",
      name: "Real Estate Social Media Ad",
      category: "Real Estate",
      videoUrl: "https://exit109.com/~dnn/clips/RW20seconds_1.mp4",
      thumbnailUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ar=9:16",
      status: "Published",
      order: 5
    },
    {
      id: "v6",
      name: "E-commerce Product Ad",
      category: "E-commerce",
      videoUrl: "https://exit109.com/~dnn/clips/RW20seconds_2.mp4",
      thumbnailUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ar=9:16",
      status: "Published",
      order: 6
    },
    {
      id: "v7",
      name: "Brand Awareness Reel",
      category: "Brand Identity",
      videoUrl: "https://exit109.com/~dnn/clips/RW20seconds_1.mp4",
      thumbnailUrl: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ar=9:16",
      status: "Published",
      order: 7
    },
    {
      id: "v8",
      name: "Promotional Sale Ad",
      category: "Seasonal Sale",
      videoUrl: "https://exit109.com/~dnn/clips/RW20seconds_2.mp4",
      thumbnailUrl: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ar=9:16",
      status: "Published",
      order: 8
    },
    {
      id: "v9",
      name: "Service-Based Business Ad",
      category: "Business Services",
      videoUrl: "https://exit109.com/~dnn/clips/RW20seconds_1.mp4",
      thumbnailUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ar=9:16",
      status: "Published",
      order: 9
    },
    {
      id: "v10",
      name: "AI Video Advertisement",
      category: "AI & Tech",
      videoUrl: "https://exit109.com/~dnn/clips/RW20seconds_2.mp4",
      thumbnailUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ar=9:16",
      status: "Published",
      order: 10
    }
  ],
  testimonials: [],
  faqs: [],
  inquiries: [],
  media: []
};

// Dynamically load initial data from local db.json if available
let defaultData = defaultSeedData;
try {
  if (fs.existsSync(DB_FILE)) {
    defaultData = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  }
} catch (error) {
  console.warn("Failed to pre-load local db.json, using hardcoded defaults:", error);
}

// Cached connections
let pgPool = null;
let mongoClient = null;

function getPgPool() {
  if (!pgPool) {
    const { Pool } = require("pg");
    pgPool = new Pool({
      connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
  }
  return pgPool;
}

async function getMongoClient() {
  if (!mongoClient) {
    const { MongoClient } = require("mongodb");
    mongoClient = new MongoClient(process.env.MONGODB_URI);
    await mongoClient.connect();
  }
  return mongoClient;
}

// Initialize database
async function init() {
  if (process.env.MONGODB_URI) {
    // Seeding MongoDB if collection empty
    try {
      const client = await getMongoClient();
      const col = client.db().collection("portfolio");
      const doc = await col.findOne({ _id: "main_db" });
      if (!doc) {
        await col.insertOne({ _id: "main_db", data: defaultData });
        console.log("MongoDB collection initialized and seeded.");
      }
    } catch (err) {
      console.error("Error initializing MongoDB:", err);
    }
  } else if (process.env.POSTGRES_URL || process.env.DATABASE_URL) {
    // Seeding PostgreSQL if table/row empty
    try {
      const pool = getPgPool();
      await pool.query(
        "CREATE TABLE IF NOT EXISTS portfolio_db (id VARCHAR(255) PRIMARY KEY, data TEXT NOT NULL)"
      );
      const res = await pool.query("SELECT data FROM portfolio_db WHERE id = $1", ["main_db"]);
      if (res.rows.length === 0) {
        await pool.query("INSERT INTO portfolio_db (id, data) VALUES ($1, $2)", [
          "main_db",
          JSON.stringify(defaultData)
        ]);
        console.log("PostgreSQL database initialized and seeded.");
      }
    } catch (err) {
      console.error("Error initializing PostgreSQL:", err);
    }
  } else {
    // Local JSON
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const uploadsDir = path.join(__dirname, "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), "utf8");
        console.log("JSON Database file initialized and seeded.");
      }
    } catch (err) {
      console.warn("Failed to initialize local filesystem database (likely running on read-only serverless environment like Vercel):", err.message);
    }
  }
}

// Read database
async function read() {
  await init();

  if (process.env.MONGODB_URI) {
    try {
      const client = await getMongoClient();
      const col = client.db().collection("portfolio");
      const doc = await col.findOne({ _id: "main_db" });
      return doc ? doc.data : defaultData;
    } catch (error) {
      console.error("Error reading from MongoDB:", error);
      return defaultData;
    }
  } else if (process.env.POSTGRES_URL || process.env.DATABASE_URL) {
    try {
      const pool = getPgPool();
      const res = await pool.query("SELECT data FROM portfolio_db WHERE id = $1", ["main_db"]);
      return res.rows.length > 0 ? JSON.parse(res.rows[0].data) : defaultData;
    } catch (error) {
      console.error("Error reading from PostgreSQL:", error);
      return defaultData;
    }
  } else {
    try {
      if (fs.existsSync(DB_FILE)) {
        const content = await fs.promises.readFile(DB_FILE, "utf8");
        return JSON.parse(content);
      }
      return defaultData;
    } catch (error) {
      console.error("Error reading local database file:", error);
      return defaultData;
    }
  }
}

// Write database
async function write(data) {
  await init();

  if (process.env.MONGODB_URI) {
    try {
      const client = await getMongoClient();
      const col = client.db().collection("portfolio");
      await col.updateOne({ _id: "main_db" }, { $set: { data } }, { upsert: true });
      return true;
    } catch (error) {
      console.error("Error writing to MongoDB:", error);
      return false;
    }
  } else if (process.env.POSTGRES_URL || process.env.DATABASE_URL) {
    try {
      const pool = getPgPool();
      await pool.query(
        "INSERT INTO portfolio_db (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data",
        ["main_db", JSON.stringify(data)]
      );
      return true;
    } catch (error) {
      console.error("Error writing to PostgreSQL:", error);
      return false;
    }
  } else {
    try {
      await fs.promises.writeFile(DB_FILE, JSON.stringify(data, null, 2), "utf8");
      return true;
    } catch (error) {
      console.error("Error writing local database file:", error);
      return false;
    }
  }
}

// Exported controllers
module.exports = {
  // Public data dump for the frontend SPA
  async getPublicData() {
    const db = await read();
    return {
      settings: db.settings,
      seoProjects: (db.seoProjects || []).filter(p => p.status === "Published").sort((a, b) => a.order - b.order),
      freelanceProjects: (db.freelanceProjects || []).filter(p => p.status === "Published").sort((a, b) => a.order - b.order),
      wordpressProjects: (db.wordpressProjects || []).filter(p => p.status === "Published").sort((a, b) => a.order - b.order),
      aiProjects: (db.aiProjects || []).filter(p => p.status === "Published").sort((a, b) => a.order - b.order),
      videoAds: (db.videoAds || []).filter(v => v.status === "Published").sort((a, b) => a.order - b.order),
      testimonials: (db.testimonials || []).filter(t => t.status === "Published").sort((a, b) => a.order - b.order),
      faqs: (db.faqs || []).filter(f => f.status === "Published").sort((a, b) => a.order - b.order)
    };
  },

  // Auth Operations
  async verifyUser(username, password) {
    // 1. Environment Variable Override (Highly recommended for Vercel/Production deployment)
    const envUsername = process.env.ADMIN_USERNAME;
    const envPassword = process.env.ADMIN_PASSWORD;
    if (envUsername && envPassword) {
      if ((username === envUsername || username === "sabaashahidd111@gmail.com") && password === envPassword) {
        return { id: "admin-user", username: envUsername, email: "sabaashahidd111@gmail.com" };
      }
    }

    // 2. Database verification fallback
    const db = await read();
    let user = (db.users || []).find(u => u.username === username || u.email === username);
    
    // Dynamic Seeding Fallback: If admin user is missing from active DB (PostgreSQL/MongoDB/JSON), inject the default admin credentials.
    if (!user && username === "admin") {
      const defaultAdmin = {
        id: "admin-user",
        username: "admin",
        email: "sabaashahidd111@gmail.com",
        salt: "bb69cf45d80e0011fc4b90ad6b41a869",
        hash: "4af9b35dac049dce6951a85734ac5c4fcb0f4c74bb349d67c4440072bf17784cb5183e5062048b4fef2905453a4dc917819498ca61de091c950418ad3fe7cef6"
      };
      if (!db.users) db.users = [];
      db.users.push(defaultAdmin);
      await write(db);
      user = defaultAdmin;
    }

    if (!user) return null;

    const { hash } = hashPassword(password, user.salt);
    if (hash === user.hash) {
      return { id: user.id, username: user.username, email: user.email };
    }
    return null;
  },

  async updateUserPassword(newPassword) {
    const db = await read();
    const admin = (db.users || []).find(u => u.id === "admin-user");
    if (!admin) return false;

    const credentials = hashPassword(newPassword);
    admin.salt = credentials.salt;
    admin.hash = credentials.hash;
    return await write(db);
  },

  // Settings
  async getSettings() {
    const db = await read();
    return db.settings;
  },

  async updateSettings(newSettings) {
    const db = await read();
    db.settings = { ...db.settings, ...newSettings };
    return (await write(db)) ? db.settings : null;
  },

  // Portfolio items (CRUD)
  async getItems(type) {
    const db = await read();
    if (!db[type]) return [];
    return db[type].sort((a, b) => a.order - b.order);
  },

  async getItemById(type, id) {
    const db = await read();
    if (!db[type]) return null;
    return db[type].find(item => item.id === id) || null;
  },

  async addItem(type, data) {
    const db = await read();
    if (!db[type]) db[type] = [];

    const id = data.id || crypto.randomBytes(8).toString("hex");
    const order = db[type].length > 0 ? Math.max(...db[type].map(o => o.order || 0)) + 1 : 1;
    
    const newItem = { id, ...data, order };
    db[type].push(newItem);
    
    return (await write(db)) ? newItem : null;
  },

  async updateItem(type, id, data) {
    const db = await read();
    if (!db[type]) return null;

    const index = db[type].findIndex(item => item.id === id);
    if (index === -1) return null;

    // Preserving order and id parameters
    const existing = db[type][index];
    db[type][index] = { ...existing, ...data, id, order: existing.order };
    
    return (await write(db)) ? db[type][index] : null;
  },

  async deleteItem(type, id) {
    const db = await read();
    if (!db[type]) return false;

    const index = db[type].findIndex(item => item.id === id);
    if (index === -1) return false;

    db[type].splice(index, 1);
    
    // Normalize ordering numbers
    db[type].forEach((item, idx) => {
      item.order = idx + 1;
    });

    return await write(db);
  },

  async duplicateItem(type, id) {
    const db = await read();
    if (!db[type]) return null;

    const item = db[type].find(item => item.id === id);
    if (!item) return null;

    const newId = `${item.id}-copy-${crypto.randomBytes(3).toString("hex")}`;
    const order = db[type].length > 0 ? Math.max(...db[type].map(o => o.order || 0)) + 1 : 1;

    // Deep clone to ensure total independence of arrays and nested fields
    const copy = JSON.parse(JSON.stringify(item));
    copy.id = newId;
    copy.order = order;
    copy.status = "Draft";

    if (copy.name) copy.name = `${copy.name} (Copy)`;
    if (copy.question) copy.question = `${copy.question} (Copy)`;
    if (copy.title) copy.title = `${copy.title} (Copy)`;

    db[type].push(copy);
    return (await write(db)) ? copy : null;
  },

  async reorderItems(type, idArray) {
    const db = await read();
    if (!db[type]) return false;

    idArray.forEach((id, idx) => {
      const item = db[type].find(i => i.id === id);
      if (item) {
        item.order = idx + 1;
      }
    });

    return await write(db);
  },

  // Media Library Queries
  async getMedia() {
    const db = await read();
    return db.media || [];
  },

  async addMedia(fileInfo) {
    const db = await read();
    if (!db.media) db.media = [];
    
    const mediaItem = {
      id: crypto.randomBytes(8).toString("hex"),
      filename: fileInfo.filename,
      url: fileInfo.url, // Expecting full URL (local path or Vercel Blob URL)
      size: fileInfo.size,
      mimetype: fileInfo.mimetype,
      uploadedAt: new Date().toISOString()
    };

    db.media.push(mediaItem);
    return (await write(db)) ? mediaItem : null;
  },

  async deleteMedia(id) {
    const db = await read();
    if (!db.media) return false;

    const index = db.media.findIndex(m => m.id === id);
    if (index === -1) return false;

    const mediaItem = db.media[index];
    
    // Delete file safely
    if (mediaItem.url.startsWith("http") && process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const { del } = require("@vercel/blob");
        await del(mediaItem.url, { token: process.env.BLOB_READ_WRITE_TOKEN });
      } catch (error) {
        console.error("Error deleting from Vercel Blob:", error);
      }
    } else {
      const filePath = path.join(__dirname, "uploads", mediaItem.filename);
      try {
        if (fs.existsSync(filePath)) {
          await fs.promises.unlink(filePath);
        }
      } catch (error) {
        console.error("Error deleting physical file:", error);
      }
    }

    db.media.splice(index, 1);
    return await write(db);
  },

  // Contact Inquiries Queries
  async getInquiries() {
    const db = await read();
    return db.inquiries || [];
  },

  async addInquiry(inquiryData) {
    const db = await read();
    if (!db.inquiries) db.inquiries = [];

    const newInquiry = {
      id: crypto.randomBytes(8).toString("hex"),
      ...inquiryData,
      date: new Date().toISOString(),
      status: "New"
    };

    db.inquiries.push(newInquiry);
    await write(db);
    return newInquiry;
  },

  async updateInquiryStatus(id, newStatus) {
    const db = await read();
    if (!db.inquiries) return false;

    const inquiry = db.inquiries.find(i => i.id === id);
    if (!inquiry) return false;

    inquiry.status = newStatus;
    return await write(db);
  }
};
