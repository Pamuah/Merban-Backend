import VehicleRequest from "../models/vehicleRequest_Model.js";
import Vehicle from "../models/vehicle_Model.js";

// 🚗 Available Vehicles
export const getAvailableVehicles = async (req, res) => {
  try {
    console.log("🚗 Fetching available vehicles...");

    const vehicles = await Vehicle.find({ status: "AVAILABLE" });

    console.log(`✅ Found ${vehicles.length} available vehicles`);

    res.json({
      success: true,
      data: vehicles,
      count: vehicles.length,
    });
  } catch (error) {
    console.error("❌ Error fetching available vehicles:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch available vehicles",
      error: error.message,
    });
  }
};

// 🚗 Vehicles In Use
export const getVehiclesInUse = async (req, res) => {
  try {
    console.log("🚗 Fetching vehicles in use...");

    // Find all vehicle requests that are IN_USE
    const inUseRequests = await VehicleRequest.find({
      status: "IN_USE",
    });

    console.log(`📊 Found ${inUseRequests.length} IN_USE requests`);

    // Get vehicle plate numbers from security_check.before.car_assigned
    const plateNumbers = inUseRequests
      .map((request) => request.security_check?.before?.car_assigned)
      .filter((plate) => plate !== null && plate !== undefined);

    console.log("🚗 Plate numbers:", plateNumbers);

    // Find the actual vehicles using plate numbers
    const vehiclesInUse = await Vehicle.find({
      plate_number: { $in: plateNumbers },
    });

    console.log(`✅ Found ${vehiclesInUse.length} vehicles in use`);

    res.json({
      success: true,
      data: vehiclesInUse,
      count: vehiclesInUse.length,
    });
  } catch (error) {
    console.error("❌ Error fetching vehicles in use:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch vehicles in use",
      error: error.message,
    });
  }
};

// 📊 Number of Trips Per Vehicle (with date range)
export const getTripsPerVehicle = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    console.log(
      `📊 Fetching trips per vehicle from ${startDate || "beginning"} to ${
        endDate || "now"
      }`,
    );

    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const tripStats = await VehicleRequest.aggregate([
      {
        $match: {
          car_assigned: { $ne: null },
          status: "COMPLETED",
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: "$car_assigned",
          tripCount: { $sum: 1 },
          totalMileage: {
            $sum: {
              $subtract: [
                { $ifNull: ["$security_check.after.mileage_after", 0] },
                { $ifNull: ["$security_check.before.mileage_before", 0] },
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: "vehicles",
          localField: "_id",
          foreignField: "_id",
          as: "vehicleInfo",
        },
      },
      {
        $unwind: "$vehicleInfo",
      },
      {
        $project: {
          vehicleId: "$_id",
          plateNumber: "$vehicleInfo.plateNumber",
          model: "$vehicleInfo.model",
          tripCount: 1,
          totalMileage: { $round: ["$totalMileage", 2] },
        },
      },
      {
        $sort: { tripCount: -1 },
      },
    ]);

    console.log(`✅ Found trip stats for ${tripStats.length} vehicles`);

    res.json({
      success: true,
      data: tripStats,
    });
  } catch (error) {
    console.error("❌ Error fetching trips per vehicle:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch trips per vehicle",
      error: error.message,
    });
  }
};

// ⛽ Fuel Consumption Report Per Vehicle
export const getFuelConsumptionReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    console.log(`⛽ Fetching fuel consumption report...`);
    console.log(`📅 Date range: ${startDate} to ${endDate}`);

    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // DEBUG: Step by step checks
    console.log("🔍 Step 1: Checking basic match...");
    const step1 = await VehicleRequest.countDocuments({
      status: "COMPLETED",
      ...dateFilter,
    });
    console.log(`  Found ${step1} COMPLETED requests in date range`);

    console.log("🔍 Step 2: With car_assigned...");
    const step2 = await VehicleRequest.countDocuments({
      "security_check.before.car_assigned": { $ne: null, $exists: true },
      status: "COMPLETED",
      ...dateFilter,
    });
    console.log(`  Found ${step2} with car_assigned`);

    console.log("🔍 Step 3: With fuel levels...");
    const step3 = await VehicleRequest.countDocuments({
      "security_check.before.car_assigned": { $ne: null, $exists: true },
      status: "COMPLETED",
      "security_check.before.fuel_level_before": { $exists: true },
      "security_check.after.fuel_level_after": { $exists: true },
      ...dateFilter,
    });
    console.log(`  Found ${step3} with fuel levels`);

    // DEBUG: See actual car_assigned values
    console.log("🔍 Step 4: Checking car_assigned values...");
    const sampleRequests = await VehicleRequest.find({
      "security_check.before.car_assigned": { $ne: null, $exists: true },
      status: "COMPLETED",
      ...dateFilter,
    })
      .select("security_check.before.car_assigned")
      .limit(5);
    console.log(
      "  Car assignments:",
      sampleRequests.map((r) => r.security_check?.before?.car_assigned),
    );

    // DEBUG: Check vehicles collection
    console.log("🔍 Step 5: Checking vehicles collection...");
    const Vehicle = VehicleRequest.db.collection("vehicles");
    const vehicleCount = await Vehicle.countDocuments();
    console.log(`  Total vehicles in collection: ${vehicleCount}`);
    const sampleVehicles = await Vehicle.find({}).limit(5).toArray();
    console.log(
      "  Sample plate numbers:",
      sampleVehicles.map((v) => v.plate_number),
    );

    // Now run the full aggregation
    const fuelStats = await VehicleRequest.aggregate([
      {
        $match: {
          "security_check.before.car_assigned": { $ne: null, $exists: true },
          status: "COMPLETED",
          "security_check.before.fuel_level_before": { $exists: true },
          "security_check.after.fuel_level_after": { $exists: true },
          ...dateFilter,
        },
      },
      {
        $addFields: {
          fuelConsumed: {
            $subtract: [
              {
                $convert: {
                  input: "$security_check.before.fuel_level_before",
                  to: "double",
                  onError: 0,
                  onNull: 0,
                },
              },
              {
                $convert: {
                  input: "$security_check.after.fuel_level_after",
                  to: "double",
                  onError: 0,
                  onNull: 0,
                },
              },
            ],
          },
        },
      },
      {
        $group: {
          _id: "$security_check.before.car_assigned",
          totalFuelConsumed: { $sum: "$fuelConsumed" },
          averageFuelConsumption: { $avg: "$fuelConsumed" },
          tripCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "vehicles",
          localField: "_id",
          foreignField: "plate_number", // Changed from plateNumber to plate_number
          as: "vehicleInfo",
        },
      },
      {
        $addFields: {
          vehicleInfoCount: { $size: "$vehicleInfo" },
        },
      },
      {
        $unwind: {
          path: "$vehicleInfo",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          vehicleId: "$vehicleInfo._id",
          plateNumber: "$_id",
          make: "$vehicleInfo.make", // Added make
          model: "$vehicleInfo.model",
          year: "$vehicleInfo.year", // Added year
          tankCapacity: "$vehicleInfo.tank_capacity", // Added tank_capacity
          currentMileage: "$vehicleInfo.current_mileage", // Added mileage
          totalFuelConsumed: { $round: ["$totalFuelConsumed", 2] },
          averageFuelConsumption: { $round: ["$averageFuelConsumption", 2] },
          tripCount: 1,
          // Useful additional metric: fuel efficiency
          fuelEfficiency: {
            $cond: [
              { $gt: ["$vehicleInfo.tank_capacity", 0] },
              {
                $round: [
                  {
                    $multiply: [
                      {
                        $divide: [
                          "$totalFuelConsumed",
                          "$vehicleInfo.tank_capacity",
                        ],
                      },
                      100,
                    ],
                  },
                  2,
                ],
              },
              null,
            ],
          },
          vehicleInfoCount: 1,
          hasVehicleInfo: {
            $cond: [{ $gt: ["$vehicleInfoCount", 0] }, true, false],
          },
        },
      },
      {
        $sort: { totalFuelConsumed: -1 },
      },
    ]);

    console.log(`✅ Final result count: ${fuelStats.length}`);
    console.log("📊 Final results:", JSON.stringify(fuelStats, null, 2));

    res.json({
      success: true,
      data: fuelStats,
    });
  } catch (error) {
    console.error("❌ Error generating fuel consumption report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate fuel consumption report",
      error: error.message,
    });
  }
};
// 🏆 Most Requested Vehicle Per Week
export const getMostRequestedVehicles = async (req, res) => {
  try {
    console.log("🏆 Fetching most requested vehicles (per week)...");

    // Get date for one week ago
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const mostRequested = await VehicleRequest.aggregate([
      {
        $match: {
          car_assigned: { $ne: null },
          createdAt: { $gte: oneWeekAgo },
        },
      },
      {
        $group: {
          _id: "$car_assigned",
          requestCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "vehicles",
          localField: "_id",
          foreignField: "_id",
          as: "vehicleInfo",
        },
      },
      {
        $unwind: "$vehicleInfo",
      },
      {
        $project: {
          vehicleId: "$_id",
          plateNumber: "$vehicleInfo.plateNumber",
          model: "$vehicleInfo.model",
          requestCount: 1,
        },
      },
      {
        $sort: { requestCount: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    console.log(`✅ Found top ${mostRequested.length} most requested vehicles`);

    res.json({
      success: true,
      data: mostRequested,
    });
  } catch (error) {
    console.error("❌ Error fetching most requested vehicles:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch most requested vehicles",
      error: error.message,
    });
  }
};
