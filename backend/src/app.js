const express = require("express");
const cors = require("cors");
const path = require("path");
const { requireDb, isDbReady } = require("./config/db");

const authRoutes = require("./routes/auth");
const registrationRoutes = require("./routes/registrations");
const eventRoutes = require("./routes/events");
const teamRoutes = require("./routes/team");
const adminRoutes = require("./routes/admins");
const auditRoutes = require("./routes/audit");
const checkinRoutes = require("./routes/checkin");
const feedbackRoutes = require("./routes/feedback");

const app = express();

// Allowed browser origins (CORS). FRONTEND_URL + CORS_ORIGINS are merged,
// both accept comma-separated lists — set them in Vercel dashboard for deploys.
const allowedOrigins = [process.env.FRONTEND_URL, process.env.CORS_ORIGINS]
  .filter(Boolean)
  .flatMap((value) => String(value).split(","))
  .map((value) => value.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header
      // (Postman, server-to-server requests, etc.)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn(`[CORS] Blocked origin: ${origin}`);
      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.options("*", cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// Uploaded team/event photos.
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "SEBC API server running",
    db: isDbReady() ? "connected" : "not-connected",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/events", requireDb, eventRoutes);
app.use("/api/team", requireDb, teamRoutes);
app.use("/api/admins", requireDb, adminRoutes);
app.use("/api/audit", requireDb, auditRoutes);
app.use("/api/checkin", checkinRoutes);
app.use("/api/feedback", feedbackRoutes);

app.use("/api", (req, res) => {
  res.status(404).json({ error: "API route not found" });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err && err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON body" });
  }
  console.error("[unhandled]", err.message);
  res.status(500).json({ error: "Something went wrong" });
});

module.exports = app;
