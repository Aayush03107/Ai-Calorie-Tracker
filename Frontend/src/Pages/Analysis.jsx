import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Typography,
  CircularProgress,
  Fade,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  createTheme,
  ThemeProvider,
  Card, // Added Card for Analysis
  Container, // Added Container for Analysis
  Avatar, // Added Avatar for Analysis
  Grid, // Keeping Grid just in case, but custom flexbox is used for cards
  Button,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import RestaurantIcon from "@mui/icons-material/Restaurant"; // For Analysis
import CalendarViewWeekIcon from "@mui/icons-material/CalendarViewWeek"; // For Analysis
import { motion } from "framer-motion";
import axios from "axios";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";

// Define a custom Material-UI theme for a premium feel
const theme = createTheme({
  palette: {
    primary: {
      main: "#6a0dad", // A deep, rich purple
    },
    secondary: {
      main: "#00bcd4", // A vibrant teal for accents
    },
    background: {
      default: "#f0f2f5", // Light gray background for overall page
      paper: "#ffffff", // White for cards and panels
    },
    text: {
      primary: "#333333", // Dark text for readability
      secondary: "#666666", // Lighter text for supplementary info
    },
    error: {
      // Define error color for delete button hover
      main: "#ef5350",
    },
  },
  typography: {
    fontFamily: "Inter, sans-serif", // Using Inter for a modern look
    h6: {
      fontWeight: 700,
    },
    subtitle1: {
      fontWeight: 600,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12, // More rounded corners for a softer look
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.05)", // Subtle shadow
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none", // Prevent uppercase by default for buttons
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiInputBase-input": {
            padding: "12px 14px", // Adjust padding for text fields
          },
        },
      },
    },
    MuiCard: {
      // Style for cards in Analysis
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.05)",
        },
      },
    },
  },
});

const Analysis = () => {
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDailyData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/user/mealLog", {
          withCredentials: true,
        });
        if (res.status === 200) {
          setData(res.data);
        } else {
          throw new Error("Failed to fetch data");
        }
      } catch (error) {
        console.error("Error fetching daily data:", error);
      }
    };
    fetchDailyData();
  }, []);

  const handleWeeklyRedirect = () => {
    navigate("/WeeklyDataTotal");
  };

  // Group meals by timing
  const groupedMeals = data.reduce((acc, meal) => {
    const timing = meal.mealTiming || "Other";
    if (!acc[timing]) {
      acc[timing] = [];
    }
    acc[timing].push(meal);
    return acc;
  }, {});

  const getTotalDailyCalories = () => {
    return data.reduce((total, meal) => total + (meal.total?.calories || 0), 0);
  };

  const getProgressColor = (mealType) => {
    switch (mealType.toLowerCase()) {
      case "breakfast":
        return "#FFB74D"; // Lighter Orange
      case "lunch":
        return "#81C784"; // Lighter Green
      case "dinner":
        return "#64B5F6"; // Lighter Blue
      case "snacks": // Added snacks for distinct color
        return "#FFD54F"; // Lighter Yellow
      default:
        return "#BA68C8"; // Lighter Purple
    }
  };

  const formatItemWithQuantity = (items) => {
    const itemCount = {};

    items.forEach((item) => {
      const name = item.name.toLowerCase();
      if (!itemCount[name]) {
        itemCount[name] = {
          count: 1,
          name: item.name,
          calories: item.calories,
        };
      } else {
        itemCount[name].count++;
      }
    });

    return Object.values(itemCount).map((item) => ({
      name: item.count > 1 ? `${item.name} (x${item.count})` : item.name,
      calories: item.calories * item.count,
    }));
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f0f2f5 0%, #e0e6ec 100%)", // Consistent with Dashboard
          py: 4,
          color: "text.primary", // Use theme text color
          overflowX: "hidden",
        }}
      >
        <Container maxWidth="md">
          {/* Header for Analysis Page */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Paper
              elevation={4}
              sx={{
                p: { xs: 2, sm: 3 },
                mb: 4,
                borderRadius: 3,
                background: "linear-gradient(90deg, #6a0dad 0%, #8e2de2 100%)", // Consistent with Dashboard
                color: "white",
                boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                display: "flex",
                flexDirection: { xs: "column", sm: "row" }, // Stack on xs, row on sm
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", sm: "center" }, // Align items
                gap: { xs: 2, sm: 0 }, // Gap when stacked
              }}
            >
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  Today's Meal Analysis 📊
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9, mt: 0.5 }}>
                  Total Calories:{" "}
                  <span style={{ fontWeight: "bold" }}>
                    {getTotalDailyCalories()} kcal
                  </span>
                </Typography>
              </Box>
              <Button
                variant="contained"
                onClick={handleWeeklyRedirect}
                startIcon={<CalendarViewWeekIcon />}
                sx={{
                  bgcolor: theme.palette.secondary.main, // Use secondary color for button
                  color: "white",
                  "&:hover": {
                    bgcolor: theme.palette.secondary.dark,
                    transform: "scale(1.05)",
                  },
                  borderRadius: 2,
                  fontWeight: "bold",
                  py: 1,
                  px: 2,
                  boxShadow: "0 4px 12px rgba(0, 188, 212, 0.3)", // Shadow based on secondary color
                  transition: "all 0.3s ease",
                }}
              >
                Weekly View
              </Button>
            </Paper>
          </motion.div>

          {/* Meal Timings and Cards */}
          {Object.entries(groupedMeals).map(([timing, meals]) => (
            <Box key={timing} sx={{ mb: 4 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2, ml: 1 }}>
                <Avatar
                  sx={{
                    bgcolor: getProgressColor(timing),
                    width: 44, // Slightly larger avatar
                    height: 44,
                    mr: 2, // Increased margin
                    boxShadow: `0 4px 12px ${getProgressColor(timing)}66`, // Shadow for avatar
                  }}
                >
                  <RestaurantIcon fontSize="medium" sx={{ color: "white" }} />{" "}
                  {/* Larger icon */}
                </Avatar>
                <Box>
                  <Typography
                    variant="h5" // Larger title
                    fontWeight="bold"
                    sx={{ textTransform: "capitalize", color: "text.primary" }} // Use theme color
                  >
                    {timing}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Total:{" "}
                    <span style={{ fontWeight: "bold" }}>
                      {meals.reduce(
                        (total, meal) => total + (meal.total?.calories || 0),
                        0
                      )}{" "}
                      kcal
                    </span>
                  </Typography>
                </Box>
              </Box>

              {/* Individual Meal Cards - Responsive Flexbox Layout */}
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 2, // Consistent gap between cards
                  justifyContent: "center", // Center cards if fewer than a full row
                }}
              >
                {meals.map((meal, index) => (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                    key={index} // Use index if meal doesn't have a stable ID, otherwise use meal.id
                    sx={{
                      flex: "1 1 calc(50% - 8px)", // Attempt to take half space (2 columns)
                      minWidth: "150px", // Min width for each card before wrapping/stacking
                      maxWidth: {
                        xs: "calc(100% - 16px)", // If it has to stack (very small screens)
                        sm: "calc(50% - 8px)", // Two columns on small screens (like iPhone SE)
                        md: "calc(33.33% - 16px)", // Three columns on medium screens
                        lg: "calc(25% - 18px)", // Four columns on large screens (PC screens)
                      },
                    }}
                  >
                    <Card
                      elevation={4} // Consistent elevation
                      sx={{
                        borderRadius: 3,
                        p: 2, // Increased padding
                        height: "100%", // Ensures cards in a row have equal height
                        background:
                          "linear-gradient(45deg, #ffffff 90%, #f9f9f9 100%)", // Subtle gradient for card background
                        color: "text.primary", // Use theme text color
                        border: "1px solid rgba(0, 0, 0, 0.08)", // More visible border
                        transition: "transform 0.3s ease, box-shadow 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-5px)",
                          boxShadow: `0 8px 24px ${getProgressColor(timing)}66`, // Dynamic shadow color on hover
                        },
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        sx={{ mb: 1 }}
                      >
                        Meal Entry:{" "}
                        {new Date(meal.timestamp).toLocaleTimeString()}
                      </Typography>
                      {formatItemWithQuantity(meal.items || []).map(
                        (item, idx) => (
                          <Box
                            key={idx}
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              mb: idx === meal.items.length - 1 ? 0 : 1,
                              borderBottom: "1px dotted rgba(0,0,0,0.1)", // Dotted separator
                              pb: 0.5,
                              "&:last-child": { borderBottom: "none" },
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500, color: "text.primary" }}
                            >
                              {item.name}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                bgcolor: getProgressColor(timing), // Calorie badge color
                                color: "white",
                                px: 1,
                                py: 0.5, // Adjusted padding
                                borderRadius: 1.5,
                                minWidth: "70px", // Increased min-width for badge
                                textAlign: "center",
                                fontWeight: "bold",
                              }}
                            >
                              {item.calories} kcal
                            </Typography>
                          </Box>
                        )
                      )}
                      <Typography
                        variant="body2"
                        sx={{
                          mt: 2,
                          textAlign: "right",
                          fontStyle: "italic",
                          color: "text.secondary",
                        }}
                      >
                        "{meal.notes || "No notes for this meal."}"
                      </Typography>
                    </Card>
                  </motion.div>
                ))}
              </Box>
            </Box>
          ))}
        </Container>
      </Box>
    </ThemeProvider>
  );
};
export default Analysis;
