import express from "express";
import verifyAdmin from "../middleware/admin_Middleware.js";
import { getAdminCheckHistory } from "../controllers/AdminHistory_Controller.js";

const router = express.Router();
router.get("/check-history", verifyAdmin, getAdminCheckHistory);
export default router;
