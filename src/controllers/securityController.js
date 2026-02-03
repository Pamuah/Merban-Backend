import VehicleRequest from "../models/vehicleRequest_Model.js";
import Vehicle from "../models/vehicle_Model.js";

// 🔵 1. GET PENDING SECURITY TASKS
export const getSecurityPending = async (req, res) => {
  try {
    console.log("🔍 Fetching security pending requests...");

    const requests = await VehicleRequest.find({
      status: {
        $in: ["SECURITY_ASSIGN_CAR", "SECURITY_PRECHECK", "IN_USE"],
      },
    }).populate("requestor car_assigned");

    console.log(`✅ Found ${requests.length} requests`);
    res.json({ success: true, data: requests });
  } catch (err) {
    console.error("❌ ERROR in getSecurityPending:");
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);

    res.status(500).json({
      success: false,
      message: "Failed to load requests",
      error: err.message,
    });
  }
};

// 🔵 2. ASSIGN VEHICLE
export const assignVehicle = async (req, res) => {
  const { id } = req.params;
  const { vehicleId } = req.body;

  try {
    const vehicle = await Vehicle.findOne({
      _id: vehicleId,
      status: "AVAILABLE",
    });

    if (!vehicle) {
      return res.status(400).json({
        message: "Vehicle is not available",
      });
    }

    const request = await VehicleRequest.findById(id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    request.car_assigned = vehicleId;
    request.status = "PENDING_SECURITY_CHECK_OUT";

    await request.save();

    vehicle.status = "IN_USE";
    await vehicle.save();

    res.json({ message: "Vehicle assigned successfully", request });
  } catch (err) {
    res.status(500).json({ message: "Failed to assign vehicle" });
  }
};

// 🔵 3. SECURITY CHECK OUT (before trip)
export const securityCheckOut = async (req, res) => {
  const { id } = req.params;
  const {
    mileage_before,
    condition_before,
    condition_comment_before,
    fuel_level_before,
    car_assigned,
    driver_assigned,
  } = req.body;

  try {
    console.log("📦 Check-out request body:", req.body);
    console.log("🆔 Request ID:", id);

    const request = await VehicleRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    console.log("✅ Request found:", request._id);

    // ✅ Find and update vehicle status
    const vehicle = await Vehicle.findOne({ plate_number: car_assigned });
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    // Check if vehicle is already in use
    if (vehicle.status === "IN_USE") {
      return res.status(400).json({
        message: `Vehicle ${car_assigned} is already in use`,
      });
    }

    // Check if vehicle is in maintenance
    if (vehicle.status === "MAINTENANCE") {
      return res.status(400).json({
        message: `Vehicle ${car_assigned} is under maintenance`,
      });
    }

    // Initialize security_check if it doesn't exist
    if (!request.security_check) {
      request.security_check = { before: {}, after: {} };
    }

    request.security_check.before = {
      mileage_before,
      condition_before,
      condition_comment_before,
      fuel_level_before,
      car_assigned,
      driver_assigned: driver_assigned || null,
      timestamp: new Date(),
    };

    request.status = "IN_USE";
    request.car_assigned = vehicle._id; // Store vehicle ID reference

    // ✅ UPDATE VEHICLE STATUS TO IN_USE
    vehicle.status = "IN_USE";
    vehicle.current_mileage = mileage_before;

    // Save both documents
    await request.save();
    await vehicle.save();

    console.log("✅ Check-out saved successfully");
    console.log(`✅ Vehicle ${car_assigned} marked as IN_USE`);

    res.json({ message: "Check-Out Completed", data: request });
  } catch (err) {
    console.error("❌ Check-out error:", err);
    res.status(500).json({
      message: "Check-out failed",
      error: err.message,
      details: err.toString(),
    });
  }
};

// 🔵 4. SECURITY CHECK IN (after trip)
export const securityCheckIn = async (req, res) => {
  const { id } = req.params;
  const {
    mileage_after,
    condition_after,
    condition_comment_after,
    fuel_level_after,
    car_assigned,
  } = req.body;

  try {
    const request = await VehicleRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // ✅ Find vehicle by plate number (more reliable)
    const vehicle = await Vehicle.findOne({ plate_number: car_assigned });
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    // Initialize security_check if it doesn't exist
    if (!request.security_check) {
      request.security_check = { before: {}, after: {} };
    }

    request.security_check.after = {
      mileage_after,
      condition_after,
      condition_comment_after,
      fuel_level_after,
      car_assigned,
      timestamp: new Date(),
    };

    request.status = "COMPLETED";

    // ✅ UPDATE VEHICLE STATUS TO AVAILABLE
    vehicle.status = "AVAILABLE";
    vehicle.current_mileage = mileage_after;

    // Save both documents
    await request.save();
    await vehicle.save();

    console.log("✅ Check-in saved successfully");
    console.log(`✅ Vehicle ${car_assigned} marked as AVAILABLE`);

    res.json({ message: "Check-In Completed", data: request });
  } catch (err) {
    console.error("❌ Check-in error:", err);
    res.status(500).json({
      message: "Check-in failed",
      error: err.message,
    });
  }
};
// 🔵 5. GET SINGLE REQUEST
export const getSecurityRequest = async (req, res) => {
  const { id } = req.params;

  try {
    const request = await VehicleRequest.findById(id)
      .populate("requestor")
      .populate("car_assigned");

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.json(request);
  } catch (err) {
    res.status(500).json({ message: "Failed to load request" });
  }
};

// 🔵 6. GET SECURITY CHECK HISTORY
export const getSecurityCheckHistory = async (req, res) => {
  try {
    console.log("🔍 Fetching security check history...");

    const requests = await VehicleRequest.find({
      $or: [
        { "security_check.before": { $exists: true } },
        { "security_check.after": { $exists: true } },
      ],
    })
      .populate("requestor", "name email")
      .populate("car_assigned", "plateNumber model")
      .sort({ updatedAt: -1 })
      .limit(100);

    console.log(`✅ Found ${requests.length} security check history records`);
    res.json({ success: true, data: requests });
  } catch (err) {
    console.error("❌ ERROR in getSecurityCheckHistory:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load security check history",
      error: err.message,
    });
  }
};
