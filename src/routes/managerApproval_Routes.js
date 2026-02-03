// src/routes/managerApproval_Routes.js
import express from "express";
import protect from "../middleware/auth_Middleware.js";
import { authorizeRole } from "../middleware/roleMiddleware.js";
import {
  getPendingManagerApprovals,
  managerApproveRequest,
  managerRejectRequest,
} from "../controllers/managerApproval_Controller.js";

const router = express.Router();

// All manager routes must be authenticated and role=MANAGER
router.get(
  "/pending",
  protect,
  authorizeRole("MANAGER"),
  getPendingManagerApprovals
);
router.patch(
  "/approve/:id",
  protect,
  authorizeRole("MANAGER"),
  managerApproveRequest
);
router.patch(
  "/reject/:id",
  protect,
  authorizeRole("MANAGER"),
  managerRejectRequest
);

export default router;
