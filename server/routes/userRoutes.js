import express from "express";
import {
  activeUserCount,
  addUser,
  changePassword,
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
// router.get("/refresh-token", refreshToken);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/users/active-count", activeUserCount);
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.get("/getactiveusers", getActiveUsers);
router.put("/users/:id", updateUser);
router.put("/change-password/:id", changePassword);
router.delete("/users/:id", deleteUser);
// /forgot-password
export default router;
