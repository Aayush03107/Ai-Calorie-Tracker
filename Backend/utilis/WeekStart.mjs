function getWeekStartDate(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay(); // 0 (Sun) - 6 (Sat)
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when Sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0); // clear time
  return d;
}
export default getWeekStartDate;