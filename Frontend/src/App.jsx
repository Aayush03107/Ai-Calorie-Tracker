import React from "react";
import { Route } from "react-router-dom";
import { Routes } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material";
import Home from "./Pages/Home";
import Register from "./Pages/Register";
import Login from "./Pages/Login";
import DashBoard from "./Pages/DashBoard";
import DashboardProtect from "./ProtectWrappers/DashboardProtect";
import Analysis from "./Pages/Analysis";
import MacroAnalysis from "./Pages/MacroAnalysis";
import WeeklyDataTotal from "./Pages/WeeklyDataTotal";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <DashboardProtect>
                <DashBoard />
              </DashboardProtect>
            }
          />
          <Route path="/Analysis" element={<Analysis />} />
          <Route path="/macroAnalysis" element={<MacroAnalysis />} />
          <Route
            path="/WeeklyDataTotal"
            element={<WeeklyDataTotal/>}/>
        </Routes>
      </div>
    </ThemeProvider>
  );
};
export default App;
