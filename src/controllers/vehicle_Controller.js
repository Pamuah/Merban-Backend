import Vehicle from "../models/vehicle_Model.js";

// Get all vehicles (with optional status filter)
export const getAllVehicles = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};
    if (status) {
      filter.status = status;
    }

    const vehicles = await Vehicle.find(filter).sort({ plate_number: 1 });

    res.json({
      success: true,
      count: vehicles.length,
      data: vehicles,
    });
  } catch (error) {
    console.error("❌ Error fetching vehicles:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch vehicles",
      error: error.message,
    });
  }
};

// Create vehicle
export const createVehicle = async (req, res) => {
  try {
    const { plate_number, make, model, year, current_mileage } = req.body;

    const exists = await Vehicle.findOne({ plate_number });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Vehicle with this plate number already exists",
      });
    }

    const vehicle = await Vehicle.create({
      plate_number,
      make,
      model,
      year,
      current_mileage,
      Tank_Capacity,
      status: "AVAILABLE",
    });

    res.status(201).json({
      success: true,
      message: "Vehicle created successfully",
      data: vehicle,
    });
  } catch (err) {
    console.error("❌ Error creating vehicle:", err);
    res.status(500).json({
      success: false,
      message: "Failed to add vehicle",
      error: err.message,
    });
  }
};
