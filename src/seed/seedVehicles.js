import mongoose from "mongoose";
import dotenv from "dotenv";
import Vehicle from "../src/models/vehicle_Model.js";

dotenv.config();

const vehicles = [

  {
    plate_number: "GX-998877-22",
    make: "Hyundai",
    model: "Elantra",
    year: 2023,
    current_mileage: 8000,
    status: "AVAILABLE",
  },
  {
    plate_number: "GX-112233-19",
    make: "Ford",
    model: "Focus",
    year: 2020,
    current_mileage: 65000,
    status: "AVAILABLE",
  },
  {
    plate_number: "GX-556677-21",
    make: "Mazda",
    model: "Mazda3",
    year: 2022,
    current_mileage: 21000,
    status: "AVAILABLE",
  },
  {
    plate_number: "GX-889900-20",
    make: "Volkswagen",
    model: "Jetta",
    year: 2021,
    current_mileage: 42000,
    status: "AVAILABLE",
  },
  {
    plate_number: "GX-223344-22",
    make: "Kia",
    model: "Forte",
    year: 2023,
    current_mileage: 5000,
    status: "AVAILABLE",
  },
  {
    plate_number: "GX-667788-21",
    make: "Chevrolet",
    model: "Malibu",
    year: 2022,
    current_mileage: 31000,
    status: "AVAILABLE",
  },
];

const seedVehicles = async () => {
  try {
    // Connect to MongoDB using your MONGO_URI from .env
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing vehicles (optional - remove if you want to keep existing ones)
    await Vehicle.deleteMany({});
    console.log("🗑️  Cleared existing vehicles");

    // Insert vehicles
    const createdVehicles = await Vehicle.insertMany(vehicles);
    console.log(`✅ ${createdVehicles.length} vehicles added successfully!`);

    // Display added vehicles
    console.log("\n📋 Added vehicles:");
    createdVehicles.forEach((vehicle) => {
      console.log(
        `   - ${vehicle.plate_number}: ${vehicle.make} ${vehicle.model} (${vehicle.year})`
      );
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding vehicles:", error);
    process.exit(1);
  }
};

seedVehicles();
