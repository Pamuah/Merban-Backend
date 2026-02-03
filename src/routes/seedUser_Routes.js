// routes/seedRoutes.js
import express from "express";
import { createHRTeamMembers } from "../seed/seedHrController.js";

const router = express.Router();

// Seed route to create HR team members (run once)
router.get("/hr-team", async (req, res) => {
  try {
    const result = await createHRTeamMembers();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
