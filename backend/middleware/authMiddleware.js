const mongoose = require("mongoose");
const Applicant = require("../models/Applicant");
const { verifyToken } = require("../utils/jwt");

/**
 * Authentication middleware for applicant-protected routes.
 * Strictly verifies the signed JWT token before trusting identity.
 * Rejects forged x-applicant-id headers and unverified payloads.
 */
async function protect(req, res, next) {
    try {
        // If req.user is already set by an upstream verified session
        if (req.user && (req.user._id || req.user.id)) {
            return next();
        }

        const authHeader = req.headers.authorization;

        if (!authHeader || typeof authHeader !== "string") {
            return res.status(401).json({ message: "Authentication required: missing token" });
        }

        let token = null;
        if (authHeader.startsWith("Bearer ")) {
            token = authHeader.slice(7).trim();
        } else {
            token = authHeader.trim();
        }

        if (!token) {
            return res.status(401).json({ message: "Authentication required: missing token" });
        }

        // Verify cryptographic JWT signature, structure, and expiration
        let decoded;
        try {
            decoded = verifyToken(token);
        } catch (err) {
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({ message: "Authentication required: token has expired" });
            }
            return res.status(401).json({ message: "Authentication required: invalid or forged token" });
        }

        const applicantId = decoded?.id || decoded?._id || decoded?.sub;
        if (!applicantId || !mongoose.Types.ObjectId.isValid(applicantId)) {
            return res.status(401).json({ message: "Authentication required: invalid token payload" });
        }

        // Explicitly check for ID spoofing attempts via headers
        const spoofedHeaderId = req.headers["x-applicant-id"];
        if (spoofedHeaderId && String(spoofedHeaderId).trim() !== String(applicantId)) {
            return res.status(403).json({
                message: "Forbidden: request header ID does not match authenticated token",
            });
        }

        // Verify applicant exists in database
        const applicant = await Applicant.findById(applicantId);
        if (!applicant) {
            return res.status(401).json({ message: "Authentication required: applicant not found" });
        }

        // Attach verified applicant to req.user for downstream controllers
        req.user = applicant;
        return next();
    } catch (error) {
        if (error.message?.includes("JWT_SECRET")) {
            console.error("Auth middleware error: JWT_SECRET missing in backend environment");
            return res.status(500).json({ message: "Server authentication configuration error" });
        }

        console.error("Auth middleware error:", error.message);
        return res.status(500).json({ message: "Authentication error" });
    }
}

/**
 * Authentication and authorization middleware strictly for administrative routes.
 * Strictly verifies the signed JWT token and requires decoded.role === "admin".
 * Rejects applicants with HTTP 403 Forbidden.
 */
async function protectAdmin(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || typeof authHeader !== "string") {
            return res.status(401).json({ message: "Authentication required: missing token" });
        }

        let token = null;
        if (authHeader.startsWith("Bearer ")) {
            token = authHeader.slice(7).trim();
        } else {
            token = authHeader.trim();
        }

        if (!token) {
            return res.status(401).json({ message: "Authentication required: missing token" });
        }

        // Verify cryptographic JWT signature, structure, and expiration
        let decoded;
        try {
            decoded = verifyToken(token);
        } catch (err) {
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({ message: "Authentication required: token has expired" });
            }
            return res.status(401).json({ message: "Authentication required: invalid or forged token" });
        }

        // Enforce genuine administrator role
        if (!decoded || decoded.role !== "admin") {
            return res.status(403).json({
                message: "Forbidden: Administrator role required",
            });
        }

        // Attach verified admin claims to request
        req.user = decoded;
        req.admin = decoded;
        return next();
    } catch (error) {
        if (error.message?.includes("JWT_SECRET")) {
            console.error("Auth middleware error: JWT_SECRET missing in backend environment");
            return res.status(500).json({ message: "Server authentication configuration error" });
        }

        console.error("Admin auth middleware error:", error.message);
        return res.status(500).json({ message: "Authentication error" });
    }
}

protect.protect = protect;
protect.protectAdmin = protectAdmin;
protect.authMiddleware = protect;

module.exports = protect;
module.exports.protect = protect;
module.exports.protectAdmin = protectAdmin;

