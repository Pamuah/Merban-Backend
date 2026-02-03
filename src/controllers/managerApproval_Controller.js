import VehicleRequest from "../models/vehicleRequest_Model.js";

// GET /api/approvals/manager
export const getPendingManagerApprovals = async (req, res) => {
  try {
    // ✅ Filter by manager's department only
    const managerDepartment = req.user.department;
    const managerId = req.user._id;

    const requests = await VehicleRequest.find({
      status: "PENDING_MANAGER",
      currentStage: "MANAGER", // ✅ Add this for consistency
      requestor_department: managerDepartment, // ✅ Only their department
      requestor: { $ne: managerId }, // ✅ Exclude their own requests
    })
      .populate("requestor", "name email department")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    console.error("getPendingManagerApprovals error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PATCH /api/approvals/manager/approve/:id
export const managerApproveRequest = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ First check if request exists and belongs to manager's department
    const request = await VehicleRequest.findById(id);

    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }

    // ✅ Verify manager can approve this request
    if (request.requestor_department !== req.user.department) {
      return res.status(403).json({
        success: false,
        message: "You can only approve requests from your department",
      });
    }

    // ✅ Update with correct currentStage
    const updated = await VehicleRequest.findByIdAndUpdate(
      id,
      {
        manager_approval: "APPROVED",
        currentStage: "HR", // ✅ CRITICAL: Move to HR stage
        status: "PENDING_HR",
      },
      { new: true }
    ).populate("requestor", "fullName email department");

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error("managerApproveRequest error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PATCH /api/approvals/manager/reject/:id
export const managerRejectRequest = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ First check if request exists and belongs to manager's department
    const request = await VehicleRequest.findById(id);

    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }

    // ✅ Verify manager can reject this request
    if (request.requestor_department !== req.user.department) {
      return res.status(403).json({
        success: false,
        message: "You can only reject requests from your department",
      });
    }

    // ✅ Update with correct currentStage
    const updated = await VehicleRequest.findByIdAndUpdate(
      id,
      {
        manager_approval: "REJECTED",
        currentStage: "NONE", // ✅ CRITICAL: Request is done
        status: "REJECTED_MANAGER",
      },
      { new: true }
    ).populate("requestor", "fullName email department");

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error("managerRejectRequest error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
