const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const applicantSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [3, "Full name must be at least 3 characters"],
      maxlength: [100, "Full name cannot exceed 100 characters"],
    },
    phone: {
      type: String,
      required: [true, "Mobile number is required"],
      unique: true,
      trim: true,
      match: [/^\d{11}$/, "Mobile number must contain exactly 11 digits"],
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
  },
  { timestamps: true },
);

applicantSchema.pre("save", async function hashPassword() {

  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);

});

module.exports = mongoose.model("Applicant", applicantSchema);