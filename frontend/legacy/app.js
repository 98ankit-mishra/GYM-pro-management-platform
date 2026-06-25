
const API_BASE = "/api";
const AUTH_TOKEN_KEY = "gympro_auth_token";
const ALERT_WINDOW_DAYS = 7;
const APP_TITLE = "Gym Pro | Workout Plans";

const viewMeta = {
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

const elements = {
  sidebar: document.getElementById("sidebar"),
  overlay: document.getElementById("overlay"),
  menuToggle: document.getElementById("menuToggle"),
  sidebarClose: document.getElementById("sidebarClose"),
  navItems: Array.from(document.querySelectorAll(".nav-item")),
  views: Array.from(document.querySelectorAll(".view")),
  pageTitle: document.getElementById("pageTitle"),
  pageSubtitle: document.getElementById("pageSubtitle"),
  todayDateLabel: document.getElementById("todayDateLabel"),

  authLayer: document.getElementById("authLayer"),
  loginForm: document.getElementById("loginForm"),
  signupForm: document.getElementById("signupForm"),
  showSignupBtn: document.getElementById("showSignupBtn"),
  showLoginBtn: document.getElementById("showLoginBtn"),
  authLoginHint: document.getElementById("authLoginHint"),
  currentUserBadge: document.getElementById("currentUserBadge"),
  changePasswordBtn: document.getElementById("changePasswordBtn"),
  logoutBtn: document.getElementById("logoutBtn"),

  globalMemberSearch: document.getElementById("globalMemberSearch"),
  expiryAlertBtn: document.getElementById("expiryAlertBtn"),
  expiryBanner: document.getElementById("expiryBanner"),
  expiryBannerTitle: document.getElementById("expiryBannerTitle"),
  expiryBannerText: document.getElementById("expiryBannerText"),
  reviewExpiryAlerts: document.getElementById("reviewExpiryAlerts"),
  quickAddMember: document.getElementById("quickAddMember"),

  memberSearch: document.getElementById("memberSearch"),
  memberStatusFilter: document.getElementById("memberStatusFilter"),
  memberForm: document.getElementById("memberForm"),
  memberPlanSelect: document.getElementById("memberPlanSelect"),
  memberTrainerSelect: document.getElementById("memberTrainerSelect"),
  memberJoinDate: document.getElementById("memberJoinDate"),
  membersBody: document.getElementById("membersBody"),

  recentMembersBody: document.getElementById("recentMembersBody"),
  recentMemberCount: document.getElementById("recentMemberCount"),
  metricTotalMembers: document.getElementById("metricTotalMembers"),
  metricActiveMembers: document.getElementById("metricActiveMembers"),
  metricTodayAttendance: document.getElementById("metricTodayAttendance"),
  metricMonthlyRevenue: document.getElementById("metricMonthlyRevenue"),
  snapshotPresent: document.getElementById("snapshotPresent"),
  snapshotAbsent: document.getElementById("snapshotAbsent"),
  snapshotTrainers: document.getElementById("snapshotTrainers"),
  snapshotRate: document.getElementById("snapshotRate"),
  snapshotPlanAlerts: document.getElementById("snapshotPlanAlerts"),

  planForm: document.getElementById("planForm"),
  plansGrid: document.getElementById("plansGrid"),

  attendanceDate: document.getElementById("attendanceDate"),
  markAllPresent: document.getElementById("markAllPresent"),
  clearDayAttendance: document.getElementById("clearDayAttendance"),
  attendanceList: document.getElementById("attendanceList"),
  attendancePresentCount: document.getElementById("attendancePresentCount"),
  attendanceAbsentCount: document.getElementById("attendanceAbsentCount"),
  attendanceActiveMembers: document.getElementById("attendanceActiveMembers"),
  attendanceRate: document.getElementById("attendanceRate"),

  paymentForm: document.getElementById("paymentForm"),
  paymentMemberSelect: document.getElementById("paymentMemberSelect"),
  paymentDate: document.getElementById("paymentDate"),
  paymentsBody: document.getElementById("paymentsBody"),
  billingOutstandingTotal: document.getElementById("billingOutstandingTotal"),
  billingCollectedMonth: document.getElementById("billingCollectedMonth"),
  billingPendingMembers: document.getElementById("billingPendingMembers"),

  workoutForm: document.getElementById("workoutForm"),
  openWorkoutComposer: document.getElementById("openWorkoutComposer"),
  workoutGrid: document.getElementById("workoutGrid"),
  dietForm: document.getElementById("dietForm"),
  dietGrid: document.getElementById("dietGrid"),

  trainerForm: document.getElementById("trainerForm"),
  trainersBody: document.getElementById("trainersBody"),

  reportRevenue: document.getElementById("reportRevenue"),
  reportDailyAttendance: document.getElementById("reportDailyAttendance"),
  reportActivePlans: document.getElementById("reportActivePlans"),
  reportTrainerCount: document.getElementById("reportTrainerCount"),
  reportOutstandingDues: document.getElementById("reportOutstandingDues"),
  attendanceBars: document.getElementById("attendanceBars"),

  remindersBody: document.getElementById("remindersBody"),
  generateWhatsappReminders: document.getElementById("generateWhatsappReminders"),
  generateSmsReminders: document.getElementById("generateSmsReminders"),
  exportMembersCsv: document.getElementById("exportMembersCsv"),
  exportPaymentsCsv: document.getElementById("exportPaymentsCsv"),
  exportExpiryCsv: document.getElementById("exportExpiryCsv"),

  staffForm: document.getElementById("staffForm"),
  staffBody: document.getElementById("staffBody"),
  staffCount: document.getElementById("staffCount"),
  staffEmpty: document.getElementById("staffEmpty"),
};

let state = getSeedState();
let activeView = "workouts";
let staffUsers = [];

const authSession = {
  token: "",
  user: null,
};

init();

function init() {
  const today = getTodayKey();
  if (elements.todayDateLabel) {
    elements.todayDateLabel.textContent = formatDateDisplay(today);
  }
  if (elements.memberJoinDate) {
    elements.memberJoinDate.value = today;
  }
  if (elements.attendanceDate) {
    elements.attendanceDate.value = today;
  }
  if (elements.paymentDate) {
    elements.paymentDate.value = today;
  }

  bindEvents();
  renderAll();
  setActiveView(activeView);
  startSession();
}

function bindEvents() {
  elements.navItems.forEach((item) => {
    item.addEventListener("click", () => setActiveView(item.dataset.viewTarget));
  });

  if (elements.menuToggle) {
    elements.menuToggle.addEventListener("click", openSidebar);
  }
  if (elements.sidebarClose) {
    elements.sidebarClose.addEventListener("click", closeSidebar);
  }
  if (elements.overlay) {
    elements.overlay.addEventListener("click", closeSidebar);
  }

  if (elements.loginForm) {
    elements.loginForm.addEventListener("submit", handleLoginSubmit);
  }
  if (elements.signupForm) {
    elements.signupForm.addEventListener("submit", handleSignupSubmit);
  }
  if (elements.showSignupBtn) {
    elements.showSignupBtn.addEventListener("click", () => setAuthMode("signup"));
  }
  if (elements.showLoginBtn) {
    elements.showLoginBtn.addEventListener("click", () => setAuthMode("login"));
  }
  if (elements.changePasswordBtn) {
    elements.changePasswordBtn.addEventListener("click", handleChangePassword);
  }
  if (elements.logoutBtn) {
    elements.logoutBtn.addEventListener("click", handleLogout);
  }
  if (elements.staffForm) {
    elements.staffForm.addEventListener("submit", handleStaffCreate);
  }
  if (elements.staffBody) {
    elements.staffBody.addEventListener("click", handleStaffRowAction);
  }

  if (elements.quickAddMember) {
    elements.quickAddMember.addEventListener("click", () => {
      if (!canManageData()) {
        alert("You do not have permission to add members.");
        return;
      }
      setActiveView("members");
      const nameField = elements.memberForm?.querySelector("input[name='name']");
      if (nameField) {
        nameField.focus();
      }
    });
  }

  if (elements.expiryAlertBtn) {
    elements.expiryAlertBtn.addEventListener("click", openExpiryAlerts);
  }
  if (elements.reviewExpiryAlerts) {
    elements.reviewExpiryAlerts.addEventListener("click", openExpiryAlerts);
  }

  if (elements.globalMemberSearch) {
    elements.globalMemberSearch.addEventListener("input", (event) => {
      if (!elements.memberSearch) {
        return;
      }
      elements.memberSearch.value = event.target.value;
      if (activeView !== "members") {
        setActiveView("members");
      }
      renderMembers();
    });
  }
  if (elements.memberSearch) {
    elements.memberSearch.addEventListener("input", renderMembers);
  }
  if (elements.memberStatusFilter) {
    elements.memberStatusFilter.addEventListener("change", renderMembers);
  }

  if (elements.memberForm) {
    elements.memberForm.addEventListener("submit", handleMemberCreate);
  }
  if (elements.planForm) {
    elements.planForm.addEventListener("submit", handlePlanCreate);
  }
  if (elements.workoutForm) {
    elements.workoutForm.addEventListener("submit", handleWorkoutCreate);
  }
  if (elements.dietForm) {
    elements.dietForm.addEventListener("submit", handleDietCreate);
  }
  if (elements.trainerForm) {
    elements.trainerForm.addEventListener("submit", handleTrainerCreate);
  }
  if (elements.openWorkoutComposer) {
    elements.openWorkoutComposer.addEventListener("click", toggleWorkoutComposer);
  }
  if (elements.paymentForm) {
    elements.paymentForm.addEventListener("submit", handlePaymentCreate);
  }

  if (elements.membersBody) {
    elements.membersBody.addEventListener("click", handleMemberRowAction);
  }

  if (elements.attendanceDate) {
    elements.attendanceDate.addEventListener("change", renderAttendance);
  }
  if (elements.markAllPresent) {
    elements.markAllPresent.addEventListener("click", markAllPresent);
  }
  if (elements.clearDayAttendance) {
    elements.clearDayAttendance.addEventListener("click", clearDayAttendance);
  }
  if (elements.attendanceList) {
    elements.attendanceList.addEventListener("change", handleAttendanceToggle);
  }

  if (elements.generateWhatsappReminders) {
    elements.generateWhatsappReminders.addEventListener("click", () => handleGenerateReminders("WhatsApp"));
  }
  if (elements.generateSmsReminders) {
    elements.generateSmsReminders.addEventListener("click", () => handleGenerateReminders("SMS"));
  }
  if (elements.remindersBody) {
    elements.remindersBody.addEventListener("click", handleReminderAction);
  }

  if (elements.exportMembersCsv) {
    elements.exportMembersCsv.addEventListener("click", exportMembersCsv);
  }
  if (elements.exportPaymentsCsv) {
    elements.exportPaymentsCsv.addEventListener("click", exportPaymentsCsv);
  }
  if (elements.exportExpiryCsv) {
    elements.exportExpiryCsv.addEventListener("click", exportExpiryCsv);
  }
}

async function startSession() {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!token) {
    showAuthLayer(true);
    setUserBadge();
    await syncAuthSetup();
    return;
  }

  authSession.token = token;
  try {
    const me = await apiRequest("/auth/me");
    authSession.user = me.user;
    showAuthLayer(false);
    setUserBadge();
    await hydrateStateFromServer();
    await hydrateStaffFromServer();
    renderAll();
    setActiveView(activeView);
  } catch (error) {
    authSession.token = "";
    authSession.user = null;
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setUserBadge();
    staffUsers = [];
    showAuthLayer(true);
    await syncAuthSetup();
    console.error(error);
  }
}

function setAuthMode(mode) {
  const showSignup = mode === "signup";
  elements.loginForm?.classList.toggle("hidden", showSignup);
  elements.signupForm?.classList.toggle("hidden", !showSignup);
}

async function syncAuthSetup() {
  if (!elements.loginForm || !elements.signupForm) {
    return;
  }

  try {
    const status = await apiRequest("/auth/setup", { auth: false });
    const setupRequired = Boolean(status && status.setupRequired);

    if (elements.showSignupBtn) {
      elements.showSignupBtn.classList.toggle("hidden", !setupRequired);
    }
    if (elements.showLoginBtn) {
      elements.showLoginBtn.classList.toggle("hidden", setupRequired);
    }
    if (elements.authLoginHint) {
      elements.authLoginHint.textContent = setupRequired ? "First time? Create the owner account to get started." : "Login to continue.";
    }

    setAuthMode(setupRequired ? "signup" : "login");
  } catch (error) {
    if (elements.showSignupBtn) {
      elements.showSignupBtn.classList.add("hidden");
    }
    if (elements.showLoginBtn) {
      elements.showLoginBtn.classList.remove("hidden");
    }
    if (elements.authLoginHint) {
      elements.authLoginHint.textContent = "Login to continue.";
    }
    setAuthMode("login");
  }
}

async function applyAuthPayload(payload) {
  authSession.token = payload.token;
  authSession.user = payload.user;
  localStorage.setItem(AUTH_TOKEN_KEY, payload.token);

  elements.loginForm?.reset();
  elements.signupForm?.reset();
  showAuthLayer(false);
  setUserBadge();

  await hydrateStateFromServer();
  await hydrateStaffFromServer();
  renderAll();
  setActiveView(activeView);
}

async function handleLoginSubmit(event) {
  event.preventDefault();
  const formData = new FormData(elements.loginForm);
  const username = cleanText(formData.get("username"));
  const password = String(formData.get("password") || "");

  if (!username || !password) {
    alert("Username and password are required.");
    return;
  }

  try {
    const payload = await apiRequest("/auth/login", {
      method: "POST",
      body: { username, password },
      auth: false,
    });
    await applyAuthPayload(payload);
  } catch (error) {
    alert(error.message || "Login failed.");
  }
}

async function handleSignupSubmit(event) {
  event.preventDefault();
  const formData = new FormData(elements.signupForm);
  const name = cleanText(formData.get("name"));
  const username = cleanText(formData.get("username"));
  const password = String(formData.get("password") || "");

  if (!username || !password) {
    alert("Username and password are required.");
    return;
  }

  if (username.length < 3 || username.length > 32) {
    alert("Username must be 3-32 characters.");
    return;
  }

  if (password.length < 6) {
    alert("Password must be at least 6 characters.");
    return;
  }

  try {
    const payload = await apiRequest("/auth/signup", {
      method: "POST",
      body: { name, username, password },
      auth: false,
    });
    await applyAuthPayload(payload);
  } catch (error) {
    alert(error.message || "Signup failed.");
  }
}

async function handleLogout() {
  if (authSession.token) {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } catch (error) {
      console.error(error);
    }
  }

  authSession.token = "";
  authSession.user = null;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  state = getSeedState();
  staffUsers = [];
  renderAll();
  showAuthLayer(true);
  setUserBadge();
  await syncAuthSetup();
}

async function handleChangePassword() {
  if (!authSession.user) {
    return;
  }

  const currentPassword = prompt("Enter your current password:");
  if (currentPassword === null) {
    return;
  }

  const newPassword = prompt("Enter your new password (min 6 characters):");
  if (newPassword === null) {
    return;
  }

  if (!currentPassword || !newPassword) {
    alert("Current password and new password are required.");
    return;
  }

  if (newPassword.length < 6) {
    alert("Password must be at least 6 characters.");
    return;
  }

  try {
    await apiRequest("/auth/change-password", {
      method: "POST",
      body: { currentPassword, newPassword },
    });
    alert("Password changed successfully.");
  } catch (error) {
    alert(error.message || "Unable to change password.");
  }
}

async function handleStaffCreate(event) {
  event.preventDefault();

  if (!canManageStaff()) {
    alert("Only the gym owner can manage staff accounts.");
    return;
  }

  const formData = new FormData(elements.staffForm);
  const role = cleanText(formData.get("role"));
  const name = cleanText(formData.get("name"));
  const username = cleanText(formData.get("username"));
  const password = String(formData.get("password") || "");

  if (!role || !name || !username || !password) {
    alert("Please fill all fields.");
    return;
  }

  if (username.length < 3 || username.length > 32) {
    alert("Username must be 3-32 characters.");
    return;
  }

  if (password.length < 6) {
    alert("Password must be at least 6 characters.");
    return;
  }

  try {
    await apiRequest("/users", {
      method: "POST",
      body: { role, name, username, password },
    });

    elements.staffForm.reset();
    await hydrateStaffFromServer();
    renderStaff();
    alert("Staff account created.");
  } catch (error) {
    alert(error.message || "Unable to create staff account.");
  }
}

async function handleStaffRowAction(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) {
    return;
  }

  if (!canManageStaff()) {
    return;
  }

  const action = String(button.dataset.action || "");
  const userId = String(button.dataset.userId || "");
  if (!action || !userId) {
    return;
  }

  const user = staffUsers.find((item) => item.id === userId);
  if (!user) {
    return;
  }

  if (action === "toggle-staff") {
    const nextActive = !user.isActive;
    const label = nextActive ? "activate" : "deactivate";
    if (!confirm(`Do you want to ${label} ${user.username}?`)) {
      return;
    }

    try {
      await apiRequest(`/users/${userId}`, {
        method: "PATCH",
        body: { isActive: nextActive },
      });
      await hydrateStaffFromServer();
      renderStaff();
    } catch (error) {
      alert(error.message || "Unable to update staff status.");
    }

    return;
  }

  if (action === "reset-staff-password") {
    const nextPassword = prompt(`Enter a new password for ${user.username} (min 6 characters):`);
    if (nextPassword === null) {
      return;
    }

    if (!nextPassword) {
      alert("Password is required.");
      return;
    }

    if (nextPassword.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    try {
      await apiRequest(`/users/${userId}/reset-password`, {
        method: "POST",
        body: { password: nextPassword },
      });
      alert("Password reset successfully.");
    } catch (error) {
      alert(error.message || "Unable to reset password.");
    }
  }
}

function setUserBadge() {
  if (!elements.currentUserBadge) {
    return;
  }

  if (!authSession.user) {
    elements.currentUserBadge.textContent = "Guest";
    return;
  }

  const name = authSession.user.name || authSession.user.username;
  const role = (authSession.user.role || "guest").toUpperCase();
  elements.currentUserBadge.textContent = `${name} (${role})`;
}

function showAuthLayer(show) {
  if (!elements.authLayer) {
    return;
  }

  elements.authLayer.classList.toggle("hidden", !show);
}

async function hydrateStateFromServer() {
  const payload = await apiRequest("/state");
  state = normalizeState(payload.data || payload);
}

async function hydrateStaffFromServer() {
  if (!authSession.token || !canManageStaff()) {
    staffUsers = [];
    return;
  }

  try {
    const payload = await apiRequest("/users");
    staffUsers = Array.isArray(payload.users) ? payload.users : [];
  } catch (error) {
    staffUsers = [];
    console.error(error);
  }
}

function normalizeState(data) {
  const fallback = getSeedState();

  return {
    members: Array.isArray(data.members) ? data.members : fallback.members,
    plans: Array.isArray(data.plans) ? data.plans : fallback.plans,
    attendance: data.attendance && typeof data.attendance === "object" ? data.attendance : fallback.attendance,
    workoutPlans: Array.isArray(data.workoutPlans) ? data.workoutPlans : fallback.workoutPlans,
    dietPlans: Array.isArray(data.dietPlans) ? data.dietPlans : fallback.dietPlans,
    trainers: Array.isArray(data.trainers) ? data.trainers : fallback.trainers,
    payments: Array.isArray(data.payments) ? data.payments : fallback.payments,
    reminders: Array.isArray(data.reminders) ? data.reminders : fallback.reminders,
    auditLogs: Array.isArray(data.auditLogs) ? data.auditLogs : fallback.auditLogs,
  };
}

function saveState(action = "state updated") {
  if (!authSession.token) {
    return;
  }

  apiRequest("/state", {
    method: "PUT",
    body: { data: state, action },
  }).catch((error) => {
    console.error(error);
    if (String(error.message || "").toLowerCase().includes("permission")) {
      alert(error.message);
    }
  });
}

async function apiRequest(path, options = {}) {
  const { method = "GET", body, auth = true } = options;
  const headers = {};

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (auth && authSession.token) {
    headers.Authorization = `Bearer ${authSession.token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();

  if (response.status === 401) {
    throw new Error(typeof payload === "string" ? payload : payload.error || "Unauthorized");
  }

  if (!response.ok) {
    throw new Error(typeof payload === "string" ? payload : payload.error || "Request failed");
  }

  return payload;
}

function setActiveView(viewId) {
  if (viewId === "staff" && !canManageStaff()) {
    alert("Only the gym owner can manage staff accounts.");
    return;
  }

  activeView = viewId;

  elements.navItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.viewTarget === viewId);
  });

  elements.views.forEach((view) => {
    view.classList.toggle("active", view.id === viewId);
  });

  const nextMeta = viewMeta[viewId];
  if (nextMeta && elements.pageTitle && elements.pageSubtitle) {
    elements.pageTitle.textContent = nextMeta.title;
    elements.pageSubtitle.textContent = nextMeta.subtitle;
  }

  closeSidebar();
}

function openSidebar() {
  elements.sidebar?.classList.add("open");
  elements.overlay?.classList.add("show");
}

function closeSidebar() {
  elements.sidebar?.classList.remove("open");
  elements.overlay?.classList.remove("show");
}

function renderAll() {
  setUserBadge();
  renderPlanOptions();
  renderTrainerOptions();
  renderPaymentMemberOptions();
  renderDashboard();
  renderPlanAlerts();
  renderMembers();
  renderPlans();
  renderAttendance();
  renderBilling();
  renderWorkouts();
  renderDietPlans();
  renderTrainers();
  renderStaff();
  renderReports();
  applyPermissionsUI();
}

function applyPermissionsUI() {
  const canManage = canManageData();
  const canAttend = canRecordAttendance();
  const canStaff = canManageStaff();

  if (elements.quickAddMember) {
    elements.quickAddMember.disabled = !canManage;
  }
  if (elements.changePasswordBtn) {
    elements.changePasswordBtn.disabled = !authSession.user;
  }
  if (elements.openWorkoutComposer) {
    elements.openWorkoutComposer.disabled = !canManage;
  }
  if (elements.markAllPresent) {
    elements.markAllPresent.disabled = !canAttend;
  }
  if (elements.clearDayAttendance) {
    elements.clearDayAttendance.disabled = !canAttend;
  }
  if (elements.generateWhatsappReminders) {
    elements.generateWhatsappReminders.disabled = !canManage;
  }
  if (elements.generateSmsReminders) {
    elements.generateSmsReminders.disabled = !canManage;
  }
  if (elements.exportMembersCsv) {
    elements.exportMembersCsv.disabled = !canManage;
  }
  if (elements.exportPaymentsCsv) {
    elements.exportPaymentsCsv.disabled = !canManage;
  }
  if (elements.exportExpiryCsv) {
    elements.exportExpiryCsv.disabled = !canManage;
  }

  if (elements.memberForm) {
    elements.memberForm.classList.toggle("hidden", !canManage);
  }
  if (elements.planForm) {
    elements.planForm.classList.toggle("hidden", !canManage);
  }
  if (elements.paymentForm) {
    elements.paymentForm.classList.toggle("hidden", !canManage);
  }
  if (elements.dietForm) {
    elements.dietForm.classList.toggle("hidden", !canManage);
  }
  if (elements.trainerForm) {
    elements.trainerForm.classList.toggle("hidden", !canManage);
  }

  const staffNavItem = elements.navItems.find((item) => item.dataset.viewTarget === "staff");
  if (staffNavItem) {
    staffNavItem.classList.toggle("hidden", !canStaff);
  }
  if (elements.staffForm) {
    elements.staffForm.classList.toggle("hidden", !canStaff);
  }
  if (activeView === "staff" && !canStaff) {
    setActiveView("workouts");
  }
}

function renderDashboard() {
  const todayKey = getTodayKey();
  const activeMembers = state.members.filter((member) => getEffectiveMemberStatus(member) === "Active");
  const billableMembers = activeMembers.filter((member) => getMemberPlanAlert(member).type !== "expired");
  const presentToday = getAttendanceForDate(todayKey);
  const monthlyRevenue = billableMembers.reduce((total, member) => total + getPlanPrice(member.planId), 0);
  const attendanceRate = activeMembers.length
    ? Math.round((presentToday.length / activeMembers.length) * 100)
    : 0;
  const planAlerts = getPlanAlerts();

  if (elements.metricTotalMembers) {
    elements.metricTotalMembers.textContent = state.members.length.toString();
  }
  if (elements.metricActiveMembers) {
    elements.metricActiveMembers.textContent = activeMembers.length.toString();
  }
  if (elements.metricTodayAttendance) {
    elements.metricTodayAttendance.textContent = presentToday.length.toString();
  }
  if (elements.metricMonthlyRevenue) {
    elements.metricMonthlyRevenue.textContent = formatCurrency(monthlyRevenue);
  }

  if (elements.snapshotPresent) {
    elements.snapshotPresent.textContent = presentToday.length.toString();
  }
  if (elements.snapshotAbsent) {
    elements.snapshotAbsent.textContent = Math.max(activeMembers.length - presentToday.length, 0).toString();
  }
  if (elements.snapshotTrainers) {
    elements.snapshotTrainers.textContent = state.trainers.length.toString();
  }
  if (elements.snapshotRate) {
    elements.snapshotRate.textContent = `${attendanceRate}%`;
  }
  if (elements.snapshotPlanAlerts) {
    elements.snapshotPlanAlerts.textContent = planAlerts.length.toString();
  }

  const recentMembers = [...state.members]
    .sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate))
    .slice(0, 6);

  if (elements.recentMemberCount) {
    elements.recentMemberCount.textContent = `${recentMembers.length} records`;
  }

  if (!elements.recentMembersBody) {
    return;
  }

  if (!recentMembers.length) {
    elements.recentMembersBody.innerHTML = "<tr><td colspan='4' class='empty'>No members added yet.</td></tr>";
    return;
  }

  elements.recentMembersBody.innerHTML = recentMembers
    .map((member) => {
      const status = getEffectiveMemberStatus(member);
      return `
        <tr>
          <td>${escapeHtml(member.name)}</td>
          <td>${escapeHtml(getPlanName(member.planId))}</td>
          <td><span class="${getStatusClass(status)}">${escapeHtml(status)}</span></td>
          <td>${formatDateDisplay(member.joinDate)}</td>
        </tr>
      `;
    })
    .join("");
}

function renderMembers() {
  if (!elements.membersBody || !elements.memberStatusFilter || !elements.memberSearch) {
    return;
  }

  const query = elements.memberSearch.value.trim().toLowerCase();
  const statusFilter = elements.memberStatusFilter.value;
  const canManage = canManageData();
  const canAttend = canRecordAttendance();

  let rows = [...state.members].sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate));

  if (statusFilter === "ExpiringSoon") {
    rows = rows.filter((member) => member.status === "Active" && getMemberPlanAlert(member).type === "due");
  } else if (statusFilter === "PlanExpired") {
    rows = rows.filter((member) => member.status === "Active" && getMemberPlanAlert(member).type === "expired");
  } else if (statusFilter !== "All") {
    rows = rows.filter((member) => getEffectiveMemberStatus(member) === statusFilter);
  }

  if (query) {
    rows = rows.filter((member) => {
      const searchable = `${member.name} ${member.phone} ${member.email || ""}`.toLowerCase();
      return searchable.includes(query);
    });
  }

  if (!rows.length) {
    elements.membersBody.innerHTML = "<tr><td colspan='9' class='empty'>No members match this filter.</td></tr>";
    return;
  }
  elements.membersBody.innerHTML = rows
    .map((member) => {
      const planAlert = getMemberPlanAlert(member);
      const effectiveStatus = getEffectiveMemberStatus(member);
      const nextAction = member.status === "Active" ? "Freeze" : "Activate";
      const expiryDate = planAlert.expiryDateKey ? formatDateDisplay(planAlert.expiryDateKey) : "-";
      const rowClass = planAlert.type === "expired" ? "member-row-expired" : planAlert.type === "due" ? "member-row-due" : "";
      const showRenew = planAlert.type === "expired" || planAlert.type === "due";
      const nameAlertIcon =
        planAlert.type === "expired"
          ? "<span class='name-alert-dot alarm-pulse' title='Plan expired'>!</span>"
          : planAlert.type === "due"
          ? "<span class='name-alert-dot' title='Plan expiring soon'>!</span>"
          : "";

      const actions = [];
      if (canAttend) {
        actions.push(`<button class="mini-btn" data-action="checkin" data-member-id="${member.id}">Check-In</button>`);
      }
      if (canManage) {
        actions.push(`<button class="mini-btn" data-action="toggle-status" data-member-id="${member.id}">${nextAction}</button>`);
        if (showRenew) {
          actions.push(`<button class="mini-btn renew" data-action="renew-plan" data-member-id="${member.id}">Renew</button>`);
        }
      }

      return `
        <tr class="${rowClass}">
          <td>
            <div class="member-name-wrap">
              <span>${escapeHtml(member.name)}</span>
              ${nameAlertIcon}
            </div>
          </td>
          <td>
            ${escapeHtml(member.phone)}
            <br>
            <small>${escapeHtml(member.email || "-")}</small>
          </td>
          <td>${escapeHtml(getPlanName(member.planId))}</td>
          <td>${escapeHtml(getTrainerName(member.trainerId))}</td>
          <td><span class="${getStatusClass(effectiveStatus)}">${escapeHtml(effectiveStatus)}</span></td>
          <td>${formatDateDisplay(member.joinDate)}</td>
          <td>${expiryDate}</td>
          <td>${buildPlanAlertBadge(planAlert)}</td>
          <td>${actions.join("") || "-"}</td>
        </tr>
      `;
    })
    .join("");
}

function renderPlans() {
  if (!elements.plansGrid) {
    return;
  }

  if (!state.plans.length) {
    elements.plansGrid.innerHTML = "<p class='empty'>No plans available.</p>";
    return;
  }

  elements.plansGrid.innerHTML = state.plans
    .map((plan) => {
      const planMembers = state.members.filter((member) => member.planId === plan.id).length;
      return `
        <article class="info-card">
          <h3>${escapeHtml(plan.name)}</h3>
          <p>${escapeHtml(plan.durationMonths.toString())} month(s)</p>
          <strong>${formatCurrency(plan.price)}</strong>
          <p>${escapeHtml(plan.features || "No extra features listed.")}</p>
          <p><strong>${planMembers}</strong> member(s) on this plan</p>
        </article>
      `;
    })
    .join("");
}

function renderAttendance() {
  if (!elements.attendanceList || !elements.attendanceDate) {
    return;
  }

  const selectedDate = elements.attendanceDate.value || getTodayKey();
  const activeMembers = state.members.filter((member) => getEffectiveMemberStatus(member) === "Active");
  const presentSet = new Set(getAttendanceForDate(selectedDate));
  const canAttend = canRecordAttendance();

  if (!activeMembers.length) {
    elements.attendanceList.innerHTML = "<p class='empty'>No active members found. Add or activate members first.</p>";
  } else {
    elements.attendanceList.innerHTML = activeMembers
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((member) => {
        const isPresent = presentSet.has(member.id);
        return `
          <label class="attendance-row">
            <span>${escapeHtml(member.name)} (${escapeHtml(getPlanName(member.planId))})</span>
            <input type="checkbox" data-member-id="${member.id}" ${isPresent ? "checked" : ""} ${canAttend ? "" : "disabled"}>
          </label>
        `;
      })
      .join("");
  }

  const presentCount = presentSet.size;
  const absentCount = Math.max(activeMembers.length - presentCount, 0);
  const rate = activeMembers.length ? Math.round((presentCount / activeMembers.length) * 100) : 0;

  if (elements.attendancePresentCount) {
    elements.attendancePresentCount.textContent = presentCount.toString();
  }
  if (elements.attendanceAbsentCount) {
    elements.attendanceAbsentCount.textContent = absentCount.toString();
  }
  if (elements.attendanceActiveMembers) {
    elements.attendanceActiveMembers.textContent = activeMembers.length.toString();
  }
  if (elements.attendanceRate) {
    elements.attendanceRate.textContent = `${rate}%`;
  }
}
function renderBilling() {
  if (!elements.paymentsBody) {
    return;
  }

  const sortedPayments = [...state.payments].sort((a, b) => new Date(b.date) - new Date(a.date));

  if (!sortedPayments.length) {
    elements.paymentsBody.innerHTML = "<tr><td colspan='6' class='empty'>No payments recorded yet.</td></tr>";
  } else {
    elements.paymentsBody.innerHTML = sortedPayments
      .slice(0, 150)
      .map((payment) => `
        <tr>
          <td>${formatDateDisplay(payment.date)}</td>
          <td>${escapeHtml(getMemberName(payment.memberId))}</td>
          <td>${formatCurrency(payment.amount)}</td>
          <td>${escapeHtml(payment.mode || "-")}</td>
          <td>${escapeHtml(payment.reference || "-")}</td>
          <td>${escapeHtml(payment.recordedBy || "-")}</td>
        </tr>
      `)
      .join("");
  }

  const activeMembers = state.members.filter((member) => member.status === "Active");
  const outstandingTotal = activeMembers.reduce((sum, member) => sum + getOutstandingDue(member), 0);
  const pendingMembers = activeMembers.filter((member) => getOutstandingDue(member) > 0).length;
  const collectedMonth = state.payments
    .filter((payment) => String(payment.date || "").startsWith(getCurrentMonthPrefix()))
    .reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);

  if (elements.billingOutstandingTotal) {
    elements.billingOutstandingTotal.textContent = formatCurrency(outstandingTotal);
  }
  if (elements.billingCollectedMonth) {
    elements.billingCollectedMonth.textContent = formatCurrency(collectedMonth);
  }
  if (elements.billingPendingMembers) {
    elements.billingPendingMembers.textContent = pendingMembers.toString();
  }
}

function renderWorkouts() {
  if (!elements.workoutGrid) {
    return;
  }

  if (!state.workoutPlans.length) {
    elements.workoutGrid.innerHTML = "<div class='workout-empty'>No workout plans found</div>";
    return;
  }

  elements.workoutGrid.innerHTML = state.workoutPlans
    .map((plan) => `
      <article class="workout-card">
        <h3>${escapeHtml(plan.name)}</h3>
        <p>Level: ${escapeHtml(plan.level)}</p>
        <p>Days/Week: ${escapeHtml(plan.daysPerWeek.toString())}</p>
        <p>${escapeHtml(plan.focus || "No focus notes.")}</p>
      </article>
    `)
    .join("");
}

function renderDietPlans() {
  if (!elements.dietGrid) {
    return;
  }

  if (!state.dietPlans.length) {
    elements.dietGrid.innerHTML = "<p class='empty'>No diet plans added yet.</p>";
    return;
  }

  elements.dietGrid.innerHTML = state.dietPlans
    .map((plan) => `
      <article class="info-card">
        <h3>${escapeHtml(plan.name)}</h3>
        <p>Goal: ${escapeHtml(plan.goal)}</p>
        <p>Calories: ${escapeHtml(plan.calories.toString())} / day</p>
        <p>${escapeHtml(plan.notes || "No notes added.")}</p>
      </article>
    `)
    .join("");
}

function renderTrainers() {
  if (!elements.trainersBody) {
    return;
  }

  if (!state.trainers.length) {
    elements.trainersBody.innerHTML = "<tr><td colspan='4' class='empty'>No trainers found yet.</td></tr>";
    return;
  }

  elements.trainersBody.innerHTML = state.trainers
    .map((trainer) => {
      const assignedMembers = state.members.filter((member) => member.trainerId === trainer.id).length;
      return `
        <tr>
          <td>${escapeHtml(trainer.name)}</td>
          <td>${escapeHtml(trainer.specialty)}</td>
          <td>${escapeHtml(trainer.phone)}</td>
          <td>${assignedMembers}</td>
        </tr>
      `;
    })
    .join("");
}

function renderStaff() {
  if (!elements.staffBody) {
    return;
  }

  const users = Array.isArray(staffUsers) ? staffUsers : [];

  if (elements.staffCount) {
    const suffix = users.length === 1 ? "" : "s";
    elements.staffCount.textContent = `${users.length} account${suffix}`;
  }

  if (elements.staffEmpty) {
    elements.staffEmpty.classList.toggle("hidden", users.length > 0);
  }

  if (!users.length) {
    elements.staffBody.innerHTML = "";
    return;
  }

  const currentUserId = authSession.user?.id || "";

  elements.staffBody.innerHTML = users
    .map((user) => {
      const roleLabel =
        user.role === "owner" ? "Owner" : user.role === "receptionist" ? "Receptionist" : user.role === "trainer" ? "Trainer" : user.role;
      const statusLabel = user.isActive ? "Active" : "Disabled";
      const statusClass = user.isActive ? "status status-active" : "status status-expired";
      const isSelf = user.id === currentUserId;
      const locked = user.role === "owner" || isSelf;

      const actions = locked
        ? "-"
        : `
            <button class="${user.isActive ? "mini-btn" : "mini-btn renew"}" data-action="toggle-staff" data-user-id="${user.id}">
              ${user.isActive ? "Deactivate" : "Activate"}
            </button>
            <button class="mini-btn" data-action="reset-staff-password" data-user-id="${user.id}">Reset Password</button>
          `;

      return `
        <tr>
          <td>${escapeHtml(user.name || "-")}</td>
          <td>${escapeHtml(user.username)}</td>
          <td>${escapeHtml(roleLabel)}</td>
          <td><span class="${statusClass}">${escapeHtml(statusLabel)}</span></td>
          <td>${actions}</td>
        </tr>
      `;
    })
    .join("");
}

function renderReports() {
  const activeMembers = state.members.filter((member) => getEffectiveMemberStatus(member) === "Active");
  const billableMembers = activeMembers.filter((member) => getMemberPlanAlert(member).type !== "expired");
  const expectedRevenue = billableMembers.reduce((total, member) => total + getPlanPrice(member.planId), 0);

  const monthlyKeys = Object.keys(state.attendance).filter((key) => key.startsWith(getCurrentMonthPrefix()));
  const monthlyAttendanceTotal = monthlyKeys.reduce((total, key) => total + getAttendanceForDate(key).length, 0);
  const avgDailyAttendance = monthlyKeys.length ? (monthlyAttendanceTotal / monthlyKeys.length).toFixed(1) : "0.0";

  const activePlanCount = new Set(billableMembers.map((member) => member.planId)).size;
  const outstandingDues = state.members
    .filter((member) => member.status === "Active")
    .reduce((sum, member) => sum + getOutstandingDue(member), 0);

  if (elements.reportRevenue) {
    elements.reportRevenue.textContent = formatCurrency(expectedRevenue);
  }
  if (elements.reportDailyAttendance) {
    elements.reportDailyAttendance.textContent = avgDailyAttendance;
  }
  if (elements.reportActivePlans) {
    elements.reportActivePlans.textContent = activePlanCount.toString();
  }
  if (elements.reportTrainerCount) {
    elements.reportTrainerCount.textContent = state.trainers.length.toString();
  }
  if (elements.reportOutstandingDues) {
    elements.reportOutstandingDues.textContent = formatCurrency(outstandingDues);
  }

  renderWeeklyBars();
  renderReminders();
}
function renderReminders() {
  if (!elements.remindersBody) {
    return;
  }

  const rows = [...state.reminders].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  const canManage = canManageData();

  if (!rows.length) {
    elements.remindersBody.innerHTML = "<tr><td colspan='5' class='empty'>No reminders generated yet.</td></tr>";
    return;
  }

  elements.remindersBody.innerHTML = rows
    .slice(0, 120)
    .map((reminder) => {
      const memberName = getMemberName(reminder.memberId);
      const statusClass = reminder.status === "Sent" ? "status status-active" : "status status-frozen";
      const actionCell =
        reminder.status === "Pending" && canManage
          ? `<button class="mini-btn" data-action="mark-reminder-sent" data-reminder-id="${reminder.id}">Mark Sent</button>`
          : "-";

      return `
        <tr>
          <td>${escapeHtml(memberName)}</td>
          <td>${escapeHtml(reminder.channel)}</td>
          <td><span class="${statusClass}">${escapeHtml(reminder.status)}</span></td>
          <td>${escapeHtml(reminder.message)}</td>
          <td>${actionCell}</td>
        </tr>
      `;
    })
    .join("");
}

function renderWeeklyBars() {
  if (!elements.attendanceBars) {
    return;
  }

  const last7Days = getLastNDays(7);
  const counts = last7Days.map((day) => getAttendanceForDate(day.key).length);
  const maxCount = Math.max(...counts, 1);

  elements.attendanceBars.innerHTML = last7Days
    .map((day, index) => {
      const percent = Math.round((counts[index] / maxCount) * 100);
      return `
        <div class="bar-wrap">
          <div class="bar" style="height:${Math.max(percent, 4)}%"></div>
          <span class="bar-label">${escapeHtml(day.label)}</span>
        </div>
      `;
    })
    .join("");
}

function renderPlanOptions() {
  if (!elements.memberPlanSelect) {
    return;
  }

  const selectedPlanId = elements.memberPlanSelect.value;
  elements.memberPlanSelect.innerHTML = state.plans
    .map((plan) => `<option value="${plan.id}">${escapeHtml(plan.name)} (${formatCurrency(plan.price)})</option>`)
    .join("");

  if (!state.plans.length) {
    elements.memberPlanSelect.innerHTML = "<option value=''>No plans available</option>";
    return;
  }

  if (state.plans.some((plan) => plan.id === selectedPlanId)) {
    elements.memberPlanSelect.value = selectedPlanId;
  } else {
    elements.memberPlanSelect.value = state.plans[0].id;
  }
}

function renderTrainerOptions() {
  if (!elements.memberTrainerSelect) {
    return;
  }

  const selectedTrainerId = elements.memberTrainerSelect.value;
  const initial = "<option value=''>No Trainer</option>";
  const options = state.trainers
    .map((trainer) => `<option value="${trainer.id}">${escapeHtml(trainer.name)}</option>`)
    .join("");

  elements.memberTrainerSelect.innerHTML = initial + options;

  if (state.trainers.some((trainer) => trainer.id === selectedTrainerId)) {
    elements.memberTrainerSelect.value = selectedTrainerId;
  } else {
    elements.memberTrainerSelect.value = "";
  }
}

function renderPaymentMemberOptions() {
  if (!elements.paymentMemberSelect) {
    return;
  }

  const selectedId = elements.paymentMemberSelect.value;
  const memberOptions = state.members
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((member) => {
      const due = getOutstandingDue(member);
      return `<option value="${member.id}">${escapeHtml(member.name)} (Due: ${formatCurrency(due)})</option>`;
    })
    .join("");

  elements.paymentMemberSelect.innerHTML = memberOptions || "<option value=''>No members available</option>";

  if (selectedId && state.members.some((member) => member.id === selectedId)) {
    elements.paymentMemberSelect.value = selectedId;
  }
}

function renderPlanAlerts() {
  const alerts = getPlanAlerts();
  const expiredCount = alerts.filter((item) => item.alert.type === "expired").length;
  const dueCount = alerts.filter((item) => item.alert.type === "due").length;
  const totalCount = alerts.length;

  if (elements.expiryAlertBtn) {
    elements.expiryAlertBtn.textContent = `Alerts (${totalCount})`;
    elements.expiryAlertBtn.classList.toggle("is-critical", expiredCount > 0);
  }

  document.title = totalCount ? `(${totalCount}) ${APP_TITLE}` : APP_TITLE;

  if (!elements.expiryBanner || !elements.expiryBannerTitle || !elements.expiryBannerText || !elements.reviewExpiryAlerts) {
    return;
  }

  if (!totalCount) {
    elements.expiryBanner.classList.add("hidden");
    return;
  }

  const parts = [];
  if (expiredCount) {
    parts.push(`${expiredCount} expired`);
  }
  if (dueCount) {
    parts.push(`${dueCount} expiring in ${ALERT_WINDOW_DAYS} days`);
  }

  elements.expiryBanner.classList.remove("hidden");
  elements.expiryBannerTitle.textContent = `${totalCount} plan alerts need attention`;
  elements.expiryBannerText.textContent = parts.join(" | ");
  elements.reviewExpiryAlerts.textContent = expiredCount ? "Review Expired Members" : "Review Expiring Members";
}

function openExpiryAlerts() {
  setActiveView("members");

  const alerts = getPlanAlerts();
  if (!elements.memberStatusFilter) {
    return;
  }

  if (!alerts.length) {
    elements.memberStatusFilter.value = "All";
    renderMembers();
    return;
  }

  elements.memberStatusFilter.value = alerts.some((item) => item.alert.type === "expired")
    ? "PlanExpired"
    : "ExpiringSoon";
  renderMembers();
}

function handleMemberCreate(event) {
  event.preventDefault();
  if (!canManageData()) {
    alert("You do not have permission to create members.");
    return;
  }
  if (!state.plans.length) {
    alert("Create at least one plan before adding a member.");
    return;
  }

  const formData = new FormData(elements.memberForm);
  const phone = cleanText(formData.get("phone"));
  const digitsOnly = phone.replace(/\D/g, "");
  if (digitsOnly.length < 10) {
    alert("Please enter a valid phone number with at least 10 digits.");
    return;
  }

  const newMember = {
    id: uid("mem"),
    name: cleanText(formData.get("name")),
    phone,
    email: cleanText(formData.get("email")),
    planId: cleanText(formData.get("planId")),
    trainerId: cleanText(formData.get("trainerId")),
    joinDate: cleanText(formData.get("joinDate")) || getTodayKey(),
    status: cleanText(formData.get("status")) || "Active",
  };

  state.members.push(newMember);
  saveState("member created");
  renderAll();

  elements.memberForm.reset();
  if (elements.memberJoinDate) {
    elements.memberJoinDate.value = getTodayKey();
  }
  renderPlanOptions();
  renderTrainerOptions();
  renderPaymentMemberOptions();
}

function handlePlanCreate(event) {
  event.preventDefault();
  if (!canManageData()) {
    alert("You do not have permission to create plans.");
    return;
  }

  const formData = new FormData(elements.planForm);
  const durationMonths = Number(formData.get("durationMonths")) || 0;
  const price = Number(formData.get("price")) || 0;

  if (durationMonths < 1) {
    alert("Plan duration must be at least 1 month.");
    return;
  }
  if (price < 0) {
    alert("Price cannot be negative.");
    return;
  }

  const newPlan = {
    id: uid("plan"),
    name: cleanText(formData.get("name")),
    durationMonths,
    price,
    features: cleanText(formData.get("features")),
  };

  state.plans.push(newPlan);
  saveState("plan created");
  renderAll();
  elements.planForm.reset();
}

function handleWorkoutCreate(event) {
  event.preventDefault();
  if (!canManageData()) {
    alert("You do not have permission to create workout plans.");
    return;
  }

  const formData = new FormData(elements.workoutForm);
  const newWorkout = {
    id: uid("workout"),
    name: cleanText(formData.get("name")),
    level: cleanText(formData.get("level")) || "Beginner",
    daysPerWeek: Number(formData.get("daysPerWeek")) || 3,
    focus: cleanText(formData.get("focus")),
  };

  state.workoutPlans.push(newWorkout);
  saveState("workout plan created");
  renderAll();
  elements.workoutForm.reset();
  elements.workoutForm.classList.add("hidden");
}
function toggleWorkoutComposer() {
  if (!canManageData()) {
    alert("Only owner/receptionist can edit workout templates.");
    return;
  }
  elements.workoutForm?.classList.toggle("hidden");
}

function handleDietCreate(event) {
  event.preventDefault();
  if (!canManageData()) {
    alert("You do not have permission to create diet plans.");
    return;
  }

  const formData = new FormData(elements.dietForm);
  const newDietPlan = {
    id: uid("diet"),
    name: cleanText(formData.get("name")),
    goal: cleanText(formData.get("goal")) || "Maintenance",
    calories: Number(formData.get("calories")) || 2000,
    notes: cleanText(formData.get("notes")),
  };

  state.dietPlans.push(newDietPlan);
  saveState("diet plan created");
  renderAll();
  elements.dietForm.reset();
}

function handleTrainerCreate(event) {
  event.preventDefault();
  if (!canManageData()) {
    alert("You do not have permission to add trainers.");
    return;
  }

  const formData = new FormData(elements.trainerForm);
  const newTrainer = {
    id: uid("trainer"),
    name: cleanText(formData.get("name")),
    specialty: cleanText(formData.get("specialty")),
    phone: cleanText(formData.get("phone")),
  };

  state.trainers.push(newTrainer);
  saveState("trainer created");
  renderAll();
  elements.trainerForm.reset();
}

function handlePaymentCreate(event) {
  event.preventDefault();
  if (!canManageData()) {
    alert("You do not have permission to record payments.");
    return;
  }

  const formData = new FormData(elements.paymentForm);
  const memberId = cleanText(formData.get("memberId"));
  const amount = Number(formData.get("amount")) || 0;
  const mode = cleanText(formData.get("mode")) || "UPI";
  const date = cleanText(formData.get("date")) || getTodayKey();
  const reference = cleanText(formData.get("reference"));
  const note = cleanText(formData.get("note"));
  const autoRenew = formData.get("autoRenew") === "on";

  if (!memberId) {
    alert("Select a member to record payment.");
    return;
  }
  if (amount <= 0) {
    alert("Payment amount should be greater than zero.");
    return;
  }

  const member = state.members.find((item) => item.id === memberId);
  if (!member) {
    alert("Member not found.");
    return;
  }

  const dueBefore = getOutstandingDue(member);

  state.payments.push({
    id: uid("pay"),
    memberId,
    amount,
    mode,
    date,
    reference,
    note,
    recordedBy: authSession.user?.username || "system",
    createdAt: new Date().toISOString(),
  });

  if (autoRenew && dueBefore > 0 && amount >= dueBefore) {
    member.joinDate = date;
    member.status = "Active";
  }

  saveState("payment recorded");
  renderAll();

  elements.paymentForm.reset();
  if (elements.paymentDate) {
    elements.paymentDate.value = getTodayKey();
  }
}

function handleGenerateReminders(channel) {
  if (!canManageData()) {
    alert("You do not have permission to generate reminders.");
    return;
  }

  const alerts = getPlanAlerts();
  if (!alerts.length) {
    alert("No expiring or expired plans found right now.");
    return;
  }

  let createdCount = 0;

  alerts.forEach(({ member, alert }) => {
    const alreadyExists = state.reminders.some((item) => {
      return (
        item.memberId === member.id &&
        item.channel === channel &&
        item.status === "Pending" &&
        item.expiryDate === alert.expiryDateKey &&
        item.alertType === alert.type
      );
    });

    if (alreadyExists) {
      return;
    }

    const reminderText = buildReminderMessage(member, alert);

    state.reminders.push({
      id: uid("rem"),
      memberId: member.id,
      channel,
      status: "Pending",
      alertType: alert.type,
      expiryDate: alert.expiryDateKey,
      message: reminderText,
      createdAt: new Date().toISOString(),
      sentAt: "",
      sentBy: "",
    });

    createdCount += 1;
  });

  if (!createdCount) {
    alert(`No new ${channel} reminders were generated.`);
    return;
  }

  saveState(`${channel} reminders generated (${createdCount})`);
  renderAll();
  setActiveView("reports");
}
function handleReminderAction(event) {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) {
    return;
  }

  const action = target.dataset.action;
  const reminderId = target.dataset.reminderId;

  if (action !== "mark-reminder-sent" || !reminderId) {
    return;
  }

  if (!canManageData()) {
    alert("You do not have permission to update reminders.");
    return;
  }

  const reminder = state.reminders.find((item) => item.id === reminderId);
  if (!reminder) {
    return;
  }

  reminder.status = "Sent";
  reminder.sentAt = new Date().toISOString();
  reminder.sentBy = authSession.user?.username || "system";

  saveState("reminder marked sent");
  renderAll();
}

function handleMemberRowAction(event) {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) {
    return;
  }

  const memberId = target.dataset.memberId;
  const action = target.dataset.action;
  if (!memberId || !action) {
    return;
  }

  const member = state.members.find((item) => item.id === memberId);
  if (!member) {
    return;
  }

  if (action === "checkin") {
    if (!canRecordAttendance()) {
      alert("You do not have permission to mark attendance.");
      return;
    }
    if (getEffectiveMemberStatus(member) !== "Active") {
      alert("This member cannot check in until plan is active.");
      return;
    }

    const today = getTodayKey();
    const presentSet = new Set(getAttendanceForDate(today));
    presentSet.add(memberId);
    state.attendance[today] = Array.from(presentSet);

    saveState("member check-in");
    renderAll();
    return;
  }

  if (!canManageData()) {
    alert("You do not have permission for this action.");
    return;
  }

  if (action === "toggle-status") {
    member.status = member.status === "Active" ? "Frozen" : "Active";
  }

  if (action === "renew-plan") {
    member.joinDate = getTodayKey();
    member.status = "Active";
  }

  saveState(`member ${action}`);
  renderAll();
}

function handleAttendanceToggle(event) {
  const target = event.target;
  if (!(target instanceof HTMLInputElement) || target.type !== "checkbox") {
    return;
  }

  if (!canRecordAttendance()) {
    alert("You do not have permission to update attendance.");
    target.checked = !target.checked;
    return;
  }

  const memberId = target.dataset.memberId;
  if (!memberId) {
    return;
  }

  const date = elements.attendanceDate?.value || getTodayKey();
  const current = new Set(getAttendanceForDate(date));

  if (target.checked) {
    current.add(memberId);
  } else {
    current.delete(memberId);
  }

  state.attendance[date] = Array.from(current);
  saveState("attendance toggled");
  renderAll();
}

function markAllPresent() {
  if (!canRecordAttendance()) {
    alert("You do not have permission to mark attendance.");
    return;
  }

  const date = elements.attendanceDate?.value || getTodayKey();
  state.attendance[date] = state.members
    .filter((member) => getEffectiveMemberStatus(member) === "Active")
    .map((member) => member.id);

  saveState("attendance marked all present");
  renderAll();
}

function clearDayAttendance() {
  if (!canRecordAttendance()) {
    alert("You do not have permission to clear attendance.");
    return;
  }

  const date = elements.attendanceDate?.value || getTodayKey();
  state.attendance[date] = [];
  saveState("attendance cleared");
  renderAll();
}

function exportMembersCsv() {
  if (!canManageData()) {
    alert("You do not have permission to export reports.");
    return;
  }

  const rows = [["Member Name", "Phone", "Email", "Plan", "Status", "Join Date", "Expiry Date", "Due Amount (INR)", "Plan Alert"]];

  state.members.forEach((member) => {
    const alert = getMemberPlanAlert(member);
    rows.push([
      member.name,
      member.phone,
      member.email || "",
      getPlanName(member.planId),
      getEffectiveMemberStatus(member),
      member.joinDate || "",
      alert.expiryDateKey || "",
      getOutstandingDue(member).toString(),
      alert.label,
    ]);
  });

  downloadCsv(`members_${getTodayKey()}.csv`, rows);
}
function exportPaymentsCsv() {
  if (!canManageData()) {
    alert("You do not have permission to export reports.");
    return;
  }

  const rows = [["Date", "Member", "Amount (INR)", "Mode", "Reference", "Recorded By", "Notes"]];

  [...state.payments]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach((payment) => {
      rows.push([
        payment.date || "",
        getMemberName(payment.memberId),
        String(payment.amount || 0),
        payment.mode || "",
        payment.reference || "",
        payment.recordedBy || "",
        payment.note || "",
      ]);
    });

  downloadCsv(`payments_${getTodayKey()}.csv`, rows);
}

function exportExpiryCsv() {
  if (!canManageData()) {
    alert("You do not have permission to export reports.");
    return;
  }

  const rows = [["Member", "Phone", "Plan", "Expiry Date", "Alert Type", "Message"]];

  getPlanAlerts().forEach(({ member, alert }) => {
    rows.push([member.name, member.phone, getPlanName(member.planId), alert.expiryDateKey || "", alert.type, alert.label]);
  });

  downloadCsv(`expiry_alerts_${getTodayKey()}.csv`, rows);
}

function downloadCsv(fileName, rows) {
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

function buildReminderMessage(member, alert) {
  const planName = getPlanName(member.planId);
  const memberName = member.name;
  const expiryDate = alert.expiryDateKey ? formatDateDisplay(alert.expiryDateKey) : "soon";

  if (alert.type === "expired") {
    return `Hi ${memberName}, your ${planName} plan expired on ${expiryDate}. Please renew to continue uninterrupted access.`;
  }

  return `Hi ${memberName}, your ${planName} plan expires on ${expiryDate}. Please renew in time to avoid interruption.`;
}

function getAttendanceForDate(dateKey) {
  const list = state.attendance[dateKey];
  if (!Array.isArray(list)) {
    return [];
  }
  return Array.from(new Set(list));
}

function getEffectiveMemberStatus(member) {
  if (member.status !== "Active") {
    return member.status;
  }
  const alert = getMemberPlanAlert(member);
  if (alert.type === "expired") {
    return "Expired";
  }
  return "Active";
}

function getPlanAlerts() {
  return state.members
    .filter((member) => member.status === "Active")
    .map((member) => ({ member, alert: getMemberPlanAlert(member) }))
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

function getMemberPlanAlert(member) {
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

function buildPlanAlertBadge(alert) {
  if (alert.type === "expired") {
    return `<span class="plan-alert plan-alert-expired">${escapeHtml(alert.label)}</span>`;
  }
  if (alert.type === "due") {
    return `<span class="plan-alert plan-alert-due">${escapeHtml(alert.label)}</span>`;
  }
  if (alert.type === "ok") {
    return `<span class="plan-alert plan-alert-ok">${escapeHtml(alert.label)}</span>`;
  }
  return "<span class='plan-alert plan-alert-na'>No Plan Data</span>";
}

function getMemberPaidSinceJoin(member) {
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

function getOutstandingDue(member) {
  const planPrice = getPlanPrice(member.planId);
  if (!planPrice) {
    return 0;
  }
  const paid = getMemberPaidSinceJoin(member);
  return Math.max(planPrice - paid, 0);
}
function getPlanName(planId) {
  const plan = state.plans.find((item) => item.id === planId);
  return plan ? plan.name : "No Plan";
}

function getPlanPrice(planId) {
  const plan = state.plans.find((item) => item.id === planId);
  return plan ? Number(plan.price) || 0 : 0;
}

function getTrainerName(trainerId) {
  if (!trainerId) {
    return "Unassigned";
  }
  const trainer = state.trainers.find((item) => item.id === trainerId);
  return trainer ? trainer.name : "Unassigned";
}

function getMemberName(memberId) {
  const member = state.members.find((item) => item.id === memberId);
  return member ? member.name : "Unknown";
}

function getStatusClass(status) {
  const key = status.toLowerCase();
  return `status status-${escapeHtml(key)}`;
}

function uid(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
}

function cleanText(value) {
  return String(value || "").trim();
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function getTodayKey() {
  return toDateKey(new Date());
}

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDate(dateString) {
  if (!dateString) {
    return null;
  }
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
}

function addMonths(date, months) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

function getDateDiffInDays(targetDate, baseDate) {
  const utcTarget = Date.UTC(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  const utcBase = Date.UTC(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  return Math.floor((utcTarget - utcBase) / (24 * 60 * 60 * 1000));
}

function formatDateDisplay(dateString) {
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

function getCurrentMonthPrefix() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${now.getFullYear()}-${month}`;
}

function getLastNDays(count) {
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

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getSeedState() {
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

function getUserRole() {
  return authSession.user?.role || "guest";
}

function canManageData() {
  return ["owner", "receptionist"].includes(getUserRole());
}

function canRecordAttendance() {
  return ["owner", "receptionist", "trainer"].includes(getUserRole());
}

function canManageStaff() {
  return getUserRole() === "owner";
}
