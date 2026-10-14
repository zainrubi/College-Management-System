const express = require("express");
const {
  loginStudent,
  getStudentProfile,
  getStudentVouchers,
  requestStudentActivation,
  activateStudentAccount,
} = require("../controllers/studentController");
const { protectStudent } = require("../middleware/authMiddleware");
const {
  studentLoginLimiter,
  studentActivationRequestLimiter,
  studentActivateLimiter,
} = require("../middleware/rateLimitMiddleware");

const router = express.Router();

// Student Account Activation (Rate-limited)
router.post("/request-activation", studentActivationRequestLimiter, requestStudentActivation);
router.post("/initiate-activation", studentActivationRequestLimiter, requestStudentActivation);
router.post("/activate", studentActivateLimiter, activateStudentAccount);
router.post("/set-password", studentActivateLimiter, activateStudentAccount);

// Student Authentication (Rate-limited)
router.post("/login", studentLoginLimiter, loginStudent);

// Student Protected Profile Routes
router.get("/profile", protectStudent, getStudentProfile);
router.get("/me", protectStudent, getStudentProfile);

// Student Protected Fee Voucher Routes
router.get("/vouchers", protectStudent, getStudentVouchers);

module.exports = router;
