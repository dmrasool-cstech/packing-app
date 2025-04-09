import Branch from "../models/Branch.js";
import User from "../models/User.js";
import Order from "../models/Order.js";
// import mongoose from "mongoose";

// **Create Branch (Admin Only)**
export const createBranch = async (req, res) => {
  try {
    const {
      name,
      code,
      address,
      pincode,
      state,
      city,
      phone,
      status,
      manager, // Expecting a user _id
      packingAgents = [], // Expecting an array of user _ids
    } = req.body;

    const errors = {};

    // ✅ Field-level validation
    if (!name) errors.name = "Branch name is required";
    if (!code) errors.code = "Branch code is required";
    if (!address) errors.address = "Address is required";
    if (!pincode) errors.pincode = "Pincode is required";
    if (!state) errors.state = "State is required";
    if (!city) errors.city = "City is required";
    if (!phone) errors.phone = "Phone number is required";
    if (!status) errors.status = "Status is required";

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    const existingBranch = await Branch.findOne({
      $or: [
        { name: { $regex: `^${name}$`, $options: "i" } },
        { code: { $regex: `^${code}$`, $options: "i" } },
      ],
    });

    if (existingBranch) {
      return res.status(400).json({
        errors: {
          message: "Branch with same name or code already exists",
        },
      });
    }

    // Validate manager (optional)
    if (manager) {
      const managerExists = await User.findOne({
        _id: manager,
        role: "branch_manager",
      });
      if (!managerExists) {
        return res.status(400).json({
          errors: { manager: "Invalid or non-existent branch manager" },
        });
      }
    }

    // Validate packing agents (optional)
    if (packingAgents.length > 0) {
      const validAgents = await User.find({
        _id: { $in: packingAgents },
        role: "packing_agent",
      });
      if (validAgents.length !== packingAgents.length) {
        return res.status(400).json({
          errors: { packingAgents: "One or more packing agents are invalid" },
        });
      }
    }

    const branch = new Branch({
      name,
      code,
      address,
      phone,
      status,
      pincode,
      state,
      city,
      manager: manager || null,
      packingAgents,
    });

    await branch.save();
    res.status(201).json({ message: "Branch created successfully", branch });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// **Get All Branches (Admin Only)**
export const allBranches = async (req, res) => {
  try {
    const branches = await Branch.find()
      .populate("manager", "name email") // populate only `name` and `email` of manager
      .populate("packingAgents", "name email"); // populate packing agent names and emails
    // console.log("branches", branches);
    res.json(branches);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// **Get Branch by ID**
export const getBranchById = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);
    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }
    res.json(branch);
  } catch (error) {
    console.error("Error fetching branch:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// **Get Branch for Logged-in Branch Manager**
export const getbranchForBranchManger = async (req, res) => {
  try {
    if (req.user.role !== "branch_manager") {
      return res.status(403).json({ message: "Access denied" });
    }

    const user = await User.findById(req.user.id).populate("branch");
    if (!user || !user.branch) {
      return res.status(404).json({ message: "No branch assigned" });
    }

    res.json(user.branch);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// **Update Branch (Admin Only)**
export const updateBranch = async (req, res) => {
  try {
    const {
      name,
      code,
      address,
      pincode,
      state,
      city,
      phone,
      status,
      manager, // new manager ID (optional)
      packingAgents = [], // new packing agent IDs (optional)
    } = req.body;

    const branch = await Branch.findById(req.params.id);
    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    // Handle manager update (if provided)
    if (manager) {
      const managerExists = await User.findOne({
        _id: manager,
        role: "branch_manager",
      });

      if (managerExists) {
        branch.manager = manager;
      } else {
        // 🧹 Clear the manager field if invalid
        branch.manager = null;
      }
    }

    // Handle packing agents (if provided)
    if (packingAgents.length > 0) {
      const validAgents = await User.find({
        _id: { $in: packingAgents },
        role: "packing_agent",
      });
      if (validAgents.length !== packingAgents.length) {
        return res
          .status(400)
          .json({ message: "One or more packing agents are invalid" });
      }
      branch.packingAgents = packingAgents;
    } else {
      branch.packingAgents = [];
    }

    // Update other fields
    if (name) branch.name = name;
    if (code) branch.code = code;
    if (address) branch.address = address;
    if (pincode) branch.pincode = pincode;
    if (state) branch.state = state;
    if (city) branch.city = city;
    if (phone) branch.phone = phone;
    if (status) branch.status = status;

    await branch.save();

    res.json({ message: "Branch updated successfully", branch });
  } catch (error) {
    console.error("Error updating branch:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// **Delete Branch (Admin Only)**
export const deleteBranch = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);
    if (!branch) return res.status(404).json({ message: "Branch not found" });
    await Order.deleteMany({ branch: branch.name });
    await branch.deleteOne();
    res.json({ message: "Branch deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// **Branch Count Summary**
export const branchCount = async (req, res) => {
  try {
    const totalBranches = await Branch.countDocuments();
    const activeBranches = await Branch.countDocuments({ status: "active" });

    const percentageActiveBranches =
      totalBranches === 0
        ? "0%"
        : ((activeBranches / totalBranches) * 100).toFixed(2) + "%";

    res.json({
      activeBranches,
      percentageActiveBranches,
    });
  } catch (error) {
    console.error("Error fetching branch stats:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// **Get Active Branch Names**
export const getBranchesNames = async (req, res) => {
  try {
    const branches = await Branch.find().select("_id name code manager");
    // console.log(branches);
    res.json(branches);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch branches" });
  }
};
