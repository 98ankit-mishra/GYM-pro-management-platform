"use strict";

const crypto = require("crypto");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const express = require("express");
const rateLimit = require("express-rate-limit");
const fs = require("fs");
const helmet = require("helmet");
const path = require("path");
const { asyncHandler, createAuthTools, hashPassword, toPublicUser, verifyPassword } = require("./lib/auth");
const { createReminderService } = require("./lib/reminders");
const {
  isDateKey,
  validateBoolean,
  validateDateKey,
  validateEntityId,
  validateEnum,
  validateIntegerInRange,
  validateIsoDateTime,
  validateLoginUsername,
  validateMemberStatus,
  validateNumberInRange,
  validateOptionalEmail,
  validateOptionalIsoDateTime,
  validateOptionalName,
  validatePassword,
  validatePhone,
  validateRequiredName,
  validateRequiredSecret,
  validateRequiredText,
  validateRole,
  validateText,
  validateUsername,
} = require("./lib/validation");

function createApp({ config, models, reminderService, serveFrontend = true }) {
  const {
    AUTH_RATE_LIMIT_MAX,
    AUTH_RATE_LIMIT_WINDOW_MS,
    COOKIE_SECURE,
    FRONTEND_DIST,
    FRONTEND_URL,
    SESSION_COOKIE_NAME,
    SESSION_TTL_MS,
  } = config;
  const { AppState, Member, Session, User } = models;

  const app = express();
  app.disable("x-powered-by");
  app.use(
    helmet({
      crossOriginResourcePolicy: false,
    })
  );
  app.use(
    cors({
      origin: FRONTEND_URL,
      credentials: true,
    })
  );
  app.use(cookieParser());
  app.use(express.json({ limit: "5mb" }));

  const authLimiter = rateLimit({
    windowMs: AUTH_RATE_LIMIT_WINDOW_MS,
    limit: AUTH_RATE_LIMIT_MAX,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Too many authentication attempts. Please try again later." },
  });

  const { clearSessionCookie, requireAuth, requireRole, setSessionCookie } = createAuthTools({
    Session,
    User,
    sessionCookieName: SESSION_COOKIE_NAME,
    cookieSecure: COOKIE_SECURE,
    sessionTtlMs: SESSION_TTL_MS,
  });

  const reminders = reminderService || createReminderService();

  app.get("/api/health", (_req, res) => {
    res.status(200).json({ ok: true, now: new Date().toISOString() });
  });

  app.get(
    "/api/auth/setup",
    asyncHandler(async (_req, res) => {
      const userCount = await User.countDocuments();
      res.status(200).json({ setupRequired: userCount === 0 });
    })
  );

  app.post(
    "/api/auth/signup",
    authLimiter,
    asyncHandler(async (req, res) => {
      const userCount = await User.countDocuments();
      if (userCount > 0) {
        res.status(403).json({ error: "Signup is disabled. Please login." });
        return;
      }

      const username = validateUsername(req.body?.username);
      const password = validatePassword(req.body?.password);
      const name = validateOptionalName(req.body?.name, "Name");
      const { hash, salt } = hashPassword(password);

      let user;
      try {
        user = await User.create({
          _id: uid("usr"),
          username,
          passwordHash: hash,
          passwordSalt: salt,
          role: "owner",
          name: name || "Gym Owner",
          isActive: true,
          createdAt: new Date(),
        });
      } catch (error) {
        if (error && typeof error === "object" && error.code === 11000) {
          res.status(409).json({ error: "Username already exists." });
          return;
        }
        throw error;
      }

      const token = crypto.randomBytes(24).toString("hex");
      await Session.create({
        _id: token,
        userId: user._id,
        expiresAt: new Date(Date.now() + SESSION_TTL_MS),
      });

      await appendAudit(AppState, user, "Owner signup");
      setSessionCookie(res, token);

      res.status(200).json({ user: toPublicUser(user) });
    })
  );

  app.post(
    "/api/auth/login",
    authLimiter,
    asyncHandler(async (req, res) => {
      const username = validateLoginUsername(req.body?.username);
      const password = validateRequiredSecret(req.body?.password);
      const user = await User.findOne({ username, isActive: true }).lean();

      if (!user || !verifyPassword(password, user)) {
        res.status(401).json({ error: "Invalid credentials." });
        return;
      }

      const token = crypto.randomBytes(24).toString("hex");
      await Session.create({
        _id: token,
        userId: user._id,
        expiresAt: new Date(Date.now() + SESSION_TTL_MS),
      });

      await appendAudit(AppState, user, "User login");
      setSessionCookie(res, token);
      res.status(200).json({ user: toPublicUser(user) });
    })
  );

  app.post(
    "/api/auth/logout",
    requireAuth(),
    asyncHandler(async (req, res) => {
      await Session.deleteOne({ _id: req.auth.token });
      await appendAudit(AppState, req.auth.user, "User logout");
      clearSessionCookie(res);
      res.status(200).json({ ok: true });
    })
  );

  app.get(
    "/api/auth/me",
    requireAuth(),
    asyncHandler(async (req, res) => {
      res.status(200).json({ user: toPublicUser(req.auth.user) });
    })
  );

  app.post(
    "/api/auth/change-password",
    requireAuth(),
    authLimiter,
    asyncHandler(async (req, res) => {
      const currentPassword = validateRequiredSecret(req.body?.currentPassword, "Current password");
      const newPassword = validatePassword(req.body?.newPassword, "New password");

      if (!verifyPassword(currentPassword, req.auth.user)) {
        res.status(401).json({ error: "Invalid current password." });
        return;
      }

      const { hash, salt } = hashPassword(newPassword);
      await User.updateOne({ _id: req.auth.user._id }, { $set: { passwordHash: hash, passwordSalt: salt } });
      await Session.deleteMany({ userId: req.auth.user._id, _id: { $ne: req.auth.token } });
      await appendAudit(AppState, req.auth.user, "Change password");

      res.status(200).json({ ok: true });
    })
  );

  app.get(
    "/api/users",
    requireAuth(),
    requireRole("owner"),
    asyncHandler(async (_req, res) => {
      const users = await User.find().sort({ createdAt: 1 }).lean();
      res.status(200).json({ users: users.map(toPublicUser) });
    })
  );

  app.post(
    "/api/users",
    requireAuth(),
    requireRole("owner"),
    asyncHandler(async (req, res) => {
      const username = validateUsername(req.body?.username);
      const password = validatePassword(req.body?.password);
      const role = validateRole(req.body?.role);
      const name = validateRequiredName(req.body?.name, "Name");
      const { hash, salt } = hashPassword(password);

      let user;
      try {
        user = await User.create({
          _id: uid("usr"),
          username,
          passwordHash: hash,
          passwordSalt: salt,
          role,
          name,
          isActive: true,
          createdAt: new Date(),
        });
      } catch (error) {
        if (error && typeof error === "object" && error.code === 11000) {
          res.status(409).json({ error: "Username already exists." });
          return;
        }
        throw error;
      }

      await appendAudit(AppState, req.auth.user, `Create user ${username} (${role})`);
      res.status(201).json({ user: toPublicUser(user) });
    })
  );

  app.patch(
    "/api/users/:id",
    requireAuth(),
    requireRole("owner"),
    asyncHandler(async (req, res) => {
      const userId = String(req.params.id || "");
      const nextActive = validateBoolean(req.body?.isActive, "isActive");

      if (!userId) {
        res.status(400).json({ error: "Missing user id." });
        return;
      }
      if (userId === String(req.auth.user._id)) {
        res.status(400).json({ error: "You cannot change your own account status." });
        return;
      }

      const user = await User.findById(userId).lean();
      if (!user) {
        res.status(404).json({ error: "User not found." });
        return;
      }

      await User.updateOne({ _id: userId }, { $set: { isActive: nextActive } });
      if (!nextActive) {
        await Session.deleteMany({ userId });
      }

      await appendAudit(AppState, req.auth.user, `${nextActive ? "Activate" : "Deactivate"} user ${user.username}`);
      res.status(200).json({ ok: true });
    })
  );

  app.post(
    "/api/users/:id/reset-password",
    requireAuth(),
    requireRole("owner"),
    asyncHandler(async (req, res) => {
      const userId = String(req.params.id || "");
      const password = validatePassword(req.body?.password);

      if (!userId) {
        res.status(400).json({ error: "Missing user id." });
        return;
      }
      if (userId === String(req.auth.user._id)) {
        res.status(400).json({ error: "Use change password to update your own password." });
        return;
      }

      const user = await User.findById(userId).lean();
      if (!user) {
        res.status(404).json({ error: "User not found." });
        return;
      }

      const { hash, salt } = hashPassword(password);
      await User.updateOne({ _id: userId }, { $set: { passwordHash: hash, passwordSalt: salt } });
      await Session.deleteMany({ userId });
      await appendAudit(AppState, req.auth.user, `Reset password for ${user.username}`);
      res.status(200).json({ ok: true });
    })
  );

  app.get(
    "/api/state",
    requireAuth(),
    asyncHandler(async (_req, res) => {
      const doc = await AppState.findById("main").lean();
      const state = stateFromDoc(doc);
      const members = await Member.find().lean();
      state.members = members.map(memberToState).filter(Boolean);
      res.status(200).json({ data: state });
    })
  );

  app.put(
    "/api/state",
    requireAuth(),
    asyncHandler(async (req, res) => {
      const nextData = req.body?.data;
      const action = String(req.body?.action || "state update");

      if (!nextData || typeof nextData !== "object") {
        res.status(400).json({ error: "Invalid state payload." });
        return;
      }

      const role = req.auth.user.role;
      const updates = {};

      if (role === "trainer") {
        const allowedKeys = ["attendance"];
        const invalidKeys = Object.keys(nextData).filter(
          (key) => !allowedKeys.includes(key) && nextData[key] !== undefined
        );
        if (invalidKeys.length > 0) {
          res.status(403).json({ error: "Trainer can only update attendance." });
          return;
        }
        if (!nextData.attendance || typeof nextData.attendance !== "object") {
          res.status(403).json({ error: "Trainer can only update attendance." });
          return;
        }
        updates.attendance = sanitizeAttendance(nextData.attendance);
      } else if (role === "owner" || role === "receptionist") {
        await mirrorMembers(Member, nextData.members);
        updates.plans = sanitizePlans(nextData.plans);
        updates.attendance = sanitizeAttendance(nextData.attendance);
        updates.workoutPlans = sanitizeWorkoutPlans(nextData.workoutPlans);
        updates.dietPlans = sanitizeDietPlans(nextData.dietPlans);
        updates.trainers = sanitizeTrainers(nextData.trainers);
        updates.payments = sanitizePayments(nextData.payments);
        updates.reminders = sanitizeReminders(nextData.reminders);
      } else {
        res.status(403).json({ error: "You do not have permission to update state." });
        return;
      }

      const auditEntry = buildAuditEntry(req.auth.user, action);
      const doc = await AppState.findOneAndUpdate(
        { _id: "main" },
        {
          $set: updates,
          $push: {
            auditLogs: {
              $each: [auditEntry],
              $slice: -2000,
            },
          },
        },
        { new: true, upsert: true }
      ).lean();

      const state = stateFromDoc(doc);
      const members = await Member.find().lean();
      state.members = members.map(memberToState).filter(Boolean);
      res.status(200).json({ ok: true, data: state });
    })
  );

  app.get(
    "/api/reminders/providers",
    requireAuth(),
    requireRole("owner", "receptionist"),
    asyncHandler(async (_req, res) => {
      res.status(200).json({ channels: reminders.getChannelStatus() });
    })
  );

  app.post(
    "/api/reminders/:id/send",
    requireAuth(),
    requireRole("owner", "receptionist"),
    asyncHandler(async (req, res) => {
      const reminderId = String(req.params.id || "");
      const doc = await AppState.findById("main").lean();
      const state = stateFromDoc(doc);
      const reminder = state.reminders.find((item) => item.id === reminderId);

      if (!reminder) {
        res.status(404).json({ error: "Reminder not found." });
        return;
      }
      if (reminder.status === "Sent") {
        res.status(400).json({ error: "Reminder has already been sent." });
        return;
      }

      const member = await Member.findById(reminder.memberId).lean();
      if (!member) {
        res.status(404).json({ error: "Reminder member not found." });
        return;
      }

      const delivery = await reminders.sendReminder({
        channel: reminder.channel,
        recipient: member.phone,
        message: reminder.message,
      });

      const nextReminders = state.reminders.map((item) =>
        item.id === reminderId
          ? {
              ...item,
              status: "Sent",
              sentAt: delivery.deliveredAt || new Date().toISOString(),
              sentBy: req.auth.user.username || "system",
              provider: delivery.provider || "",
              externalId: delivery.externalId || "",
            }
          : item
      );

      await AppState.updateOne({ _id: "main" }, { $set: { reminders: nextReminders } });
      await appendAudit(AppState, req.auth.user, `Reminder sent (${reminder.channel})`);

      res.status(200).json({
        ok: true,
        delivery,
        reminder: nextReminders.find((item) => item.id === reminderId),
      });
    })
  );

  app.use("/api", (_req, res) => {
    res.status(404).json({ error: "Route not found" });
  });

  if (serveFrontend && fs.existsSync(FRONTEND_DIST)) {
    app.use(express.static(FRONTEND_DIST));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(FRONTEND_DIST, "index.html"));
    });
  }

  app.use((err, req, res, _next) => {
    console.error(err);
    const statusCode = Number(err.statusCode) || 500;
    const message = statusCode === 500 ? "Internal server error" : err.message;

    if (req.path.startsWith("/api")) {
      res.status(statusCode).json({ error: message });
      return;
    }

    res.status(statusCode).send(message);
  });

  return app;
}

async function ensureInitialData({ AppState, Member, legacyDbPath }) {
  const legacy = readLegacyDb(legacyDbPath);

  if (legacy) {
    await importLegacyMembers(Member, legacy.members);
    await importLegacyState(AppState, legacy);
  }

  await ensureStateDoc(AppState);
  await migrateMembersFromStateDoc(AppState, Member);
}

function readLegacyDb(legacyDbPath) {
  if (!fs.existsSync(legacyDbPath)) {
    return null;
  }

  try {
    const raw = fs.readFileSync(legacyDbPath, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    console.warn("Unable to read legacy data/db.json:", error);
    return null;
  }
}

async function importLegacyState(AppState, legacyDb) {
  if (!legacyDb || typeof legacyDb !== "object") {
    return;
  }

  const existing = await AppState.findById("main").lean();
  if (existing) {
    return;
  }

  await AppState.create({
    _id: "main",
    plans: Array.isArray(legacyDb.plans) ? legacyDb.plans : [],
    attendance: legacyDb.attendance && typeof legacyDb.attendance === "object" ? legacyDb.attendance : {},
    workoutPlans: Array.isArray(legacyDb.workoutPlans) ? legacyDb.workoutPlans : [],
    dietPlans: Array.isArray(legacyDb.dietPlans) ? legacyDb.dietPlans : [],
    trainers: Array.isArray(legacyDb.trainers) ? legacyDb.trainers : [],
    payments: Array.isArray(legacyDb.payments) ? legacyDb.payments : [],
    reminders: Array.isArray(legacyDb.reminders) ? legacyDb.reminders : [],
    auditLogs: Array.isArray(legacyDb.auditLogs) ? legacyDb.auditLogs : [],
  });
}

async function ensureStateDoc(AppState) {
  const existing = await AppState.findById("main").lean();
  if (existing) {
    return;
  }

  await AppState.create({
    _id: "main",
    plans: [],
    attendance: {},
    workoutPlans: [],
    dietPlans: [],
    trainers: [],
    payments: [],
    reminders: [],
    auditLogs: [],
  });
}

function sanitizeAttendance(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw Object.assign(new Error("Attendance must be an object."), { statusCode: 400 });
  }

  const normalized = {};
  for (const [dateKey, memberIds] of Object.entries(value)) {
    if (!Array.isArray(memberIds)) {
      throw Object.assign(new Error("Attendance rows must be arrays."), { statusCode: 400 });
    }
    if (!isDateKey(dateKey)) {
      throw Object.assign(new Error("Attendance date keys must be YYYY-MM-DD."), { statusCode: 400 });
    }
    normalized[dateKey] = Array.from(new Set(memberIds.map((id) => String(id).trim()).filter(Boolean)));
  }
  return normalized;
}

function sanitizeMember(value) {
  if (!value || typeof value !== "object") {
    return null;
  }

  const id = String(value.id || "").trim();
  if (!id) {
    return null;
  }

  return {
    _id: id,
    name: validateRequiredName(value.name, "Member name"),
    phone: validatePhone(value.phone),
    email: validateOptionalEmail(value.email),
    planId: String(value.planId || "").trim(),
    trainerId: String(value.trainerId || "").trim(),
    joinDate: validateDateKey(value.joinDate, "Join date"),
    status: validateMemberStatus(value.status),
  };
}

async function mirrorMembers(Member, members) {
  if (!Array.isArray(members)) {
    return;
  }

  const sanitized = members.map(sanitizeMember).filter(Boolean);
  if (members.length > 0 && sanitized.length !== members.length) {
    throw Object.assign(new Error("Invalid members payload."), { statusCode: 400 });
  }

  const ids = sanitized.map((member) => member._id);
  const ops = sanitized.map((member) => ({
    updateOne: {
      filter: { _id: member._id },
      update: { $set: member },
      upsert: true,
    },
  }));

  if (ops.length) {
    await Member.bulkWrite(ops, { ordered: false });
  }

  if (!ids.length) {
    await Member.deleteMany({});
    return;
  }

  await Member.deleteMany({ _id: { $nin: ids } });
}

function memberToState(memberDoc) {
  if (!memberDoc || typeof memberDoc !== "object") {
    return null;
  }

  return {
    id: String(memberDoc._id || ""),
    name: String(memberDoc.name || ""),
    phone: String(memberDoc.phone || ""),
    email: String(memberDoc.email || ""),
    planId: String(memberDoc.planId || ""),
    trainerId: String(memberDoc.trainerId || ""),
    joinDate: String(memberDoc.joinDate || ""),
    status: String(memberDoc.status || ""),
  };
}

async function importLegacyMembers(Member, legacyMembers) {
  if (!Array.isArray(legacyMembers) || legacyMembers.length === 0) {
    return;
  }

  const existingCount = await Member.countDocuments();
  if (existingCount > 0) {
    return;
  }

  const docs = legacyMembers.map(sanitizeMember).filter(Boolean);
  if (!docs.length) {
    return;
  }

  try {
    await Member.insertMany(docs, { ordered: false });
  } catch (error) {
    console.warn("Unable to import legacy members:", error);
  }
}

async function migrateMembersFromStateDoc(AppState, Member) {
  const doc = await AppState.findById("main").lean();
  if (!doc || !Array.isArray(doc.members) || doc.members.length === 0) {
    return;
  }

  const memberCount = await Member.countDocuments();
  if (memberCount === 0) {
    await mirrorMembers(Member, doc.members);
  }

  await AppState.updateOne({ _id: "main" }, { $unset: { members: "" } });
}

function buildAuditEntry(user, action) {
  return {
    id: uid("log"),
    action,
    actorId: String(user._id),
    actor: String(user.username || ""),
    role: String(user.role || ""),
    at: new Date().toISOString(),
  };
}

async function appendAudit(AppState, user, action) {
  const entry = buildAuditEntry(user, action);
  await AppState.updateOne(
    { _id: "main" },
    {
      $push: {
        auditLogs: {
          $each: [entry],
          $slice: -2000,
        },
      },
    }
  );
}

function stateFromDoc(doc) {
  if (!doc || typeof doc !== "object") {
    return seedState();
  }

  return {
    members: [],
    plans: Array.isArray(doc.plans) ? doc.plans : [],
    attendance: doc.attendance && typeof doc.attendance === "object" ? doc.attendance : {},
    workoutPlans: Array.isArray(doc.workoutPlans) ? doc.workoutPlans : [],
    dietPlans: Array.isArray(doc.dietPlans) ? doc.dietPlans : [],
    trainers: Array.isArray(doc.trainers) ? doc.trainers : [],
    payments: Array.isArray(doc.payments) ? doc.payments : [],
    reminders: Array.isArray(doc.reminders) ? doc.reminders : [],
    auditLogs: Array.isArray(doc.auditLogs) ? doc.auditLogs : [],
  };
}

function seedState() {
  return {
    members: [],
    plans: [],
    attendance: {},
    workoutPlans: [],
    dietPlans: [],
    trainers: [],
    payments: [],
    reminders: [],
    auditLogs: [],
  };
}

function sanitizePlans(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => ({
    id: validateEntityId(item?.id, "plan"),
    name: validateRequiredName(item?.name, "Plan name"),
    durationMonths: validateIntegerInRange(item?.durationMonths, "Plan duration", 1, 36),
    price: validateNumberInRange(item?.price, "Plan price", 0, 1000000),
    features: validateText(item?.features, "Plan features", 400),
  }));
}

function sanitizeWorkoutPlans(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => ({
    id: validateEntityId(item?.id, "workout"),
    name: validateRequiredName(item?.name, "Workout plan name"),
    level: validateEnum(item?.level, "Workout level", ["Beginner", "Intermediate", "Advanced"]),
    daysPerWeek: validateIntegerInRange(item?.daysPerWeek, "Workout days per week", 1, 7),
    focus: validateText(item?.focus, "Workout focus", 500),
  }));
}

function sanitizeDietPlans(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => ({
    id: validateEntityId(item?.id, "diet"),
    name: validateRequiredName(item?.name, "Diet plan name"),
    goal: validateEnum(item?.goal, "Diet goal", ["Weight Loss", "Muscle Gain", "Maintenance"]),
    calories: validateIntegerInRange(item?.calories, "Calories", 900, 10000),
    notes: validateText(item?.notes, "Diet notes", 500),
  }));
}

function sanitizeTrainers(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => ({
    id: validateEntityId(item?.id, "trainer"),
    name: validateRequiredName(item?.name, "Trainer name"),
    specialty: validateRequiredName(item?.specialty, "Trainer specialty"),
    phone: validatePhone(item?.phone),
  }));
}

function sanitizePayments(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => ({
    id: validateEntityId(item?.id, "payment"),
    memberId: validateEntityId(item?.memberId, "member"),
    amount: validateNumberInRange(item?.amount, "Payment amount", 0, 1000000),
    mode: validateText(item?.mode, "Payment mode", 40),
    date: validateDateKey(item?.date, "Payment date"),
    reference: validateText(item?.reference, "Payment reference", 80),
    note: validateText(item?.note, "Payment note", 500),
    recordedBy: validateText(item?.recordedBy, "Recorded by", 80),
    createdAt: validateIsoDateTime(item?.createdAt, "Payment createdAt"),
  }));
}

function sanitizeReminders(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => ({
    id: validateEntityId(item?.id, "reminder"),
    memberId: validateEntityId(item?.memberId, "member"),
    channel: validateText(item?.channel, "Reminder channel", 30),
    status: validateEnum(item?.status, "Reminder status", ["Pending", "Sent"]),
    alertType: validateText(item?.alertType, "Reminder alert type", 20),
    expiryDate: validateDateKey(item?.expiryDate, "Reminder expiry date"),
    message: validateRequiredText(item?.message, "Reminder message", 500),
    createdAt: validateIsoDateTime(item?.createdAt, "Reminder createdAt"),
    sentAt: validateOptionalIsoDateTime(item?.sentAt, "Reminder sentAt"),
    sentBy: validateText(item?.sentBy, "Reminder sent by", 80),
    provider: validateText(item?.provider, "Reminder provider", 40),
    externalId: validateText(item?.externalId, "Reminder external id", 120),
  }));
}

function uid(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
}

module.exports = {
  createApp,
  ensureInitialData,
};
