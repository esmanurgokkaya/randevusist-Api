// src/index.js

const express = require("express");
const http = require("http");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();
const { WebSocketServer } = require("ws");

// Utils
const logger = require("./src/utils/logger");

// Middleware
const { handleAuthError } = require("./src/middleware/authMiddleware");

// Swagger
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./docs/swagger");

// Routes
const authRoutes = require("./src/routes/authRoute");
const userRoutes = require("./src/routes/userRoute");
const roomRoutes = require("./src/routes/roomRoute");
const reservationRoutes = require("./src/routes/reservationRoute");
const permissionRoutes = require("./src/routes/permissionRoute");
const roleRoutes = require("./src/routes/roleRoute");
const rolePermissionRoutes = require("./src/routes/rolePermissionRoute");

// App initialization
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// WebSocket initialization
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("🔌 Yeni bir WebSocket istemcisi bağlandı.");
  ws.send(JSON.stringify({ type: "info", message: "WebSocket bağlantısı kuruldu." }));
});

// Attach WebSocket to all requests
app.use((req, res, next) => {
  req.wss = wss;
  next();
});

// Middleware
app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));
app.use(morgan("dev"));
app.use(morgan("combined", {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
}));

// Routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/rooms", roomRoutes);
app.use("/reservations", reservationRoutes);
app.use("/roles", roleRoutes);
app.use("/role-permissions", rolePermissionRoutes);
app.use("/admin", permissionRoutes);

// Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Global error handler
app.use(handleAuthError);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Sunucu ${PORT} portunda çalışıyor.`);
});
