import React from "react";
import { Navigate } from "react-router-dom";

const DashboardProtect = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
};
export default DashboardProtect;
