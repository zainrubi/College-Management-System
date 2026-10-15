const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const path = require("path");
const express = require("express");
const cors = require("cors");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const connectDB = require("./config/db");
const applicantRoutes = require("./routes/applicantRoutes");
const admissionApplicationRoutes = require("./routes/admissionApplicationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const studentRoutes = require("./routes/studentRoutes");

const app = express();

const allowedOrigins = new Set([
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3001",
  ...(process.env.FRONTEND_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
]);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }
    // In local development, permit requests from localhost dev servers on any port
    if (process.env.NODE_ENV !== "production") {
      try {
        const parsed = new URL(origin);
        if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
          return callback(null, true);
        }
      } catch {
        // Ignore invalid URL parse errors
      }
    }
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-applicant-id", "x-student-id"],
}));
app.use(express.json());
app.use("/api/applicants", applicantRoutes);
app.use("/api/applications", admissionApplicationRoutes);
app.use("/api/admission-applications", admissionApplicationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/students", studentRoutes);

app.get("/", (req, res) => {
  res.send("College website backend is running!");
});

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({ message: "Request body must be valid JSON" });
  }

  console.error("Unhandled server error:", error.message);
  return res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;

async function ensureApplicantIndexes() {
  try {
    const Applicant = require("./models/Applicant");
    const indexes = await Applicant.collection.indexes();
    const emailIndex = indexes.find(
      (idx) => idx.name === "email_1" || (idx.key && idx.key.email && idx.unique)
    );
    if (emailIndex) {
      await Applicant.collection.dropIndex(emailIndex.name);
      console.log(`Dropped legacy unique email index (${emailIndex.name}) from applicants collection`);
    }
  } catch (error) {
    if (error.codeName !== "IndexNotFound" && error.code !== 27) {
      console.warn("Notice checking applicant indexes:", error.message);
    }
  }
}

async function startServer() {
  const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  try {
    await connectDB();
    await ensureApplicantIndexes();
  } catch (error) {
    console.warn("MongoDB connection notice:", error.message);
    console.warn("Express server remains active for admin authentication and independent routes.");

    if (process.env.NODE_ENV !== "test") {
      const mongoose = require("mongoose");
      const retryTimer = setInterval(async () => {
        if (mongoose.connection.readyState === 0) {
          try {
            await connectDB();
            await ensureApplicantIndexes();
            clearInterval(retryTimer);
          } catch {
            // Silently wait for next interval
          }
        } else if (mongoose.connection.readyState === 1) {
          clearInterval(retryTimer);
        }
      }, 10000);
      retryTimer.unref();
    }
  }

  return server;
}

startServer();