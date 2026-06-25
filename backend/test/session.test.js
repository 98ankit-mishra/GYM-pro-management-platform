"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { getBearerToken, getSessionToken } = require("../src/lib/session");

test("getBearerToken extracts a bearer token", () => {
  assert.equal(getBearerToken("Bearer abc123"), "abc123");
});

test("getBearerToken returns empty string for invalid headers", () => {
  assert.equal(getBearerToken("Token abc123"), "");
  assert.equal(getBearerToken(""), "");
});

test("getSessionToken prefers cookie token over authorization header", () => {
  const token = getSessionToken(
    {
      cookies: { gympro_session: "cookie-token" },
      headers: { authorization: "Bearer header-token" },
    },
    "gympro_session"
  );

  assert.equal(token, "cookie-token");
});

test("getSessionToken falls back to authorization header", () => {
  const token = getSessionToken(
    {
      cookies: {},
      headers: { authorization: "Bearer header-token" },
    },
    "gympro_session"
  );

  assert.equal(token, "header-token");
});
