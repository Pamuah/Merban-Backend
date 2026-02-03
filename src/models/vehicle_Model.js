import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    plate_number: {
      type: String,
      required: true,
      unique: true,
    },
    make: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["AVAILABLE", "IN_USE", "MAINTENANCE"],
      default: "AVAILABLE",
    },
    current_mileage: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Vehicle", vehicleSchema);
