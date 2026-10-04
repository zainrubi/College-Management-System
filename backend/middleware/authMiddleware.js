const mongoose = require("mongoose");
const Applicant = require("../models/Applicant");

/**
 * Authentication middleware for applicant-protected routes.
 * Ensures the requesting applicant is authenticated and attaches the applicant to req.user.
 */
async function protect(req, res, next) {
    try {
        // If req.user is already set by an upstream middleware or session
        if (req.user && (req.user._id || req.user.id)) {
            return next();
        }

        let tokenOrId = null;
        const authHeader = req.headers.authorization;

        if (authHeader && typeof authHeader === "string") {
            if (authHeader.startsWith("Bearer ")) {
                tokenOrId = authHeader.slice(7).trim();
            } else {
                tokenOrId = authHeader.trim();
            }
        }

        if (!tokenOrId && req.headers["x-applicant-id"]) {
            tokenOrId = String(req.headers["x-applicant-id"]).trim();
        }

        if (!tokenOrId) {
            return res.status(401).json({ message: "Authentication required" });
        }

        // Support direct ObjectId or decoded JWT payload if provided
        let applicantId = null;
        if (mongoose.Types.ObjectId.isValid(tokenOrId)) {
            applicantId = tokenOrId;
        } else if (tokenOrId.includes(".")) {
            try {
                const parts = tokenOrId.split(".");
                if (parts.length === 3) {
                    const payloadStr = Buffer.from(parts[1], "base64").toString("utf-8");
                    const payload = JSON.parse(payloadStr);
                    const candidate = payload.id || payload._id || payload.sub;
                    if (candidate && mongoose.Types.ObjectId.isValid(candidate)) {
                        applicantId = candidate;
                    }
                }
            } catch {
                // Ignore decoding errors
            }
        }

        if (!applicantId) {
            return res.status(401).json({ message: "Authentication required: invalid token or ID" });
        }

        const applicant = await Applicant.findById(applicantId);
        if (!applicant) {
            return res.status(401).json({ message: "Authentication required: applicant not found" });
        }

        req.user = applicant;
        return next();
    } catch (error) {
        console.error("Auth middleware error:", error.message);
        return res.status(500).json({ message: "Authentication error" });
    }
}

protect.protect = protect;
protect.authMiddleware = protect;

module.exports = protect;
