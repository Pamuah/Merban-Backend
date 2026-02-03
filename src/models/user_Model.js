import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    department: {
      type: String,
      required: true,
      enum: [
        "Executives",
        "Wealth Management",
        "Mutual Funds",
        "Corp, Finance & Research",
        "Pension & Institutional Funds.",
        "Gov Securities & Trading",
        "Human Resource & Admin",
        "Accounts",
        "Marketing/ Client Services",
        "I.T",
        "UMB StockBrokers",
        "Compliance",
        "Security",
        "SDSL",
      ],
    },

    role: {
      type: String,
      required: true,
      enum: ["Employee", "Manager", "HR", "CEO", "Security"],
      default: "Employee",
    },
  },
  { timestamps: true }
);

// Hash password before saving if modified
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

// Compare entered password to hashed password in DB
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
