import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/auth_Routes.js";
import vehicleRequestRoutes from "./src/routes/vehicleRequest_Routes.js";
import managerApprovalRoutes from "./src/routes/managerApproval_Routes.js";
import hrApprovalRoutes from "./src/routes/hrApproval_Routes.js";
import securityRoutes from "./src/routes/securityRoutes.js";
import adminRoutes from "./src/routes/admin_Routes.js";
import vehicleRoutes from "./src/routes/vehicle_Routes.js";
import adminHistory from "./src/routes/adminHistory_Routes.js";
import commentRoutes from "./src/routes/comment_Routes.js";
import seedRoutes from "./src/routes/seedUser_Routes.js";

dotenv.config();

const app = express();

// connect to MongoDB
connectDB();

app.use(
  cors({
    origin: "https://octopus-app-qejo4.ondigitalocean.app",
    credentials: true,
  }),
);
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/vehicle-requests", vehicleRequestRoutes);
app.use("/api/manager-approvals", managerApprovalRoutes);
app.use("/api/hr-approvals", hrApprovalRoutes);
app.use("/api/security", securityRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/admin-history", adminHistory);
app.use("/api/comments", commentRoutes);
app.use("/api/seed", seedRoutes);

app.get("/", (req, res) => {
  res.send("Saint's Server is running 🔥🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`Saint's Server is running on port ${PORT}`),
);
