import http from "http";
import express from "express";
import cors from "cors";
import { LingoDotDevEngine } from "lingo.dev/sdk";
import dotenv from "dotenv";
import { Server } from "socket.io";
import conversationsRoutes from "./routes/conversations.js";

dotenv.config();

const lingoDotDev = new LingoDotDevEngine({
  apiKey: process.env.LINGODOTDEV_API_KEY,
});

const app = express();
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: CLIENT_ORIGIN, methods: ["GET", "POST"] }));
app.use(express.json());

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: CLIENT_ORIGIN, methods: ["GET", "POST"] },
});

app.use(
  "/api",
  conversationsRoutes({
    io,
    lingoDotDev,
  }),
);

// Websocket events
io.on("connection", (socket) => {
  console.log("[WebSocket] Client connected:", socket.id);

  // Agent joins to receive real-time updates
  socket.on("agent_join", () => {
    console.log("[WebSocket] Agent joined:", socket.id);
    socket.join("agents");
  });

  socket.on("disconnect", () => {
    console.log("[WebSocket] Client disconnected:", socket.id);
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║      Lebab Language Mediation Server       ║
╚════════════════════════════════════════════╝

Server running on: http://localhost:${PORT}
Client origin:     ${CLIENT_ORIGIN}

API Endpoints:
  GET  /api/conversations          - List all conversations
  GET  /api/conversations/:id      - Get conversation details
  POST /api/messages               - Ingest customer message
  POST /api/conversations/:id/reply - Send agent reply

WebSocket Events:
  → new_message          - New message in conversation
  → conversation_updated - Conversation list updated

Ready to mediate languages! 🚀
  `);
});

// Shutdown handling

process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
  });
});
