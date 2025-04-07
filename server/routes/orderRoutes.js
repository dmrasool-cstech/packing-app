import express from "express";
import {
  completeDelivery,
  createOrder,
  getOrderById,
  getOrders,
  hookOrderId,
  todayDelivers,
  updateOrder,
  updatePaymentStatus,
} from "../controllers/orderController.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the upload folder path
const uploadPath = path.join(__dirname, "../uploads");

// Ensure the uploads directory exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
  console.log("✅ Upload directory created:", uploadPath);
} else {
  console.log("✔️ Upload directory already exists:", uploadPath);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage });

const router = express.Router();

router.post("/create", upload.single("image"), createOrder);
router.get("/today", todayDelivers);
router.get("/all", getOrders);
router.get("/:orderId", getOrderById);
router.put("/webhook/qr-scan", hookOrderId);
router.post("/update/:id", upload.single("image"), updateOrder);
router.patch("/update/:id", updatePaymentStatus);
router.post("/complete/:orderId", completeDelivery);

export default router;
