import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Paper, Typography, CircularProgress, Grid } from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { motion } from "framer-motion";

// Custom Tooltip for a more integrated look
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Paper
        elevation={3}
        sx={{
          padding: "12px",
          background: "rgba(30, 30, 30, 0.9)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "8px",
          color: "white",
        }}
      >
        <Typography sx={{ fontWeight: "bold" }}>{label}</Typography>
        <Typography
          sx={{ color: "#82ca9d", fontWeight: 500 }}
        >{`Calories: ${payload[0].value} kcal`}</Typography>
      </Paper>
    );
  }
  return null;
};

const WeeklyDataTotal = () => {
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeeklyData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:5000/user/weeklyfetch",
          {
            withCredentials: true,
          }
        );

        if (response.data && response.data.length > 0) {
          // Format all dates
          const formattedData = response.data.map((day) => ({
            date: new Date(day.date).toLocaleDateString("en-US", {
              weekday: "short",
              month: "numeric",
              day: "numeric",
            }),
            fullDate: new Date(day.date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            }),
            calories: day.calories || 0,
          }));

          setWeeklyData(formattedData);
        }
      } catch (err) {
        setError("Failed to fetch weekly data. Please try again later.");
        console.error("Error fetching weekly data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklyData();
  }, []);

  const totalCalories = weeklyData.reduce((sum, day) => sum + day.calories, 0);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          bgcolor: "#121212",
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          textAlign: "center",
          mt: 4,
          p: 3,
          color: "rgba(255, 255, 255, 0.7)",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 4,
            maxWidth: 600,
            mx: "auto",
            borderRadius: 3,
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <Typography variant="h5" color="error.light">
            {error}
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#121212",
        py: 4,
        px: { xs: 2, md: 3 },
        color: "white",
        userSelect: "none", // Prevents text selection
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Paper
          elevation={0}
          sx={{
            maxWidth: 900,
            mx: "auto",
            p: { xs: 2, sm: 3, md: 4 },
            borderRadius: 4,
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            fontWeight="bold"
            textAlign="left"
            mb={1}
          >
            Weekly Report
          </Typography>
          <Typography
            variant="subtitle1"
            color="rgba(255,255,255,0.7)"
            textAlign="left"
            mb={4}
          >
            Your calorie intake over time
          </Typography>

          <Grid container spacing={3} mb={5}>
            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: "rgba(0,0,0,0.2)",
                }}
              >
                <Typography variant="h6" color="rgba(255,255,255,0.7)">
                  Total Calories
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {totalCalories.toLocaleString()} kcal
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={weeklyData}
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
              >
                <defs>
                  <linearGradient
                    id="colorCalories"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "rgba(255,255,255,0.7)" }}
                  axisLine={{ stroke: "rgba(255,255,255,0.2)" }}
                  tickLine={{ stroke: "rgba(255,255,255,0.2)" }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  tick={{ fill: "rgba(255,255,255,0.7)" }}
                  axisLine={{ stroke: "rgba(255,255,255,0.2)" }}
                  tickLine={{ stroke: "rgba(255,255,255,0.2)" }}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "transparent" }} // Removes the selection highlight
                />
                <Bar
                  dataKey="calories"
                  fill="url(#colorCalories)"
                  radius={[4, 4, 0, 0]}
                  barSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default WeeklyDataTotal;
