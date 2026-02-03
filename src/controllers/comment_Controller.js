import Comment from "../models/comment.js";

// Submit a new comment
export const submitComment = async (req, res) => {
  try {
    const { name, email, department, employeeId, comment } = req.body;

    // Validation
    if (!name || !email || !department || !employeeId || !comment) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Create new comment
    const newComment = await Comment.create({
      name,
      email,
      department,
      employeeId,
      comment,
    });

    console.log("✅ Comment submitted:", newComment._id);

    res.status(201).json({
      success: true,
      message: "Comment submitted successfully",
      data: newComment,
    });
  } catch (error) {
    console.error("❌ Error submitting comment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit comment",
      error: error.message,
    });
  }
};

// Get all comments (for admin)
export const getAllComments = async (req, res) => {
  try {
    const { status, limit = 50, page = 1 } = req.query;

    // Build filter
    const filter = {};
    if (status) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;

    const comments = await Comment.find(filter)
      .sort({ createdAt: -1 }) // Most recent first
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Comment.countDocuments(filter);

    console.log(`✅ Fetched ${comments.length} comments`);

    res.json({
      success: true,
      data: comments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("❌ Error fetching comments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch comments",
      error: error.message,
    });
  }
};

// Update comment status (for admin)
export const updateCommentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["PENDING", "REVIEWED", "RESOLVED"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const comment = await Comment.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    console.log(`✅ Comment ${id} status updated to ${status}`);

    res.json({
      success: true,
      message: "Comment status updated",
      data: comment,
    });
  } catch (error) {
    console.error("❌ Error updating comment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update comment",
      error: error.message,
    });
  }
};

// Delete comment (for admin)
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findByIdAndDelete(id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    console.log(`✅ Comment ${id} deleted`);

    res.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting comment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete comment",
      error: error.message,
    });
  }
};
