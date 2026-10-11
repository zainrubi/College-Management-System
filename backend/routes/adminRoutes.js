const express = require("express");
const {
  adminLogin,
  getAdminApplications,
  getAdminApplicationById,
  updateAdminApplicationStatus,
} = require("../controllers/adminController");
const { protectAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// Admin Authentication
router.post("/login", adminLogin);

// Admin Admissions Applications Routes (Protected with Administrator Authorization)
router.get("/applications", protectAdmin, getAdminApplications);
router.get("/applications/:id", protectAdmin, getAdminApplicationById);
router.patch("/applications/:id/status", protectAdmin, updateAdminApplicationStatus);

module.exports = router;
