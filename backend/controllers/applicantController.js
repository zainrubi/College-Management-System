const Applicant = require("../models/Applicant");

async function registerApplicant(req, res) {
    try {
        const { fullName, phone, email, password } = req.body;

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
        // Handle MongoDB duplicate-key error code 11000
        if (error?.code === 11000) {
            const isDuplicatePhone = Boolean(
                error.keyPattern?.phone ||
                error.keyValue?.phone ||
                (typeof error.message === "string" && error.message.includes("phone_1"))
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

        // Mongoose validation
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

module.exports = { registerApplicant };