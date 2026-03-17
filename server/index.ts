import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { createServer as createViteServer } from "vite";
import path from "path";
import { handleSocketMessage, handleDisconnect } from "./socket-handlers";

async function startServer() {
  const app = express();
  const server = createServer(app);
  const wss = new WebSocketServer({ server });

  const PORT = 3000;

  wss.on("connection", (ws) => {
    const id = Math.random().toString(36).substring(7);
    console.log(`New connection: ${id}`);

    ws.on("message", (message) => {
      handleSocketMessage(ws, wss, id, message.toString());
    });

    ws.on("close", () => {
      handleDisconnect(id, wss);
    });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
