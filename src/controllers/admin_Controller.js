import generateToken from "../utils/generateTokens.js";

// Static admin credentials (move to .env)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

// @desc Admin login (static authentication)
// @route POST /api/auth/admin/login
export const adminLogin = async (req, res) => {
  const { username, password } = req.body;

  try {
    console.log("🔐 Admin login attempt:", username);

    // Verify static credentials
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials",
      });
    }

    // Generate admin token with special flags
    const token = generateToken("admin-static-id", {
      isAdmin: true,
      role: "admin",
    });

    console.log("✅ Admin login successful");

    res.json({
      success: true,
      message: "Admin login successful",
      token,
      user: {
        username: ADMIN_USERNAME,
        role: "admin",
        isAdmin: true,
      },
    });
  } catch (error) {
    console.error("❌ Admin login error:", error);
    res.status(500).json({
      success: false,
      message: "Admin login failed",
      error: error.message,
    });
  }
};
