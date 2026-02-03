import VehicleRequest from "../models/vehicleRequest_Model.js";

// ⏱️ Average Trip Duration
export const getAverageTripDuration = async (req, res) => {
  try {
    console.log("⏱️ Calculating average trip duration...");

    const tripDurations = await VehicleRequest.aggregate([
      {
        $match: {
          status: "COMPLETED",
          "security_check.before": { $exists: true },
          "security_check.after": { $exists: true },
        },
      },
      {
        $addFields: {
          // Calculate duration in milliseconds
          duration: {
            $subtract: ["$updatedAt", "$createdAt"],
          },
        },
      },
      {
        $group: {
          _id: null,
          averageDuration: { $avg: "$duration" },
          totalTrips: { $sum: 1 },
          minDuration: { $min: "$duration" },
          maxDuration: { $max: "$duration" },
        },
      },
    ]);

    const result = tripDurations[0] || {
      averageDuration: 0,
      totalTrips: 0,
      minDuration: 0,
      maxDuration: 0,
    };

    // Convert milliseconds to hours
    const averageHours = (result.averageDuration / (1000 * 60 * 60)).toFixed(2);
    const minHours = (result.minDuration / (1000 * 60 * 60)).toFixed(2);
    const maxHours = (result.maxDuration / (1000 * 60 * 60)).toFixed(2);

    console.log(`✅ Average trip duration: ${averageHours} hours`);

    res.json({
      success: true,
      data: {
        averageDurationMs: result.averageDuration,
        averageDurationHours: parseFloat(averageHours),
        minDurationHours: parseFloat(minHours),
        maxDurationHours: parseFloat(maxHours),
        totalTrips: result.totalTrips,
      },
    });
  } catch (error) {
    console.error("❌ Error calculating average trip duration:", error);
    res.status(500).json({
      success: false,
      message: "Failed to calculate average trip duration",
      error: error.message,
    });
  }
};

// 📊 Department Usage Statistics
export const getDepartmentUsageStats = async (req, res) => {
  try {
    console.log("📊 Fetching department usage statistics...");

    const departmentStats = await VehicleRequest.aggregate([
      {
        $group: {
          _id: "$requestor_department",
          totalRequests: { $sum: 1 },
          completedTrips: {
            $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] },
          },
          rejectedRequests: {
            $sum: { $cond: [{ $eq: ["$status", "REJECTED"] }, 1, 0] },
          },
          pendingRequests: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$status", "COMPLETED"] },
                    { $ne: ["$status", "REJECTED"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          department: "$_id",
          totalRequests: 1,
          completedTrips: 1,
          rejectedRequests: 1,
          pendingRequests: 1,
          completionRate: {
            $cond: [
              { $gt: ["$totalRequests", 0] },
              {
                $round: [
                  {
                    $multiply: [
                      { $divide: ["$completedTrips", "$totalRequests"] },
                      100,
                    ],
                  },
                  2,
                ],
              },
              0,
            ],
          },
        },
      },
      {
        $sort: { totalRequests: -1 },
      },
    ]);

    console.log(`✅ Usage stats for ${departmentStats.length} departments`);

    res.json({
      success: true,
      data: departmentStats,
    });
  } catch (error) {
    console.error("❌ Error fetching department usage stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch department usage statistics",
      error: error.message,
    });
  }
};

// 📅 Peak Usage Times
export const getPeakUsageTimes = async (req, res) => {
  try {
    console.log("📅 Analyzing peak usage times...");

    const peakTimes = await VehicleRequest.aggregate([
      {
        $match: {
          status: { $ne: "REJECTED" },
        },
      },
      {
        $project: {
          hour: { $hour: "$createdAt" },
          dayOfWeek: { $dayOfWeek: "$createdAt" }, // 1 = Sunday, 7 = Saturday
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: {
            hour: "$hour",
            dayOfWeek: "$dayOfWeek",
          },
          requestCount: { $sum: 1 },
        },
      },
      {
        $sort: { requestCount: -1 },
      },
      {
        $limit: 20,
      },
    ]);

    // Convert day numbers to names
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const formattedPeakTimes = peakTimes.map((item) => ({
      hour: `${item._id.hour}:00`,
      dayOfWeek: dayNames[item._id.dayOfWeek - 1],
      requestCount: item.requestCount,
    }));

    console.log(`✅ Peak usage analysis complete`);

    res.json({
      success: true,
      data: formattedPeakTimes,
    });
  } catch (error) {
    console.error("❌ Error analyzing peak usage times:", error);
    res.status(500).json({
      success: false,
      message: "Failed to analyze peak usage times",
      error: error.message,
    });
  }
};
