import mongoose from "mongoose";

const mealLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    mealTiming: {
      type: String,
      required: true,
      enum: ["breakfast", "lunch", "dinner", "snacks"],
    },
    items: [
      {
        name: { type: String, required: true },
        originalQuantity: { type: String, required: true },
        grams: { type: Number },
        unit: { type: String },
        calories: { type: Number, required: true },
        protein: { type: Number, default: 0 },
        carbs: { type: Number, default: 0 },
        fats: { type: Number, default: 0 },
      },
    ],
    total: {
      calories: { type: Number, required: true },
      protein: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      fats: { type: Number, default: 0 },
    },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

// Add index for better query performance
mealLogSchema.index({ userId: 1, date: 1 });

export default mongoose.model("MealLog", mealLogSchema);
