import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import CryptoJS from "crypto-js";
import User from "../models/User.js";
import dotenv from "dotenv";
import Branch from "../models/Branch.js";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const token = CryptoJS.lib.WordArray.random(20).toString(CryptoJS.enc.Hex);
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const resetURL = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: "Password Reset",
      text: `Click the link to reset your password: ${resetURL}`,
    };
    const info = await transporter.sendMail(mailOptions);
    res.json({ message: "Password reset link sent to email" });
  } catch (error) {
    res.status(500).json({ message: "Error sending email" });
  }
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 86400000,
      path: "/",
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: "Password successfully reset" });
  } catch (error) {
    res.status(500).json({ message: "Error resetting password" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const addUser = async (req, res) => {
  try {
    const { name, email, mobile, branchId, status, userType, password } =
      req.body;

    if (!name || !email || !mobile || !userType) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    let branchName = "";
    if (branchId) {
      const branch = await Branch.findById(branchId);
      if (!branch) return res.status(404).json({ message: "Branch not found" });
      branchName = branch.name;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      mobile,
      branch: branchId || null,
      branchName,
      status,
      role: userType,
      password: hashedPassword,
    });

    await newUser.save();

    // 🔁 Sync with Branch model
    // if (branchId) {
    //   const branch = await Branch.findById(branchId);
    //   if (userType === "branch_manager") {
    //     branch.manager = newUser._id;
    //   } else if (userType === "packing_agent") {
    //     if (!branch.packingAgents.includes(newUser._id)) {
    //       branch.packingAgents.push(newUser._id);
    //     }
    //   }
    //   await branch.save();
    // }
    if (branchId) {
      const branch = await Branch.findById(branchId);
      if (!branch) return res.status(404).json({ message: "Branch not found" });

      // Prevent duplicate assignment
      if (userType === "branch_manager") {
        if (
          branch.manager &&
          branch.manager.toString() !== newUser._id.toString()
        ) {
          return res
            .status(400)
            .json({ message: "Branch already has a manager assigned" });
        }
        branch.manager = newUser._id;
      } else if (userType === "packing_agent") {
        const isAlreadyAssigned = branch.packingAgents.some(
          (agentId) => agentId.toString() === newUser._id.toString()
        );
        if (isAlreadyAssigned) {
          return res
            .status(400)
            .json({ message: "Packing agent already assigned to this branch" });
        }
        branch.packingAgents.push(newUser._id);
      }

      await branch.save();
    }
    res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (error) {
    console.error("Error in addUser:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { name, email, mobile, branchId, status, userType, password } =
      req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser)
        return res.status(400).json({ message: "Email already in use" });
    }

    let branchName = user.branchName;

    // 🧹 Step 1: Remove user from old branch if changing branch
    const isBranchChanged = branchId && branchId !== user.branch?.toString();
    if (isBranchChanged && user.branch) {
      const oldBranch = await Branch.findById(user.branch);
      if (oldBranch) {
        if (
          user.role === "branch_manager" &&
          oldBranch.manager?.toString() === user._id.toString()
        ) {
          oldBranch.manager = null;
        }
        if (user.role === "packing_agent") {
          oldBranch.packingAgents = oldBranch.packingAgents.filter(
            (agentId) => agentId.toString() !== user._id.toString()
          );
        }
        await oldBranch.save();
      }
    }

    // 🧠 Step 2: If new branch is provided, update name
    if (branchId) {
      const newBranch = await Branch.findById(branchId);
      if (!newBranch)
        return res.status(404).json({ message: "Branch not found" });
      branchName = newBranch.name;

      // Prevent duplicate assignment
      if (userType === "branch_manager") {
        if (
          newBranch.manager &&
          newBranch.manager.toString() !== user._id.toString()
        ) {
          return res
            .status(400)
            .json({ message: "Branch already has a manager assigned" });
        }
        newBranch.manager = user._id;
      } else if (userType === "packing_agent") {
        const isAlreadyAssigned = newBranch.packingAgents.some(
          (agentId) => agentId.toString() === user._id.toString()
        );
        if (!isAlreadyAssigned) {
          newBranch.packingAgents.push(user._id);
        }
      }
      await newBranch.save();
    }

    // 🧩 Step 3: Update user details
    user.name = name || user.name;
    user.email = email || user.email;
    user.mobile = mobile || user.mobile;
    user.branch = branchId || user.branch;
    user.branchName = branchName;
    user.status = status || user.status;
    user.role = userType || user.role;
    if (password) user.password = await bcrypt.hash(password, 10);

    await user.save();

    res.json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Error in updateUser:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Remove user from branch references
    if (user.branch) {
      const branch = await Branch.findById(user.branch);
      if (branch) {
        if (branch.manager?.toString() === user._id.toString()) {
          branch.manager = null;
        }
        branch.packingAgents = branch.packingAgents.filter(
          (agentId) => agentId.toString() !== user._id.toString()
        );
        await branch.save();
      }
    }

    await user.deleteOne();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error in deleteUser:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const activeUserCount = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: "active" });
    const percentageActive =
      totalUsers === 0
        ? "0%"
        : ((activeUsers / totalUsers) * 100).toFixed(2) + "%";
    res.json({ activeUsers, percentageActive });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getActiveUsers = async (req, res) => {
  try {
    const activeUsers = await User.find({ status: "active" });
    res.json(activeUsers);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
