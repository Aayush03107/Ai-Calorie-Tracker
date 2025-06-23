import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Paper, Typography, Card, Container, Avatar } from "@mui/material";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import { motion } from "framer-motion";

const MEAL_ORDER = ["breakfast", "lunch", "snacks", "dinner"];
const COLORS = {
  protein: "#FF6B6B",
  carbs: "#4ECDC4",
  fats: "#FFD93D",
};

const MacroAnalysis = () => {
  const [mealData, setMealData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMealData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/user/mealLog", {
          withCredentials: true,
        });

        // Initialize all meal timings with zero values
        const initialMealData = MEAL_ORDER.reduce((acc, timing) => {
          acc[timing] = { protein: 0, carbs: 0, fats: 0, calories: 0 };
          return acc;
        }, {});

        // Group meals by timing
        const groupedMeals = response.data.reduce((acc, meal) => {
          const timing = meal.mealTiming?.toLowerCase() || "other";
          if (MEAL_ORDER.includes(timing)) {
            acc[timing].protein += meal.total?.protein || 0;
            acc[timing].carbs += meal.total?.carbs || 0;
            acc[timing].fats += meal.total?.fats || 0;
            acc[timing].calories += meal.total?.calories || 0;
          }
          return acc;
        }, initialMealData);

        setMealData(groupedMeals);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching meal data:", error);
        setLoading(false);
      }
    };

    fetchMealData();
  }, []);

  const getProgressColor = (mealType) => {
    switch (mealType.toLowerCase()) {
      case "breakfast":
        return "#FFB74D";
      case "lunch":
        return "#81C784";
      case "dinner":
        return "#64B5F6";
      case "snacks":
        return "#FFD54F";
      default:
        return "#BA68C8";
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f0f2f5 0%, #e0e6ec 100%)",
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Paper
            elevation={4}
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 3,
              background: "linear-gradient(90deg, #6a0dad 0%, #8e2de2 100%)",
              color: "white",
            }}
          >
            <Typography variant="h4" fontWeight="bold">
              Macro Analysis 📊
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              Breakdown of your macronutrients by meal
            </Typography>
          </Paper>
        </motion.div>

        {MEAL_ORDER.map((timing) => (
          <Box key={timing} sx={{ mb: 4 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 2,
                ml: 1,
              }}
            >
              <Avatar
                sx={{
                  bgcolor: getProgressColor(timing),
                  width: 44,
                  height: 44,
                  mr: 2,
                  boxShadow: `0 4px 12px ${getProgressColor(timing)}66`,
                }}
              >
                <RestaurantIcon />
              </Avatar>
              <Typography
                variant="h5"
                fontWeight="bold"
                sx={{ textTransform: "capitalize" }}
              >
                {timing}
              </Typography>
            </Box>

            <Card
              elevation={4}
              sx={{
                p: 3,
                borderRadius: 3,
                background: "white",
                transition: "transform 0.3s ease",
                "&:hover": {
                  transform: "translateY(-5px)",
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 2,
                }}
              >
                {Object.entries(COLORS).map(([macro, color]) => (
                  <Box
                    key={macro}
                    sx={{
                      textAlign: "center",
                      p: 2,
                      borderRadius: 2,
                      bgcolor: `${color}15`,
                      flex: 1,
                      mx: 1,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ color, fontWeight: "bold", mb: 1 }}
                    >
                      {mealData[timing][macro].toFixed(1)}g
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                        textTransform: "capitalize",
                      }}
                    >
                      {macro}
                    </Typography>
                  </Box>
                ))}
              </Box>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "rgba(0,0,0,0.03)",
                  textAlign: "center",
                }}
              >
                <Typography variant="h6" color="primary" fontWeight="bold">
                  {mealData[timing].calories.toFixed(0)} kcal
                </Typography>
              </Box>
            </Card>
          </Box>
        ))}
      </Container>
    </Box>
  );
};

export default MacroAnalysis;
