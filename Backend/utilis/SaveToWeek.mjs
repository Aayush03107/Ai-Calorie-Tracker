import WeeklyMealLog from "../Models/weeklyMealLog.mjs";
import getWeekStartDate from "./WeekStart.mjs";

export const saveToWeek = async (userId, date, total) => {
  const weekStart = getWeekStartDate(date);
  let weeklyLog = await WeeklyMealLog.findOne({
    userId,
    weekStartDate: weekStart,
  });

  if (!weeklyLog) {
    weeklyLog = new WeeklyMealLog({
      userId,
      weekStartDate: weekStart,
      days: [{ date: date, total }],
    });
  } else {
    const existingDay = weeklyLog.days.find(
      (day) =>
        new Date(day.date).toDateString() === new Date(date).toDateString()
    );

    if (existingDay) {
      existingDay.total.calories += total.calories;
      existingDay.total.protein += total.protein;
      existingDay.total.carbs += total.carbs;
      existingDay.total.fats += total.fats;
    } else {
      weeklyLog.days.push({ date, total });
    }
  }

  await weeklyLog.save();
  console.log("Weekly log updated successfully!");
};
