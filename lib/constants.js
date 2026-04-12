import { ClipboardCheck, Target, Zap, Brain, BookOpen } from "lucide-react";

export const ADULT_BELTS = {
  white: { bg: "#F5F5F0", text: "#1a1a1a", label: "White", labelAr: "أبيض", dual: null },
  blue: { bg: "#1E40AF", text: "#fff", label: "Blue", labelAr: "أزرق", dual: null },
  purple: { bg: "#7C3AED", text: "#fff", label: "Purple", labelAr: "بنفسجي", dual: null },
  brown: { bg: "#78350F", text: "#fff", label: "Brown", labelAr: "بني", dual: null },
  black: { bg: "#18181B", text: "#fff", label: "Black", labelAr: "أسود", dual: null },
};

export const KIDS_BELTS = {
  white: { bg: "#F5F5F0", text: "#1a1a1a", label: "White", labelAr: "أبيض", dual: null },
  grey_white: { bg: "#F5F5F0", text: "#1a1a1a", label: "Grey & White", labelAr: "رمادي وأبيض", dual: "#9CA3AF" },
  grey: { bg: "#9CA3AF", text: "#fff", label: "Grey", labelAr: "رمادي", dual: null },
  grey_black: { bg: "#9CA3AF", text: "#fff", label: "Grey & Black", labelAr: "رمادي وأسود", dual: "#18181B" },
  yellow_white: { bg: "#F5F5F0", text: "#1a1a1a", label: "Yellow & White", labelAr: "أصفر وأبيض", dual: "#EAB308" },
  yellow: { bg: "#EAB308", text: "#1a1a1a", label: "Yellow", labelAr: "أصفر", dual: null },
  yellow_black: { bg: "#EAB308", text: "#1a1a1a", label: "Yellow & Black", labelAr: "أصفر وأسود", dual: "#18181B" },
  orange_white: { bg: "#F5F5F0", text: "#1a1a1a", label: "Orange & White", labelAr: "برتقالي وأبيض", dual: "#EA580C" },
  orange: { bg: "#EA580C", text: "#fff", label: "Orange", labelAr: "برتقالي", dual: null },
  orange_black: { bg: "#EA580C", text: "#fff", label: "Orange & Black", labelAr: "برتقالي وأسود", dual: "#18181B" },
  green_white: { bg: "#F5F5F0", text: "#1a1a1a", label: "Green & White", labelAr: "أخضر وأبيض", dual: "#16A34A" },
  green: { bg: "#16A34A", text: "#fff", label: "Green", labelAr: "أخضر", dual: null },
  green_black: { bg: "#16A34A", text: "#fff", label: "Green & Black", labelAr: "أخضر وأسود", dual: "#18181B" },
};

export const ALL_BELTS = { ...ADULT_BELTS, ...KIDS_BELTS };

export const getBeltMap = (dob) => {
  if (!dob) return ADULT_BELTS;
  const age = Math.floor((new Date() - new Date(dob)) / (365.25 * 24 * 60 * 60 * 1000));
  return age < 16 ? KIDS_BELTS : ADULT_BELTS;
};

export const getBeltInfo = (belt) => ALL_BELTS[belt] || ADULT_BELTS.white;

export const getAge = (dob) => dob ? Math.floor((new Date() - new Date(dob)) / (365.25 * 24 * 60 * 60 * 1000)) : null;

export const isKid = (dob) => { const a = getAge(dob); return a !== null && a < 16; };

export const PHYSICAL_ITEMS = [
  { key: "heartbeat_rest", label: "Heartbeat (Rest)", labelAr: "نبض القلب (راحة)", unit: "bpm", group: "cardio" },
  { key: "heartbeat_max", label: "Heartbeat (Max)", labelAr: "نبض القلب (أقصى)", unit: "bpm", group: "cardio" },
  { key: "pushup", label: "Push-ups", labelAr: "تمرين الضغط", unit: "max", group: "strength" },
  { key: "crunch", label: "Crunches", labelAr: "تمرين البطن", unit: "rpm", group: "strength" },
  { key: "pullup", label: "Pull-ups", labelAr: "تمرين العقلة", unit: "max", group: "strength" },
  { key: "squat", label: "Squat", labelAr: "سكوات", unit: "kg×r", group: "strength" },
  { key: "deadlift", label: "Deadlift", labelAr: "ديدلفت", unit: "kg×r", group: "strength" },
  { key: "benchpress", label: "Bench Press", labelAr: "بنش برس", unit: "kg×r", group: "strength" },
  { key: "barbentrow", label: "Bent Row", labelAr: "بنت رو", unit: "kg", group: "strength" },
  { key: "forward_jump", label: "Forward Jump", labelAr: "القفز للأمام", unit: "m", group: "explosiveness" },
  { key: "single_leg_r", label: "Single Leg (R)", labelAr: "رجل واحدة (ي)", unit: "m", group: "explosiveness" },
  { key: "single_leg_l", label: "Single Leg (L)", labelAr: "رجل واحدة (ش)", unit: "m", group: "explosiveness" },
  { key: "sprint_50m", label: "50m Sprint", labelAr: "عدو 50م", unit: "sec", group: "speed" },
  { key: "sprint_100m", label: "100m Sprint", labelAr: "عدو 100م", unit: "sec", group: "speed" },
  { key: "run_400m", label: "400m Run", labelAr: "جري 400م", unit: "sec", group: "endurance" },
  { key: "run_800m", label: "800m Run", labelAr: "جري 800م", unit: "sec", group: "endurance" },
  { key: "balance_r", label: "Static Balance (R)", labelAr: "توازن ثابت (ي)", unit: "30s", group: "balanceMobility" },
  { key: "balance_l", label: "Static Balance (L)", labelAr: "توازن ثابت (ش)", unit: "30s", group: "balanceMobility" },
  { key: "dynamic_r", label: "Dynamic Balance (R)", labelAr: "توازن متحرك (ي)", unit: "3j", group: "balanceMobility" },
  { key: "dynamic_l", label: "Dynamic Balance (L)", labelAr: "توازن متحرك (ش)", unit: "3j", group: "balanceMobility" },
  { key: "lateral", label: "Lateral Mobility", labelAr: "المرونة الجانبية", unit: "rate", group: "balanceMobility" },
];

export const TECHNICAL_ITEMS = [
  { key: "bf_back", label: "Back Breakfall", labelAr: "السقطة الخلفية", group: "breakfalls" },
  { key: "bf_side", label: "Side Breakfall", labelAr: "السقطة الجانبية", group: "breakfalls" },
  { key: "bf_front", label: "Front Breakfall", labelAr: "السقطة الأمامية", group: "breakfalls" },
  { key: "st_grabs", label: "Grabs", labelAr: "المسكات", group: "standingMovement" },
  { key: "st_conn", label: "Connection", labelAr: "الاتصال", group: "standingMovement" },
  { key: "st_coord", label: "Coordination", labelAr: "التنسيق", group: "standingMovement" },
  { key: "st_base", label: "Base", labelAr: "القاعدة", group: "standingMovement" },
  { key: "st_post", label: "Posture", labelAr: "الوضعية", group: "standingMovement" },
  { key: "st_struct", label: "Structure", labelAr: "البنية", group: "standingMovement" },
  { key: "tp_grabs", label: "Grabs", labelAr: "المسكات", group: "topMovement" },
  { key: "tp_conn", label: "Connection", labelAr: "الاتصال", group: "topMovement" },
  { key: "tp_coord", label: "Coordination", labelAr: "التنسيق", group: "topMovement" },
  { key: "tp_base", label: "Base", labelAr: "القاعدة", group: "topMovement" },
  { key: "tp_post", label: "Posture", labelAr: "الوضعية", group: "topMovement" },
  { key: "tp_struct", label: "Structure", labelAr: "البنية", group: "topMovement" },
  { key: "bt_hip", label: "Hip Escape", labelAr: "الهروب بالورك", group: "bottomMovement" },
  { key: "bt_tech", label: "Technical Stand-up", labelAr: "النهوض الفني", group: "bottomMovement" },
  { key: "bt_sit", label: "Sit Escape", labelAr: "الهروب جالساً", group: "bottomMovement" },
  { key: "gd_align", label: "Alignment", labelAr: "المحاذاة", group: "guardFundamentals" },
  { key: "gd_conn", label: "Connection", labelAr: "الاتصال", group: "guardFundamentals" },
  { key: "gd_frame", label: "Frames", labelAr: "الإطارات", group: "guardFundamentals" },
  { key: "gd_base", label: "Base", labelAr: "القاعدة", group: "guardFundamentals" },
  { key: "gd_post", label: "Posture", labelAr: "الوضعية", group: "guardFundamentals" },
  { key: "gd_struct", label: "Structure", labelAr: "البنية", group: "guardFundamentals" },
  { key: "gd_ctrl", label: "Control", labelAr: "السيطرة", group: "guardFundamentals" },
  { key: "gd_grips", label: "Grips", labelAr: "القبضات", group: "guardFundamentals" },
  { key: "gd_hooks", label: "Hooks", labelAr: "الخطافات", group: "guardFundamentals" },
];

export const FIGHTER_ATTRS = [
  { key: "focus", labelKey: "focus", Icon: Target, color: "#E74C3C" },
  { key: "attendance_rating", labelKey: "attendanceRating", Icon: ClipboardCheck, color: "#3498DB" },
  { key: "performance", labelKey: "performance", Icon: Zap, color: "#F39C12" },
  { key: "behavior", labelKey: "behavior", Icon: Brain, color: "#9B59B6" },
  { key: "studying", labelKey: "studying", Icon: BookOpen, color: "#2ECC71" },
];

export const TECH_LEVELS = [
  { value: "", labelKey: null, color: "transparent" },
  { value: "poor", labelKey: "poor", color: "#DC2626" },
  { value: "developing", labelKey: "developing", color: "#F59E0B" },
  { value: "competent", labelKey: "competent", color: "#3B82F6" },
  { value: "proficient", labelKey: "proficient", color: "#8B5CF6" },
  { value: "excellent", labelKey: "excellent", color: "#059669" },
];
