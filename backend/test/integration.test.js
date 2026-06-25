"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { createApp, ensureInitialData } = require("../src/app");

test("owner auth flow works end-to-end", async (t) => {
  const ctx = await createTestContext();
  t.after(() => ctx.close());

  const signup = await ctx.request("/api/auth/signup", {
    method: "POST",
    body: {
      name: "Owner",
      username: "owner.main",
      password: "password123",
    },
  });

  assert.equal(signup.status, 200);
  assert.equal(signup.json.user.role, "owner");
  assert.match(signup.cookie, /gympro_session=/);

  const me = await ctx.request("/api/auth/me", {
    cookie: signup.cookie,
  });

  assert.equal(me.status, 200);
  assert.equal(me.json.user.username, "owner.main");
});

test("owner can persist full state and read it back", async (t) => {
  const ctx = await createTestContext();
  t.after(() => ctx.close());
  const cookie = await ctx.signupOwner();

  const statePayload = {
    data: {
      members: [
        {
          id: "mem_1",
          name: "Aman Kumar",
          phone: "+91 9999988888",
          email: "aman@example.com",
          planId: "plan_1",
          trainerId: "trainer_1",
          joinDate: "2026-06-01",
          status: "Active",
        },
      ],
      plans: [
        {
          id: "plan_1",
          name: "Gold",
          durationMonths: 3,
          price: 2500,
          features: "Gym + PT",
        },
      ],
      attendance: { "2026-06-25": ["mem_1"] },
      workoutPlans: [
        {
          id: "workout_1",
          name: "Strength Builder",
          level: "Beginner",
          daysPerWeek: 4,
          focus: "Compound lifts",
        },
      ],
      dietPlans: [
        {
          id: "diet_1",
          name: "Lean Gain",
          goal: "Muscle Gain",
          calories: 2800,
          notes: "High protein",
        },
      ],
      trainers: [
        {
          id: "trainer_1",
          name: "Ravi",
          specialty: "Strength",
          phone: "+91 8888877777",
        },
      ],
      payments: [],
      reminders: [],
      auditLogs: [],
    },
    action: "integration test save",
  };

  const save = await ctx.request("/api/state", {
    method: "PUT",
    cookie,
    body: statePayload,
  });

  assert.equal(save.status, 200);

  const read = await ctx.request("/api/state", {
    cookie,
  });

  assert.equal(read.status, 200);
  assert.equal(read.json.data.plans[0].name, "Gold");
  assert.equal(read.json.data.trainers[0].name, "Ravi");
  assert.equal(read.json.data.dietPlans[0].name, "Lean Gain");
  assert.equal(read.json.data.workoutPlans[0].name, "Strength Builder");
  assert.equal(read.json.data.members[0].trainerId, "trainer_1");
});

test("trainer cannot modify plans but can update attendance", async (t) => {
  const ctx = await createTestContext();
  t.after(() => ctx.close());
  const ownerCookie = await ctx.signupOwner();

  const createTrainer = await ctx.request("/api/users", {
    method: "POST",
    cookie: ownerCookie,
    body: {
      role: "trainer",
      name: "Coach",
      username: "trainer.one",
      password: "password123",
    },
  });

  assert.equal(createTrainer.status, 201);

  await ctx.request("/api/state", {
    method: "PUT",
    cookie: ownerCookie,
    body: {
      data: {
        members: [
          {
            id: "mem_1",
            name: "User One",
            phone: "+91 9999911111",
            email: "",
            planId: "",
            trainerId: "",
            joinDate: "2026-06-01",
            status: "Active",
          },
        ],
        plans: [],
        attendance: {},
        workoutPlans: [],
        dietPlans: [],
        trainers: [],
        payments: [],
        reminders: [],
        auditLogs: [],
      },
      action: "seed member",
    },
  });

  const loginTrainer = await ctx.request("/api/auth/login", {
    method: "POST",
    body: {
      username: "trainer.one",
      password: "password123",
    },
  });
  const trainerCookie = loginTrainer.cookie;

  const rejected = await ctx.request("/api/state", {
    method: "PUT",
    cookie: trainerCookie,
    body: {
      data: {
        attendance: {},
        plans: [{ id: "plan_x", name: "Invalid", durationMonths: 1, price: 100, features: "" }],
      },
      action: "illegal trainer edit",
    },
  });

  assert.equal(rejected.status, 403);

  const allowed = await ctx.request("/api/state", {
    method: "PUT",
    cookie: trainerCookie,
    body: {
      data: {
        attendance: { "2026-06-25": ["mem_1"] },
      },
      action: "attendance update",
    },
  });

  assert.equal(allowed.status, 200);
  assert.deepEqual(allowed.json.data.attendance["2026-06-25"], ["mem_1"]);
});

test("reminder provider status and send flow work end-to-end", async (t) => {
  const ctx = await createTestContext();
  t.after(() => ctx.close());
  const cookie = await ctx.signupOwner();

  await ctx.request("/api/state", {
    method: "PUT",
    cookie,
    body: {
      data: {
        members: [
          {
            id: "mem_1",
            name: "Reminder User",
            phone: "+91 9000011111",
            email: "",
            planId: "",
            trainerId: "",
            joinDate: "2026-06-01",
            status: "Active",
          },
        ],
        plans: [],
        attendance: {},
        workoutPlans: [],
        dietPlans: [],
        trainers: [],
        payments: [],
        reminders: [
          {
            id: "rem_1",
            memberId: "mem_1",
            channel: "SMS",
            status: "Pending",
            alertType: "due",
            expiryDate: "2026-06-30",
            message: "Please renew soon",
            createdAt: new Date().toISOString(),
            sentAt: "",
            sentBy: "",
            provider: "",
            externalId: "",
          },
        ],
        auditLogs: [],
      },
      action: "seed reminder",
    },
  });

  const providers = await ctx.request("/api/reminders/providers", {
    cookie,
  });

  assert.equal(providers.status, 200);
  assert.equal(providers.json.channels.SMS.provider, "test-sms");

  const send = await ctx.request("/api/reminders/rem_1/send", {
    method: "POST",
    cookie,
  });

  assert.equal(send.status, 200);
  assert.equal(send.json.reminder.status, "Sent");
  assert.equal(send.json.delivery.provider, "test-sms");
});

async function createTestContext() {
  const models = createInMemoryModels();
  await ensureInitialData({
    AppState: models.AppState,
    Member: models.Member,
    legacyDbPath: path.join(__dirname, "__no_legacy__.json"),
  });

  const app = createApp({
    config: createTestConfig(),
    models,
    reminderService: {
      getChannelStatus() {
        return {
          SMS: { provider: "test-sms", configured: true, mode: "sandbox" },
          WhatsApp: { provider: "test-whatsapp", configured: true, mode: "sandbox" },
        };
      },
      async sendReminder({ channel }) {
        return {
          provider: channel === "SMS" ? "test-sms" : "test-whatsapp",
          externalId: "delivery_123",
          deliveredAt: new Date().toISOString(),
        };
      },
    },
    serveFrontend: false,
  });

  const server = await new Promise((resolve) => {
    const instance = app.listen(0, () => resolve(instance));
  });

  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  return {
    async request(route, options = {}) {
      const response = await fetch(`${baseUrl}${route}`, {
        method: options.method || "GET",
        headers: {
          ...(options.body ? { "Content-Type": "application/json" } : {}),
          ...(options.cookie ? { Cookie: options.cookie } : {}),
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      const contentType = response.headers.get("content-type") || "";
      const payload = contentType.includes("application/json") ? await response.json() : await response.text();
      const setCookie = response.headers.getSetCookie?.()?.[0] || "";

      return {
        status: response.status,
        json: typeof payload === "string" ? null : payload,
        text: typeof payload === "string" ? payload : "",
        cookie: setCookie ? setCookie.split(";")[0] : "",
      };
    },

    async signupOwner() {
      const response = await this.request("/api/auth/signup", {
        method: "POST",
        body: {
          name: "Owner",
          username: "owner.main",
          password: "password123",
        },
      });
      return response.cookie;
    },

    close() {
      return new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    },
  };
}

function createTestConfig() {
  return {
    AUTH_RATE_LIMIT_MAX: 50,
    AUTH_RATE_LIMIT_WINDOW_MS: 1000 * 60,
    COOKIE_SECURE: false,
    FRONTEND_DIST: path.join(__dirname, "__dist__"),
    FRONTEND_URL: "http://localhost:5173",
    SESSION_COOKIE_NAME: "gympro_session",
    SESSION_TTL_MS: 1000 * 60 * 60,
  };
}

function createInMemoryModels() {
  const db = {
    users: [],
    sessions: [],
    members: [],
    appState: null,
  };

  const User = {
    async countDocuments() {
      return db.users.length;
    },
    async create(doc) {
      if (db.users.some((user) => user.username === doc.username)) {
        const error = new Error("duplicate");
        error.code = 11000;
        throw error;
      }
      const created = { ...doc };
      db.users.push(created);
      return clone(created);
    },
    findOne(query) {
      return leanResult(db.users.find((user) => matches(user, query)) || null);
    },
    findById(id) {
      return leanResult(db.users.find((user) => String(user._id) === String(id)) || null);
    },
    find() {
      return {
        sort(sortSpec) {
          const [[field, direction]] = Object.entries(sortSpec || {});
          const sorted = [...db.users].sort((left, right) => {
            const leftValue = left[field];
            const rightValue = right[field];
            return direction >= 0 ? leftValue - rightValue : rightValue - leftValue;
          });
          return leanResult(sorted);
        },
      };
    },
    async updateOne(filter, update) {
      const user = db.users.find((item) => matches(item, filter));
      if (user && update.$set) {
        Object.assign(user, update.$set);
      }
    },
  };

  const Session = {
    async create(doc) {
      db.sessions.push({ ...doc });
      return clone(doc);
    },
    findById(id) {
      return leanResult(db.sessions.find((session) => String(session._id) === String(id)) || null);
    },
    async deleteOne(filter) {
      db.sessions = db.sessions.filter((session) => !matches(session, filter));
    },
    async deleteMany(filter) {
      db.sessions = db.sessions.filter((session) => !matches(session, filter));
    },
    async updateOne(filter, update) {
      const session = db.sessions.find((item) => matches(item, filter));
      if (session && update.$set) {
        Object.assign(session, update.$set);
      }
    },
  };

  const Member = {
    find() {
      return leanResult(db.members);
    },
    findById(id) {
      return leanResult(db.members.find((member) => String(member._id) === String(id)) || null);
    },
    async bulkWrite(ops) {
      ops.forEach((op) => {
        const filterId = op.updateOne.filter._id;
        const index = db.members.findIndex((member) => String(member._id) === String(filterId));
        if (index >= 0) {
          db.members[index] = { ...db.members[index], ...op.updateOne.update.$set };
        } else {
          db.members.push({ ...op.updateOne.update.$set });
        }
      });
    },
    async deleteMany(filter) {
      if (!filter || !Object.keys(filter).length) {
        db.members = [];
        return;
      }
      if (filter._id && filter._id.$nin) {
        const allowed = new Set(filter._id.$nin.map(String));
        db.members = db.members.filter((member) => allowed.has(String(member._id)));
      }
    },
    async countDocuments() {
      return db.members.length;
    },
    async insertMany(docs) {
      db.members.push(...docs.map((doc) => ({ ...doc })));
    },
  };

  const AppState = {
    findById(id) {
      return leanResult(String(id) === "main" ? db.appState : null);
    },
    async create(doc) {
      db.appState = { ...doc };
      return clone(db.appState);
    },
    async updateOne(filter, update) {
      if (!matches({ _id: "main" }, filter)) {
        return;
      }
      if (!db.appState) {
        db.appState = { _id: "main" };
      }
      applyUpdate(db.appState, update);
    },
    findOneAndUpdate(filter, update, options) {
      if (!matches({ _id: "main" }, filter)) {
        return leanResult(null);
      }
      if (!db.appState && options?.upsert) {
        db.appState = { _id: "main" };
      }
      applyUpdate(db.appState, update);
      return leanResult(db.appState);
    },
  };

  return { User, Session, Member, AppState };
}

function applyUpdate(target, update) {
  if (!target || !update) {
    return;
  }

  if (update.$set) {
    Object.assign(target, clone(update.$set));
  }

  if (update.$unset) {
    Object.keys(update.$unset).forEach((key) => {
      delete target[key];
    });
  }

  if (update.$push) {
    Object.entries(update.$push).forEach(([key, value]) => {
      const current = Array.isArray(target[key]) ? target[key] : [];
      const items = Array.isArray(value.$each) ? value.$each : [value];
      let next = [...current, ...clone(items)];
      if (typeof value.$slice === "number" && value.$slice < 0) {
        next = next.slice(value.$slice);
      }
      target[key] = next;
    });
  }
}

function matches(item, filter) {
  return Object.entries(filter || {}).every(([key, expected]) => {
    if (expected && typeof expected === "object" && !Array.isArray(expected)) {
      if (Object.prototype.hasOwnProperty.call(expected, "$ne")) {
        return String(item[key]) !== String(expected.$ne);
      }
      return false;
    }
    return String(item[key]) === String(expected);
  });
}

function leanResult(value) {
  return {
    async lean() {
      return clone(value);
    },
  };
}

function clone(value) {
  return value == null ? value : structuredClone(value);
}
