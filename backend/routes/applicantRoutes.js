const express = require("express");
const { registerApplicant, loginApplicant } = require("../controllers/applicantController");

const router = express.Router();

router.post("/register", registerApplicant);
router.post("/login", loginApplicant);

module.exports = router;