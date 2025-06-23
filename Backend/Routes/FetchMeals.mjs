import express from "express";
import { config } from "dotenv";
import MealLog from "../Models/MealLog.mjs";
import { authMidWare } from "../Middlewares/authMidWare.mjs";

export const router = express.Router();
config();

router.get("/mealLog", authMidWare, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { userId: req.user._id };

    // Add date range if provided
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else {
      // Default to today's meals
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      query.date = { $gte: today, $lt: tomorrow };
    }

    const mealLog = await MealLog.find(query)
      .sort({ date: -1, mealTiming: 1 })
      .lean();

    res.status(200).json(mealLog);
  } catch (error) {
    console.error("Error fetching meal logs:", error);
    res.status(500).json({
      error: "Error fetching meal logs",
      details: error.message,
    });
  }
});
