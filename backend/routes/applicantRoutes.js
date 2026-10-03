const express = require("express");
const { registerApplicant } = require("../controllers/applicantController");

const router = express.Router();

router.post("/register", registerApplicant);

module.exports = router;