import express from "express";
import Order from "../models/Order.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Get All Deliveries
router.get("/all-deliveries", authMiddleware, async (req, res) => {
  try {
    const deliveries = await Order.find();
    res.json(deliveries);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Get Today's Deliveries
router.get("/today-deliveries", authMiddleware, async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const deliveries = await Order.find({
      deliveredAt: { $gte: startOfDay, $lt: endOfDay },
      deliveryStatus: "Delivered",
    });

    res.json(deliveries);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Search Order by Order ID
router.get("/search/:orderId", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

export default router;
