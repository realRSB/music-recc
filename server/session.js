import crypto from "node:crypto";

const SESSION_COOKIE = "inner_horizons_session";
const sessions = new Map();

export function createSession(tokens) {
  const id = crypto.randomUUID();

  sessions.set(id, {
    ...tokens,
    createdAt: Date.now(),
  });

  return id;
}

export function getSession(request) {
  const id = parseCookies(request.headers.cookie)[SESSION_COOKIE];

  if (!id) {
    return null;
  }

  const session = sessions.get(id);
  return session ? { id, ...session } : null;
}

export function updateSession(id, tokens) {
  if (!sessions.has(id)) {
    return;
  }

  sessions.set(id, {
    ...sessions.get(id),
    ...tokens,
  });
}

export function setSessionCookie(response, sessionId) {
  response.cookie(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24 * 14,
    path: "/",
  });
}

export function clearSession(request, response) {
  const session = getSession(request);

  if (session) {
    sessions.delete(session.id);
  }

  response.clearCookie(SESSION_COOKIE, { path: "/" });
}

function parseCookies(cookieHeader = "") {
  return cookieHeader.split(";").reduce((cookies, cookie) => {
    const [name, ...valueParts] = cookie.trim().split("=");

    if (name) {
      cookies[name] = decodeURIComponent(valueParts.join("="));
    }

    return cookies;
  }, {});
}
