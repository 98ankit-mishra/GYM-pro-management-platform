import { useEffect, useMemo, useState } from "react";
import AuthLayer from "./components/AuthLayer";
import AppDialog from "./components/AppDialog";
import AlertBanner from "./components/AlertBanner";
import NoticeBar from "./components/NoticeBar";
import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import AttendanceView from "./components/views/AttendanceView";
import BillingView from "./components/views/BillingView";
import DashboardView from "./components/views/DashboardView";
import DietView from "./components/views/DietView";
import MembersView from "./components/views/MembersView";
import PlansView from "./components/views/PlansView";
import ReportsView from "./components/views/ReportsView";
import StaffView from "./components/views/StaffView";
import TrainersView from "./components/views/TrainersView";
import WorkoutsView from "./components/views/WorkoutsView";
import { APP_TITLE, viewMeta } from "./constants";
import { apiRequest } from "./lib/api";
import {
  buildReminderMessage,
  canManageData,
  canManageStaff,
  canRecordAttendance,
  cleanText,
  downloadCsv,
  formToObject,
  getAttendanceForDate,
  getEffectiveMemberStatus,
  getMemberPlanAlert,
  getOutstandingDue,
  getPlanAlerts,
  getTodayKey,
  normalizeState,
  seedState,
  uid,
} from "./lib/gym";
import {
  buildAlertSummary,
  buildAttendanceData,
  buildBillingData,
  buildCurrentUserLabel,
  buildDashboardData,
  buildExpiryExportRows,
  buildMembersExportRows,
  buildMembersRows,
  buildPaymentsExportRows,
  buildPlansCards,
  buildReportsData,
  buildStaffRows,
  buildTrainersRows,
} from "./lib/appSelectors";
import { applyTheme, getInitialTheme, persistTheme } from "./lib/theme";

function App() {
  const [state, setState] = useState(seedState);
  const [activeView, setActiveView] = useState("workouts");
  const [currentUser, setCurrentUser] = useState(null);
  const [setupRequired, setSetupRequired] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [staffUsers, setStaffUsers] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [memberStatusFilter, setMemberStatusFilter] = useState("All");
  const [attendanceDate, setAttendanceDate] = useState(getTodayKey());
  const [showWorkoutComposer, setShowWorkoutComposer] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState("");
  const [editingPlanId, setEditingPlanId] = useState("");
  const [editingTrainerId, setEditingTrainerId] = useState("");
  const [editingDietId, setEditingDietId] = useState("");
  const [editingWorkoutId, setEditingWorkoutId] = useState("");
  const [authRefreshKey, setAuthRefreshKey] = useState(0);
  const [notice, setNotice] = useState(null);
  const [dialog, setDialog] = useState({ type: "" });
  const [theme, setTheme] = useState(getInitialTheme);
  const [reminderProviders, setReminderProviders] = useState(null);

  const canManage = canManageData(currentUser);
  const canAttend = canRecordAttendance(currentUser);
  const canStaff = canManageStaff(currentUser);

  function showNotice(type, message) {
    setNotice({ type, message });
  }

  function showError(message) {
    showNotice("error", message);
  }

  function showSuccess(message) {
    showNotice("success", message);
  }

  function closeDialog() {
    setDialog({ type: "" });
  }

  function handleToggleTheme() {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  }

  useEffect(() => {
    document.title = APP_TITLE;
  }, []);

  useEffect(() => {
    applyTheme(theme);
    persistTheme(theme);
  }, [theme]);

  useEffect(() => {
    async function boot() {
      try {
        const me = await apiRequest("/auth/me");
        setCurrentUser(me.user);
        await Promise.all([loadState(), loadStaff(me.user), loadReminderProviders(me.user)]);
      } catch {
        setCurrentUser(null);
        setState(seedState());
        setStaffUsers([]);
        setReminderProviders(null);
        await syncAuthSetup();
      }
    }

    boot();
  }, [authRefreshKey]);

  useEffect(() => {
    if (!canStaff && activeView === "staff") {
      setActiveView("workouts");
    }
  }, [activeView, canStaff]);

  const todayKey = getTodayKey();
  const alerts = useMemo(() => getPlanAlerts(state), [state]);

  useEffect(() => {
    document.title = alerts.length ? `(${alerts.length}) ${APP_TITLE}` : APP_TITLE;
  }, [alerts.length]);

  const dashboardData = useMemo(() => buildDashboardData(state, todayKey, alerts), [alerts, state, todayKey]);
  const alertSummary = useMemo(() => buildAlertSummary(alerts), [alerts]);
  const membersRows = useMemo(() => buildMembersRows(state, memberSearch, memberStatusFilter), [memberSearch, memberStatusFilter, state]);
  const plansCards = useMemo(() => buildPlansCards(state), [state]);
  const attendanceData = useMemo(() => buildAttendanceData(state, attendanceDate), [attendanceDate, state]);
  const billingData = useMemo(() => buildBillingData(state), [state]);
  const trainersRows = useMemo(() => buildTrainersRows(state), [state]);
  const staffRows = useMemo(() => buildStaffRows(staffUsers, currentUser?.id || ""), [currentUser?.id, staffUsers]);
  const reportsData = useMemo(() => buildReportsData(state, canManage), [canManage, state]);

  async function syncAuthSetup() {
    try {
      const status = await apiRequest("/auth/setup");
      const required = Boolean(status?.setupRequired);
      setSetupRequired(required);
      setAuthMode(required ? "signup" : "login");
    } catch {
      setSetupRequired(false);
      setAuthMode("login");
    }
  }

  async function loadState() {
    const payload = await apiRequest("/state");
    setState(normalizeState(payload.data || payload));
  }

  async function loadStaff(user = currentUser) {
    if (!canManageStaff(user)) {
      setStaffUsers([]);
      return;
    }

    const payload = await apiRequest("/users");
    setStaffUsers(Array.isArray(payload.users) ? payload.users : []);
  }

  async function loadReminderProviders(user = currentUser) {
    if (!canManageData(user)) {
      setReminderProviders(null);
      return;
    }

    try {
      const payload = await apiRequest("/reminders/providers");
      setReminderProviders(payload.channels || null);
    } catch {
      setReminderProviders(null);
    }
  }

  async function applyAuthPayload(payload) {
    setCurrentUser(payload.user);
    setAuthRefreshKey((value) => value + 1);
    setSidebarOpen(false);
  }

  async function handleLogin(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = formToObject(form);
    const username = cleanText(values.username);
    const password = String(values.password || "");

    if (!username || !password) {
      showError("Username and password are required.");
      return;
    }

    try {
      const payload = await apiRequest("/auth/login", {
        method: "POST",
        body: { username, password },
      });
      form.reset();
      await applyAuthPayload(payload);
    } catch (error) {
      showError(error.message || "Login failed.");
    }
  }

  async function handleSignup(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = formToObject(form);
    const name = cleanText(values.name);
    const username = cleanText(values.username);
    const password = String(values.password || "");

    if (!username || !password) {
      showError("Username and password are required.");
      return;
    }
    if (username.length < 3 || username.length > 32) {
      showError("Username must be 3-32 characters.");
      return;
    }
    if (password.length < 8) {
      showError("Password must be at least 8 characters.");
      return;
    }

    try {
      const payload = await apiRequest("/auth/signup", {
        method: "POST",
        body: { name, username, password },
      });
      form.reset();
      await applyAuthPayload(payload);
    } catch (error) {
      showError(error.message || "Signup failed.");
    }
  }

  async function handleLogout() {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } catch {
      // Ignore logout cleanup failures.
    }

    setCurrentUser(null);
    setState(seedState());
    setStaffUsers([]);
    setReminderProviders(null);
    setShowWorkoutComposer(false);
    setAuthRefreshKey((value) => value + 1);
  }

  async function handleChangePassword() {
    if (!currentUser) {
      return;
    }
    setDialog({ type: "change-password" });
  }

  async function persistState(nextState, action) {
    setState(nextState);
    try {
      await apiRequest("/state", {
        method: "PUT",
        body: { data: nextState, action },
      });
      await loadState();
    } catch (error) {
      showError(error.message || "Unable to save state.");
    }
  }

  async function handleCreateMember(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!canManage) {
      showError("You do not have permission to create members.");
      return;
    }
    if (!state.plans.length) {
      showError("Create at least one plan before adding a member.");
      return;
    }

    const values = formToObject(form);
    const phone = cleanText(values.phone);
    const digitsOnly = phone.replace(/\D/g, "");
    if (digitsOnly.length < 10) {
      showError("Please enter a valid phone number with at least 10 digits.");
      return;
    }

    const nextMember = {
      id: editingMemberId || uid("mem"),
      name: cleanText(values.name),
      phone,
      email: cleanText(values.email),
      planId: cleanText(values.planId),
      trainerId: cleanText(values.trainerId),
      joinDate: cleanText(values.joinDate) || todayKey,
      status: cleanText(values.status) || "Active",
    };

    const nextState = {
      ...state,
      members: editingMemberId
        ? state.members.map((member) => (member.id === editingMemberId ? nextMember : member))
        : [...state.members, nextMember],
    };

    form.reset();
    setEditingMemberId("");
    await persistState(nextState, editingMemberId ? "member updated" : "member created");
  }

  async function handleCreatePlan(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!canManage) {
      showError("You do not have permission to create plans.");
      return;
    }

    const values = formToObject(form);
    const durationMonths = Number(values.durationMonths) || 0;
    const price = Number(values.price) || 0;

    if (durationMonths < 1) {
      showError("Plan duration must be at least 1 month.");
      return;
    }
    if (price < 0) {
      showError("Price cannot be negative.");
      return;
    }

    const nextPlan = {
      id: editingPlanId || uid("plan"),
      name: cleanText(values.name),
      durationMonths,
      price,
      features: cleanText(values.features),
    };

    const nextState = {
      ...state,
      plans: editingPlanId
        ? state.plans.map((plan) => (plan.id === editingPlanId ? nextPlan : plan))
        : [...state.plans, nextPlan],
    };

    form.reset();
    setEditingPlanId("");
    await persistState(nextState, editingPlanId ? "plan updated" : "plan created");
  }

  async function handleCreateWorkout(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!canManage) {
      showError("You do not have permission to create workout plans.");
      return;
    }

    const values = formToObject(form);
    const nextWorkout = {
      id: editingWorkoutId || uid("workout"),
      name: cleanText(values.name),
      level: cleanText(values.level) || "Beginner",
      daysPerWeek: Number(values.daysPerWeek) || 3,
      focus: cleanText(values.focus),
    };

    const nextState = {
      ...state,
      workoutPlans: editingWorkoutId
        ? state.workoutPlans.map((plan) => (plan.id === editingWorkoutId ? nextWorkout : plan))
        : [...state.workoutPlans, nextWorkout],
    };

    form.reset();
    setShowWorkoutComposer(false);
    setEditingWorkoutId("");
    await persistState(nextState, editingWorkoutId ? "workout plan updated" : "workout plan created");
  }

  async function handleCreateDiet(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!canManage) {
      showError("You do not have permission to create diet plans.");
      return;
    }

    const values = formToObject(form);
    const nextDiet = {
      id: editingDietId || uid("diet"),
      name: cleanText(values.name),
      goal: cleanText(values.goal) || "Maintenance",
      calories: Number(values.calories) || 2000,
      notes: cleanText(values.notes),
    };

    const nextState = {
      ...state,
      dietPlans: editingDietId
        ? state.dietPlans.map((plan) => (plan.id === editingDietId ? nextDiet : plan))
        : [...state.dietPlans, nextDiet],
    };

    form.reset();
    setEditingDietId("");
    await persistState(nextState, editingDietId ? "diet plan updated" : "diet plan created");
  }

  async function handleCreateTrainer(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!canManage) {
      showError("You do not have permission to add trainers.");
      return;
    }

    const values = formToObject(form);
    const nextTrainer = {
      id: editingTrainerId || uid("trainer"),
      name: cleanText(values.name),
      specialty: cleanText(values.specialty),
      phone: cleanText(values.phone),
    };

    const nextState = {
      ...state,
      trainers: editingTrainerId
        ? state.trainers.map((trainer) => (trainer.id === editingTrainerId ? nextTrainer : trainer))
        : [...state.trainers, nextTrainer],
    };

    form.reset();
    setEditingTrainerId("");
    await persistState(nextState, editingTrainerId ? "trainer updated" : "trainer created");
  }

  function confirmAction(message) {
    if (typeof window === "undefined") {
      return true;
    }
    return window.confirm(message);
  }

  function handleEditPlan(planId) {
    setEditingPlanId(planId);
  }

  async function handleDeletePlan(planId) {
    if (!canManage) {
      showError("You do not have permission to delete plans.");
      return;
    }
    if (state.members.some((member) => member.planId === planId)) {
      showError("This plan is assigned to existing members. Reassign them before deleting the plan.");
      return;
    }
    if (!confirmAction("Delete this plan?")) {
      return;
    }

    setEditingPlanId((currentId) => (currentId === planId ? "" : currentId));
    await persistState(
      {
        ...state,
        plans: state.plans.filter((plan) => plan.id !== planId),
      },
      "plan deleted"
    );
  }

  function handleCancelPlanEdit() {
    setEditingPlanId("");
  }

  function handleEditTrainer(trainerId) {
    setEditingTrainerId(trainerId);
  }

  async function handleDeleteTrainer(trainerId) {
    if (!canManage) {
      showError("You do not have permission to delete trainers.");
      return;
    }
    if (!confirmAction("Delete this trainer and unassign linked members?")) {
      return;
    }

    setEditingTrainerId((currentId) => (currentId === trainerId ? "" : currentId));
    await persistState(
      {
        ...state,
        trainers: state.trainers.filter((trainer) => trainer.id !== trainerId),
        members: state.members.map((member) =>
          member.trainerId === trainerId ? { ...member, trainerId: "" } : member
        ),
      },
      "trainer deleted"
    );
  }

  function handleCancelTrainerEdit() {
    setEditingTrainerId("");
  }

  function handleEditDiet(dietId) {
    setEditingDietId(dietId);
  }

  async function handleDeleteDiet(dietId) {
    if (!canManage) {
      showError("You do not have permission to delete diet plans.");
      return;
    }
    if (!confirmAction("Delete this diet plan?")) {
      return;
    }

    setEditingDietId((currentId) => (currentId === dietId ? "" : currentId));
    await persistState(
      {
        ...state,
        dietPlans: state.dietPlans.filter((plan) => plan.id !== dietId),
      },
      "diet plan deleted"
    );
  }

  function handleCancelDietEdit() {
    setEditingDietId("");
  }

  function handleEditWorkout(workoutId) {
    setEditingWorkoutId(workoutId);
    setShowWorkoutComposer(true);
  }

  async function handleDeleteWorkout(workoutId) {
    if (!canManage) {
      showError("You do not have permission to delete workout plans.");
      return;
    }
    if (!confirmAction("Delete this workout plan?")) {
      return;
    }

    setEditingWorkoutId((currentId) => (currentId === workoutId ? "" : currentId));
    await persistState(
      {
        ...state,
        workoutPlans: state.workoutPlans.filter((plan) => plan.id !== workoutId),
      },
      "workout plan deleted"
    );
  }

  function handleCancelWorkoutEdit() {
    setEditingWorkoutId("");
    setShowWorkoutComposer(false);
  }

  async function handleCreatePayment(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!canManage) {
      showError("You do not have permission to record payments.");
      return;
    }

    const values = formToObject(form);
    const memberId = cleanText(values.memberId);
    const amount = Number(values.amount) || 0;
    if (!memberId) {
      showError("Select a member to record payment.");
      return;
    }
    if (amount <= 0) {
      showError("Payment amount should be greater than zero.");
      return;
    }

    const member = state.members.find((item) => item.id === memberId);
    if (!member) {
      showError("Member not found.");
      return;
    }

    const dueBefore = getOutstandingDue(state, member);
    const payments = [
      ...state.payments,
      {
        id: uid("pay"),
        memberId,
        amount,
        mode: cleanText(values.mode) || "UPI",
        date: cleanText(values.date) || todayKey,
        reference: cleanText(values.reference),
        note: cleanText(values.note),
        recordedBy: currentUser?.username || "system",
        createdAt: new Date().toISOString(),
      },
    ];

    const members = state.members.map((item) => {
      if (item.id !== memberId) {
        return item;
      }
      if (values.autoRenew === "on" && dueBefore > 0 && amount >= dueBefore) {
        return { ...item, joinDate: cleanText(values.date) || todayKey, status: "Active" };
      }
      return item;
    });

    form.reset();
    await persistState({ ...state, payments, members }, "payment recorded");
  }

  function handleEditMember(memberId) {
    setEditingMemberId(memberId);
    setActiveView("members");
  }

  async function handleDeleteMember(memberId) {
    if (!canManage) {
      showError("You do not have permission to delete members.");
      return;
    }
    if (!confirmAction("Delete this member and remove linked attendance, payments, and reminders?")) {
      return;
    }

    setEditingMemberId((currentId) => (currentId === memberId ? "" : currentId));
    const attendance = Object.fromEntries(
      Object.entries(state.attendance).map(([dateKey, memberIds]) => [
        dateKey,
        Array.isArray(memberIds) ? memberIds.filter((id) => id !== memberId) : [],
      ])
    );

    await persistState(
      {
        ...state,
        members: state.members.filter((member) => member.id !== memberId),
        payments: state.payments.filter((payment) => payment.memberId !== memberId),
        reminders: state.reminders.filter((reminder) => reminder.memberId !== memberId),
        attendance,
      },
      "member deleted"
    );
  }

  function handleCancelMemberEdit() {
    setEditingMemberId("");
  }

  async function handleMemberAction(action, memberId) {
    const member = state.members.find((item) => item.id === memberId);
    if (!member) {
      return;
    }

    if (action === "checkin") {
      if (!canAttend) {
        showError("You do not have permission to mark attendance.");
        return;
      }
      if (getEffectiveMemberStatus(state, member) !== "Active") {
        showError("This member cannot check in until plan is active.");
        return;
      }

      const presentSet = new Set(getAttendanceForDate(state, todayKey));
      presentSet.add(memberId);
      const nextState = {
        ...state,
        attendance: {
          ...state.attendance,
          [todayKey]: Array.from(presentSet),
        },
      };
      await persistState(nextState, "member check-in");
      return;
    }

    if (!canManage) {
      showError("You do not have permission for this action.");
      return;
    }

    const members = state.members.map((item) => {
      if (item.id !== memberId) {
        return item;
      }
      if (action === "toggle-status") {
        return { ...item, status: item.status === "Active" ? "Frozen" : "Active" };
      }
      if (action === "renew-plan") {
        return { ...item, joinDate: todayKey, status: "Active" };
      }
      return item;
    });

    await persistState({ ...state, members }, `member ${action}`);
  }

  async function handleAttendanceToggle(memberId, checked) {
    if (!canAttend) {
      showError("You do not have permission to update attendance.");
      return;
    }

    const current = new Set(getAttendanceForDate(state, attendanceDate));
    if (checked) {
      current.add(memberId);
    } else {
      current.delete(memberId);
    }

    await persistState(
      {
        ...state,
        attendance: {
          ...state.attendance,
          [attendanceDate]: Array.from(current),
        },
      },
      "attendance toggled"
    );
  }

  async function handleMarkAllPresent() {
    if (!canAttend) {
      showError("You do not have permission to mark attendance.");
      return;
    }

    const next = state.members
      .filter((member) => getEffectiveMemberStatus(state, member) === "Active")
      .map((member) => member.id);

    await persistState(
      {
        ...state,
        attendance: {
          ...state.attendance,
          [attendanceDate]: next,
        },
      },
      "attendance marked all present"
    );
  }

  async function handleClearDayAttendance() {
    if (!canAttend) {
      showError("You do not have permission to clear attendance.");
      return;
    }

    await persistState(
      {
        ...state,
        attendance: {
          ...state.attendance,
          [attendanceDate]: [],
        },
      },
      "attendance cleared"
    );
  }

  async function handleCreateStaff(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!canStaff) {
      showError("Only the gym owner can manage staff accounts.");
      return;
    }

    const values = formToObject(form);
    const role = cleanText(values.role);
    const name = cleanText(values.name);
    const username = cleanText(values.username);
    const password = String(values.password || "");

    if (!role || !name || !username || !password) {
      showError("Please fill all fields.");
      return;
    }
    if (username.length < 3 || username.length > 32) {
      showError("Username must be 3-32 characters.");
      return;
    }
    if (password.length < 8) {
      showError("Password must be at least 8 characters.");
      return;
    }

    try {
      await apiRequest("/users", {
        method: "POST",
        body: { role, name, username, password },
      });
      form.reset();
      await loadStaff();
      showSuccess("Staff account created.");
    } catch (error) {
      showError(error.message || "Unable to create staff account.");
    }
  }

  async function handleToggleStaff(userId, isActive) {
    if (!canStaff) {
      return;
    }
    setDialog({ type: "toggle-staff", userId, isActive });
  }

  async function handleResetStaffPassword(userId) {
    setDialog({ type: "reset-staff-password", userId });
  }

  async function handleGenerateReminders(channel) {
    if (!canManage) {
      showError("You do not have permission to generate reminders.");
      return;
    }
    if (!alerts.length) {
      showError("No expiring or expired plans found right now.");
      return;
    }

    let createdCount = 0;
    const reminders = [...state.reminders];

    alerts.forEach(({ member, alert }) => {
      const alreadyExists = reminders.some((item) => {
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

      reminders.push({
        id: uid("rem"),
        memberId: member.id,
        channel,
        status: "Pending",
        alertType: alert.type,
        expiryDate: alert.expiryDateKey,
        message: buildReminderMessage(state, member, alert),
        createdAt: new Date().toISOString(),
        sentAt: "",
        sentBy: "",
      });
      createdCount += 1;
    });

    if (!createdCount) {
      showNotice("info", `No new ${channel} reminders were generated.`);
      return;
    }

    setActiveView("reports");
    await persistState({ ...state, reminders }, `${channel} reminders generated (${createdCount})`);
  }

  async function handleMarkReminderSent(reminderId) {
    if (!canManage) {
      showError("You do not have permission to update reminders.");
      return;
    }

    const reminders = state.reminders.map((reminder) => {
      if (reminder.id !== reminderId) {
        return reminder;
      }
      return {
        ...reminder,
        status: "Sent",
        sentAt: new Date().toISOString(),
        sentBy: currentUser?.username || "system",
      };
    });

    await persistState({ ...state, reminders }, "reminder marked sent");
  }

  async function handleSendReminder(reminderId) {
    if (!canManage) {
      showError("You do not have permission to send reminders.");
      return;
    }

    try {
      const payload = await apiRequest(`/reminders/${reminderId}/send`, {
        method: "POST",
      });
      await loadState();
      const providerName = payload?.delivery?.provider || "provider";
      showSuccess(`Reminder sent successfully via ${providerName}.`);
    } catch (error) {
      showError(error.message || "Unable to send reminder.");
    }
  }

  async function handleDialogSubmit(event) {
    event.preventDefault();
    const values = formToObject(event.currentTarget);

    if (dialog.type === "change-password") {
      const currentPassword = String(values.currentPassword || "");
      const newPassword = String(values.newPassword || "");

      if (!currentPassword || !newPassword) {
        showError("Current password and new password are required.");
        return;
      }
      if (newPassword.length < 8) {
        showError("Password must be at least 8 characters.");
        return;
      }

      try {
        await apiRequest("/auth/change-password", {
          method: "POST",
          body: { currentPassword, newPassword },
        });
        closeDialog();
        showSuccess("Password changed successfully.");
      } catch (error) {
        showError(error.message || "Unable to change password.");
      }
      return;
    }

    if (dialog.type === "reset-staff-password") {
      const password = String(values.password || "");
      if (!password || password.length < 8) {
        showError("Password must be at least 8 characters.");
        return;
      }

      try {
        await apiRequest(`/users/${dialog.userId}/reset-password`, {
          method: "POST",
          body: { password },
        });
        closeDialog();
        showSuccess("Password reset successfully.");
      } catch (error) {
        showError(error.message || "Unable to reset password.");
      }
      return;
    }

    if (dialog.type === "toggle-staff") {
      try {
        await apiRequest(`/users/${dialog.userId}`, {
          method: "PATCH",
          body: { isActive: !dialog.isActive },
        });
        await loadStaff();
        closeDialog();
        showSuccess(`Staff account ${dialog.isActive ? "deactivated" : "activated"} successfully.`);
      } catch (error) {
        showError(error.message || "Unable to update staff status.");
      }
    }
  }

  function handleExportMembers() {
    if (!canManage) {
      showError("You do not have permission to export reports.");
      return;
    }

    downloadCsv(`members_${todayKey}.csv`, buildMembersExportRows(state));
  }

  function handleExportPayments() {
    if (!canManage) {
      showError("You do not have permission to export reports.");
      return;
    }

    downloadCsv(`payments_${todayKey}.csv`, buildPaymentsExportRows(state));
  }

  function handleExportExpiry() {
    if (!canManage) {
      showError("You do not have permission to export reports.");
      return;
    }

    downloadCsv(`expiry_alerts_${todayKey}.csv`, buildExpiryExportRows(state, alerts));
  }

  function navigate(viewId) {
    if (viewId === "staff" && !canStaff) {
      showError("Only the gym owner can manage staff accounts.");
      return;
    }
    setActiveView(viewId);
    setSidebarOpen(false);
  }

  function openExpiryAlerts() {
    setActiveView("members");
    setMemberStatusFilter(alerts.some((item) => item.alert.type === "expired") ? "PlanExpired" : "ExpiringSoon");
  }

  function handleMemberFilterChange(next) {
    if (Object.prototype.hasOwnProperty.call(next, "search")) {
      setMemberSearch(next.search);
    }
    if (Object.prototype.hasOwnProperty.call(next, "status")) {
      setMemberStatusFilter(next.status);
    }
  }

  function handleGlobalSearchChange(value) {
    setMemberSearch(value);
    if (activeView !== "members") {
      setActiveView("members");
    }
  }

  function handleQuickAddMember() {
    setActiveView("members");
  }

  function toggleWorkoutComposer() {
    if (!canManage) {
      showError("Only owner/receptionist can edit workout templates.");
      return;
    }
    if (showWorkoutComposer) {
      setEditingWorkoutId("");
    }
    setShowWorkoutComposer((value) => !value);
  }

  const currentMeta = viewMeta[activeView] || viewMeta.workouts;
  const dialogUser = staffUsers.find((user) => user.id === dialog.userId);
  const currentUserLabel = buildCurrentUserLabel(currentUser);
  const editingMember = state.members.find((member) => member.id === editingMemberId) || null;
  const editingPlan = state.plans.find((plan) => plan.id === editingPlanId) || null;
  const editingTrainer = state.trainers.find((trainer) => trainer.id === editingTrainerId) || null;
  const editingDiet = state.dietPlans.find((plan) => plan.id === editingDietId) || null;
  const editingWorkout = state.workoutPlans.find((plan) => plan.id === editingWorkoutId) || null;
  const viewContent = {
    dashboard: <DashboardView metrics={dashboardData.metrics} recentMembers={dashboardData.recentMembers} />,
    members: (
      <MembersView
        members={membersRows}
        plans={state.plans}
        trainers={state.trainers}
        filters={{ search: memberSearch, status: memberStatusFilter, today: todayKey }}
        onFilterChange={handleMemberFilterChange}
        onSubmit={handleCreateMember}
        onAction={handleMemberAction}
        onEdit={handleEditMember}
        onDelete={handleDeleteMember}
        canManage={canManage}
        canAttend={canAttend}
        editingMember={editingMember}
        onCancelEdit={handleCancelMemberEdit}
        formKey={`member-${editingMemberId || "new"}`}
      />
    ),
    plans: (
      <PlansView
        plans={plansCards}
        onSubmit={handleCreatePlan}
        canManage={canManage}
        editingPlan={editingPlan}
        onEdit={handleEditPlan}
        onDelete={handleDeletePlan}
        onCancelEdit={handleCancelPlanEdit}
        formKey={`plan-${editingPlanId || "new"}`}
      />
    ),
    attendance: (
      <AttendanceView
        selectedDate={attendanceDate}
        rows={attendanceData.rows}
        summary={attendanceData.summary}
        canAttend={canAttend}
        onDateChange={setAttendanceDate}
        onToggleMember={handleAttendanceToggle}
        onMarkAllPresent={handleMarkAllPresent}
        onClearDay={handleClearDayAttendance}
      />
    ),
    billing: (
      <BillingView
        stats={billingData.stats}
        payments={billingData.payments}
        members={billingData.memberOptions}
        onSubmit={handleCreatePayment}
        canManage={canManage}
        today={todayKey}
      />
    ),
    diet: (
      <DietView
        dietPlans={state.dietPlans}
        canManage={canManage}
        onSubmit={handleCreateDiet}
        editingDiet={editingDiet}
        onEdit={handleEditDiet}
        onDelete={handleDeleteDiet}
        onCancelEdit={handleCancelDietEdit}
        formKey={`diet-${editingDietId || "new"}`}
      />
    ),
    trainers: (
      <TrainersView
        trainers={trainersRows}
        canManage={canManage}
        onSubmit={handleCreateTrainer}
        editingTrainer={editingTrainer}
        onEdit={handleEditTrainer}
        onDelete={handleDeleteTrainer}
        onCancelEdit={handleCancelTrainerEdit}
        formKey={`trainer-${editingTrainerId || "new"}`}
      />
    ),
    staff: (
      <StaffView
        users={staffRows}
        canManage={canStaff}
        onSubmit={handleCreateStaff}
        onToggleUser={handleToggleStaff}
        onResetPassword={handleResetStaffPassword}
      />
    ),
    reports: (
      <ReportsView
        overview={reportsData.overview}
        bars={reportsData.bars}
        reminders={reportsData.reminders}
        canManage={canManage}
        providerStatus={reminderProviders}
        onGenerateWhatsApp={() => handleGenerateReminders("WhatsApp")}
        onGenerateSms={() => handleGenerateReminders("SMS")}
        onMarkReminderSent={handleMarkReminderSent}
        onSendReminder={handleSendReminder}
        onExportMembers={handleExportMembers}
        onExportPayments={handleExportPayments}
        onExportExpiry={handleExportExpiry}
      />
    ),
    workouts: (
      <WorkoutsView
        workouts={state.workoutPlans}
        canManage={canManage}
        showComposer={showWorkoutComposer}
        onToggleComposer={toggleWorkoutComposer}
        onSubmit={handleCreateWorkout}
        editingWorkout={editingWorkout}
        onEdit={handleEditWorkout}
        onDelete={handleDeleteWorkout}
        onCancelEdit={handleCancelWorkoutEdit}
        formKey={`workout-${editingWorkoutId || "new"}`}
      />
    ),
  };

  return (
    <>
      <NoticeBar notice={notice} onDismiss={() => setNotice(null)} />

      <div className="app-shell">
        <Sidebar
          activeView={activeView}
          onNavigate={navigate}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentUser={currentUser}
        />

        <div className={`overlay${sidebarOpen ? " show" : ""}`} onClick={() => setSidebarOpen(false)}></div>

        <main className="main-content">
          <Topbar
            title={currentMeta.title}
            subtitle={currentMeta.subtitle}
            currentUserLabel={currentUserLabel}
            currentTheme={theme}
            alertCount={alertSummary.totalCount}
            criticalAlerts={alertSummary.critical}
            globalSearch={memberSearch}
            onGlobalSearchChange={handleGlobalSearchChange}
            onMenuToggle={() => setSidebarOpen(true)}
            onToggleTheme={handleToggleTheme}
            onChangePassword={handleChangePassword}
            onLogout={handleLogout}
            onOpenAlerts={openExpiryAlerts}
            onQuickAddMember={handleQuickAddMember}
            canQuickAdd={canManage}
            isAuthenticated={Boolean(currentUser)}
          />

          <AlertBanner alertSummary={alertSummary} onReview={openExpiryAlerts} />
          {viewContent[activeView] || viewContent.workouts}
        </main>
      </div>

      {!currentUser ? (
        <AuthLayer
          mode={authMode}
          setupRequired={setupRequired}
          onModeChange={setAuthMode}
          onLogin={handleLogin}
          onSignup={handleSignup}
        />
      ) : null}

      <AppDialog
        open={dialog.type === "change-password"}
        title="Change Password"
        description="Update your account password with a stronger replacement."
        confirmLabel="Update Password"
        onClose={closeDialog}
        onSubmit={handleDialogSubmit}
      >
        <label>
          Current Password
          <input type="password" name="currentPassword" required placeholder="Enter current password" />
        </label>
        <label>
          New Password
          <input type="password" name="newPassword" required placeholder="Use at least 8 characters" />
        </label>
      </AppDialog>

      <AppDialog
        open={dialog.type === "reset-staff-password"}
        title="Reset Staff Password"
        description={`Set a new password for ${dialogUser?.username || "this staff member"}.`}
        confirmLabel="Reset Password"
        onClose={closeDialog}
        onSubmit={handleDialogSubmit}
      >
        <label>
          New Password
          <input type="password" name="password" required placeholder="Use at least 8 characters" />
        </label>
      </AppDialog>

      <AppDialog
        open={dialog.type === "toggle-staff"}
        title={dialog.isActive ? "Deactivate Staff Account" : "Activate Staff Account"}
        description={
          dialog.isActive
            ? `This will immediately block ${dialogUser?.username || "this user"} from signing in.`
            : `This will restore access for ${dialogUser?.username || "this user"}.`
        }
        confirmLabel={dialog.isActive ? "Deactivate" : "Activate"}
        tone={dialog.isActive ? "danger" : "default"}
        onClose={closeDialog}
        onSubmit={handleDialogSubmit}
      >
        <p className="dialog-copy">
          {dialog.isActive
            ? "You can reactivate the account later if needed."
            : "The user will be able to sign in again after activation."}
        </p>
      </AppDialog>
    </>
  );
}

export default App;
