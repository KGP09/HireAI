process.on("uncaughtException", (err) => {
  console.error("🔥 UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("🔥 UNHANDLED PROMISE REJECTION:", err);
});

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { Db } from "./utils/db.js";
import authRoutes from "./routes/auth.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import testRoutes from "./routes/tests.routes.js";
import speechRoutes from "./routes/speech.routes.js";
import cookieParser from "cookie-parser";
import { app, server } from "./utils/socket.io.js";
import userRoutes from "./routes/user.routes.js";

dotenv.config();
const PORT = process.env.PORT;
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/user", userRoutes);
app.use("/api/speech", speechRoutes);

// console.log("Registered Routes:");
// app._router.stack.forEach((r) => {
//   if (r.route && r.route.path) console.log(`Route: ${r.route.path}`);
//   if (r.name === 'router') {
//     r.handle.stack.forEach((handler) => {
//       if (handler.route) console.log(`Nested Route: ${handler.route.path}`);
//     });
//   }
// });

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  Db();
});