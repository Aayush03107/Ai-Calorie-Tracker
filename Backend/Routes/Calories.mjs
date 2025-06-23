import express from "express";
import { config } from "dotenv";
import { main } from "../Services/GeminiService.mjs";

export const router = express.Router();
config();

router.post("/calories", async (req, res) => {
  const { prompt, pendingMealData } = req.body;

  try {
    // If there's pending meal data and this is a timing response
    if (pendingMealData) {
      // Extract timing from user's response
      const timing = prompt.toLowerCase().trim();
      const validTimings = ["breakfast", "lunch", "dinner", "snacks"];

      if (!validTimings.includes(timing)) {
        return res.status(200).json({
          requiresMealTiming: true,
          message:
            "Please specify if this was breakfast, lunch, dinner, or snacks.",
          extractedData: pendingMealData,
        });
      }

      // Add timing to the pending data
      const completeData = {
        ...pendingMealData,
        mealTiming: timing,
      };

      return res.status(200).json(completeData);
    }

    // Normal flow for new meal input
    const response = await main(prompt);

    if (!response.mealTiming || response.mealTiming.trim() === "") {
      return res.status(200).json({
        requiresMealTiming: true,
        message: "When did you have this meal? (breakfast/lunch/dinner/snacks)",
        extractedData: response,
      });
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
