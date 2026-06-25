export const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
export const ALERT_WINDOW_DAYS = 7;
export const APP_TITLE = "Gym Pro | Workout Plans";

export const viewMeta = {
  dashboard: {
    title: "Dashboard",
    subtitle: "Quick summary of your gym operations",
  },
  members: {
    title: "Members",
    subtitle: "Manage member details, status, and assignments",
  },
  plans: {
    title: "Plans",
    subtitle: "Create and maintain membership pricing plans",
  },
  attendance: {
    title: "Attendance",
    subtitle: "Track daily check-ins and attendance rates",
  },
  billing: {
    title: "Billing",
    subtitle: "Track payments, dues, and renewals",
  },
  workouts: {
    title: "WORKOUT PLANS",
    subtitle: "Create and manage workout programs",
  },
  diet: {
    title: "Diet Plan",
    subtitle: "Maintain diet plans based on member goals",
  },
  trainers: {
    title: "Trainers",
    subtitle: "Manage trainers and member assignments",
  },
  staff: {
    title: "Staff",
    subtitle: "Create and manage staff logins",
  },
  reports: {
    title: "Report",
    subtitle: "See your monthly and weekly performance trends",
  },
};

export const navItems = [
  { id: "dashboard", label: "Dashboard" },
  { id: "members", label: "Members" },
  { id: "plans", label: "Plans" },
  { id: "attendance", label: "Attendance" },
  { id: "billing", label: "Billing" },
  { id: "workouts", label: "Workouts" },
  { id: "diet", label: "Diet Plan" },
  { id: "trainers", label: "Trainers" },
  { id: "staff", label: "Staff" },
  { id: "reports", label: "Report" },
];
