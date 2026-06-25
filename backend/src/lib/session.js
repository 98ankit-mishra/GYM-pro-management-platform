"use strict";

function getBearerToken(authorizationHeader) {
  if (!authorizationHeader || typeof authorizationHeader !== "string") {
    return "";
  }
  if (!authorizationHeader.startsWith("Bearer ")) {
    return "";
  }
  return authorizationHeader.slice(7).trim();
}

function getSessionToken(req, cookieName) {
  const cookieToken = String(req.cookies?.[cookieName] || "").trim();
  if (cookieToken) {
    return cookieToken;
  }
  return getBearerToken(req.headers?.authorization || "");
}

module.exports = {
  getBearerToken,
  getSessionToken,
};
