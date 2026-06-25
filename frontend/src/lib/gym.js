import { ALERT_WINDOW_DAYS } from "../constants";

export function uid(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
}

export function cleanText(value) {
  return String(value || "").trim();
}

export function seedState() {
  return {
    members: [],
    plans: [],
    trainers: [],
    attendance: {},
    workoutPlans: [],
    dietPlans: [],
    payments: [],
    reminders: [],
    auditLogs: [],
  };
}

export function normalizeState(data) {
  const fallback = seedState();

  return {
    members: Array.isArray(data?.members) ? data.members : fallback.members,
    plans: Array.isArray(data?.plans) ? data.plans : fallback.plans,
    trainers: Array.isArray(data?.trainers) ? data.trainers : fallback.trainers,
    attendance: data?.attendance && typeof data.attendance === "object" ? data.attendance : fallback.attendance,
    workoutPlans: Array.isArray(data?.workoutPlans) ? data.workoutPlans : fallback.workoutPlans,
    dietPlans: Array.isArray(data?.dietPlans) ? data.dietPlans : fallback.dietPlans,
    payments: Array.isArray(data?.payments) ? data.payments : fallback.payments,
    reminders: Array.isArray(data?.reminders) ? data.reminders : fallback.reminders,
    auditLogs: Array.isArray(data?.auditLogs) ? data.auditLogs : fallback.auditLogs,
  };
}

export function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

export function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getTodayKey() {
  return toDateKey(new Date());
}

export function parseDate(dateString) {
  if (!dateString) {
    return null;
  }

  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
}

export function addMonths(date, months) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

export function getDateDiffInDays(targetDate, baseDate) {
  const utcTarget = Date.UTC(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  const utcBase = Date.UTC(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  return Math.floor((utcTarget - utcBase) / (24 * 60 * 60 * 1000));
}

export function formatDateDisplay(dateString) {
  if (!dateString) {
    return "-";
  }

  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function getCurrentMonthPrefix() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${now.getFullYear()}-${month}`;
}

export function getLastNDays(count) {
  const days = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push({
      key: toDateKey(date),
      label: date.toLocaleDateString("en-IN", { weekday: "short" }),
    });
  }
  return days;
}

export function getUserRole(user) {
  return user?.role || "guest";
}

export function canManageData(user) {
  return ["owner", "receptionist"].includes(getUserRole(user));
}

export function canRecordAttendance(user) {
  return ["owner", "receptionist", "trainer"].includes(getUserRole(user));
}

export function canManageStaff(user) {
  return getUserRole(user) === "owner";
}

export function getAttendanceForDate(state, dateKey) {
  const list = state.attendance[dateKey];
  if (!Array.isArray(list)) {
    return [];
  }
  return Array.from(new Set(list));
}

export function getPlanName(state, planId) {
  const plan = state.plans.find((item) => item.id === planId);
  return plan ? plan.name : "No Plan";
}

export function getPlanPrice(state, planId) {
  const plan = state.plans.find((item) => item.id === planId);
  return plan ? Number(plan.price) || 0 : 0;
}

export function getTrainerName(state, trainerId) {
  if (!trainerId) {
    return "Unassigned";
  }
  const trainer = state.trainers.find((item) => item.id === trainerId);
  return trainer ? trainer.name : "Unassigned";
}

export function getMemberName(state, memberId) {
  const member = state.members.find((item) => item.id === memberId);
  return member ? member.name : "Unknown";
}

export function getMemberPlanAlert(state, member) {
  const plan = state.plans.find((item) => item.id === member.planId);
  if (!plan || !member.joinDate) {
    return { type: "na", daysLeft: Number.NaN, expiryDateKey: "", label: "No active plan" };
  }

  const joinDate = parseDate(member.joinDate);
  if (!joinDate) {
    return { type: "na", daysLeft: Number.NaN, expiryDateKey: "", label: "Invalid join date" };
  }

  const expiryDate = addMonths(joinDate, Number(plan.durationMonths) || 1);
  expiryDate.setDate(expiryDate.getDate() - 1);
  const today = parseDate(getTodayKey());
  const daysLeft = getDateDiffInDays(expiryDate, today);
  const expiryDateKey = toDateKey(expiryDate);

  if (daysLeft < 0) {
    return { type: "expired", daysLeft, expiryDateKey, label: `Expired ${Math.abs(daysLeft)} day(s) ago` };
  }

  if (daysLeft <= ALERT_WINDOW_DAYS) {
    return {
      type: "due",
      daysLeft,
      expiryDateKey,
      label: daysLeft === 0 ? "Expires today" : `Expires in ${daysLeft} day(s)`,
    };
  }

  return { type: "ok", daysLeft, expiryDateKey, label: "Plan active" };
}

export function getEffectiveMemberStatus(state, member) {
  if (member.status !== "Active") {
    return member.status;
  }
  const alert = getMemberPlanAlert(state, member);
  if (alert.type === "expired") {
    return "Expired";
  }
  return "Active";
}

export function getPlanAlerts(state) {
  return state.members
    .filter((member) => member.status === "Active")
    .map((member) => ({ member, alert: getMemberPlanAlert(state, member) }))
    .filter((item) => item.alert.type === "expired" || item.alert.type === "due")
    .sort((a, b) => {
      const rank = { expired: 0, due: 1 };
      const typeDiff = rank[a.alert.type] - rank[b.alert.type];
      if (typeDiff !== 0) {
        return typeDiff;
      }
      return a.alert.daysLeft - b.alert.daysLeft;
    });
}

export function getMemberPaidSinceJoin(state, member) {
  const joinDate = parseDate(member.joinDate);
  return state.payments
    .filter((payment) => {
      if (payment.memberId !== member.id) {
        return false;
      }
      const paymentDate = parseDate(payment.date);
      if (!paymentDate) {
        return false;
      }
      if (!joinDate) {
        return true;
      }
      return paymentDate >= joinDate;
    })
    .reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);
}

export function getOutstandingDue(state, member) {
  const planPrice = getPlanPrice(state, member.planId);
  if (!planPrice) {
    return 0;
  }
  const paid = getMemberPaidSinceJoin(state, member);
  return Math.max(planPrice - paid, 0);
}

export function buildReminderMessage(state, member, alert) {
  const planName = getPlanName(state, member.planId);
  const memberName = member.name;
  const expiryDate = alert.expiryDateKey ? formatDateDisplay(alert.expiryDateKey) : "soon";

  if (alert.type === "expired") {
    return `Hi ${memberName}, your ${planName} plan expired on ${expiryDate}. Please renew to continue uninterrupted access.`;
  }

  return `Hi ${memberName}, your ${planName} plan expires on ${expiryDate}. Please renew in time to avoid interruption.`;
}

export function getStatusClass(status) {
  return `status status-${String(status || "").toLowerCase()}`;
}

export function buildPlanAlertClass(alertType) {
  if (alertType === "expired") {
    return "plan-alert plan-alert-expired";
  }
  if (alertType === "due") {
    return "plan-alert plan-alert-due";
  }
  if (alertType === "ok") {
    return "plan-alert plan-alert-ok";
  }
  return "plan-alert plan-alert-na";
}

export function formToObject(form) {
  const data = new FormData(form);
  return Object.fromEntries(data.entries());
}

export function downloadCsv(fileName, rows) {
  const csv = rows.map((row) => row.map(escapeCsv).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCsv(value) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}
