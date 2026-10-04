const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const applicantRoutes = require("./routes/applicantRoutes");
const admissionApplicationRoutes = require("./routes/admissionApplicationRoutes");

const app = express();

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || true }));
app.use(express.json());
app.use("/api/applicants", applicantRoutes);
app.use("/api/applications", admissionApplicationRoutes);
app.use("/api/admission-applications", admissionApplicationRoutes);

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

async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

startServer();