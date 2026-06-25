"use strict";

const mongoose = require("mongoose");

const Mixed = mongoose.Schema.Types.Mixed;

const UserSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    username: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    passwordSalt: { type: String, required: true },
    role: { type: String, required: true },
    name: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

const SessionSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    userId: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const AppStateSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true, default: "main" },
    plans: { type: [Mixed], default: [] },
    attendance: { type: Mixed, default: {} },
    workoutPlans: { type: [Mixed], default: [] },
    dietPlans: { type: [Mixed], default: [] },
    trainers: { type: [Mixed], default: [] },
    payments: { type: [Mixed], default: [] },
    reminders: { type: [Mixed], default: [] },
    auditLogs: { type: [Mixed], default: [] },
  },
  { versionKey: false, minimize: false, timestamps: true }
);

const MemberSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    planId: { type: String, default: "" },
    trainerId: { type: String, default: "" },
    joinDate: { type: String, default: "" },
    status: { type: String, default: "" },
  },
  { versionKey: false, strict: true, minimize: false }
);
MemberSchema.index({ phone: 1 });
MemberSchema.index({ status: 1 });

const PaymentSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    memberId: { type: String, required: true },
    amount: { type: Number, default: 0 },
    mode: { type: String, default: "" },
    date: { type: String, default: "" },
    reference: { type: String, default: "" },
    note: { type: String, default: "" },
    recordedBy: { type: String, default: "" },
    createdAt: { type: String, default: "" },
  },
  { versionKey: false, strict: true, minimize: false }
);
PaymentSchema.index({ memberId: 1 });
PaymentSchema.index({ date: -1 });

module.exports = {
  AppState: mongoose.models.AppState || mongoose.model("AppState", AppStateSchema),
  Member: mongoose.models.Member || mongoose.model("Member", MemberSchema),
  Payment: mongoose.models.Payment || mongoose.model("Payment", PaymentSchema),
  Session: mongoose.models.Session || mongoose.model("Session", SessionSchema),
  User: mongoose.models.User || mongoose.model("User", UserSchema),
};
