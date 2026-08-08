import crypto from "node:crypto";

const SESSION_COOKIE = "inner_horizons_session";
const ALGORITHM = "aes-256-gcm";

export function getSession(request) {
  const value = parseCookies(request.headers.cookie)[SESSION_COOKIE];

  if (!value) {
    return null;
  }

  return decodeSession(value);
}

export function setSessionCookie(response, tokens) {
  response.cookie(SESSION_COOKIE, encodeSession(tokens), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24 * 14,
    path: "/",
  });
}

export function clearSession(request, response) {
  response.clearCookie(SESSION_COOKIE, { path: "/" });
}

function encodeSession(tokens) {
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(tokens), "utf8"),
    cipher.final(),
  ]);

  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString("base64url");
}

function decodeSession(value) {
  try {
    const key = getKey();
    const buffer = Buffer.from(value, "base64url");
    const iv = buffer.subarray(0, 12);
    const authTag = buffer.subarray(12, 28);
    const encrypted = buffer.subarray(28);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return JSON.parse(decrypted.toString("utf8"));
  } catch {
    return null;
  }
}

function getKey() {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    const error = new Error("SESSION_SECRET is not configured");
    error.status = 500;
    throw error;
  }

  return crypto.createHash("sha256").update(secret).digest();
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
