import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Box, useTheme } from "@mui/material";

const COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"];

const Charts = ({ data }) => {
  const theme = useTheme();

  const total = data.reduce((sum, entry) => sum + entry.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { label, value } = payload[0].payload;
      const percent = ((value / total) * 100).toFixed(1);
      return (
        <Box
          sx={{
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            border: "1px solid",
            borderColor: theme.palette.divider,
            px: 1.5,
            py: 1,
            borderRadius: 1,
            fontSize: 13,
          }}
        >
          <strong>{label}</strong>: {value} ({percent}%)
        </Box>
      );
    }
    return null;
  };

  return (
    <Box sx={{ width: "100%", height: 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={45} // 🟢 Doughnut hole
            outerRadius={70}
            fill="#8884d8"
            dataKey="value"
            nameKey="label"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default Charts;
