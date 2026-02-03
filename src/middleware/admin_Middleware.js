import jwt from "jsonwebtoken";

export const verifyAdmin = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if token has admin flag
      if (!decoded.isAdmin || decoded.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Access denied. Admin privileges required.",
        });
      }

      req.admin = decoded;
      next();
    } catch (error) {
      console.error("❌ Admin verification error:", error);
      res.status(401).json({
        success: false,
        message: "Not authorized, invalid token",
      });
    }
  } else {
    res.status(401).json({
      success: false,
      message: "No token provided",
    });
  }
};

export default verifyAdmin;
