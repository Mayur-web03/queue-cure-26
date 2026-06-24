require("dotenv").config();

const connectDB = require("./config/db");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const { initializeQueue } = require("./services/queueService");
const initSocket = require("./sockets/socketHandler");

const queueRoutes       = require("./routes/queueRoutes");
const patientRoutes     = require("./routes/patientRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const analyticsRoutes   = require("./routes/analyticsRoutes");

const app    = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("QueueCure Backend Running 🚀");
});

app.use("/queue",        queueRoutes);
app.use("/patients",     patientRoutes);
app.use("/appointments", appointmentRoutes);
app.use("/analytics",    analyticsRoutes);

// Socket
initSocket(io);

// Startup
const PORT = process.env.PORT || 4000;

connectDB().then(() => {
  initializeQueue();
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});