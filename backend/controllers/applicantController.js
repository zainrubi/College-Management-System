const Applicant = require("../models/Applicant");

async function registerApplicant(req, res) {
    try {
        const { fullName, phone, email, password } = req.body;

        // Validations
        if (!fullName?.trim() || fullName.trim().length < 3)
            return res.status(400).json({ message: "Full name must be at least 3 characters" });

        if (!/^\d{11}$/.test(phone))
            return res.status(400).json({ message: "Phone must be exactly 11 digits" });

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            return res.status(400).json({ message: "Invalid email address" });

        if (!password || password.length < 6)
            return res.status(400).json({ message: "Password must be at least 6 characters" });

        // Create
        const applicant = await Applicant.create({
            fullName: fullName.trim(),
            phone,
            ...(email?.trim() && { email: email.trim().toLowerCase() }),
            password,
        });

        return res.status(201).json({
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
        // Duplicate field
        if (error?.code === 11000) {
            const field = Object.keys(error.keyPattern || {})[0];
            return res.status(409).json({
                message: `${field === "email" ? "Email" : "Phone"} already registered`
            });
        }

        // Mongoose validation
        if (error?.name === "ValidationError")
            return res.status(400).json({
                message: Object.values(error.errors)[0]?.message || "Invalid data"
            });

        // Server error
        console.error("Registration failed:", error.message);
        return res.status(500).json({ message: "Server error — try again" });
    }
}

module.exports = { registerApplicant };