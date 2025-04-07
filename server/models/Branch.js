import mongoose from "mongoose";

const BranchSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    pincode: { type: Number, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    // Manager
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // required: true,
    },

    // Add this
    packingAgents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

export default mongoose.model("Branch", BranchSchema);
