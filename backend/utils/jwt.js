const crypto = require("crypto");

/**
 * Retrieves the JWT secret from the environment.
 * Fails safely if missing without exposing or hardcoding secrets.
 */
function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || typeof secret !== "string" || secret.trim().length === 0) {
    throw new Error("JWT_SECRET is not configured in backend environment");
  }
  return secret.trim();
}

/**
 * Signs a payload into an RFC 7519 compliant HS256 JWT using Node.js built-in crypto.
 *
 * @param {object} payload - Identity claims to encode.
 * @param {object} [options] - Signing options.
 * @param {number} [options.expiresInSeconds=604800] - Lifespan in seconds (default: 7 days).
 * @param {string} [options.secret] - Optional override secret (for testing).
 * @returns {string} Signed JWT.
 */
function signToken(payload, options = {}) {
  const secret = options.secret || getJwtSecret();
  const expiresInSeconds = options.expiresInSeconds ?? 7 * 24 * 60 * 60; // 7 days

  const header = { alg: "HS256", typ: "JWT" };
  const iat = Math.floor(Date.now() / 1000);
  const fullPayload = { ...payload, iat };

  if (typeof expiresInSeconds === "number") {
    fullPayload.exp = iat + expiresInSeconds;
  }

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url");
  const encodedPayload = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");
  const data = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac("sha256", secret)
    .update(data)
    .digest("base64url");

  return `${data}.${signature}`;
}

/**
 * Verifies the signature, format, algorithm, and expiration of a JWT.
 * Uses constant-time comparison to prevent timing attacks.
 *
 * @param {string} token - The JWT string to verify.
 * @param {object} [options] - Verification options.
 * @param {string} [options.secret] - Optional override secret (for testing).
 * @returns {object} Verified payload.
 */
function verifyToken(token, options = {}) {
  if (!token || typeof token !== "string") {
    const err = new Error("Token missing or not a string");
    err.name = "JsonWebTokenError";
    throw err;
  }

  const parts = token.trim().split(".");
  if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) {
    const err = new Error("Malformed token structure");
    err.name = "JsonWebTokenError";
    throw err;
  }

  const secret = options.secret || getJwtSecret();
  const [encodedHeader, encodedPayload, receivedSig] = parts;

  // Recreate HMAC signature
  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64url");

  // Constant-time comparison
  const receivedBuf = Buffer.from(receivedSig);
  const expectedBuf = Buffer.from(expectedSig);

  if (
    receivedBuf.length !== expectedBuf.length ||
    !crypto.timingSafeEqual(receivedBuf, expectedBuf)
  ) {
    const err = new Error("Invalid token signature");
    err.name = "JsonWebTokenError";
    throw err;
  }

  // Parse header and verify algorithm
  let header;
  try {
    header = JSON.parse(Buffer.from(encodedHeader, "base64url").toString("utf-8"));
  } catch {
    const err = new Error("Invalid token header");
    err.name = "JsonWebTokenError";
    throw err;
  }

  if (header.alg !== "HS256") {
    const err = new Error(`Unsupported algorithm: ${header.alg}`);
    err.name = "JsonWebTokenError";
    throw err;
  }

  // Parse payload
  let payload;
  try {
    payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf-8"));
  } catch {
    const err = new Error("Invalid token payload");
    err.name = "JsonWebTokenError";
    throw err;
  }

  // Check expiration
  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp === "number" && now > payload.exp) {
    const err = new Error("Token expired");
    err.name = "TokenExpiredError";
    throw err;
  }

  return payload;
}

module.exports = {
  getJwtSecret,
  signToken,
  verifyToken,
};
