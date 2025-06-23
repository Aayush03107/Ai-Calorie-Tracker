import express from "express";
import cors from "cors";
import { config } from "dotenv";
import mongoose from "mongoose";
import passport from "passport";
import cookieParser from "cookie-parser";
import "./Passport/Passport.mjs";
import { router as googleAuth } from "./Routes/GoogleAuth.mjs";
import { router as registerRouter } from "./Routes/Register.mjs";
import { router as loginRouter } from "./Routes/Login.mjs";
import { router as foodRouter } from "./Routes/Calories.mjs";
import { router as mealLogRouter } from "./Routes/MealLogRoute.mjs";
import { router as mealFetchRouter } from "./Routes/FetchMeals.mjs";
import { router as weeklyFetchRouter } from "./Routes/Weeklyfetch.mjs";

config();
const app = express();
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(passport.initialize());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/auth", googleAuth);
app.use("/user", registerRouter);
app.use("/user", loginRouter);
app.use("/user", foodRouter);
app.use("/user", mealLogRouter);
app.use("/user", mealFetchRouter);
app.use("/user", weeklyFetchRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
