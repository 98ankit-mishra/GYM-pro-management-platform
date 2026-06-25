"use strict";

const crypto = require("crypto");
const { getSessionToken: getSessionTokenFromRequest } = require("./session");

function toPublicUser(user) {
  return {
    id: String(user._id),
    username: String(user.username),
    name: String(user.name || ""),
    role: String(user.role || ""),
    isActive: Boolean(user.isActive),
  };
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { hash, salt };
}

function verifyPassword(password, user) {
  const { hash } = hashPassword(password, user.passwordSalt);
  try {
    return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(user.passwordHash, "hex"));
  } catch {
    return false;
  }
}

function createAuthTools({ Session, User, sessionCookieName, cookieSecure, sessionTtlMs }) {
  function getSessionToken(req) {
    return getSessionTokenFromRequest(req, sessionCookieName);
  }

  function setSessionCookie(res, token) {
    res.cookie(sessionCookieName, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: cookieSecure,
      maxAge: sessionTtlMs,
      path: "/",
    });
  }

  function clearSessionCookie(res) {
    res.clearCookie(sessionCookieName, {
      httpOnly: true,
      sameSite: "lax",
      secure: cookieSecure,
      path: "/",
    });
  }

  function requireAuth() {
    return asyncHandler(async (req, res, next) => {
      const token = getSessionToken(req);
      if (!token) {
        res.status(401).json({ error: "Missing auth token." });
        return;
      }

      const session = await Session.findById(token).lean();
      if (!session || session.expiresAt.getTime() < Date.now()) {
        await Session.deleteOne({ _id: token });
        clearSessionCookie(res);
        res.status(401).json({ error: "Session expired. Please login again." });
        return;
      }

      const user = await User.findById(session.userId).lean();
      if (!user || !user.isActive) {
        await Session.deleteOne({ _id: token });
        clearSessionCookie(res);
        res.status(401).json({ error: "Invalid session." });
        return;
      }

      await Session.updateOne(
        { _id: token },
        {
          $set: { expiresAt: new Date(Date.now() + sessionTtlMs) },
        }
      );
      setSessionCookie(res, token);

      req.auth = { token, user };
      next();
    });
  }

  function requireRole(...roles) {
    const allowed = new Set(roles.filter(Boolean));
    return (req, res, next) => {
      const role = req.auth?.user?.role;
      if (!role || !allowed.has(role)) {
        res.status(403).json({ error: "You do not have permission to perform this action." });
        return;
      }
      next();
    };
  }

  return {
    clearSessionCookie,
    getSessionToken,
    requireAuth,
    requireRole,
    setSessionCookie,
  };
}

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

module.exports = {
  asyncHandler,
  createAuthTools,
  hashPassword,
  toPublicUser,
  verifyPassword,
};
