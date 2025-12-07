export const getGreeting = (date) => {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

export const getStreakColor = (days) => {
  if (days >= 30) return "text-purple-400";
  if (days >= 14) return "text-blue-400";
  if (days >= 7) return "text-green-400";
  return "text-yellow-400";
};

export const getScoreGradient = (score) => {
  if (score >= 90) return "from-purple-500 to-pink-500";
  if (score >= 80) return "from-blue-500 to-cyan-500";
  if (score >= 70) return "from-green-500 to-emerald-500";
  return "from-yellow-500 to-orange-500";
};

export const formatTime = (minutes) => {
  if (!minutes || minutes <= 0) return "0m";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};
