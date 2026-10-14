const mongoose = require("mongoose");

/**
 * Attendance Schema - Official Student Attendance Record
 * Represents an individual class attendance entry for an enrolled student.
 *
 * References:
 * - studentId: References the enrolled Student document.
 *
 * Snapshots:
 * - studentRollNumber & studentName: Preserved snapshots for historical auditing.
 * - courseCode & courseTitle: Academic course snapshots.
 *
 * Business Rules for Future Calculations:
 * - "present" and "late" receive full attendance credit.
 * - "absent" receives zero attendance credit.
 * - Approved "leave" is excluded from the attendance-percentage denominator.
 */
const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student reference is required"],
      index: true,
    },
    studentRollNumber: {
      type: String,
      required: [true, "Student roll number is required"],
      trim: true,
      uppercase: true,
    },
    studentName: {
      type: String,
      required: [true, "Student name is required"],
      trim: true,
    },
    courseId: {
      type: String,
      trim: true,
      default: "",
    },
    courseCode: {
      type: String,
      required: [true, "Course code is required"],
      trim: true,
      uppercase: true,
    },
    courseTitle: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "Attendance date is required"],
    },
    status: {
      type: String,
      required: [true, "Attendance status is required"],
      enum: {
        values: ["present", "absent", "late", "leave"],
        message: "Status must be present, absent, late, or leave",
      },
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [250, "Remarks cannot exceed 250 characters"],
      default: "",
    },
    academicSession: {
      type: String,
      trim: true,
      default: "",
    },
    markedByTeacherName: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
    bufferCommands: false,
  }
);

// Compound indexes for student/date queries and student/course queries
attendanceSchema.index({ studentId: 1, date: -1 });
attendanceSchema.index({ studentId: 1, courseCode: 1 });

module.exports = mongoose.model("Attendance", attendanceSchema);
