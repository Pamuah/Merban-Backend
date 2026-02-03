import express from "express";
import protect from "../middleware/auth_Middleware.js";
import { authorizeRole } from "../middleware/roleMiddleware.js";
import {
  assignVehicle,
  securityCheckOut,
  securityCheckIn,
  getSecurityPending,
  getSecurityRequest,
  getSecurityCheckHistory,
} from "../controllers/securityController.js";

const router = express.Router();

router.get("/pending", protect, authorizeRole("security"), getSecurityPending);

router.put("/assign/:id", protect, authorizeRole("security"), assignVehicle);

router.put(
  "/check-out/:id",
  protect,
  authorizeRole("security"),
  securityCheckOut
);

router.get(
  "/request/:id",
  protect,
  authorizeRole("security"),
  getSecurityRequest
);

router.put(
  "/check-in/:id",
  protect,
  authorizeRole("security"),
  securityCheckIn
);

router.get(
  "/history",
  protect,
  authorizeRole("security"),
  getSecurityCheckHistory
);

export default router;
// In your router
// router.get(
//   "/request/:id",
//   protect,
//   authorizeRole("security"),
//   getSecurityRequest
// );
