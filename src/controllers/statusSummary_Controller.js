import VehicleRequest from "../models/vehicleRequest_Model.js";

export const getRequestStats = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        message: "Unauthorized - User not authenticated",
      });
    }

    const userId = req.user._id;
    const userRole = req.user.role;
    const userDepartment = req.user.department;

    console.log("👤 User ID:", userId);
    console.log("👔 User Role:", userRole); // ✅ Check this
    console.log("🏢 User Department:", userDepartment); // ✅ Check this

    // Get only the user's own requests
    const myRequests = await VehicleRequest.find({ requestor: userId });

    let completed = 0;
    let rejected = 0;
    let pending = 0;

    myRequests.forEach((req) => {
      if (req.status === "COMPLETED") {
        completed++;
      } else if (
        req.status === "REJECTED_MANAGER" ||
        req.status === "REJECTED_HR"
      ) {
        rejected++;
      } else {
        pending++;
      }
    });

    const stats = {
      completed,
      pending,
      rejected,
      total: myRequests.length,
    };

    // ✅ MANAGERS: Add pending approvals count
    if (userRole === "Manager" || userRole === "MANAGER") {
      // ✅ Handle both cases
      console.log("🔍 Checking for manager approvals...");
      console.log("🔍 User department:", userDepartment);

      const pendingForManager = await VehicleRequest.countDocuments({
        // ✅ Use countDocuments
        requestor_department: userDepartment,
        currentStage: "MANAGER",
        manager_approval: "PENDING",
        requestor: { $ne: userId },
      });

      console.log("📋 Pending requests for manager:", pendingForManager);

      stats.pendingApprovals = pendingForManager;
    }

    // ✅ HR: Add pending approvals count
    if (userRole === "HR" || userDepartment === "Human Resource & Admin") {
      console.log("🔍 Checking for HR approvals...");

      const pendingForHR = await VehicleRequest.find({
        currentStage: "HR",
        hr_approval: "PENDING",
      });

      console.log("📋 Pending requests for HR:", pendingForHR.length);
      console.log("📋 Requests found:", pendingForHR);

      stats.pendingApprovals = pendingForHR.length;
    }

    // ✅ CEO: Add system-wide stats
    if (userRole === "CEO") {
      const allRequests = await VehicleRequest.find();

      let systemCompleted = 0;
      let systemRejected = 0;
      let systemPending = 0;

      allRequests.forEach((req) => {
        if (req.status === "COMPLETED") {
          systemCompleted++;
        } else if (
          req.status === "REJECTED_MANAGER" ||
          req.status === "REJECTED_HR"
        ) {
          systemRejected++;
        } else {
          systemPending++;
        }
      });

      stats.systemStats = {
        total: allRequests.length,
        completed: systemCompleted,
        pending: systemPending,
        rejected: systemRejected,
      };
    }

    console.log("✅ Final stats:", stats);

    res.status(200).json(stats);
  } catch (error) {
    console.error("Stats Error:", error);
    res.status(500).json({ message: "Failed to fetch request stats" });
  }
};
