import Order from "../models/Order.js";
import User from "../models/User.js";
// import WebhookData from "../models/webhook.js";
// import authMiddleware from "../middleware/authMiddleware.js";

// Create Order (via QR scan or manual entry)
export const createOrder = async (req, res) => {
  try {
    const {
      orderId,
      customerName,
      address,
      packageDetails,
      status,
      paymentStatus,
    } = req.body;
    // Check if an image was uploaded
    // console.log(req.body);
    const image = req.file ? `uploads/${req.file.filename}` : null;
    const existingOrder = await Order.findOne({ orderId });
    if (existingOrder)
      return res.status(400).json({ message: "Order ID already exists" });

    const newOrder = new Order({
      orderId,
      customerName,
      address,
      packageDetails: {
        ...packageDetails,
        ...(image && { image }), // Add image only if uploaded
      },
      status,
      paymentStatus,
    });

    await newOrder.save();
    res
      .status(201)
      .json({ message: "Order created successfully", order: newOrder });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// // Fetch All Orders
// export const orders = async (req, res) => {
//   try {
//     const orders = await Order.find().sort({ createdAt: -1 });
//     res.json(orders);
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error });
//   }
// };

// Fetch Order by ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      orderId: new RegExp(`^${req.params.orderId}$`, "i"),
    });

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Update Order Status
export const updateOrder = async (req, res) => {
  try {
    const {
      name,
      email,
      dob,
      mobile,
      address,
      packageDetails,
      status,
      paymentStatus,
      deliveryStatus,
      price,
    } = req.body;

    const image = req.file ? `uploads/${req.file.filename}` : null;

    // Extract and normalize orderId
    const inputId = req.params.id;
    const upperCaseOrderId = inputId.toUpperCase();
    const lowerCaseOrderId = inputId.toLowerCase();

    // Find existing order using either uppercase or lowercase match
    const existingOrder = await Order.findOne({
      $or: [{ orderId: upperCaseOrderId }, { orderId: lowerCaseOrderId }],
    });

    if (!existingOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if only customer fields (name, email, mobile) are being updated
    const isOnlyCustomerFieldsUpdated =
      name !== undefined &&
      email !== undefined &&
      mobile !== undefined &&
      dob === undefined &&
      address === undefined &&
      packageDetails === undefined &&
      status === undefined &&
      paymentStatus === undefined &&
      deliveryStatus === undefined &&
      price === undefined;

    console.log(
      "Is Only Customer Fields Updated:",
      isOnlyCustomerFieldsUpdated
    );

    // Build update object dynamically
    const updateFields = {
      "customer.name": name || existingOrder.customer.name,
      "customer.email": email || existingOrder.customer.email,
      "customer.mobile": mobile || existingOrder.customer.mobile,
      "customer.dob": dob || existingOrder.customer.dob,
      "customer.address": address || existingOrder.customer.address,
      "packageDetails.title":
        packageDetails?.title || existingOrder.packageDetails.title,
      "packageDetails.image": image || existingOrder.packageDetails.image,
      "packageDetails.quantity":
        packageDetails?.quantity || existingOrder.packageDetails.quantity,
      status: status || existingOrder.status,
      paymentStatus: paymentStatus || existingOrder.paymentStatus,
      deliveryStatus: isOnlyCustomerFieldsUpdated
        ? "delivered"
        : deliveryStatus || existingOrder.deliveryStatus,
      price: price || existingOrder.price,
    };

    // console.log("updateFields.deliveryStatus:", updateFields.deliveryStatus);

    // Update the order using the same case-insensitive match
    const updatedOrder = await Order.findOneAndUpdate(
      {
        $or: [{ orderId: upperCaseOrderId }, { orderId: lowerCaseOrderId }],
      },
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order update failed" });
    }

    res.json({ message: "Order updated successfully", order: updatedOrder });
  } catch (error) {
    console.error("Update Order Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// export const hookOrderId = async (req, res) => {
//   //   console.log(req.body);
//   try {
//     const { orderId } = req.body;

//     if (!orderId) {
//       console.warn("⚠️ Invalid webhook payload: Missing orderId");
//       return res.status(200).send("Webhook received with invalid data");
//     }

//     const saveWebhookInfo = await Order.findOneAndUpdate(
//       { "zorder.cashmemo.orderId": orderId },
//       { "zorder.cashmemo": req.body },
//       { upsert: true }
//     );

//     if (saveWebhookInfo) {
//       console.log(
//         `✅ Webhook info saved for Order ${saveWebhookInfo.intent_no}`
//       );
//     }
//     res.status(201).json({ message: "Data received and stored successfully" });
//   } catch (error) {
//     console.error("🚨 Webhook processing error:", error);
//     return res.status(200).send("Webhook received. Internal processing error.");
//   }
// };

// export const hookOrderId = async (req, res) => {
//   try {
//     const body = req.body;
//     // console.log(re)
//     // if (!orderId) {
//     //   console.warn("⚠️ Invalid webhook payload: Missing orderId");
//     //   return res
//     //     .status(400)
//     //     .json({ message: "Invalid webhook payload: Missing orderId" });
//     // }

//     // const storeData =  await Order.
//     // const existingOrder = await Order.findOneAndUpdate({
//     //   "zorder.cashmemo.orderId": orderId,
//     // });

//     // if (existingOrder) {
//     //   console.log(
//     //     `⚠️ Duplicate entry detected: Order ${orderId} already exists.`
//     //   );
//     //   return res
//     //     .status(200)
//     //     .json({ message: "Duplicate order: This order is already saved." , body});
//     // }

//     // // ✅ Save new order if not duplicate
//     // const saveWebhookInfo = await Order.findOneAndUpdate(
//     //   { orderId },
//     //   { $set: { "zorder.cashmemo": req.body } },
//     //   { upsert: true, new: true } // Upsert ensures new entry if not found
//     // );

//     // console.log(`✅ Webhook info saved for Order ${orderId}`);

//     // res.status(201).json({
//     //   message: "Data received and stored successfully",
//     //   order: saveWebhookInfo,
//     // });

//     // const
//   } catch (error) {
//     console.error("🚨 Webhook processing error:", error);
//     return res.status(500).json({ message: "Internal processing error." });
//   }
// };

// import Order from "../models/Order.js"; // Ensure correct model import

// export const hookOrderId = async (req, res) => {

// };
export const hookOrderId = async (req, res) => {
  try {
    const {
      orderId,
      customerName,
      customerEmail,
      customerMobile,
      orderItems,
      branch,
      orderDate,
      paymentStatus,
      deliveryStatus,
      orderValue,
      contentHash,
      rowId,
      rowNo,
    } = req.body;

    // console.log(req.body);

    if (
      !orderId ||
      !customerName ||
      !customerEmail ||
      !customerMobile ||
      !orderItems ||
      !orderValue
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingOrder = await Order.findOne({ orderId });

    if (existingOrder) {
      // Update existing order
      existingOrder.customerName = customerName;
      existingOrder.customerEmail = customerEmail;
      existingOrder.customerMobile = customerMobile;
      existingOrder.orderItems = orderItems;
      existingOrder.branch = branch;
      existingOrder.orderDate = orderDate;
      existingOrder.paymentStatus = paymentStatus;
      existingOrder.deliveryStatus = deliveryStatus;
      existingOrder.orderValue = orderValue;
      existingOrder.contentHash = contentHash;
      existingOrder.rowId = rowId;
      existingOrder.rowNo = rowNo;

      await existingOrder.save();
      return res
        .status(200)
        .json({ message: "Order updated successfully", order: existingOrder });
    } else {
      // Insert new order
      const newOrder = new Order({
        orderId,
        customerName,
        customerEmail,
        customerMobile,
        orderItems,
        branch,
        orderDate,
        paymentStatus,
        deliveryStatus,
        orderValue,
        contentHash,
        rowId,
        rowNo,
      });

      await newOrder.save();
      return res
        .status(201)
        .json({ message: "Order created successfully", order: newOrder });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    if (!paymentStatus) {
      return res.status(400).json({ message: "Payment status is required" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { paymentStatus },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res
      .status(200)
      .json({ message: "Payment status updated", order: updatedOrder });
  } catch (error) {
    console.error("Error updating payment status:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const completeDelivery = async (req, res) => {
  try {
    const { orderId, name, email, mobile, address } = req.body;

    let order = await Order.findOne({ orderId });
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.deliveryStatus === "Delivered") {
      return res.status(400).json({ message: "Order already delivered" });
    }

    // Update order details
    order.customer = { name, email, mobile, address };
    order.deliveryStatus = "Delivered";
    order.deliveredAt = new Date();

    await order.save();

    res.json({ message: "Delivery completed successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get Today's Deliveries
export const todayDelivers = async (req, res) => {
  //   console.log(req.body);
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    // console.log(startOfDay);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayOrders = await Order.find({
      orderDate: { $gte: startOfDay, $lt: endOfDay },
    });

    res.json(todayOrders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getOrders = async (req, res) => {
  try {
    const { role, id: userId } = req.query;
    // console.log(req.query);
    if (role === "admin") {
      const allOrders = await Order.find({});
      // console.log(allOrders);
      return res.json(allOrders);
    }

    if (role === "branch_manager") {
      const user = await User.findById(userId).populate("branch");

      if (!user || !user.branch) {
        return res.status(403).json({ message: "Branch not assigned" });
      }

      const branchName = user.branch.name;

      const branchOrders = await Order.find({ branch: branchName });

      return res.json(branchOrders);
    }

    // Packing Agent or other roles
    return res.status(403).json({ message: "Access denied" });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server error" });
  }
};
