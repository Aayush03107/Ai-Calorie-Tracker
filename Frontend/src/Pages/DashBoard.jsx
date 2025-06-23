import { useState, useEffect, useMemo } from "react";
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
  TableHead,
  TableRow,
  createTheme, // Import createTheme
  ThemeProvider, // Import ThemeProvider
  Dialog,
  DialogTitle,
  DialogContent,
  Select,
  MenuItem,
  DialogActions,
  Button,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
  },
});

const DashBoard = () => {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [mealLog, setMealLog] = useState([]);
  const [showTimingDialog, setShowTimingDialog] = useState(false);
  const [selectedTiming, setSelectedTiming] = useState("");
  const [pendingMealData, setPendingMealData] = useState(null);
  const [awaitingTiming, setAwaitingTiming] = useState(false);
  const today = new Date().toISOString().split("T")[0];
  const navigate = useNavigate();

  // Effect to load chat responses from local storage
  useEffect(() => {
    const stored = localStorage.getItem("ChatResponses");
    const today = new Date().toISOString().split("T")[0];

    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed[today]) {
        setResponse(parsed[today]); // now it's an array of chats
      } else {
        setResponse([]);
      }
    } else {
      setResponse([]); // Initialize if no responses are stored
    }
  }, []);

  // Effect to fetch meal log from the backend
  useEffect(() => {
    const fetchMealLog = async () => {
      try {
        const res = await axios.get("http://localhost:5000/user/mealLog", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        });
        setMealLog(res.data);
      } catch (error) {
        console.error("Error fetching meal log:", error);
      }
    };

    fetchMealLog();
  }, []);

  // Handler for submitting meal input
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return; // Prevent submission of empty input

    setIsLoading(true); // Show loading indicator
    try {
      // Post prompt to backend for calorie analysis
      const res = await axios.post("http://localhost:5000/user/calories", {
        prompt: input,
        pendingMealData: awaitingTiming ? pendingMealData : null,
      });

      if (res.data.requiresMealTiming) {
        // Store pending data and show timing prompt
        setPendingMealData(res.data.extractedData);
        setAwaitingTiming(true);

        // Add system message asking for timing
        const newMessage = {
          type: "system",
          message: res.data.message,
          timestamp: Date.now(),
        };
        setResponse((prev) => [...(prev || []), newMessage]);
      } else {
        // Process complete meal data
        await processMealData(res.data);
        setAwaitingTiming(false);
        setPendingMealData(null);
      }

      setInput(""); // Clear input field
    } catch (error) {
      console.error("Error submitting meal:", error);
      // Implement a user-friendly error message here instead of just console.error
    } finally {
      setIsLoading(false); // Hide loading indicator
    }
  };

  // Add helper function to process meal data
  const processMealData = async (mealData) => {
    try {
      // Add date to the meal data
      const mealLogData = {
        ...mealData,
        date: today,
      };

      const newEntry = {
        type: "response", // Add type to differentiate from system messages
        data: mealLogData,
        timestamp: Date.now(),
      };

      // Update local storage
      const stored = localStorage.getItem("ChatResponses");
      let parsed = stored ? JSON.parse(stored) : {};
      if (!parsed[today]) {
        parsed[today] = [newEntry];
      } else {
        parsed[today] = [...parsed[today], newEntry];
      }
      localStorage.setItem("ChatResponses", JSON.stringify(parsed));
      setResponse((prev) => [...(prev || []), newEntry]);

      // Post to backend with date
      await axios.post("http://localhost:5000/user/mealLog", mealLogData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        withCredentials: true,
      });

      setMealLog((prev) => [...prev, mealLogData]);
    } catch (error) {
      console.error("Error processing meal data:", error);
    }
  };

  // Function to handle timing selection
  const handleTimingSelect = async (timing) => {
    setShowTimingDialog(false);

    if (pendingMealData && timing) {
      try {
        // Add the timing to the data
        const mealLogData = {
          ...pendingMealData,
          mealTiming: timing,
        };

        // Update local storage and state
        const newEntry = {
          data: mealLogData,
          timestamp: Date.now(),
        };

        const stored = localStorage.getItem("ChatResponses");
        let parsed = stored ? JSON.parse(stored) : {};
        if (!parsed[today]) {
          parsed[today] = [newEntry];
        } else {
          parsed[today] = [...parsed[today], newEntry];
        }
        localStorage.setItem("ChatResponses", JSON.stringify(parsed));
        setResponse(parsed[today]);

        // Post to backend
        await axios.post("http://localhost:5000/user/mealLog", mealLogData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        });

        // Update meal log state
        setMealLog((prev) => [...prev, mealLogData]);
      } catch (error) {
        console.error("Error saving meal with timing:", error);
      }
    }

    // Reset pending data
    setPendingMealData(null);
    setSelectedTiming("");
  };

  // Memoized data for total calories by meal timing (for charts/summaries)
  const mealTimingChartData = useMemo(() => {
    const totals = { breakfast: 0, lunch: 0, snacks: 0, dinner: 0 };
    mealLog.forEach((log) => {
      const mealKey = log.mealTiming?.toLowerCase();
      if (totals[mealKey] !== undefined) {
        totals[mealKey] += log.total?.calories || 0;
      }
    });
    return Object.entries(totals)
      .filter(([_, val]) => val > 0)
      .map(([label, value]) => ({ label, value }));
  }, [mealLog]);

  // Memoized data for total macronutrients
  const macrosChartData = useMemo(() => {
    let protein = 0,
      carbs = 0,
      fats = 0;
    mealLog.forEach((log) => {
      protein += log.total?.protein || 0;
      carbs += log.total?.carbs || 0;
      fats += log.total?.fats || 0;
    });
    return [
      { label: "Protein", value: protein },
      { label: "Carbs", value: carbs },
      { label: "Fats", value: fats },
    ];
  }, [mealLog]);

  // Helper function to get emojis for macronutrients
  const getEmoji = (label) => {
    switch (label.toLowerCase()) {
      case "protein":
        return "🥩";
      case "carbs":
        return "🍞"; // Changed to bread for carbs
      case "fats":
        return "🧈"; // Changed to butter for fats
      default:
        return "📊";
    }
  };

  // Handler for deleting a chat response
  const handleDeleteResponse = (timestamp) => {
    // Remove from response state
    setResponse((prev) =>
      prev.filter((entry) => entry.timestamp !== timestamp)
    );

    // Remove from localStorage
    const stored = localStorage.getItem("ChatResponses");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed[today]) {
        parsed[today] = parsed[today].filter(
          (entry) => entry.timestamp !== timestamp
        );
        localStorage.setItem("ChatResponses", JSON.stringify(parsed));
      }
    }
  };

  return (
    // Apply the custom theme
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: "100vh", // Use minHeight to allow content to expand
          display: "flex",
          flexDirection: "column",
          // Use a subtle linear gradient for a premium background
          background: "linear-gradient(135deg, #f0f2f5 0%, #e0e6ec 100%)",
          color: "text.primary",
          overflowX: "hidden", // Prevent horizontal scrolling
        }}
      >
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ position: "sticky", top: 0, zIndex: 100 }} // Make header sticky
        >
          <Paper
            elevation={4} // Higher elevation for prominence
            sx={{
              py: 2,
              px: { xs: 2, sm: 3 }, // Responsive padding
              background: "linear-gradient(90deg, #6a0dad 0%, #8e2de2 100%)", // Gradient header
              color: "white", // White text on gradient
              borderRadius: "0 0 20px 20px", // More pronounced rounded bottom
              boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)", // Stronger shadow
              textAlign: "center",
            }}
          >
            <Typography variant="h5" fontWeight="bold">
              Calorie Tracker Dashboard 🍏
            </Typography>
          </Paper>
        </motion.div>

        {/* Tables/Summary Cards Section */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "row" }, // Cards will attempt to go side-by-side from smallest screens
            gap: 2,
            px: { xs: 2, sm: 3 },
            mt: 3, // Increased top margin
            justifyContent: "center",
            alignItems: "flex-start", // Align items to the top
            flexWrap: "wrap", // Allow items to wrap if they cannot fit side-by-side
          }}
        >
          {/* Total Calories Summary Card */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            sx={{
              flex: "1 1 calc(50% - 8px)", // Attempt to take half space, considering gap
              minWidth: "160px", // Minimum width before wrapping to full width
              maxWidth: {
                xs: "calc(100% - 16px)", // Max width if it has to stack on very small screens (due to minWidth conflict)
                sm: "250px", // Max width on small desktops/tablets
                md: "350px", // Max width on medium desktops
                lg: "450px", // Max width on large desktops ("full fledge")
              },
              cursor: "pointer",
            }}
          >
            <Paper
              elevation={6} // Higher elevation
              onClick={() => navigate("/Analysis")}
              sx={{
                p: 3, // Increased padding
                borderRadius: 3, // More rounded
                background: "linear-gradient(45deg, #ffffff 30%, #f9f9f9 90%)", // Subtle gradient
                textAlign: "center",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 12px 25px rgba(0, 0, 0, 0.15)", // More pronounced hover shadow
                  border: "1px solid #6a0dad", // Subtle border on hover
                },
              }}
            >
              <Typography
                variant="h6"
                color="text.secondary"
                gutterBottom
                sx={{ textTransform: "uppercase", letterSpacing: 1 }}
              >
                Total Calories Today
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                  mt: 1,
                }}
              >
                <Typography variant="h3" fontWeight="bold" color="primary.main">
                  {" "}
                  {/* Use theme primary color */}
                  {mealTimingChartData.reduce(
                    (acc, curr) => acc + curr.value,
                    0
                  )}
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                kcal 🔥
              </Typography>
            </Paper>
          </motion.div>

          {/* Macronutrients Table Card */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            sx={{
              flex: "1 1 calc(50% - 8px)", // Attempt to take half space, considering gap
              minWidth: "180px", // Minimum width before wrapping to full width
              maxWidth: {
                xs: "calc(100% - 16px)", // Max width if it has to stack on very small screens (due to minWidth conflict)
                sm: "350px", // Max width on small desktops/tablets
                md: "500px", // Max width on medium desktops
                lg: "650px", // Max width on large desktops ("full fledge")
              },
              cursor: "pointer",
            }}
          >
            <Paper
              elevation={6} // Higher elevation
              onClick={() => navigate("/macroAnalysis")}
              sx={{
                p: 3, // Increased padding
                borderRadius: 3, // More rounded
                background: "linear-gradient(45deg, #ffffff 30%, #f9f9f9 90%)", // Subtle gradient
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 12px 25px rgba(0, 0, 0, 0.15)", // More pronounced hover shadow
                  border: "1px solid #00bcd4", // Subtle border on hover
                },
              }}
            >
              <Typography
                variant="h6"
                color="text.secondary"
                gutterBottom
                sx={{
                  textAlign: "center",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Macronutrients 💪
              </Typography>
              <TableContainer>
                <Table
                  size="medium" // Larger table size
                  sx={{
                    "& .MuiTableCell-root": {
                      py: 1, // Increased vertical padding for cells
                      fontSize: "0.95rem", // Slightly larger font
                      borderBottom: "none", // No cell borders
                    },
                  }}
                >
                  <TableBody>
                    {macrosChartData.map((row) => (
                      <TableRow
                        key={row.label}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell
                          component="th"
                          scope="row"
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5, // Increased gap
                            pl: 1,
                            fontWeight: 500, // Slightly bolder
                          }}
                        >
                          <span>{getEmoji(row.label)}</span>
                          <Typography variant="body1" color="text.primary">
                            {row.label}
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ pr: 1 }}>
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            color="secondary.main"
                          >
                            {" "}
                            {/* Use theme secondary color */}
                            {row.value.toFixed(1)}g
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </motion.div>
        </Box>

        {/* Meal Summary Response Area */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            px: { xs: 2, sm: 3 },
            py: 3,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            maxWidth: "800px", // Max width for content area
            margin: "0 auto", // Center the content
            width: "100%", // Ensure it takes full width within its max-width
          }}
        >
          {response && Array.isArray(response) && response.length > 0 ? (
            response.map((entry, index) => (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 * index }} // Staggered animation
                key={entry.timestamp}
              >
                {entry.type === "system" ? (
                  // Render system message (timing prompt)
                  <Paper
                    sx={{
                      p: 2,
                      bgcolor: "primary.light",
                      color: "white",
                      borderRadius: 2,
                    }}
                  >
                    <Typography>{entry.message}</Typography>
                  </Paper>
                ) : (
                  // Render normal meal entry
                  <Paper
                    elevation={4} // Good elevation for each card
                    sx={{
                      p: 3, // Increased padding
                      borderRadius: 3, // Rounded corners
                      background: "white", // Clean white background for chat bubbles
                      position: "relative",
                      border: "1px solid rgba(0, 0, 0, 0.05)", // Subtle border
                      boxShadow: "0 6px 15px rgba(0, 0, 0, 0.08)", // More refined shadow
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteResponse(entry.timestamp)}
                      sx={{
                        position: "absolute",
                        right: 12,
                        top: 12,
                        padding: "6px",
                        color: "text.secondary", // Neutral color
                        transition:
                          "color 0.2s ease, background-color 0.2s ease",
                        "&:hover": {
                          color: "error.main", // Red on hover for delete
                          bgcolor: "rgba(255, 0, 0, 0.08)",
                        },
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1.5, // Increased bottom margin
                        pr: 4, // Space for delete icon
                      }}
                    >
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        color="primary.dark"
                      >
                        Meal Summary
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </Typography>
                    </Box>

                    <Typography
                      variant="body1"
                      sx={{
                        mb: 1,
                        fontStyle: "italic",
                        color: "text.secondary",
                      }}
                    >
                      "{entry.data.notes || "No additional notes"}"
                    </Typography>

                    {entry.data.items?.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography
                          variant="subtitle2"
                          fontWeight="bold"
                          color="primary.main"
                          sx={{ mb: 1 }}
                        >
                          Items Consumed:
                        </Typography>
                        {entry.data.items?.map((item, itemIndex) => (
                          <Box key={itemIndex} sx={{ pl: 1, mb: 1 }}>
                            <Typography
                              variant="body1"
                              fontWeight="medium"
                              color="text.primary"
                            >
                              🍽️ {item.name} ({item.originalQuantity})
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Calories: {item.calories} kcal | Protein:{" "}
                              {item.protein}g | Carbs: {item.carbs}g | Fats:{" "}
                              {item.fats}g
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}

                    <Box
                      mt={3}
                      pt={2}
                      sx={{ borderTop: "1px dashed #eee", textAlign: "right" }}
                    >
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        color="text.primary"
                      >
                        Total Macros:
                      </Typography>
                      <Typography
                        variant="body1"
                        fontWeight="medium"
                        color="primary.main"
                      >
                        Calories: {entry.data.total?.calories} kcal, Protein:{" "}
                        {entry.data.total?.protein}g, Carbs:{" "}
                        {entry.data.total?.carbs}g, Fats:{" "}
                        {entry.data.total?.fats}g
                      </Typography>
                    </Box>
                  </Paper>
                )}
              </motion.div>
            ))
          ) : (
            <Box sx={{ textAlign: "center", mt: 4, color: "text.secondary" }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                👋 Welcome! Start tracking your meals!
              </Typography>
              <Typography variant="body1">
                Enter what you ate in the input field below to get started.
              </Typography>
            </Box>
          )}
        </Box>

        {/* Input Area */}
        <Box
          sx={{
            padding: { xs: 2, sm: 3 },
            pb: { xs: 2, sm: 4 },
            position: "sticky",
            bottom: 0,
            zIndex: 100,
          }}
        >
          <Paper
            component="form"
            onSubmit={handleSubmit}
            elevation={8} // Higher elevation for a floating effect
            sx={{
              p: 1.5,
              background: "linear-gradient(90deg, #ffffff 0%, #fcfcfc 100%)", // Light gradient for input
              borderRadius: "40px",
              maxWidth: "700px", // Increased max width
              margin: "0 auto",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)", // More prominent shadow
              border: "1px solid rgba(0, 0, 0, 0.08)", // Slightly stronger border
            }}
          >
            <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
              {" "}
              {/* Increased gap */}
              <TextField
                fullWidth
                multiline
                maxRows={4}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="What did you eat? E.g., '1 scoop of vanilla protein, 2 eggs, 1 banana'"
                variant="standard"
                sx={{
                  mx: 2,
                  "& .MuiInput-root": {
                    fontSize: "17px", // Slightly larger font
                    padding: "10px 0", // Adjust padding
                    "&:before, &:after": {
                      display: "none", // Remove default Material-UI underlines
                    },
                  },
                  "& .MuiInput-input": {
                    "&::placeholder": {
                      color: "text.secondary",
                      opacity: 0.8,
                    },
                  },
                }}
              />
              <IconButton
                type="submit"
                disabled={isLoading || !input.trim()}
                sx={{
                  bgcolor: "primary.main", // Use theme primary color
                  color: "white",
                  "&:hover": {
                    bgcolor: "primary.dark", // Darker primary on hover
                    transform: "scale(1.05)", // Slight scale on hover
                  },
                  height: 48, // Larger button
                  width: 48, // Larger button
                  borderRadius: "50%",
                  flexShrink: 0,
                  transition: "all 0.3s ease",
                  "&:disabled": {
                    bgcolor: "rgba(0, 0, 0, 0.1)", // Lighter disabled color
                    color: "rgba(255, 255, 255, 0.6)",
                    boxShadow: "none",
                  },
                  boxShadow: "0 4px 12px rgba(106, 13, 173, 0.3)", // Shadow based on primary color
                  mr: 1, // Margin to the right
                }}
              >
                {isLoading ? (
                  // Loader for loading state
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  // Send icon when not loading
                  <SendIcon fontSize="medium" />
                )}
              </IconButton>
            </Box>
          </Paper>
        </Box>

        {/* Timing Selection Dialog */}
        <Dialog
          open={showTimingDialog}
          onClose={() => setShowTimingDialog(false)}
        >
          <DialogTitle>What time of day did you eat this?</DialogTitle>
          <DialogContent>
            <Select
              fullWidth
              value={selectedTiming}
              onChange={(e) => setSelectedTiming(e.target.value)}
              sx={{ mt: 2 }}
            >
              <MenuItem value="breakfast">Breakfast</MenuItem>
              <MenuItem value="lunch">Lunch</MenuItem>
              <MenuItem value="dinner">Dinner</MenuItem>
              <MenuItem value="snacks">Snacks</MenuItem>
            </Select>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowTimingDialog(false)} color="inherit">
              Cancel
            </Button>
            <Button
              onClick={() => handleTimingSelect(selectedTiming)}
              color="primary"
              disabled={!selectedTiming}
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default DashBoard;
