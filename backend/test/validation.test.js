"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  isDateKey,
  validatePassword,
  validatePhone,
  validateUsername,
  validateOptionalEmail,
  validateRole,
} = require("../src/lib/validation");

test("validateUsername accepts supported usernames", () => {
  assert.equal(validateUsername("owner.main"), "owner.main");
});

test("validateUsername rejects invalid usernames", () => {
  assert.throws(() => validateUsername("ab"), /3-32/);
  assert.throws(() => validateUsername("bad space"), /letters, numbers/);
});

test("validatePassword enforces minimum length", () => {
  assert.equal(validatePassword("12345678"), "12345678");
  assert.throws(() => validatePassword("1234567"), /8-128/);
});

test("validatePhone accepts formatted phone numbers and rejects short ones", () => {
  assert.equal(validatePhone("+91 98765 43210"), "+91 98765 43210");
  assert.throws(() => validatePhone("12345"), /10-15 digits/);
});

test("validateOptionalEmail accepts blank values and valid emails", () => {
  assert.equal(validateOptionalEmail(""), "");
  assert.equal(validateOptionalEmail("owner@example.com"), "owner@example.com");
  assert.throws(() => validateOptionalEmail("ownerexample.com"), /invalid/);
});

test("validateRole accepts allowed staff roles only", () => {
  assert.equal(validateRole("trainer"), "trainer");
  assert.throws(() => validateRole("owner"), /receptionist or trainer/);
});

test("isDateKey validates YYYY-MM-DD format", () => {
  assert.equal(isDateKey("2026-05-26"), true);
  assert.equal(isDateKey("26-05-2026"), false);
});
