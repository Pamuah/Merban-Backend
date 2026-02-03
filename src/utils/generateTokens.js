import jwt from "jsonwebtoken";

const generateToken = (id, additionalData = {}) => {
  return jwt.sign(
    {
      id,
      ...additionalData,
    },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
};

export default generateToken;
