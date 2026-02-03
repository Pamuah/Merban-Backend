// src/routes/hrApproval_Routes.js
import express from "express";
import protect from "../middleware/auth_Middleware.js";
import { authorizeRole } from "../middleware/roleMiddleware.js";
import {
  getPendingHrApprovals,
  hrApproveRequest,
  hrRejectRequest,
} from "../controllers/hrApproval_Controller.js";

const router = express.Router();

router.get("/pending", protect, authorizeRole("HR"), getPendingHrApprovals);
router.patch("/approve/:id", protect, authorizeRole("HR"), hrApproveRequest);
router.patch("/reject/:id", protect, authorizeRole("HR"), hrRejectRequest);

export default router;
