import {
  buildPlanAlertClass,
  formatCurrency,
  formatDateDisplay,
  getAttendanceForDate,
  getCurrentMonthPrefix,
  getEffectiveMemberStatus,
  getLastNDays,
  getMemberName,
  getMemberPlanAlert,
  getOutstandingDue,
  getPlanName,
  getStatusClass,
  getTrainerName,
} from "./gym";

export function buildDashboardData(state, todayKey, alerts) {
  const activeMembers = state.members.filter((member) => getEffectiveMemberStatus(state, member) === "Active");
  const billableMembers = activeMembers.filter((member) => getMemberPlanAlert(state, member).type !== "expired");
  const presentToday = getAttendanceForDate(state, todayKey);
  const monthlyRevenue = billableMembers.reduce(
    (total, member) => total + (state.plans.find((plan) => plan.id === member.planId)?.price || 0),
    0
  );
  const attendanceRate = activeMembers.length ? Math.round((presentToday.length / activeMembers.length) * 100) : 0;

  const recentMembers = [...state.members]
    .sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate))
    .slice(0, 6)
    .map((member) => {
      const status = getEffectiveMemberStatus(state, member);
      return {
        id: member.id,
        name: member.name,
        planName: getPlanName(state, member.planId),
        status,
        statusClass: getStatusClass(status),
        joinedAt: formatDateDisplay(member.joinDate),
      };
    });

  return {
    metrics: {
      totalMembers: state.members.length,
      activeMembers: activeMembers.length,
      todayAttendance: presentToday.length,
      monthlyRevenue: formatCurrency(monthlyRevenue),
      snapshotPresent: presentToday.length,
      snapshotAbsent: Math.max(activeMembers.length - presentToday.length, 0),
      snapshotTrainers: state.trainers.length,
      snapshotRate: `${attendanceRate}%`,
      snapshotPlanAlerts: alerts.length,
    },
    recentMembers,
  };
}

export function buildAlertSummary(alerts) {
  const expiredCount = alerts.filter((item) => item.alert.type === "expired").length;
  const dueCount = alerts.filter((item) => item.alert.type === "due").length;
  const parts = [];

  if (expiredCount) {
    parts.push(`${expiredCount} expired`);
  }
  if (dueCount) {
    parts.push(`${dueCount} expiring in 7 days`);
  }

  return {
    totalCount: alerts.length,
    title: `${alerts.length} plan alerts need attention`,
    text: parts.join(" | "),
    actionLabel: expiredCount ? "Review Expired Members" : "Review Expiring Members",
    critical: expiredCount > 0,
  };
}

export function buildMembersRows(state, memberSearch, memberStatusFilter) {
  let rows = [...state.members].sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate));
  const query = memberSearch.trim().toLowerCase();

  if (memberStatusFilter === "ExpiringSoon") {
    rows = rows.filter((member) => member.status === "Active" && getMemberPlanAlert(state, member).type === "due");
  } else if (memberStatusFilter === "PlanExpired") {
    rows = rows.filter((member) => member.status === "Active" && getMemberPlanAlert(state, member).type === "expired");
  } else if (memberStatusFilter !== "All") {
    rows = rows.filter((member) => getEffectiveMemberStatus(state, member) === memberStatusFilter);
  }

  if (query) {
    rows = rows.filter((member) => {
      const searchable = `${member.name} ${member.phone} ${member.email || ""}`.toLowerCase();
      return searchable.includes(query);
    });
  }

  return rows.map((member) => {
    const planAlert = getMemberPlanAlert(state, member);
    const status = getEffectiveMemberStatus(state, member);

    return {
      id: member.id,
      name: member.name,
      phone: member.phone,
      email: member.email,
      planName: getPlanName(state, member.planId),
      trainerName: getTrainerName(state, member.trainerId),
      status,
      statusClass: getStatusClass(status),
      joinDate: formatDateDisplay(member.joinDate),
      expiryDate: planAlert.expiryDateKey ? formatDateDisplay(planAlert.expiryDateKey) : "-",
      planAlertLabel: planAlert.label,
      planAlertType: planAlert.type,
      planAlertClass: buildPlanAlertClass(planAlert.type),
      rowClass: planAlert.type === "expired" ? "member-row-expired" : planAlert.type === "due" ? "member-row-due" : "",
      nextAction: member.status === "Active" ? "Freeze" : "Activate",
      showRenew: planAlert.type === "expired" || planAlert.type === "due",
    };
  });
}

export function buildPlansCards(state) {
  return state.plans.map((plan) => ({
    ...plan,
    price: formatCurrency(plan.price),
    memberCount: state.members.filter((member) => member.planId === plan.id).length,
  }));
}

export function buildAttendanceData(state, attendanceDate) {
  const activeMembers = state.members
    .filter((member) => getEffectiveMemberStatus(state, member) === "Active")
    .sort((a, b) => a.name.localeCompare(b.name));
  const presentSet = new Set(getAttendanceForDate(state, attendanceDate));
  const rows = activeMembers.map((member) => ({
    id: member.id,
    name: member.name,
    planName: getPlanName(state, member.planId),
    present: presentSet.has(member.id),
  }));
  const presentCount = presentSet.size;

  return {
    rows,
    summary: {
      presentCount,
      absentCount: Math.max(activeMembers.length - presentCount, 0),
      activeMembers: activeMembers.length,
      rate: `${activeMembers.length ? Math.round((presentCount / activeMembers.length) * 100) : 0}%`,
    },
  };
}

export function buildBillingData(state) {
  const payments = [...state.payments]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 150)
    .map((payment) => ({
      id: payment.id,
      date: formatDateDisplay(payment.date),
      memberName: getMemberName(state, payment.memberId),
      amount: formatCurrency(payment.amount),
      mode: payment.mode || "-",
      reference: payment.reference || "-",
      recordedBy: payment.recordedBy || "-",
    }));

  const activeMembers = state.members.filter((member) => member.status === "Active");
  const outstandingTotal = activeMembers.reduce((sum, member) => sum + getOutstandingDue(state, member), 0);
  const pendingMembers = activeMembers.filter((member) => getOutstandingDue(state, member) > 0).length;
  const collectedMonth = state.payments
    .filter((payment) => String(payment.date || "").startsWith(getCurrentMonthPrefix()))
    .reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);

  const memberOptions = [...state.members]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((member) => ({
      id: member.id,
      label: `${member.name} (Due: ${formatCurrency(getOutstandingDue(state, member))})`,
    }));

  return {
    payments,
    memberOptions,
    stats: {
      outstandingTotal: formatCurrency(outstandingTotal),
      collectedMonth: formatCurrency(collectedMonth),
      pendingMembers,
    },
  };
}

export function buildTrainersRows(state) {
  return state.trainers.map((trainer) => ({
    ...trainer,
    assignedMembers: state.members.filter((member) => member.trainerId === trainer.id).length,
  }));
}

export function buildStaffRows(staffUsers, currentUserId) {
  return staffUsers.map((user) => {
    const roleLabel = user.role === "owner" ? "Owner" : user.role === "receptionist" ? "Receptionist" : "Trainer";
    const statusLabel = user.isActive ? "Active" : "Disabled";

    return {
      ...user,
      roleLabel,
      statusLabel,
      statusClass: user.isActive ? "status status-active" : "status status-expired",
      locked: user.role === "owner" || user.id === currentUserId,
    };
  });
}

export function buildReportsData(state, canManage) {
  const activeMembers = state.members.filter((member) => getEffectiveMemberStatus(state, member) === "Active");
  const billableMembers = activeMembers.filter((member) => getMemberPlanAlert(state, member).type !== "expired");
  const expectedRevenue = billableMembers.reduce(
    (total, member) => total + (state.plans.find((plan) => plan.id === member.planId)?.price || 0),
    0
  );

  const monthlyKeys = Object.keys(state.attendance).filter((key) => key.startsWith(getCurrentMonthPrefix()));
  const monthlyAttendanceTotal = monthlyKeys.reduce((total, key) => total + getAttendanceForDate(state, key).length, 0);
  const avgDailyAttendance = monthlyKeys.length ? (monthlyAttendanceTotal / monthlyKeys.length).toFixed(1) : "0.0";
  const activePlanCount = new Set(billableMembers.map((member) => member.planId)).size;
  const outstandingDues = state.members
    .filter((member) => member.status === "Active")
    .reduce((sum, member) => sum + getOutstandingDue(state, member), 0);

  const last7Days = getLastNDays(7);
  const counts = last7Days.map((day) => getAttendanceForDate(state, day.key).length);
  const maxCount = Math.max(...counts, 1);
  const bars = last7Days.map((day, index) => ({
    ...day,
    percent: Math.round((counts[index] / maxCount) * 100),
  }));

  const reminders = [...state.reminders]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 120)
    .map((reminder) => ({
      ...reminder,
      memberName: getMemberName(state, reminder.memberId),
      statusClass: reminder.status === "Sent" ? "status status-active" : "status status-frozen",
      canMarkSent: reminder.status === "Pending" && canManage,
    }));

  return {
    overview: {
      revenue: formatCurrency(expectedRevenue),
      dailyAttendance: avgDailyAttendance,
      activePlans: activePlanCount,
      trainerCount: state.trainers.length,
      outstandingDues: formatCurrency(outstandingDues),
    },
    bars,
    reminders,
  };
}

export function buildCurrentUserLabel(currentUser) {
  if (!currentUser) {
    return "Guest";
  }

  return `${currentUser.name || currentUser.username} (${String(currentUser.role || "guest").toUpperCase()})`;
}

export function buildMembersExportRows(state) {
  const rows = [["Member Name", "Phone", "Email", "Plan", "Status", "Join Date", "Expiry Date", "Due Amount (INR)", "Plan Alert"]];

  state.members.forEach((member) => {
    const alert = getMemberPlanAlert(state, member);
    rows.push([
      member.name,
      member.phone,
      member.email || "",
      getPlanName(state, member.planId),
      getEffectiveMemberStatus(state, member),
      member.joinDate || "",
      alert.expiryDateKey || "",
      String(getOutstandingDue(state, member)),
      alert.label,
    ]);
  });

  return rows;
}

export function buildPaymentsExportRows(state) {
  const rows = [["Date", "Member", "Amount (INR)", "Mode", "Reference", "Recorded By", "Notes"]];

  [...state.payments]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach((payment) => {
      rows.push([
        payment.date || "",
        getMemberName(state, payment.memberId),
        String(payment.amount || 0),
        payment.mode || "",
        payment.reference || "",
        payment.recordedBy || "",
        payment.note || "",
      ]);
    });

  return rows;
}

export function buildExpiryExportRows(state, alerts) {
  const rows = [["Member", "Phone", "Plan", "Expiry Date", "Alert Type", "Message"]];

  alerts.forEach(({ member, alert }) => {
    rows.push([member.name, member.phone, getPlanName(state, member.planId), alert.expiryDateKey || "", alert.type, alert.label]);
  });

  return rows;
}
