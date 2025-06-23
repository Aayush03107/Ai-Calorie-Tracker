import express from "express";
import weeklyMealLog from "../Models/weeklyMealLog.mjs";
import { authMidWare } from "../Middlewares/authMidWare.mjs";

export const router = express.Router();

router.get("/weeklyfetch", authMidWare, async (req, res) => {
  try {
    const { weeks = 1 } = req.query;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - weeks * 7);

    const logs = await weeklyMealLog
      .find({
        userId: req.user._id,
        weekStartDate: { $gte: startDate, $lte: endDate },
      })
      .sort({ weekStartDate: 1 });

    if (!logs || logs.length === 0) {
      return res.json({
        days: [],
        totals: { calories: 0, protein: 0, carbs: 0, fats: 0 },
      });
    }

    // Flatten and process all days
    const allDays = logs.reduce((acc, log) => {
      const daysWithData = log.days
        .filter((day) => day.date >= startDate && day.date <= endDate)
        .map((day) => ({
          date: day.date.toISOString().split("T")[0],
          calories: Math.round(day.total.calories),
          protein: Number(day.total.protein.toFixed(1)),
          carbs: Number(day.total.carbs.toFixed(1)),
          fats: Number(day.total.fats.toFixed(1)),
        }));
      return [...acc, ...daysWithData];
    }, []);

    // Calculate totals
    const totals = logs.reduce(
      (total, log) => {
        const weekTotals = log.getWeekTotals();
        total.calories += weekTotals.calories;
        total.protein += weekTotals.protein;
        total.carbs += weekTotals.carbs;
        total.fats += weekTotals.fats;
        return total;
      },
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );

    // Sort by date and format response
    allDays.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({
      days: allDays,
      totals: {
        calories: Math.round(totals.calories),
        protein: Number(totals.protein.toFixed(1)),
        carbs: Number(totals.carbs.toFixed(1)),
        fats: Number(totals.fats.toFixed(1)),
      },
    });
  } catch (error) {
    console.error("Error fetching weekly data:", error);
    res.status(500).json({
      error: "Error fetching weekly data",
      details: error.message,
    });
  }
});
