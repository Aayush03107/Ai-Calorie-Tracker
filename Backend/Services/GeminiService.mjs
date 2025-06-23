import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function main(prompt) {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
    systemInstruction:
      "You are a certified nutritionist helping users understand the nutritional content of their meals. " +
      "The user will describe what they ate using natural language, including food items, quantities, preparation methods, and meal timing. " +
      "Your tasks are as follows: " +
      "1. Extract each individual food item and its quantity. " +
      "2. If the quantity is not mentioned, use these standard serving sizes: " +
      "   - 1 cup cooked rice = 160g " +
      "   - 1 cup cooked pasta = 140g " +
      "   - 1 cup milk/yogurt = 240ml " +
      "   - 1 glass liquid = 250ml " +
      "   - 1 tablespoon = 15ml or 15g " +
      "   - 1 teaspoon = 5ml or 5g " +
      "   - 1 slice bread = 30g " +
      "   - 1 medium fruit = 120g " +
      "   - 1 serving meat/fish = 85g " +
      "   - 1 egg = 50g " +
      "   - 1 cup vegetables = 150g " +
      "   - 1 roti = 30g (90 calories) " +
      "3. For each item, convert ALL quantities to grams or milliliters. " +
      "4. Always include the quantity in grams/ml in ALL calculations and output. " +
      "5. For each item, provide both the user's original quantity AND the exact weight in grams/ml. " +
      "6. Calculate all nutritional values based on the gram/ml quantity. " +
      "7. For meal timing, specifically look for: " +
      "   - Direct mentions (e.g., 'breakfast', 'lunch', 'dinner', 'snacks') " +
      "   - Time references (e.g., 'in the morning', 'at noon', 'evening meal') " +
      "   - Convert time references to meal timings: " +
      "     * 4am-11am = breakfast " +
      "     * 11am-4pm = lunch " +
      "     * 4pm-8pm = dinner " +
      "     * Any other time = snacks " +
      "8. If any assumptions are made, explain the conversion in notes. " +
      "9. Calculate total nutrition based on the exact gram/ml quantities. " +
      "One Roti = 100 cal" +
      "10. Take the accurate readings of the street food data like a samosa for 250 calories and 1 steam momo veg  for 60 calories " +
      "Always return the result strictly in the following JSON schema structure.",

    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          mealTiming: { type: "string" },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                originalQuantity: { type: "string" },
                grams: { type: "number" }, // New field for exact weight
                unit: { type: "string", enum: ["g", "ml"] }, // New field for unit
                standardServingInfo: { type: "string" },
                calories: { type: "number" },
                protein: { type: "number" },
                carbs: { type: "number" },
                fats: { type: "number" },
              },
              required: [
                "name",
                "originalQuantity",
                "grams",
                "unit",
                "standardServingInfo",
                "calories",
                "protein",
                "carbs",
                "fats",
              ],
            },
          },
          total: {
            type: "object",
            properties: {
              totalGrams: { type: "number" }, // New field for total weight
              calories: { type: "number" },
              protein: { type: "number" },
              carbs: { type: "number" },
              fats: { type: "number" },
            },
            required: ["totalGrams", "calories", "protein", "carbs", "fats"],
          },
          notes: { type: "string" },
        },
        required: ["items", "total", "notes"],
      },
    },
  });

  const raw = response.text;
  const parsed = JSON.parse(raw);
  return parsed;
}
