import VehicleRequest from "../models/vehicleRequest_Model.js";
import User from "../models/user_Model.js";
import Vehicle from "../models/vehicle_Model.js";

// 📊 Dashboard Summary Statistics
export const getDashboardStats = async (req, res) => {
  try {
    console.log("📊 Fetching dashboard stats...");

    // 1. Number of users
    const totalUsers = await User.countDocuments();

    // 2. Number of trips going on (IN_USE status)
    const ongoingTrips = await VehicleRequest.countDocuments({
      status: "IN_USE",
    });

    // 3. Today's checkout
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todaysCheckouts = await VehicleRequest.countDocuments({
      "security_check.before": { $exists: true },
      updatedAt: { $gte: startOfDay, $lte: endOfDay },
    });

    // 4. Today's checkin
    const todaysCheckins = await VehicleRequest.countDocuments({
      "security_check.after": { $exists: true },
      updatedAt: { $gte: startOfDay, $lte: endOfDay },
    });

    // 5. Overall pending approvals (all non-completed/rejected statuses)
    const pendingApprovals = await VehicleRequest.countDocuments({
      status: {
        $in: [
          "PENDING_MANAGER",
          "PENDING_HR",
          "SECURITY_ASSIGN_CAR",
          "SECURITY_PRECHECK",
          "PENDING_SECURITY_CHECK_IN",
          "IN_PROGRESS",
          "IN_USE",
        ],
      },
    });

    // 6. Overall rejections
    const totalRejections = await VehicleRequest.countDocuments({
      status: "REJECTED",
    });

    // 7. Completed trips
    const completedTrips = await VehicleRequest.countDocuments({
      status: "COMPLETED",
    });

    console.log("✅ Dashboard stats fetched successfully");

    res.json({
      success: true,
      data: {
        totalUsers,
        ongoingTrips,
        todaysCheckouts,
        todaysCheckins,
        pendingApprovals,
        totalRejections,
        completedTrips,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
      error: error.message,
    });
  }
};

// 📈 Approval and Rejection Rates
export const getApprovalRejectionRates = async (req, res) => {
  try {
    console.log("📈 Calculating approval/rejection rates...");

    const totalRequests = await VehicleRequest.countDocuments();

    const completedRequests = await VehicleRequest.countDocuments({
      status: "COMPLETED",
    });

    const rejectedRequests = await VehicleRequest.countDocuments({
      status: "REJECTED",
    });

    const approvalRate =
      totalRequests > 0
        ? ((completedRequests / totalRequests) * 100).toFixed(2)
        : 0;

    const rejectionRate =
      totalRequests > 0
        ? ((rejectedRequests / totalRequests) * 100).toFixed(2)
        : 0;

    console.log("✅ Rates calculated successfully");

    res.json({
      success: true,
      data: {
        totalRequests,
        completedRequests,
        rejectedRequests,
        approvalRate: parseFloat(approvalRate),
        rejectionRate: parseFloat(rejectionRate),
      },
    });
  } catch (error) {
    console.error("❌ Error calculating rates:", error);
    res.status(500).json({
      success: false,
      message: "Failed to calculate approval/rejection rates",
      error: error.message,
    });
  }
};
