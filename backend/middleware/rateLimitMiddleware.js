const { rateLimit } = require("express-rate-limit");

/**
 * Factory for standard 429 Too Many Requests response handler.
 * Returns structured JSON without logging or exposing passwords,
 * tokens, or sensitive parameters.
 */
function createRateLimitHandler(defaultMessage) {
  return function rateLimitHandler(req, res, next, options) {
    const message = options?.message || defaultMessage;
    return res.status(options?.statusCode || 429).json({
      success: false,
      code: "TOO_MANY_REQUESTS",
      message: typeof message === "string" ? message : defaultMessage,
    });
  };
}

/**
 * Rate limiter for POST /api/students/login
 * Mitigates brute-force credential attacks while allowing legitimate students
 * multiple attempts to enter their password correctly.
 * Default: 10 requests per 15 minutes per IP.
 */
const studentLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.STUDENT_LOGIN_RATE_LIMIT_MAX, 10) || 10,
  message: "Too many login attempts from this IP address. Please try again after 15 minutes.",
  handler: createRateLimitHandler(
    "Too many login attempts from this IP address. Please try again after 15 minutes."
  ),
  standardHeaders: true, // Draft-6/Draft-7 RateLimit headers (RateLimit-Policy, RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset)
  legacyHeaders: false, // Disable X-RateLimit-* headers
  validate: false, // Disable dev-time trust proxy validation warnings
});

/**
 * Rate limiter for POST /api/students/request-activation (and /initiate-activation)
 * Limits frequency of activation token generation requests per IP
 * to curb applicant credential enumeration and spam.
 * Default: 5 requests per 15 minutes per IP.
 */
const studentActivationRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.STUDENT_ACTIVATION_REQUEST_RATE_LIMIT_MAX, 10) || 5,
  message: "Too many activation requests from this IP address. Please try again after 15 minutes.",
  handler: createRateLimitHandler(
    "Too many activation requests from this IP address. Please try again after 15 minutes."
  ),
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
});

/**
 * Rate limiter for POST /api/students/activate (and /set-password)
 * Mitigates activation token guessing and brute force password setting.
 * Default: 10 requests per 15 minutes per IP.
 */
const studentActivateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.STUDENT_ACTIVATE_RATE_LIMIT_MAX, 10) || 10,
  message: "Too many password setup attempts from this IP address. Please try again after 15 minutes.",
  handler: createRateLimitHandler(
    "Too many password setup attempts from this IP address. Please try again after 15 minutes."
  ),
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
});

module.exports = {
  createRateLimitHandler,
  studentLoginLimiter,
  studentActivationRequestLimiter,
  studentActivateLimiter,
};
