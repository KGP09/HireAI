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
import cookieParser from "cookie-parser";
import { app, server } from "./utils/socket.io.js";
import userRoutes from "./routes/user.routes.js";

dotenv.config();
const PORT = process.env.PORT;
app.use(express.json({ limit: "10mb" })); // Adjust the limit as per your requirement
app.use(express.urlencoded({ limit: "10mb", extended: true })); // Adjust the limit as per your requirement
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
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  Db();
});