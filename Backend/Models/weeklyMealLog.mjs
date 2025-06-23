import mongoose from "mongoose";

const daySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    index: true,
  },
  total: {
    calories: { type: Number, default: 0, min: 0 },
    protein: { type: Number, default: 0, min: 0 },
    carbs: { type: Number, default: 0, min: 0 },
    fats: { type: Number, default: 0, min: 0 },
  },
});

const weeklyMealLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    weekStartDate: {
      type: Date,
      required: true,
      index: true,
    },
    days: [daySchema],
  },
  {
    timestamps: true,
  }
);

// Add compound index for better query performance
weeklyMealLogSchema.index({ userId: 1, weekStartDate: 1 });

// Add method to calculate week totals
weeklyMealLogSchema.methods.getWeekTotals = function () {
  return this.days.reduce(
    (totals, day) => {
      totals.calories += day.total.calories;
      totals.protein += day.total.protein;
      totals.carbs += day.total.carbs;
      totals.fats += day.total.fats;
      return totals;
    },
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );
};

const weeklyMealLog = mongoose.model("weeklyMealLog", weeklyMealLogSchema);
export default weeklyMealLog;
