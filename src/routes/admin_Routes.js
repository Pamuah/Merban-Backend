import express from "express";
import { verifyAdmin } from "../middleware/admin_Middleware.js";
import { adminLogin } from "../controllers/admin_Controller.js";
import {
  getDashboardStats,
  getApprovalRejectionRates,
} from "../controllers/adminDashboard_Controller.js";
import {
  getAvailableVehicles,
  getVehiclesInUse,
  getTripsPerVehicle,
  getFuelConsumptionReport,
  getMostRequestedVehicles,
} from "../controllers/adminVehicle_Controller.js";
import {
  getAverageTripDuration,
  getDepartmentUsageStats,
  getPeakUsageTimes,
} from "../controllers/adminAnalytics_Controller.js";



const router = express.Router();

// Authentication (no middleware needed for login)
router.post("/login", adminLogin);

// Dashboard Stats (protected)
router.get("/dashboard/stats", verifyAdmin, getDashboardStats);
router.get("/dashboard/approval-rates", verifyAdmin, getApprovalRejectionRates);

// Vehicle Analytics (protected)
router.get("/vehicles/available", verifyAdmin, getAvailableVehicles);
router.get("/vehicles/in-use", verifyAdmin, getVehiclesInUse);
router.get("/vehicles/trips-per-vehicle", verifyAdmin, getTripsPerVehicle);
router.get("/vehicles/fuel-consumption", verifyAdmin, getFuelConsumptionReport);
router.get("/vehicles/most-requested", verifyAdmin, getMostRequestedVehicles);

// Trip & Usage Analytics (protected)
router.get(
  "/analytics/average-trip-duration",
  verifyAdmin,
  getAverageTripDuration
);
router.get("/analytics/department-usage", verifyAdmin, getDepartmentUsageStats);
router.get("/analytics/peak-usage-times", verifyAdmin, getPeakUsageTimes);



export default router;
