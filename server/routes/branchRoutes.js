import express from "express";
import {
  allBranches,
  branchCount,
  createBranch,
  deleteBranch,
  getBranchById,
  getBranchesNames,
  updateBranch,
} from "../controllers/branchController.js";
// import { isAdmin, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", createBranch);
router.get("/", allBranches);
router.get("/all", getBranchesNames);
router.get("/active-count", branchCount);
router.get("/:id", getBranchById);
router.put("/:id", updateBranch);
router.delete("/:id", deleteBranch);

export default router;
