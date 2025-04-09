import Order from "../models/Order.js";
import User from "../models/User.js";

// Create Order (via QR scan or manual entry)
export const createOrder = async (req, res) => {
  try {
    const {
      orderId,
      customerName,
      address,
      packageDetails,
      branch,
      orderItems,
      customerMobile,
      customerEmail,
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
      branch,
      orderItems,
      customerMobile,
      customerEmail,
      packageDetails: {
        ...packageDetails,
        ...(image && { image }), // Add image only if uploaded
      },
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
// export const getOrderById = async (req, res) => {
//   try {
//     const order = await Order.findOne({
//       orderId: new RegExp(`^${req.params.orderId}$`, "i"),
//     });

//     if (!order) return res.status(404).json({ message: "Order not found" });

//     res.json(order);
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error });
//   }
// };
export const getOrderById = async (req, res) => {
  try {
    const { role, id: userId } = req.query;

    const order = await Order.findOne({
      orderId: new RegExp(`^${req.params.orderId}$`, "i"),
    });

    if (!order) return res.status(404).json({ message: "Order not found" });

    // Non-admins can only access orders from their branch
    if (role !== "admin") {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      // console.log(user, "user", user.branch, "order:", order.branch);
      if (user.branchName !== order.branch) {
        return res
          .status(403)
          .json({ message: "Access denied: Not your branch Order" });
      }
    }

    res.json(order);
  } catch (error) {
    console.error("Error fetching order by ID:", error);
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

    if (isOnlyCustomerFieldsUpdated) {
      updateFields.deliveredAt = Date.now(); // Or use Date.now() if schema uses timestamps
    }
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
    const normalizedPaymentStatus = paymentStatus?.toLowerCase() || "";
    const normalizedDeliveryStatus = deliveryStatus?.toLowerCase() || "";
    const existingOrder = await Order.findOne({ orderId });

    if (existingOrder) {
      // Update existing order
      existingOrder.customerName = customerName;
      existingOrder.customerEmail = customerEmail;
      existingOrder.customerMobile = customerMobile;
      existingOrder.orderItems = orderItems;
      existingOrder.branch = branch;
      existingOrder.orderDate = orderDate;
      existingOrder.paymentStatus = normalizedPaymentStatus;
      existingOrder.deliveryStatus = normalizedDeliveryStatus;
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
        paymentStatus: normalizedPaymentStatus,
        deliveryStatus: normalizedDeliveryStatus,
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
// export const todayDelivers = async (req, res) => {
//   //   console.log(req.body);
//   try {
//     const startOfDay = new Date();
//     startOfDay.setHours(0, 0, 0, 0);
//     // console.log(startOfDay);
//     const endOfDay = new Date();
//     endOfDay.setHours(23, 59, 59, 999);

//     const todayOrders = await Order.find({
//       orderDate: { $gte: startOfDay, $lt: endOfDay },
//     });

//     res.json(todayOrders);
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error });
//   }
// };
// Get Today's Delivered Orders Count

export const todayDelivers = async (req, res) => {
  try {
    const { role, id } = req.query;

    const user = await User.findById(id).populate("branch");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Build base query
    const query = {
      deliveryStatus: "delivered",
      deliveredAt: { $gte: startOfDay, $lt: endOfDay },
    };

    // Restrict to branch if packing agent
    if (role === "packing_agent") {
      query.branch = user.branchName; // Assuming orders store branchName (not _id)
    }

    const todayDeliveredCount = await Order.countDocuments(query);

    res.json(todayDeliveredCount);
  } catch (error) {
    console.error("Error fetching today's deliveries:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const getOrders = async (req, res) => {
  try {
    const { role, id: userId } = req.query;
    // console.log(role, id);
    if (!role || !userId) {
      return res.status(400).json({ message: "Role or user ID missing" });
    }

    // Admin can see all orders
    if (role === "admin") {
      const allOrders = await Order.find().sort({ createdAt: -1 });
      return res.status(200).json(allOrders);
    }

    // Branch Manager can only see orders for their branch
    if (role === "branch_manager") {
      const user = await User.findById(userId).populate("branch");

      if (!user || !user.branch) {
        return res.status(403).json({ message: "Branch not assigned" });
      }

      const branchName = user.branch.name;

      const branchOrders = await Order.find({ branch: branchName }).sort({
        createdAt: -1,
      });

      return res.status(200).json(branchOrders);
    }

    // Other roles not allowed
    return res.status(403).json({ message: "Access denied" });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const orderCount = async (req, res) => {
  try {
    const { role, id: userId } = req.query;

    if (!role || !userId) {
      return res.status(400).json({ message: "Role or user ID missing" });
    }

    // Admin: Count all orders
    if (role === "admin") {
      const totalOrders = await Order.countDocuments();
      const paidOrders = await Order.countDocuments({ paymentStatus: "paid" });

      const percentagePaid =
        totalOrders === 0
          ? "0%"
          : ((paidOrders / totalOrders) * 100).toFixed(2) + "%";

      return res.json({ totalOrders, paidOrders, percentagePaid });
    }

    // Branch Manager: Count only branch orders
    if (role === "branch_manager") {
      const manager = await User.findById(userId).populate("branch");

      if (!manager || !manager.branch) {
        return res.status(403).json({ message: "Branch not assigned" });
      }

      const branchName = manager.branch.name;

      const totalOrders = await Order.countDocuments({ branch: branchName });
      const paidOrders = await Order.countDocuments({
        branch: branchName,
        paymentStatus: "paid",
      });

      const percentagePaid =
        totalOrders === 0
          ? "0%"
          : ((paidOrders / totalOrders) * 100).toFixed(2) + "%";

      return res.json({ totalOrders, paidOrders, percentagePaid });
    }

    return res.status(403).json({ message: "Access denied" });
  } catch (error) {
    console.error("Error in orderCount:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
