// Mock data — will be replaced by real API responses in Day 6 integration.
export const accuracyData = [
  { date: "Jun 17", accuracy: 62 }, { date: "Jun 19", accuracy: 68 },
  { date: "Jun 21", accuracy: 71 }, { date: "Jun 23", accuracy: 75 },
  { date: "Jun 25", accuracy: 73 }, { date: "Jun 27", accuracy: 79 },
  { date: "Jun 29", accuracy: 82 }, { date: "Jul 1", accuracy: 81 },
  { date: "Jul 3", accuracy: 85 }, { date: "Jul 5", accuracy: 88 },
  { date: "Jul 7", accuracy: 84 }, { date: "Jul 9", accuracy: 91 },
  { date: "Jul 11", accuracy: 89 }, { date: "Jul 13", accuracy: 93 },
  { date: "Jul 15", accuracy: 91 },
];
export const weeklyTime = [
  { day: "Mon", min: 25 }, { day: "Tue", min: 40 }, { day: "Wed", min: 15 },
  { day: "Thu", min: 50 }, { day: "Fri", min: 35 }, { day: "Sat", min: 60 },
  { day: "Sun", min: 45 },
];
// M2 Day 3 (Frontend) — "Lessons completed" bar graph on Learner Dashboard.
export const lessonsCompleted = [
  { week: "Wk 1", count: 4 }, { week: "Wk 2", count: 7 }, { week: "Wk 3", count: 5 },
  { week: "Wk 4", count: 9 }, { week: "Wk 5", count: 6 }, { week: "Wk 6", count: 11 },
];
// M3 Day 3 — Badges & Streaks mock data
export const BADGES = [
  { id: "first-sign",   label: "First Sign",    em: "🌟", earned: true,  desc: "Completed your first sign" },
  { id: "week-warrior", label: "Week Warrior",   em: "🔥", earned: true,  desc: "7 consecutive practice days" },
  { id: "speed-signer", label: "Speed Signer",   em: "⚡", earned: true,  desc: "20 signs in under 5 minutes" },
  { id: "perfect",      label: "Perfect Score",  em: "🏆", earned: true,  desc: "100% on any assessment" },
  { id: "century",      label: "100 Signs",      em: "💯", earned: false, desc: "Practice 100 unique signs" },
  { id: "consistent",   label: "Consistency",    em: "📈", earned: false, desc: "30-day practice streak" },
  { id: "alphabet",     label: "Alphabet Master",em: "🎓", earned: false, desc: "Master all 26 letters" },
];
export const STREAK = { current: 14, best: 21 };
export const weakAreas = [
  { cat: "Numbers", v: 71 }, { cat: "Colors", v: 64 }, { cat: "Emotions", v: 78 },
  { cat: "Actions", v: 82 }, { cat: "Greetings", v: 94 }, { cat: "Questions", v: 69 },
  { cat: "Time", v: 76 },
];
export const adminGrowth = [
  { month: "Feb", users: 1820, comps: 134 }, { month: "Mar", users: 2105, comps: 198 },
  { month: "Apr", users: 2340, comps: 221 }, { month: "May", users: 2580, comps: 267 },
  { month: "Jun", users: 2740, comps: 312 }, { month: "Jul", users: 2847, comps: 341 },
];

// MediaPipe-style hand landmark positions — replaced by Intern 3's real
// MediaPipe output once the AI service is wired in (Day 6-7).
export const LANDMARKS: [number, number][] = [
  [0.50, 0.88],
  [0.38, 0.76], [0.28, 0.67], [0.22, 0.58], [0.18, 0.50],
  [0.42, 0.62], [0.38, 0.47], [0.36, 0.36], [0.35, 0.26],
  [0.50, 0.60], [0.50, 0.44], [0.50, 0.33], [0.50, 0.23],
  [0.58, 0.62], [0.61, 0.46], [0.63, 0.36], [0.64, 0.26],
  [0.66, 0.67], [0.71, 0.54], [0.74, 0.45], [0.76, 0.37],
];
export const CONNECTIONS: [number, number][] = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [0,9],[9,10],[10,11],[11,12],
  [0,13],[13,14],[14,15],[15,16],
  [0,17],[17,18],[18,19],[19,20],
  [5,9],[9,13],[13,17],
];
