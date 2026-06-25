"use strict";

function validateUsername(value) {
  const username = String(value || "").trim();
  if (!username) {
    throw Object.assign(new Error("Username is required."), { statusCode: 400 });
  }
  if (!/^[a-zA-Z0-9._-]{3,32}$/.test(username)) {
    throw Object.assign(
      new Error("Username must be 3-32 characters and contain only letters, numbers, dot, underscore, or hyphen."),
      { statusCode: 400 }
    );
  }
  return username;
}

function validateLoginUsername(value) {
  const username = String(value || "").trim();
  if (!username) {
    throw Object.assign(new Error("Username is required."), { statusCode: 400 });
  }
  if (username.length > 64) {
    throw Object.assign(new Error("Username must be 64 characters or fewer."), { statusCode: 400 });
  }
  return username;
}

function validatePassword(value, fieldName = "Password") {
  const password = String(value || "");
  if (!password) {
    throw Object.assign(new Error(`${fieldName} is required.`), { statusCode: 400 });
  }
  if (password.length < 8 || password.length > 128) {
    throw Object.assign(new Error(`${fieldName} must be 8-128 characters.`), { statusCode: 400 });
  }
  return password;
}

function validateRequiredSecret(value, fieldName = "Password") {
  const password = String(value || "");
  if (!password) {
    throw Object.assign(new Error(`${fieldName} is required.`), { statusCode: 400 });
  }
  if (password.length > 128) {
    throw Object.assign(new Error(`${fieldName} must be 128 characters or fewer.`), { statusCode: 400 });
  }
  return password;
}

function validateRequiredName(value, fieldName) {
  const text = String(value || "").trim();
  if (!text) {
    throw Object.assign(new Error(`${fieldName} is required.`), { statusCode: 400 });
  }
  if (text.length > 80) {
    throw Object.assign(new Error(`${fieldName} must be 80 characters or fewer.`), { statusCode: 400 });
  }
  return text;
}

function validateOptionalName(value, fieldName) {
  const text = String(value || "").trim();
  if (!text) {
    return "";
  }
  if (text.length > 80) {
    throw Object.assign(new Error(`${fieldName} must be 80 characters or fewer.`), { statusCode: 400 });
  }
  return text;
}

function validateRole(value) {
  const role = String(value || "").trim();
  if (!["receptionist", "trainer"].includes(role)) {
    throw Object.assign(new Error("Role must be receptionist or trainer."), { statusCode: 400 });
  }
  return role;
}

function validateBoolean(value, fieldName) {
  if (typeof value !== "boolean") {
    throw Object.assign(new Error(`${fieldName} must be boolean.`), { statusCode: 400 });
  }
  return value;
}

function validatePhone(value) {
  const phone = String(value || "").trim();
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) {
    throw Object.assign(new Error("Phone number must contain 10-15 digits."), { statusCode: 400 });
  }
  return phone;
}

function validateOptionalEmail(value) {
  const email = String(value || "").trim();
  if (!email) {
    return "";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw Object.assign(new Error("Email address is invalid."), { statusCode: 400 });
  }
  return email;
}

function validateDateKey(value, fieldName) {
  const dateKey = String(value || "").trim();
  if (!isDateKey(dateKey)) {
    throw Object.assign(new Error(`${fieldName} must be in YYYY-MM-DD format.`), { statusCode: 400 });
  }
  return dateKey;
}

function validateMemberStatus(value) {
  const status = String(value || "").trim();
  if (!["Active", "Frozen", "Expired"].includes(status)) {
    throw Object.assign(new Error("Member status must be Active, Frozen, or Expired."), { statusCode: 400 });
  }
  return status;
}

function validateEntityId(value, label) {
  const id = String(value || "").trim();
  if (!id) {
    throw Object.assign(new Error(`${label} id is required.`), { statusCode: 400 });
  }
  if (id.length > 64) {
    throw Object.assign(new Error(`${label} id is too long.`), { statusCode: 400 });
  }
  return id;
}

function validateIntegerInRange(value, fieldName, min, max) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < min || number > max) {
    throw Object.assign(new Error(`${fieldName} must be an integer between ${min} and ${max}.`), {
      statusCode: 400,
    });
  }
  return number;
}

function validateNumberInRange(value, fieldName, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < min || number > max) {
    throw Object.assign(new Error(`${fieldName} must be between ${min} and ${max}.`), { statusCode: 400 });
  }
  return number;
}

function validateText(value, fieldName, maxLength) {
  const text = String(value || "").trim();
  if (text.length > maxLength) {
    throw Object.assign(new Error(`${fieldName} must be ${maxLength} characters or fewer.`), { statusCode: 400 });
  }
  return text;
}

function validateRequiredText(value, fieldName, maxLength) {
  const text = validateText(value, fieldName, maxLength);
  if (!text) {
    throw Object.assign(new Error(`${fieldName} is required.`), { statusCode: 400 });
  }
  return text;
}

function validateEnum(value, fieldName, allowedValues) {
  const text = String(value || "").trim();
  if (!allowedValues.includes(text)) {
    throw Object.assign(new Error(`${fieldName} is invalid.`), { statusCode: 400 });
  }
  return text;
}

function validateIsoDateTime(value, fieldName) {
  const text = String(value || "").trim();
  if (!text || Number.isNaN(new Date(text).getTime())) {
    throw Object.assign(new Error(`${fieldName} must be a valid ISO datetime.`), { statusCode: 400 });
  }
  return text;
}

function validateOptionalIsoDateTime(value, fieldName) {
  const text = String(value || "").trim();
  if (!text) {
    return "";
  }
  return validateIsoDateTime(text, fieldName);
}

function isDateKey(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || "").trim());
}

module.exports = {
  isDateKey,
  validateBoolean,
  validateDateKey,
  validateEntityId,
  validateEnum,
  validateIntegerInRange,
  validateLoginUsername,
  validateIsoDateTime,
  validateMemberStatus,
  validateNumberInRange,
  validateOptionalEmail,
  validateOptionalIsoDateTime,
  validateOptionalName,
  validatePassword,
  validatePhone,
  validateRequiredSecret,
  validateRequiredName,
  validateRequiredText,
  validateRole,
  validateText,
  validateUsername,
};
