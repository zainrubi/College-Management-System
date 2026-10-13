const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/**
 * Student Schema - Enrolled Student Record
 * Represents an officially enrolled student after admission acceptance.
 * 
 * References:
 * - applicantId: References the registered Applicant document (1:1 per student)
 * - applicationId: References the accepted AdmissionApplication document (1:1 per enrollment)
 * 
 * Password Handling:
 * - `password` is marked with `select: false` so it is never returned in standard queries.
 * - Hashed with bcrypt (salt rounds = 10) in a pre-save hook when modified.
 * - `comparePassword` instance method provided for verification.
 * - Note: Password provisioning / student login is reserved for a future step.
 */
const studentSchema = new mongoose.Schema(
  {
    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Applicant",
      required: [true, "Applicant reference is required"],
      unique: true,
      index: true,
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdmissionApplication",
      required: [true, "Admission application reference is required"],
      unique: true,
      index: true,
    },
    studentIdNumber: {
      type: String,
      required: [true, "Student registration ID is required"],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    rollNumber: {
      type: String,
      required: [true, "Roll number is required"],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [3, "Full name must be at least 3 characters"],
      maxlength: [100, "Full name cannot exceed 100 characters"],
    },
    dob: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      enum: {
        values: ["Male", "Female", "Other"],
        message: "Gender must be Male, Female, or Other",
      },
      default: "Male",
    },
    cnicBForm: {
      type: String,
      trim: true,
    },
    bloodGroup: {
      type: String,
      trim: true,
    },
    nationality: {
      type: String,
      default: "Pakistani",
      trim: true,
    },
    religion: {
      type: String,
      default: "Islam",
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Mobile number is required"],
      trim: true,
      match: [/^[0-9]{11}$/, "Mobile number must contain exactly 11 digits"],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
      unique: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email address"],
    },
    guardian: {
      fatherName: { type: String, trim: true },
      motherName: { type: String, trim: true },
      guardianPhone: { type: String, trim: true },
    },
    address: {
      domicile: { type: String, trim: true },
      currentAddress: { type: String, trim: true },
      permanentAddress: { type: String, trim: true },
    },
    program: {
      academicLevel: {
        type: String,
        required: [true, "Academic level is required"],
        enum: {
          values: ["Intermediate", "Undergraduate"],
          message: "Academic level must be Intermediate or Undergraduate",
        },
      },
      programName: {
        type: String,
        required: [true, "Program name is required"],
        trim: true,
      },
      shift: {
        type: String,
        enum: {
          values: ["Morning", "Evening"],
          message: "Shift must be Morning or Evening",
        },
        default: "Morning",
      },
      campus: {
        type: String,
        default: "Kanganpur",
        trim: true,
      },
      session: {
        type: String,
        default: "Fall 2026",
        trim: true,
      },
      currentSemesterOrYear: {
        type: Number,
        default: 1,
        min: 1,
      },
    },
    status: {
      type: String,
      enum: {
        values: ["active", "suspended", "graduated", "alumni", "withdrawn"],
        message: "Status must be active, suspended, graduated, alumni, or withdrawn",
      },
      default: "active",
      index: true,
    },
    admissionDate: {
      type: Date,
      default: Date.now,
    },
    password: {
      type: String,
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    isActivated: {
      type: Boolean,
      default: false,
      index: true,
    },
    activatedAt: {
      type: Date,
    },
    activationTokenHash: {
      type: String,
      select: false,
    },
    activationTokenExpires: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true, bufferCommands: false }
);

studentSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password") || !this.password) return;
  if (typeof this.password === "string" && (this.password.startsWith("$2a$") || this.password.startsWith("$2b$"))) {
    return;
  }
  this.password = await bcrypt.hash(this.password, 10);
});

studentSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) {
    throw new Error("Password field not selected");
  }
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("Student", studentSchema);
