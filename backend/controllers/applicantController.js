const mongoose = require("mongoose");
const Applicant = require("../models/Applicant");
const { signToken } = require("../utils/jwt");

async function registerApplicant(req, res) {
    try {
        const { fullName, phone, email, password } = req.body || {};

        // Validations
        if (!fullName || typeof fullName !== "string" || fullName.trim().length < 3) {
            return res.status(400).json({
                success: false,
                message: "Full name must be at least 3 characters",
            });
        }

        if (typeof phone !== "string" || !/^[0-9]{11}$/.test(phone)) {
            return res.status(400).json({
                success: false,
                message: "Phone must be exactly 11 digits",
            });
        }

        const trimmedEmail = typeof email === "string" ? email.trim() : "";
        if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email address",
            });
        }

        if (!password || typeof password !== "string" || password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters",
            });
        }

        // Pre-check for existing registered phone number
        const existingApplicant = await Applicant.findOne({ phone }).lean();
        if (existingApplicant) {
            return res.status(409).json({
                success: false,
                code: "PHONE_ALREADY_REGISTERED",
                message: "This phone number is already registered. Please sign in instead.",
            });
        }

        // Create applicant payload (store email only if provided and non-empty)
        const applicantData = {
            fullName: fullName.trim(),
            phone,
            password,
        };
        if (trimmedEmail) {
            applicantData.email = trimmedEmail.toLowerCase();
        }

        const applicant = await Applicant.create(applicantData);

        return res.status(201).json({
            success: true,
            message: "Applicant registered successfully",
            applicant: {
                id: applicant._id,
                fullName: applicant.fullName,
                phone: applicant.phone,
                email: applicant.email,
                createdAt: applicant.createdAt,
            },
        });

    } catch (error) {
        // Handle database offline / buffering timeout errors
        const isDbConnectionError = Boolean(
            (error?.name === "MongooseError" && typeof error.message === "string" && (
                error.message.includes("buffering timed out") ||
                error.message.includes("before initial connection is complete") ||
                error.message.includes("connection must be established") ||
                error.message.includes("bufferCommands")
            )) ||
            error?.name === "MongooseServerSelectionError" ||
            error?.name === "MongoNetworkError" ||
            error?.name === "MongoTimeoutError" ||
            error?.name === "MongoServerSelectionError"
        );

        if (isDbConnectionError) {
            console.error("Database connection error during registration:", error.message);
            return res.status(503).json({
                success: false,
                code: "DATABASE_UNAVAILABLE",
                message: "Database service is temporarily unavailable. Please try again shortly.",
            });
        }

        // Handle MongoDB duplicate-key error code 11000
        if (error?.code === 11000 || (typeof error?.message === "string" && error.message.includes("E11000"))) {
            const isDuplicatePhone = Boolean(
                error.keyPattern?.phone ||
                error.keyValue?.phone ||
                (typeof error.message === "string" && (error.message.includes("phone_1") || error.message.includes("phone")))
            );

            if (isDuplicatePhone) {
                return res.status(409).json({
                    success: false,
                    code: "PHONE_ALREADY_REGISTERED",
                    message: "This phone number is already registered. Please sign in instead.",
                });
            }

            console.error("Non-phone duplicate key error:", error.message);
            return res.status(500).json({
                success: false,
                message: "Server error — try again",
            });
        }

        // Mongoose validation error
        if (error?.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: Object.values(error.errors)[0]?.message || "Invalid data",
            });
        }

        // Server error
        console.error("Registration failed:", error.message);
        return res.status(500).json({
            success: false,
            message: "Server error — try again",
        });
    }
}

async function loginApplicant(req, res) {
    try {
        const { phone, password } = req.body || {};

        // Validate phone number presence and format (11 digits)
        if (
            !phone ||
            typeof phone !== "string" ||
            !/^[0-9]{11}$/.test(phone.trim()) ||
            !password ||
            typeof password !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid 11-digit mobile number and password",
            });
        }

        const normalizedPhone = phone.trim();

        // Query applicant with password explicitly selected
        const applicant = await Applicant.findOne({ phone: normalizedPhone }).select("+password");

        // Generic error for unknown phone to prevent user enumeration
        if (!applicant) {
            return res.status(401).json({
                success: false,
                message: "Invalid mobile number or password",
            });
        }

        // Compare password with bcrypt
        const isMatch = await applicant.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid mobile number or password",
            });
        }

        // Generate signed JWT
        const token = signToken({
            id: applicant._id.toString(),
            phone: applicant.phone,
            role: "applicant",
        });

        // Return token and sanitized applicant profile (never exposing password)
        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            applicant: {
                id: applicant._id,
                fullName: applicant.fullName,
                phone: applicant.phone,
                email: applicant.email || "",
            },
        });
    } catch (error) {
        // Handle database offline / buffering timeout errors
        const isDbConnectionError = Boolean(
            (error?.name === "MongooseError" && typeof error.message === "string" && (
                error.message.includes("buffering timed out") ||
                error.message.includes("before initial connection is complete") ||
                error.message.includes("connection must be established") ||
                error.message.includes("bufferCommands")
            )) ||
            error?.name === "MongooseServerSelectionError" ||
            error?.name === "MongoNetworkError" ||
            error?.name === "MongoTimeoutError" ||
            error?.name === "MongoServerSelectionError"
        );

        if (isDbConnectionError) {
            console.error("Database connection error during login:", error.message);
            return res.status(503).json({
                success: false,
                code: "DATABASE_UNAVAILABLE",
                message: "Database service is temporarily unavailable. Please try again shortly.",
            });
        }

        if (error.message?.includes("JWT_SECRET")) {
            console.error("Authentication configuration error: JWT_SECRET missing");
            return res.status(500).json({
                success: false,
                message: "Server configuration error",
            });
        }

        console.error("Login failed:", error.message);
        return res.status(500).json({
            success: false,
            message: "Server error — try again",
        });
    }
}

module.exports = { registerApplicant, loginApplicant };