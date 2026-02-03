import express from "express";
import { createVehicleRequest } from "../controllers/vehicleRequest_Controller.js";
import protect from "../middleware/auth_Middleware.js";
import { getMyRequests } from "../controllers/vehicleRequest_Controller.js";
import { getRequestStats } from "../controllers/statusSummary_Controller.js";

const router = express.Router();

router.post("/", protect, createVehicleRequest);
router.get("/my-requests", protect, getMyRequests);
router.get("/stats", protect, getRequestStats);

export default router;
