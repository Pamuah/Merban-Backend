import express from "express";
import { registerUser, loginUser } from "../controllers/auth_Controller.js";
import protect from "../middleware/auth_Middleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Example of a protected route
router.get("/profile", protect, (req, res) => {
  res.json(req.user);
});

export default router;
