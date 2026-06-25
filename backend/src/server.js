"use strict";

const mongoose = require("mongoose");
const {
  LEGACY_DB_PATH,
  MONGODB_URI,
  PORT,
  REMINDER_SMS_FROM,
  REMINDER_SMS_PROVIDER,
  REMINDER_TWILIO_ACCOUNT_SID,
  REMINDER_TWILIO_AUTH_TOKEN,
  REMINDER_TWILIO_MESSAGING_SERVICE_SID,
  REMINDER_WHATSAPP_ACCESS_TOKEN,
  REMINDER_WHATSAPP_PHONE_NUMBER_ID,
  REMINDER_WHATSAPP_PROVIDER,
  ...appConfig
} = require("./config");
const { createApp, ensureInitialData } = require("./app");
const models = require("./models");
const { createReminderService } = require("./lib/reminders");

const reminderService = createReminderService({
  smsProvider: REMINDER_SMS_PROVIDER,
  smsFrom: REMINDER_SMS_FROM,
  twilioAccountSid: REMINDER_TWILIO_ACCOUNT_SID,
  twilioAuthToken: REMINDER_TWILIO_AUTH_TOKEN,
  twilioMessagingServiceSid: REMINDER_TWILIO_MESSAGING_SERVICE_SID,
  whatsappProvider: REMINDER_WHATSAPP_PROVIDER,
  whatsappAccessToken: REMINDER_WHATSAPP_ACCESS_TOKEN,
  whatsappPhoneNumberId: REMINDER_WHATSAPP_PHONE_NUMBER_ID,
});

const app = createApp({
  config: { ...appConfig, PORT, MONGODB_URI },
  models,
  reminderService,
});

start().catch((error) => {
  console.error("Failed to start server:", error);
  process.exitCode = 1;
});

async function start() {
  await mongoose.connect(MONGODB_URI);
  await ensureInitialData({
    AppState: models.AppState,
    Member: models.Member,
    legacyDbPath: LEGACY_DB_PATH,
  });
  const userCount = await models.User.countDocuments();

  app.listen(PORT, () => {
    console.log(`Gym Pro backend running at http://localhost:${PORT}`);
    console.log(`MongoDB: ${MONGODB_URI}`);
    if (userCount === 0) {
      console.log("First-time setup: open the app and create the owner account.");
    }
  });
}
