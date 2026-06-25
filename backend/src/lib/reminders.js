"use strict";

const crypto = require("crypto");

function createReminderService(options = {}) {
  const {
    smsProvider = "console",
    smsFrom = "",
    twilioAccountSid = "",
    twilioAuthToken = "",
    twilioMessagingServiceSid = "",
    whatsappProvider = "console",
    whatsappAccessToken = "",
    whatsappPhoneNumberId = "",
    fetchImpl = global.fetch,
  } = options;

  return {
    getChannelStatus() {
      return {
        SMS: describeSmsProvider({ smsProvider, smsFrom, twilioAccountSid, twilioAuthToken, twilioMessagingServiceSid }),
        WhatsApp: describeWhatsAppProvider({ whatsappProvider, whatsappAccessToken, whatsappPhoneNumberId }),
      };
    },

    async sendReminder({ channel, recipient, message }) {
      if (channel === "SMS") {
        return sendSms({
          provider: smsProvider,
          smsFrom,
          twilioAccountSid,
          twilioAuthToken,
          twilioMessagingServiceSid,
          fetchImpl,
          recipient,
          message,
        });
      }

      if (channel === "WhatsApp") {
        return sendWhatsApp({
          provider: whatsappProvider,
          whatsappAccessToken,
          whatsappPhoneNumberId,
          fetchImpl,
          recipient,
          message,
        });
      }

      throw Object.assign(new Error("Unsupported reminder channel."), { statusCode: 400 });
    },
  };
}

function describeSmsProvider({
  smsProvider,
  smsFrom,
  twilioAccountSid,
  twilioAuthToken,
  twilioMessagingServiceSid,
}) {
  if (smsProvider === "twilio") {
    const configured = Boolean(twilioAccountSid && twilioAuthToken && (twilioMessagingServiceSid || smsFrom));
    return {
      provider: "twilio",
      configured,
      mode: configured ? "live" : "missing-config",
      from: smsFrom || "",
    };
  }

  return {
    provider: "console",
    configured: true,
    mode: "sandbox",
    from: smsFrom || "console",
  };
}

function describeWhatsAppProvider({ whatsappProvider, whatsappAccessToken, whatsappPhoneNumberId }) {
  if (whatsappProvider === "meta-cloud") {
    const configured = Boolean(whatsappAccessToken && whatsappPhoneNumberId);
    return {
      provider: "meta-cloud",
      configured,
      mode: configured ? "live" : "missing-config",
    };
  }

  return {
    provider: "console",
    configured: true,
    mode: "sandbox",
  };
}

async function sendSms({
  provider,
  smsFrom,
  twilioAccountSid,
  twilioAuthToken,
  twilioMessagingServiceSid,
  fetchImpl,
  recipient,
  message,
}) {
  if (provider !== "twilio") {
    return {
      provider: "console",
      externalId: `sms_${crypto.randomBytes(6).toString("hex")}`,
      deliveredAt: new Date().toISOString(),
    };
  }

  if (!fetchImpl) {
    throw Object.assign(new Error("Fetch is unavailable for SMS delivery."), { statusCode: 500 });
  }

  const configured = twilioAccountSid && twilioAuthToken && (twilioMessagingServiceSid || smsFrom);
  if (!configured) {
    throw Object.assign(new Error("Twilio SMS provider is not fully configured."), { statusCode: 503 });
  }

  const body = new URLSearchParams({
    To: recipient,
    Body: message,
  });

  if (twilioMessagingServiceSid) {
    body.set("MessagingServiceSid", twilioMessagingServiceSid);
  } else {
    body.set("From", smsFrom);
  }

  const response = await fetchImpl(
    `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    }
  );

  const payload = await readJsonSafe(response);
  if (!response.ok) {
    throw Object.assign(new Error(payload?.message || "Unable to send SMS reminder."), { statusCode: 502 });
  }

  return {
    provider: "twilio",
    externalId: String(payload?.sid || ""),
    deliveredAt: new Date().toISOString(),
  };
}

async function sendWhatsApp({
  provider,
  whatsappAccessToken,
  whatsappPhoneNumberId,
  fetchImpl,
  recipient,
  message,
}) {
  if (provider !== "meta-cloud") {
    return {
      provider: "console",
      externalId: `wa_${crypto.randomBytes(6).toString("hex")}`,
      deliveredAt: new Date().toISOString(),
    };
  }

  if (!fetchImpl) {
    throw Object.assign(new Error("Fetch is unavailable for WhatsApp delivery."), { statusCode: 500 });
  }

  if (!whatsappAccessToken || !whatsappPhoneNumberId) {
    throw Object.assign(new Error("WhatsApp Cloud provider is not fully configured."), { statusCode: 503 });
  }

  const response = await fetchImpl(`https://graph.facebook.com/v20.0/${whatsappPhoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${whatsappAccessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: recipient,
      type: "text",
      text: { body: message },
    }),
  });

  const payload = await readJsonSafe(response);
  if (!response.ok) {
    throw Object.assign(new Error(payload?.error?.message || "Unable to send WhatsApp reminder."), {
      statusCode: 502,
    });
  }

  return {
    provider: "meta-cloud",
    externalId: String(payload?.messages?.[0]?.id || ""),
    deliveredAt: new Date().toISOString(),
  };
}

async function readJsonSafe(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

module.exports = {
  createReminderService,
};
