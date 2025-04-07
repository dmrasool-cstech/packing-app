import express from "express";
import {
  activeUserCount,
  addUser,
  deleteUser,
  forgotPassword,
  getActiveUsers,
  getAllUsers,
  getUserById,
  login,
  register,
  resetPassword,
  updateUser,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/register", register);
router.post("/users/add", addUser);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/users/active-count", activeUserCount);
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.get("/getactiveusers", getActiveUsers);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
// /forgot-password
export default router;
