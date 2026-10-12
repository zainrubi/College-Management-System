const assert = require("assert");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Student = require("../models/Student");

function getValidStudentData(overrides = {}) {
  const dummyApplicantId = new mongoose.Types.ObjectId();
  const dummyApplicationId = new mongoose.Types.ObjectId();

  return {
    applicantId: dummyApplicantId,
    applicationId: dummyApplicationId,
    studentIdNumber: "AIST-STD-2026-0001",
    rollNumber: "BCS-F26-001",
    fullName: "Muhammad Ali Siddiqui",
    dob: "2006-04-12",
    gender: "Male",
    cnicBForm: "35102-1234567-1",
    bloodGroup: "B+",
    nationality: "Pakistani",
    religion: "Islam",
    phone: "03001234567",
    email: "ali.siddiqui@student.apex.edu.pk",
    guardian: {
      fatherName: "Tariq Siddiqui",
      motherName: "Nasreen Bibi",
      guardianPhone: "03009876543",
    },
    address: {
      domicile: "Kasur",
      currentAddress: "Main Bazar, Kanganpur",
      permanentAddress: "Main Bazar, Kanganpur",
    },
    program: {
      academicLevel: "Undergraduate",
      programName: "BS Computer Science",
      shift: "Morning",
      campus: "Kanganpur",
      session: "Fall 2026",
      currentSemesterOrYear: 1,
    },
    status: "active",
    admissionDate: new Date("2026-08-15"),
    ...overrides,
  };
}

async function validateDoc(student) {
  try {
    await student.validate();
    return undefined;
  } catch (err) {
    return err;
  }
}

async function runStudentModelTests() {
  console.log("─────────────────────────────────────────────────────────────");
  console.log("Running Student Model & Enrollment Schema Test Suite");
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
      console.error(`     Error: ${err.message}\n`);
    }
  }

  // ─── 1. Complete Document Validation ─────────────────────────────────────────
  console.log("[1] Valid Instantiation & Defaults");

  await test("1. Complete student payload validates successfully in-memory", async () => {
    const student = new Student(getValidStudentData());
    const err = await validateDoc(student);
    assert.strictEqual(err, undefined, "Expected no validation errors for complete valid payload");
    assert.strictEqual(student.status, "active", "Default status should be active");
    assert.strictEqual(student.program.shift, "Morning", "Default shift should be Morning");
    assert.strictEqual(student.program.currentSemesterOrYear, 1, "Default semester should be 1");
    assert(student.admissionDate instanceof Date, "admissionDate should be an instance of Date");
  });

  await test("2. Default values populate when optional fields are omitted", async () => {
    const minimalData = {
      applicantId: new mongoose.Types.ObjectId(),
      applicationId: new mongoose.Types.ObjectId(),
      studentIdNumber: "AIST-STD-2026-0002",
      rollNumber: "FSC-M26-001",
      fullName: "Fatima Noor",
      phone: "03121234567",
      program: {
        academicLevel: "Intermediate",
        programName: "FSc Pre-Medical",
      },
    };
    const student = new Student(minimalData);
    const err = await validateDoc(student);
    assert.strictEqual(err, undefined, "Minimal valid payload must pass validation");
    assert.strictEqual(student.status, "active");
    assert.strictEqual(student.gender, "Male");
    assert.strictEqual(student.nationality, "Pakistani");
    assert.strictEqual(student.religion, "Islam");
    assert.strictEqual(student.program.campus, "Kanganpur");
    assert.strictEqual(student.program.session, "Fall 2026");
  });

  // ─── 2. Required Field Constraints ─────────────────────────────────────────
  console.log("\n[2] Required Field Constraints");

  await test("3. Fails validation when applicantId is missing", async () => {
    const data = getValidStudentData({ applicantId: undefined });
    const student = new Student(data);
    const err = await validateDoc(student);
    assert(err && err.errors["applicantId"], "applicantId must be required");
    assert.strictEqual(err.errors["applicantId"].message, "Applicant reference is required");
  });

  await test("4. Fails validation when applicationId is missing", async () => {
    const data = getValidStudentData({ applicationId: undefined });
    const student = new Student(data);
    const err = await validateDoc(student);
    assert(err && err.errors["applicationId"], "applicationId must be required");
    assert.strictEqual(err.errors["applicationId"].message, "Admission application reference is required");
  });

  await test("5. Fails validation when studentIdNumber is missing", async () => {
    const data = getValidStudentData({ studentIdNumber: undefined });
    const student = new Student(data);
    const err = await validateDoc(student);
    assert(err && err.errors["studentIdNumber"], "studentIdNumber must be required");
    assert.strictEqual(err.errors["studentIdNumber"].message, "Student registration ID is required");
  });

  await test("6. Fails validation when rollNumber is missing", async () => {
    const data = getValidStudentData({ rollNumber: undefined });
    const student = new Student(data);
    const err = await validateDoc(student);
    assert(err && err.errors["rollNumber"], "rollNumber must be required");
    assert.strictEqual(err.errors["rollNumber"].message, "Roll number is required");
  });

  await test("7. Fails validation when fullName is missing or under 3 characters", async () => {
    const dataMissing = getValidStudentData({ fullName: undefined });
    const errMissing = await validateDoc(new Student(dataMissing));
    assert(errMissing && errMissing.errors["fullName"]);

    const dataShort = getValidStudentData({ fullName: "Al" });
    const errShort = await validateDoc(new Student(dataShort));
    assert(errShort && errShort.errors["fullName"]);
    assert.strictEqual(errShort.errors["fullName"].message, "Full name must be at least 3 characters");
  });

  await test("8. Fails validation when phone is missing or not 11 digits", async () => {
    const dataMissing = getValidStudentData({ phone: undefined });
    const errMissing = await validateDoc(new Student(dataMissing));
    assert(errMissing && errMissing.errors["phone"]);

    const dataInvalid = getValidStudentData({ phone: "0300123" });
    const errInvalid = await validateDoc(new Student(dataInvalid));
    assert(errInvalid && errInvalid.errors["phone"]);
    assert.strictEqual(errInvalid.errors["phone"].message, "Mobile number must contain exactly 11 digits");
  });

  await test("9. Fails validation when program.academicLevel or program.programName is missing", async () => {
    const dataNoLevel = getValidStudentData({
      program: { programName: "BS Computer Science" },
    });
    const errNoLevel = await validateDoc(new Student(dataNoLevel));
    assert(errNoLevel && errNoLevel.errors["program.academicLevel"]);

    const dataNoProg = getValidStudentData({
      program: { academicLevel: "Undergraduate" },
    });
    const errNoProg = await validateDoc(new Student(dataNoProg));
    assert(errNoProg && errNoProg.errors["program.programName"]);
  });

  // ─── 3. Enum & Optional Field Handling ─────────────────────────────────────
  console.log("\n[3] Enum Values & Optional Field Validation");

  await test("10. Rejects invalid academicLevel, gender, shift, and status enums", async () => {
    const invalidLevel = await validateDoc(new Student(getValidStudentData({
      program: { academicLevel: "PhD", programName: "Computer Science" },
    })));
    assert(invalidLevel && invalidLevel.errors["program.academicLevel"]);

    const invalidGender = await validateDoc(new Student(getValidStudentData({ gender: "Unknown" })));
    assert(invalidGender && invalidGender.errors["gender"]);

    const invalidShift = await validateDoc(new Student(getValidStudentData({
      program: { academicLevel: "Undergraduate", programName: "BS CS", shift: "Weekend" },
    })));
    assert(invalidShift && invalidShift.errors["program.shift"]);

    const invalidStatus = await validateDoc(new Student(getValidStudentData({ status: "invalid_status" })));
    assert(invalidStatus && invalidStatus.errors["status"]);
  });

  await test("11. Email is optional, but validated with regex when provided", async () => {
    // A: Omitted email passes
    const dataWithoutEmail = getValidStudentData({ email: undefined });
    const errNone = await validateDoc(new Student(dataWithoutEmail));
    assert.strictEqual(errNone, undefined, "Undefined email should pass validation");

    // B: Malformed email fails
    const dataBadEmail = getValidStudentData({ email: "not-an-email" });
    const errBad = await validateDoc(new Student(dataBadEmail));
    assert(errBad && errBad.errors["email"]);
    assert.strictEqual(errBad.errors["email"].message, "Please provide a valid email address");

    // C: Valid email passes and gets lowercased
    const dataGoodEmail = getValidStudentData({ email: "STUDENT@APEX.EDU.PK" });
    const student = new Student(dataGoodEmail);
    assert.strictEqual(await validateDoc(student), undefined);
    assert.strictEqual(student.email, "student@apex.edu.pk");
  });

  // ─── 4. Schema Indexes & Uniqueness Declarations ───────────────────────────
  console.log("\n[4] Uniqueness Protections on Schema");

  await test("12. Schema explicitly defines uniqueness on applicantId, applicationId, studentIdNumber, and rollNumber", () => {
    const studentIdPath = Student.schema.path("studentIdNumber");
    assert(studentIdPath.options.unique === true, "studentIdNumber must be unique");

    const rollNumberPath = Student.schema.path("rollNumber");
    assert(rollNumberPath.options.unique === true, "rollNumber must be unique");

    const applicantIdPath = Student.schema.path("applicantId");
    assert(applicantIdPath.options.unique === true, "applicantId must be unique");

    const applicationIdPath = Student.schema.path("applicationId");
    assert(applicationIdPath.options.unique === true, "applicationId must be unique");

    const emailPath = Student.schema.path("email");
    assert(emailPath.options.unique === true, "email must have unique constraint");
    assert(emailPath.options.sparse === true, "email must be sparse to allow missing values");
  });

  // ─── 5. Password Security & Hashing ─────────────────────────────────────────
  console.log("\n[5] Password Security & Hashing Mechanism");

  await test("13. Password is excluded by default (select: false)", () => {
    const passwordPath = Student.schema.path("password");
    assert.strictEqual(passwordPath.options.select, false, "password must have select: false");
  });

  await test("14. comparePassword method throws error when password field was not selected", async () => {
    const student = new Student(getValidStudentData());
    let threw = false;
    try {
      await student.comparePassword("SomePassword123");
    } catch (err) {
      threw = true;
      assert.strictEqual(err.message, "Password field not selected");
    }
    assert(threw, "comparePassword must throw when password is not loaded");
  });

  await test("15. comparePassword validates against bcrypt hashed passwords correctly", async () => {
    const plain = "StudentPassword123!";
    const hashed = await bcrypt.hash(plain, 10);
    const student = new Student(getValidStudentData({ password: hashed }));

    const isMatch = await student.comparePassword(plain);
    assert.strictEqual(isMatch, true, "comparePassword should return true for matching password");

    const isMismatch = await student.comparePassword("WrongPassword999");
    assert.strictEqual(isMismatch, false, "comparePassword should return false for incorrect password");
  });

  console.log("\n─────────────────────────────────────────────────────────────");
  console.log(`Student Model Results: ${passed} / ${total} passed (${total - passed} failed)`);
  console.log("─────────────────────────────────────────────────────────────\n");

  if (passed !== total) process.exit(1);
}

if (require.main === module) {
  runStudentModelTests().catch((err) => {
    console.error("Student test suite fatal error:", err);
    process.exit(1);
  });
}

module.exports = { runStudentModelTests };
