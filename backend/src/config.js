"use strict";

const path = require("path");

require("dotenv").config();

const ROOT = path.resolve(__dirname, "..");

module.exports = {
  AUTH_RATE_LIMIT_MAX: Number(process.env.AUTH_RATE_LIMIT_MAX || 20),
  AUTH_RATE_LIMIT_WINDOW_MS: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  COOKIE_SECURE: String(process.env.COOKIE_SECURE || "false").toLowerCase() === "true",
  FRONTEND_DIST: path.resolve(ROOT, "..", "frontend", "dist"),
  FRONTEND_URL: String(process.env.FRONTEND_URL || "http://localhost:5173"),
  LEGACY_DB_PATH: path.join(ROOT, "data", "db.json"),
  MONGODB_URI: String(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/gympro"),
  PORT: Number(process.env.PORT || 3000),
  REMINDER_SMS_FROM: String(process.env.REMINDER_SMS_FROM || ""),
  REMINDER_SMS_PROVIDER: String(process.env.REMINDER_SMS_PROVIDER || "console"),
  REMINDER_TWILIO_ACCOUNT_SID: String(process.env.REMINDER_TWILIO_ACCOUNT_SID || ""),
  REMINDER_TWILIO_AUTH_TOKEN: String(process.env.REMINDER_TWILIO_AUTH_TOKEN || ""),
  REMINDER_TWILIO_MESSAGING_SERVICE_SID: String(process.env.REMINDER_TWILIO_MESSAGING_SERVICE_SID || ""),
  REMINDER_WHATSAPP_ACCESS_TOKEN: String(process.env.REMINDER_WHATSAPP_ACCESS_TOKEN || ""),
  REMINDER_WHATSAPP_PHONE_NUMBER_ID: String(process.env.REMINDER_WHATSAPP_PHONE_NUMBER_ID || ""),
  REMINDER_WHATSAPP_PROVIDER: String(process.env.REMINDER_WHATSAPP_PROVIDER || "console"),
  ROOT,
  SESSION_COOKIE_NAME: String(process.env.SESSION_COOKIE_NAME || "gympro_session"),
  SESSION_TTL_MS: Number(process.env.SESSION_TTL_MS || 1000 * 60 * 60 * 12),
};
