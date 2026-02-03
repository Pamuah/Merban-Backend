import VehicleRequest from "../models/vehicleRequest_Model.js";

export const getAdminCheckHistory = async (req, res) => {
  try {
    console.log("🔍 [ADMIN] Fetching all security check history...");
    console.log("👤 Admin User:", req.admin); 

    // Extract query parameters for filtering
    const { 
      startDate, 
      endDate, 
      department, 
      status, 
      page = 1, 
      limit = 100 
    } = req.query;

    // Build the query object
    let query = {
      $or: [
        { "security_check.before": { $exists: true } },
        { "security_check.after": { $exists: true } },
      ],
    };

    // Add date range filter
    if (startDate || endDate) {
      query.updatedAt = {};
      if (startDate) {
        query.updatedAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.updatedAt.$lte = new Date(endDate);
      }
    }

    // Filter by department
    if (department) {
      query.requestor_department = department;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const totalCount = await VehicleRequest.countDocuments(query);

    // Fetch the requests
    const requests = await VehicleRequest.find(query)
      .populate("requestor", "name email department")
      .populate("car_assigned", "plateNumber model make year")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    console.log(`✅ [ADMIN] Found ${requests.length} of ${totalCount} records`);
    
    res.json({ 
      success: true, 
      data: requests,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalRecords: totalCount,
        recordsPerPage: parseInt(limit)
      }
    });
  } catch (err) {
    console.error("❌ ERROR in getAdminCheckHistory:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load admin check history",
      error: err.message,
    });
  }
};