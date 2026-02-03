import VehicleRequest from "../models/vehicleRequest_Model.js";

// GET /api/approvals/hr
export const getPendingHrApprovals = async (req, res) => {
  try {
    const requests = await VehicleRequest.find({ status: "PENDING_HR" })
      .populate("requestor", "name email department")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    console.error("getPendingHrApprovals error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PATCH /api/approvals/hr/approve/:id
// PATCH /api/approvals/hr/approve/:id
export const hrApproveRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await VehicleRequest.findByIdAndUpdate(
      id,
      {
        hr_approval: "APPROVED",
        status: "SECURITY_ASSIGN_CAR",
        currentStage: "SECURITY",
      },
      { new: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error("hrApproveRequest error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PATCH /api/approvals/hr/reject/:id
// PATCH /api/approvals/hr/reject/:id
export const hrRejectRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await VehicleRequest.findByIdAndUpdate(
      id,
      {
        hr_approval: "REJECTED",
        status: "REJECTED_HR",
        currentStage: "NONE",
      },
      { new: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error("hrRejectRequest error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
