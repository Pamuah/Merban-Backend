import mongoose from "mongoose";

const vehicleRequestSchema = new mongoose.Schema(
  {
    // USER REQUEST SECTION
    requestor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // SCHEDULE
    date: { type: String, required: true },
    departure_time: { type: String, required: true },
    estimated_arrival_time: { type: String, required: true },

    // DESTINATION + PURPOSE
    destination: { type: String, required: true },
    purpose: { type: String, required: true },

    // DEPARTMENT
    requestor_department: { type: String, required: true },

    // APPROVAL WORKFLOW
    manager_approval: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    hr_approval: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },

    // WHICH ROLE SHOULD HANDLE THIS STEP
    currentStage: {
      type: String,
      enum: ["MANAGER", "HR", "SECURITY", "COMPLETED", "NONE"],
      default: "MANAGER",
    },

    // CAR ASSIGNED BY SECURITY
    car_assigned: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      default: null,
    },

    // WORKFLOW STATUS
    status: {
      type: String,
      enum: [
        "PENDING_MANAGER",
        "PENDING_HR",
        "SECURITY_ASSIGN_CAR",
        "IN_USE",
        "PENDING_SECURITY_CHECK_IN",
        "SECURITY_PRECHECK",
        "IN_PROGRESS",
        "COMPLETED",
        "REJECTED",
      ],
      default: "PENDING_MANAGER",
    },

    // ✅ NESTED SECURITY CHECKS
    security_check: {
      before: {
        mileage_before: { type: Number },
        condition_before: {
          type: String,
          enum: ["GOOD", "BAD"],
        },
        condition_comment_before: { type: String },
        fuel_level_before: { type: String },
        driver_assigned: { type: String, required: false },
        car_assigned: { type: String },
      },
      after: {
        mileage_after: { type: Number },
        condition_after: {
          type: String,
          enum: ["GOOD", "BAD"],
        },
        condition_comment_after: { type: String },
        fuel_level_after: { type: String },
        car_assigned: { type: String },
      },
    },
  },
  { timestamps: true },
);

export default mongoose.model("VehicleRequest", vehicleRequestSchema);
