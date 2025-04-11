// import mongoose from "mongoose";

// const orderSchema = new mongoose.Schema(
//   {
//     orderId: { type: String, required: true, unique: true },
//     // data: Object,
//     customer: {
//       name: String,
//       email: String,
//       mobile: String,
//       address: String,
//       dob: Date,
//     },
//     customerName: { type: String, required: true },
//     customerEmail: { type: String, required: true },
//     customerMobile: { type: String, required: true },
//     orderItems: { type: String, required: true },
//     address: { type: String, required: true },
//     packageDetails: {
//       title: String,
//       image: String,
//       quantity: Number,
//     },
//     branch: { type: String, required: true },
//     orderDate: { type: Date, default: Date.now },
//     // status: {
//     //   type: String,
//     //   enum: ["pending", "ready for delivery", "delivered"],
//     //   default: "pending",
//     // },
//     // paymentStatus: {
//     //   type: String,
//     //   enum: ["pending", "paid"],
//     //   default: "pending",
//     // },
//     // deliveryStatus: {
//     //   type: String,
//     //   enum: ["not delivered", "delivered"],
//     //   default: "not delivered",
//     // },
//     paymentStatus: {
//       type: String,
//       enum: ["paid", "pending"],
//       default: "pending",
//     },
//     deliveryStatus: {
//       type: String,
//       enum: ["delivered", "not delivered"],
//       default: "not delivered",
//     },
//     orderValue: { type: Number, required: true, default: 0 },
//     orderDate: { type: Date, required: true, default: Date.now },
//     deliveredAt: { type: Date, default: Date.now },
//     contentHash: { type: String, unique: true },
//     rowId: { type: Number },
//     rowNo: { type: Number },
//     //druv
//     // orderId: { type: String, required: true, unique: true },
//     // customerName: { type: String, required: true },
//     // customerEmail: { type: String, required: true },
//     // customerMobile: { type: String, required: true },
//     // orderItems: { type: String, required: true }, // Assuming it's a comma-separated string
//     // branch: { type: String },
//     // orderDate: { type: Date, required: true },
//     // paymentStatus: { type: String, enum: ["paid", "pending"], default: "pending" },
//     // deliveryStatus: { type: String, enum: ["Delivered", "not Delivered"], default: "not Delivered" },
//     // orderValue: { type: Number, required: true },
//     // contentHash: { type: String },
//     // rowId: { type: Number },
//     // rowNo: { type: Number },
//   },

//   { timestamps: true }
// );

// export default mongoose.model("Order", orderSchema);

import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },

    // Customer Info (nested + flat for flexibility)
    customer: {
      name: { type: String },
      email: { type: String },
      mobile: { type: String },
      address: { type: String },
      dob: { type: Date },
    },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerMobile: { type: String, required: true },

    address: { type: String }, // Delivery address

    // Order items
    orderItems: { type: String, required: true }, // You can change this to an array if needed

    packageDetails: {
      title: { type: String },
      image: { type: String },
      quantity: { type: Number },
    },

    branch: { type: String, required: true },

    orderDate: { type: Date, required: true, default: Date.now },

    paymentStatus: {
      type: String,
      enum: ["paid", "pending"],
      default: "pending",
    },
    deliveryStatus: {
      type: String,
      enum: ["delivered", "not delivered"],
      default: "not delivered",
    },

    deliveredAt: { type: Date },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    orderValue: { type: Number, required: true, default: 0 },

    contentHash: { type: String, unique: true },

    rowId: { type: Number },
    rowNo: { type: Number },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
