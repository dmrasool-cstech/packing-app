import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
// import otpRoutes from "./routes/otpRoutes.js";
// import adminRoutes from "./routes/adminRoutes.js";
import branchRoutes from "./routes/branchRoutes.js";

import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000", // Allow Next.js frontend
    credentials: true, // Allow cookies & auth headers
  })
);

// Convert ES module paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files (uploaded images)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("server is running");
});

// Routes
app.use("/api/auth", userRoutes);
app.use("/api/orders", orderRoutes);
// app.use("/api/otp", otpRoutes);
app.use("/api/branches", branchRoutes);

// app.use("/api/admin", adminRoutes);
// app.use('/api/delivery', deliveryRoutes);

// Database Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`Server running on port http://localhost:${PORT}`)
);
