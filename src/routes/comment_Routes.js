import express from "express";
import {
  submitComment,
  getAllComments,
  updateCommentStatus,
  deleteComment,
} from "../controllers/comment_Controller.js";
import VerifyAdmin from "../middleware/admin_Middleware.js";

const router = express.Router();

// User routes
router.post("/submit", submitComment);

// Admin routes
router.get("/all", VerifyAdmin, getAllComments);
router.patch("/:id/status", VerifyAdmin, updateCommentStatus);
router.delete("/:id", VerifyAdmin, deleteComment);

export default router;
