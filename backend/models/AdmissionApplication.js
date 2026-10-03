const mongoose = require("mongoose");

const admissionApplicationSchema = new mongoose.Schema(
  {
    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Applicant",
      required: true,
      index: true,
    },
    applicationNumber: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    status: {
      type: String,
      enum: [
        "Draft",
        "Submitted",
        "Under Review",
        "More Information Required",
        "On Hold",
        "Merit Qualified",
        "Accepted",
        "Admitted",
        "Rejected",
      ],
      default: "Draft",
    },
    personal: {
      fullName: String,
      dob: String,
      gender: String,
      idType: String,
      idNumber: String,
      nationality: String,
      religion: String,
      bloodGroup: String,
    },
    contactAddress: {
      phone: String,
      email: String,
      domicile: String,
      address: String,
    },
    guardian: {
      fatherName: String,
      motherName: String,
      altPhone: String,
    },
    academic: {
      matricBoard: String,
      matricRollNo: String,
      matricYear: String,
      matricGroup: String,
      matricTotalMarks: String,
      matricObtainedMarks: String,
      interStatus: String,
      interBoard: String,
      interRollNo: String,
      interYear: String,
      interTotalMarks: String,
      interObtainedMarks: String,
    },
    programCampus: {
      academicLevel: String,
      primaryProgram: String,
      secondaryProgram: String,
      preferredShift: String,
      campus: String,
    },
    transport: {
      required: Boolean,
      route: String,
      pickupPoint: String,
    },
    documents: {
      matricResultCard: String,
      cnicOrBForm: String,
      guardianCnic: String,
      photo: String,
    },
    reviewSubmission: {
      undertakingAgreed: Boolean,
      submittedAt: String,
      reviewedAt: Date,
      reviewerNotes: String,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("AdmissionApplication", admissionApplicationSchema);