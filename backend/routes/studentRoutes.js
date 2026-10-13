const express = require("express");
const {
  loginStudent,
  getStudentProfile,
  requestStudentActivation,
  activateStudentAccount,
} = require("../controllers/studentController");
const { protectStudent } = require("../middleware/authMiddleware");

const router = express.Router();

// Student Account Activation
router.post("/request-activation", requestStudentActivation);
router.post("/initiate-activation", requestStudentActivation);
router.post("/activate", activateStudentAccount);
router.post("/set-password", activateStudentAccount);

// Student Authentication
router.post("/login", loginStudent);

// Student Protected Profile Routes
router.get("/profile", protectStudent, getStudentProfile);
router.get("/me", protectStudent, getStudentProfile);

module.exports = router;
