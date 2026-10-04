const express = require("express");
const {
    createAdmissionApplication,
    getMyAdmissionApplication,
    updateAdmissionDraft,
    submitAdmissionApplication,
} = require("../controllers/admissionApplicationController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Require authentication for all admission application operations
router.use(protect);

// Create / save initial draft application
router.post("/", createAdmissionApplication);
router.post("/draft", createAdmissionApplication);

// Get my application
router.get("/me", getMyAdmissionApplication);
router.get("/my-application", getMyAdmissionApplication);
router.get("/", getMyAdmissionApplication);

// Update my draft application
router.put("/draft", updateAdmissionDraft);
router.put("/me", updateAdmissionDraft);
router.put("/", updateAdmissionDraft);
router.patch("/draft", updateAdmissionDraft);
router.patch("/", updateAdmissionDraft);

// Submit my application
router.post("/submit", submitAdmissionApplication);
router.post("/me/submit", submitAdmissionApplication);

module.exports = router;
