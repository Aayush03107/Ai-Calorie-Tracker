import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../Models/UserModel.mjs";
import BlackModel from "../Models/BlackModel.mjs";

dotenv.config();

export const authMidWare = async (req, res, next) => {
  const token = req.cookies?.token;
  //console.log("Cookie Token:", req.cookies?.token);

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    // Check if blacklisted
    const blacklistedToken = await BlackModel.findOne({ token });
    if (blacklistedToken) {
      return res.status(401).json({ message: "Token blacklisted" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded.userId || decoded.id; // Support both normal & Google login
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error checking token:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
