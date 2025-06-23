import { Box, Button, Container, Typography, Stack } from "@mui/material";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Container maxWidth="md">
        <Box sx={{ textAlign: "center", color: "white" }}>
          <FitnessCenterIcon sx={{ fontSize: 60, mb: 2 }} />
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            fontWeight="bold"
          >
            Calorie Tracker
          </Typography>
          <Typography variant="h5" sx={{ mb: 4 }}>
            Track your daily calories and achieve your fitness goals
          </Typography>

          <Stack spacing={2} alignItems="center" sx={{ mt: 4 }}>
            <Link
              to="/login"
              style={{
                textDecoration: "none",
                width: "100%",
                maxWidth: "300px",
              }}
            >
              <Button
                variant="contained"
                size="large"
                fullWidth
                sx={{
                  bgcolor: "white",
                  color: "#2196F3",
                  "&:hover": {
                    bgcolor: "#f5f5f5",
                  },
                }}
              >
                Login
              </Button>
            </Link>
            <Typography variant="body2" color="white" sx={{ mt: 2 }}>
              Don't have an account?{" "}
              <Link
                to="/register"
                style={{
                  color: "white",
                  textDecoration: "underline",
                }}
              >
                Create one here
              </Link>
            </Typography>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;
