import express from "express";
import { authMidWare } from "../Middlewares/authMidWare.mjs";
import MealLog from "../Models/MealLog.mjs";

export const router = express.Router();

router.post("/mealLog", authMidWare, async (req, res) => {
  const { mealTiming, items, total, notes, date } = req.body;

  if (!mealTiming || !items || !total || !date) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const mealLog = new MealLog({
      userId: req.user._id,
      date: new Date(date),
      mealTiming,
      items,
      total,
      notes,
    });

    await mealLog.save();
    res.status(201).json(mealLog);
  } catch (error) {
    res.status(500).json({
      error: "Error saving meal log",
      details: error.message,
    });
  }
});

router.get("/mealLog", authMidWare, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const mealLog = await MealLog.find({
      userId: req.user._id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    });
    res.status(200).json(mealLog);
  } catch (error) {
    res.status(500).json({
      error: "Error fetching meal logs",
      details: error.message,
    });
  }
});
