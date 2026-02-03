import express from "express";
import {
  createVehicle,
  getAllVehicles,
} from "../controllers/vehicle_Controller.js";
import verifyAdmin from "../middleware/admin_Middleware.js";
import protect from "../middleware/auth_Middleware.js";

const router = express.Router();

// Get all vehicles (any authenticated user can view)
router.get("/", protect, getAllVehicles);

// Create vehicle (admin only)
router.post("/create", verifyAdmin, createVehicle);

export default router;
