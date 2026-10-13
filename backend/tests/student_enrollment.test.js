const assert = require("assert");
const mongoose = require("mongoose");
const {
  updateAdminApplicationStatus,
  enrollStudentFromApplication,
} = require("../controllers/adminController");
const AdmissionApplication = require("../models/AdmissionApplication");
const Student = require("../models/Student");

// Helper to create mock Express response object
function createMockRes() {
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
  };
  return res;
}

// Helper to create sample admission application document
function createSampleApp(overrides = {}) {
  const appId = new mongoose.Types.ObjectId();
  const applicantId = new mongoose.Types.ObjectId();

  const appData = {
    _id: appId,
    applicantId,
    applicationNumber: overrides.applicationNumber || "APP-2026-9042",
    status: overrides.status || "Submitted",
    personal: {
      fullName: "Hamza Tariq",
      dob: "2005-08-14",
      gender: "Male",
      idType: "CNIC",
      idNumber: "35102-1234567-3",
      nationality: "Pakistani",
      religion: "Islam",
      bloodGroup: "B+",
      ...overrides.personal,
    },
    contactAddress: {
      phone: "03001234567",
      email: "hamza.tariq@example.com",
      domicile: "Kasur",
      address: "Chunian Road, Kanganpur",
      ...overrides.contactAddress,
    },
    guardian: {
      fatherName: "Tariq Mahmood",
      motherName: "Shaheen Bibi",
      altPhone: "03009876543",
      ...overrides.guardian,
    },
    academic: {
      matricBoard: "BISE Lahore",
      matricRollNo: "112233",
      matricYear: "2024",
      matricGroup: "Science",
      matricTotalMarks: "1100",
      matricObtainedMarks: "980",
      interStatus: "Not Applicable (Applying for Inter)",
      ...overrides.academic,
    },
    programCampus: {
      academicLevel: "Intermediate",
      primaryProgram: "FSc Pre-Medical",
      secondaryProgram: "ICS (Computer Science)",
      preferredShift: "Morning",
      campus: "Kanganpur",
      ...overrides.programCampus,
    },
    preferences: {
      admissionSession: "Fall 2026",
      ...overrides.preferences,
    },
    reviewSubmission: {
      submittedAt: new Date("2026-08-01"),
      ...overrides.reviewSubmission,
    },
    history: overrides.history || [
      {
        id: "audit-1",
        action: "Online Application Submitted",
        timestamp: new Date("2026-08-01"),
        performedBy: "Hamza Tariq",
        role: "Applicant",
        newStatus: "Submitted",
      },
    ],
  };

  appData.save = async function () {
    return this;
  };
  appData.set = function (path, val) {
    const parts = path.split(".");
    let target = this;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!target[parts[i]]) target[parts[i]] = {};
      target = target[parts[i]];
    }
    target[parts[parts.length - 1]] = val;
  };

  return appData;
}

async function runStudentEnrollmentTests() {
  console.log("─────────────────────────────────────────────────────────────");
  console.log("Running Phase 6 Step 6.2 Student Enrollment Test Suite");
  console.log("─────────────────────────────────────────────────────────────\n");

  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${err.message}`);
      if (err.stack) {
        console.error(`     ${err.stack.split("\n").slice(1, 4).join("\n     ")}`);
      }
    }
  }

  const origFindOneApp = AdmissionApplication.findOne;
  const origFindByIdApp = AdmissionApplication.findById;
  const origUpdateOneApp = AdmissionApplication.updateOne;
  const origFindOneStudent = Student.findOne;
  const origCreateStudent = Student.create;
  const origDeleteOneStudent = Student.deleteOne;

  // Cleanup helper
  function restoreMocks() {
    AdmissionApplication.findOne = origFindOneApp;
    AdmissionApplication.findById = origFindByIdApp;
    AdmissionApplication.updateOne = origUpdateOneApp;
    Student.findOne = origFindOneStudent;
    Student.create = origCreateStudent;
    Student.deleteOne = origDeleteOneStudent;
  }

  console.log("[1] Acceptance & Student Record Field Mapping");

  await test("1. Accepting a submitted application creates exactly one Student with correct fields", async () => {
    const sampleApp = createSampleApp();

    AdmissionApplication.findOne = async () => sampleApp;
    Student.findOne = async () => null;

    const req = {
      params: { id: sampleApp.applicationNumber },
      body: { status: "Accepted", reviewerNotes: "Eligible for admission" },
      admin: { name: "Admin Officer", role: "Administrator" },
    };
    const res = createMockRes();

    await updateAdminApplicationStatus(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.student, "Student object should be returned");

    const st = res.body.student;
    assert.strictEqual(st.applicantId.toString(), sampleApp.applicantId.toString());
    assert.strictEqual(st.applicationId.toString(), sampleApp._id.toString());
    assert.strictEqual(st.fullName, "Hamza Tariq");
    assert.strictEqual(st.phone, "03001234567");
    assert.strictEqual(st.email, "hamza.tariq@example.com");
    assert.strictEqual(st.program.programName, "FSc Pre-Medical");
    assert.strictEqual(st.program.academicLevel, "Intermediate");
    assert.strictEqual(st.program.shift, "Morning");
    assert.strictEqual(st.program.campus, "Kanganpur");
    assert.strictEqual(st.program.session, "Fall 2026");
    assert.strictEqual(st.status, "active");
    assert.ok(st.rollNumber.startsWith("FSC-M-"), `Expected FSC-M roll number, got ${st.rollNumber}`);
    assert.ok(st.studentIdNumber.startsWith("AIST-STD-2026-"), `Expected institutional ID, got ${st.studentIdNumber}`);

    // Verify application status changed to Accepted
    assert.strictEqual(sampleApp.status, "Accepted");
  });

  await test("2. Applicant credentials are fully preserved and no password copied to Student", async () => {
    const sampleApp = createSampleApp();
    sampleApp.password = "$2a$10$hashedapplicantpassword123456";

    AdmissionApplication.findOne = async () => sampleApp;
    Student.findOne = async () => null;

    const req = {
      params: { id: sampleApp.applicationNumber },
      body: { status: "Accepted" },
      admin: { name: "Admin Officer", role: "Administrator" },
    };
    const res = createMockRes();

    await updateAdminApplicationStatus(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.student.password, undefined, "Student record must never copy applicant password");
  });

  console.log("\n[2] Idempotency & Duplicate Prevention");

  await test("3. Repeated acceptance returns existing student without duplicate creation or audit bloat", async () => {
    const sampleApp = createSampleApp({ status: "Accepted" });
    const existingStudentDoc = {
      _id: new mongoose.Types.ObjectId(),
      studentIdNumber: "AIST-STD-2026-0001",
      rollNumber: "FSC-M-F26-001",
      applicationId: sampleApp._id,
      applicantId: sampleApp.applicantId,
      fullName: "Hamza Tariq",
    };

    AdmissionApplication.findOne = async () => sampleApp;
    Student.findOne = async () => existingStudentDoc;

    const initialHistoryLength = sampleApp.history.length;

    const req = {
      params: { id: sampleApp.applicationNumber },
      body: { status: "Accepted", reviewerNotes: "Accepting again" },
      admin: { name: "Admin Officer", role: "Administrator" },
    };
    const res = createMockRes();

    await updateAdminApplicationStatus(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.message, "Application is already accepted and enrolled");
    assert.strictEqual(res.body.student.studentIdNumber, "AIST-STD-2026-0001");
    assert.strictEqual(res.body.student.rollNumber, "FSC-M-F26-001");

    // History should NOT have a duplicate acceptance event
    assert.strictEqual(sampleApp.history.length, initialHistoryLength, "No duplicate audit history entry should be appended");
  });

  console.log("\n[3] Ineligible Status Rejection");

  await test("4. Rejects acceptance of Draft application with HTTP 400", async () => {
    const draftApp = createSampleApp({ status: "Draft" });

    AdmissionApplication.findOne = async () => draftApp;
    Student.findOne = async () => null;

    const req = {
      params: { id: draftApp.applicationNumber },
      body: { status: "Accepted" },
      admin: { name: "Admin Officer" },
    };
    const res = createMockRes();

    await updateAdminApplicationStatus(req, res);

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes("Draft applications cannot be accepted"));
    assert.strictEqual(draftApp.status, "Draft", "Status must remain Draft");
  });

  await test("5. Rejects acceptance of Rejected application with HTTP 400", async () => {
    const rejectedApp = createSampleApp({ status: "Rejected" });

    AdmissionApplication.findOne = async () => rejectedApp;
    Student.findOne = async () => null;

    const req = {
      params: { id: rejectedApp.applicationNumber },
      body: { status: "Accepted" },
      admin: { name: "Admin Officer" },
    };
    const res = createMockRes();

    await updateAdminApplicationStatus(req, res);

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes("Applications with status 'Rejected' cannot be accepted directly"));
    assert.strictEqual(rejectedApp.status, "Rejected", "Status must remain Rejected");
  });

  console.log("\n[4] Missing or Invalid Program Data");

  await test("6. Rejects application with missing primary program with HTTP 400", async () => {
    const appWithoutProgram = createSampleApp({
      programCampus: {
        academicLevel: "Intermediate",
        primaryProgram: "",
      },
    });

    AdmissionApplication.findOne = async () => appWithoutProgram;
    Student.findOne = async () => null;

    const req = {
      params: { id: appWithoutProgram.applicationNumber },
      body: { status: "Accepted" },
      admin: { name: "Admin Officer" },
    };
    const res = createMockRes();

    await updateAdminApplicationStatus(req, res);

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes("missing primary program"));
  });

  await test("7. Rejects application with unknown program with explicit UNKNOWN_PROGRAM HTTP 400", async () => {
    const appWithUnknownProgram = createSampleApp({
      programCampus: {
        academicLevel: "Intermediate",
        primaryProgram: "Aeronautical Robotics",
      },
    });

    AdmissionApplication.findOne = async () => appWithUnknownProgram;
    Student.findOne = async () => null;

    const req = {
      params: { id: appWithUnknownProgram.applicationNumber },
      body: { status: "Accepted" },
      admin: { name: "Admin Officer" },
    };
    const res = createMockRes();

    await updateAdminApplicationStatus(req, res);

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes("UNKNOWN_PROGRAM"));
  });

  console.log("\n[5] Concurrency & Collision Recovery");

  await test("8. Handles roll number duplicate key (E11000) by retrying with incremented sequence", async () => {
    const sampleApp = createSampleApp({
      programCampus: {
        academicLevel: "Undergraduate",
        primaryProgram: "BS Computer Science",
        campus: "Kanganpur",
      },
    });

    let attemptCount = 0;
    const mockStudentModel = {
      findOne: async () => null,
      create: async (data) => {
        attemptCount++;
        if (attemptCount === 1) {
          const err = new Error("E11000 duplicate key error collection: students index: rollNumber_1 dup key");
          err.code = 11000;
          err.keyPattern = { rollNumber: 1 };
          throw err;
        }
        return {
          ...data,
          _id: new mongoose.Types.ObjectId(),
        };
      },
    };

    const result = await enrollStudentFromApplication(sampleApp, {
      StudentModel: mockStudentModel,
    });

    assert.strictEqual(attemptCount, 2, "Should have retried once after collision");
    assert.strictEqual(result.isAlreadyEnrolled, false);
    assert.strictEqual(result.student.rollNumber, "BCS-F26-002", "Roll number should advance on retry");
  });

  await test("9. Handles concurrent race on applicationId (E11000) by resolving existing student", async () => {
    const sampleApp = createSampleApp();
    const existingConcurrentStudent = {
      _id: new mongoose.Types.ObjectId(),
      studentIdNumber: "AIST-STD-2026-0001",
      rollNumber: "FSC-M-F26-001",
      applicationId: sampleApp._id,
      applicantId: sampleApp.applicantId,
    };

    let firstFind = true;
    const mockStudentModel = {
      findOne: async () => {
        if (firstFind) {
          firstFind = false;
          return null; // Initial check found nothing
        }
        return existingConcurrentStudent; // Re-check after E11000 finds concurrently created doc
      },
      create: async () => {
        const err = new Error("E11000 duplicate key error collection: students index: applicationId_1 dup key");
        err.code = 11000;
        err.keyPattern = { applicationId: 1 };
        throw err;
      },
    };

    const result = await enrollStudentFromApplication(sampleApp, {
      StudentModel: mockStudentModel,
    });

    assert.strictEqual(result.isAlreadyEnrolled, true);
    assert.strictEqual(result.student._id, existingConcurrentStudent._id);
  });

  console.log("\n[6] Compensation Rollback on Application Save Failure");

  await test("10. Rolls back created student if application.save() fails", async () => {
    const sampleApp = createSampleApp();
    sampleApp.save = async () => {
      throw new Error("Atlas connection lost during application save");
    };

    let deletedStudentId = null;
    const mockStudentDoc = {
      _id: new mongoose.Types.ObjectId(),
      studentIdNumber: "AIST-STD-2026-0001",
      rollNumber: "FSC-M-F26-001",
    };

    AdmissionApplication.findOne = async () => sampleApp;
    Student.findOne = async () => null;
    Student.create = async () => mockStudentDoc;
    Student.deleteOne = async (query) => {
      deletedStudentId = query._id;
      return { deletedCount: 1 };
    };

    const req = {
      params: { id: sampleApp.applicationNumber },
      body: { status: "Accepted" },
      admin: { name: "Admin Officer" },
    };
    const res = createMockRes();

    await updateAdminApplicationStatus(req, res);

    assert.strictEqual(res.statusCode, 500);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(deletedStudentId.toString(), mockStudentDoc._id.toString(), "Should delete created student on rollback");
  });

  await test("11. Rollback failure logs structured critical error and returns rollbackFailed in response", async () => {
    const sampleApp = createSampleApp();
    sampleApp.save = async () => {
      throw new Error("Save error trigger");
    };

    const mockStudentDoc = {
      _id: new mongoose.Types.ObjectId(),
      studentIdNumber: "AIST-STD-2026-0001",
      rollNumber: "FSC-M-F26-001",
    };

    AdmissionApplication.findOne = async () => sampleApp;
    Student.findOne = async () => null;
    Student.create = async () => mockStudentDoc;
    Student.deleteOne = async () => {
      throw new Error("MongoDB network drop during delete compensation");
    };

    const originalConsoleError = console.error;
    const errorLogs = [];
    console.error = (...args) => {
      errorLogs.push(args.join(" "));
    };

    try {
      const req = {
        params: { id: sampleApp.applicationNumber },
        body: { status: "Accepted" },
        admin: { name: "Admin Officer" },
      };
      const res = createMockRes();

      await updateAdminApplicationStatus(req, res);

      assert.strictEqual(res.statusCode, 500);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.rollbackFailed, true);
      assert.ok(res.body.message.includes("automatic student cleanup failed"));

      // Verify structured critical log
      const criticalLog = errorLogs.find((l) => l.includes("ENROLLMENT_COMPENSATION_ROLLBACK_FAILED"));
      assert.ok(criticalLog, "Must emit structured CRITICAL log on rollback failure");
      assert.ok(criticalLog.includes("CRITICAL"));
      assert.ok(criticalLog.includes(mockStudentDoc._id.toString()));
    } finally {
      console.error = originalConsoleError;
    }
  });

  console.log("\n[7] Duplicate Email & Constraint Failure Handling");

  await test("12. Fails immediately on duplicate email constraint without retrying 5 times", async () => {
    const sampleApp = createSampleApp({
      contactAddress: {
        email: "duplicate.student@example.com",
        phone: "03001234567",
      },
    });

    let createCallCount = 0;
    const mockStudentModel = {
      findOne: async () => null,
      create: async () => {
        createCallCount++;
        const err = new Error("E11000 duplicate key error collection: students index: email_1 dup key");
        err.code = 11000;
        err.keyPattern = { email: 1 };
        throw err;
      },
    };

    AdmissionApplication.findOne = async () => sampleApp;
    Student.findOne = async () => null;

    try {
      await enrollStudentFromApplication(sampleApp, {
        StudentModel: mockStudentModel,
      });
      assert.fail("Should have thrown email collision error");
    } catch (err) {
      assert.strictEqual(createCallCount, 1, "Must NOT loop 5 times on non-rollNumber collision");
      assert.ok(err.message.includes("Email address 'duplicate.student@example.com' is already registered"));
    }
  });

  console.log("\n[8] Concurrency Audit-History Preservation & Status Guards");

  await test("13. Prevents stale in-memory application save from overwriting audit history in concurrent acceptance", async () => {
    const sampleApp = createSampleApp({
      status: "Accepted",
      history: [
        {
          id: "audit-1",
          action: "Online Application Submitted",
          timestamp: new Date().toISOString(),
          performedBy: "Applicant",
          role: "Applicant",
          newStatus: "Submitted",
        },
        {
          id: "audit-2",
          action: "Admission Accepted",
          timestamp: new Date().toISOString(),
          performedBy: "Admissions Administrator",
          role: "Administrator",
          newStatus: "Accepted",
          note: "Enrolled as FSC-M-F26-001 (AIST-STD-2026-0001)",
        },
      ],
    });

    let inMemorySaveCalled = false;
    sampleApp.save = async function () {
      inMemorySaveCalled = true;
      return this;
    };

    const existingStudentDoc = {
      _id: new mongoose.Types.ObjectId(),
      studentIdNumber: "AIST-STD-2026-0001",
      rollNumber: "FSC-M-F26-001",
      applicationId: sampleApp._id,
      applicantId: sampleApp.applicantId,
    };

    AdmissionApplication.findOne = async () => sampleApp;
    Student.findOne = async () => existingStudentDoc;

    let updateOneCalled = false;
    AdmissionApplication.updateOne = async () => {
      updateOneCalled = true;
      return { modifiedCount: 0 };
    };
    AdmissionApplication.findById = async () => sampleApp;

    const req = {
      params: { id: sampleApp.applicationNumber },
      body: { status: "Accepted" },
      admin: { name: "Admin Officer" },
    };
    const res = createMockRes();

    await updateAdminApplicationStatus(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.message, "Application is already accepted and enrolled");
    assert.strictEqual(inMemorySaveCalled, false, "Must NOT call in-memory save() in already-enrolled path to avoid clobbering history");
    assert.strictEqual(sampleApp.history.length, 2, "Audit history length must remain unchanged");
  });

  await test("14. Prevents an already-enrolled application from being changed to Rejected or On Hold", async () => {
    const sampleApp = createSampleApp({ status: "Accepted" });
    const existingStudentDoc = {
      _id: new mongoose.Types.ObjectId(),
      studentIdNumber: "AIST-STD-2026-0001",
      rollNumber: "FSC-M-F26-001",
      applicationId: sampleApp._id,
      applicantId: sampleApp.applicantId,
    };

    AdmissionApplication.findOne = async () => sampleApp;
    Student.findOne = async () => existingStudentDoc;

    // Attempt 1: Change to Rejected
    const reqReject = {
      params: { id: sampleApp.applicationNumber },
      body: { status: "rejected", reason: "Attempting to reject enrolled student" },
      admin: { name: "Admin Officer" },
    };
    const resReject = createMockRes();
    await updateAdminApplicationStatus(reqReject, resReject);

    assert.strictEqual(resReject.statusCode, 400);
    assert.strictEqual(resReject.body.success, false);
    assert.ok(resReject.body.message.includes("Cannot change status to 'Rejected'"));
    assert.strictEqual(sampleApp.status, "Accepted", "Status must remain Accepted");

    // Attempt 2: Change to On Hold
    const reqHold = {
      params: { id: sampleApp.applicationNumber },
      body: { status: "on_hold", note: "Attempting to hold enrolled student" },
      admin: { name: "Admin Officer" },
    };
    const resHold = createMockRes();
    await updateAdminApplicationStatus(reqHold, resHold);

    assert.strictEqual(resHold.statusCode, 400);
    assert.strictEqual(resHold.body.success, false);
    assert.ok(resHold.body.message.includes("Cannot change status to 'On Hold'"));
    assert.strictEqual(sampleApp.status, "Accepted", "Status must remain Accepted");
  });

  restoreMocks();

  console.log("\n─────────────────────────────────────────────────────────────");
  console.log(`Student Enrollment Results: ${passed} / ${total} passed (${total - passed} failed)`);
  console.log("─────────────────────────────────────────────────────────────\n");

  if (passed !== total) process.exit(1);
}

if (require.main === module) {
  runStudentEnrollmentTests().catch((err) => {
    console.error("Student enrollment test fatal error:", err);
    process.exit(1);
  });
}

module.exports = { runStudentEnrollmentTests };
