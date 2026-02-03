import VehicleRequest from "../models/vehicleRequest_Model.js";
import User from "../models/user_Model.js";

export const createVehicleRequest = async (req, res) => {
  try {
    const {
      date,
      departure_time,
      estimated_arrival_time,
      destination,
      purpose,
    } = req.body;

    if (
      !date ||
      !departure_time ||
      !estimated_arrival_time ||
      !destination ||
      !purpose
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ Define roles/departments that skip manager approval and go directly to HR
    const skipManagerRoles = ["CEO", "Manager"];
    const skipManagerDepartments = ["Human Resource & Admin"];

    // ✅ Check if user should skip manager approval
    const shouldSkipManager =
      skipManagerRoles.includes(req.user.role) ||
      skipManagerDepartments.includes(req.user.department);

    // ✅ Optional: Verify a manager exists for this department (good UX)
    if (!shouldSkipManager) {
      const managerExists = await User.findOne({
        role: "Manager",
        department: req.user.department,
      });

      if (!managerExists) {
        return res.status(400).json({
          message: `No manager found for ${req.user.department} department. Please contact HR.`,
        });
      }
    }

    // ✅ Set workflow based on whether they skip manager approval
    const initialStage = shouldSkipManager ? "HR" : "MANAGER";
    const initialStatus = shouldSkipManager ? "PENDING_HR" : "PENDING_MANAGER";
    const managerApproval = shouldSkipManager ? "APPROVED" : "PENDING";

    const newRequest = await VehicleRequest.create({
      requestor: req.user._id,
      requestor_department: req.user.department, // ✅ This is enough

      date,
      departure_time,
      estimated_arrival_time,
      destination,
      purpose,

      currentStage: initialStage,
      manager_approval: managerApproval,
      hr_approval: "PENDING",
      status: initialStatus,
    });

    const message = shouldSkipManager
      ? "Vehicle request submitted successfully and sent directly to HR"
      : "Vehicle request submitted successfully and sent to your department manager";

    res.status(201).json({
      message,
      data: newRequest,
    });
  } catch (error) {
    console.error("Error creating vehicle request:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc Get all requests made by logged-in user
// @route GET /api/vehicle-request/my-requests
// @access Private
export const getMyRequests = async (req, res) => {
  try {
    const requests = await VehicleRequest.find({
      requestor: req.user._id,
    }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    console.error("GET MY REQUESTS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
