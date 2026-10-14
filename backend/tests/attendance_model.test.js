const assert = require("assert");
const mongoose = require("mongoose");
const Attendance = require("../models/Attendance");

function getValidAttendanceData(overrides = {}) {
  const dummyStudentId = new mongoose.Types.ObjectId();
  const testDate = new Date("2026-10-12T09:00:00.000Z");

  return {
    studentId: dummyStudentId,
    studentRollNumber: "BCS-F26-014",
    studentName: "Ali Hasan Siddiqui",
    courseId: "crs-cs101",
    courseCode: "CS-101",
    courseTitle: "Programming Fundamentals",
    date: testDate,
    status: "present",
    remarks: "Active classroom participation",
    academicSession: "Fall 2026",
    markedByTeacherName: "Dr. Muhammad Shahbaz",
    ...overrides,
  };
}

async function validateDoc(doc) {
  try {
    await doc.validate();
    return undefined;
  } catch (err) {
    return err;
  }
}

async function runAttendanceModelTests() {
  console.log("─────────────────────────────────────────────────────────────");
  console.log("Running Attendance Model & Schema Test Suite (Step 7.4 Task 2)");
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

  // ─── 1. Document Instantiation & Default Value Handling ───────────────────
  console.log("[1] Valid Instantiation & Default Value Handling");

  await test("1. Complete valid attendance record validates successfully in-memory", async () => {
    const data = getValidAttendanceData();
    const doc = new Attendance(data);
    const err = await validateDoc(doc);
    assert.strictEqual(err, undefined, "Expected no validation errors for valid record");
    assert.strictEqual(doc.studentRollNumber, "BCS-F26-014");
    assert.strictEqual(doc.courseCode, "CS-101");
    assert.strictEqual(doc.status, "present");
    assert.strictEqual(doc.remarks, "Active classroom participation");
  });

  await test("2. Default values populate when optional fields are omitted", async () => {
    const minimalData = {
      studentId: new mongoose.Types.ObjectId(),
      studentRollNumber: "BBA-F26-005",
      studentName: "Mahnoor Tariq",
      courseCode: "MGT-201",
      courseTitle: "Principles of Management",
      date: new Date("2026-10-13T10:00:00.000Z"),
      status: "present",
    };

    const doc = new Attendance(minimalData);
    const err = await validateDoc(doc);
    assert.strictEqual(err, undefined, "Expected no validation errors for minimal record");
    assert.strictEqual(doc.courseId, "", "Default courseId should be empty string");
    assert.strictEqual(doc.remarks, "", "Default remarks should be empty string");
    assert.strictEqual(doc.academicSession, "", "Default academicSession should be empty string");
    assert.strictEqual(doc.markedByTeacherName, "", "Default markedByTeacherName should be empty string");
  });

  await test("3. Accepts all approved status enum values ('present', 'absent', 'late', 'leave')", async () => {
    const allowedStatuses = ["present", "absent", "late", "leave"];
    for (const st of allowedStatuses) {
      const doc = new Attendance(getValidAttendanceData({ status: st }));
      const err = await validateDoc(doc);
      assert.strictEqual(err, undefined, `Expected status '${st}' to be valid`);
      assert.strictEqual(doc.status, st);
    }
  });

  // ─── 2. Required Fields Validation ─────────────────────────────────────────
  console.log("\n[2] Required Fields Validation");

  await test("4. Rejects missing studentId", async () => {
    const doc = new Attendance(getValidAttendanceData({ studentId: undefined }));
    const err = await validateDoc(doc);
    assert(err && err.errors && err.errors.studentId, "Validation error expected on studentId");
    assert.strictEqual(err.errors.studentId.message, "Student reference is required");
  });

  await test("5. Rejects missing studentRollNumber", async () => {
    const doc = new Attendance(getValidAttendanceData({ studentRollNumber: undefined }));
    const err = await validateDoc(doc);
    assert(err && err.errors && err.errors.studentRollNumber, "Validation error expected on studentRollNumber");
    assert.strictEqual(err.errors.studentRollNumber.message, "Student roll number is required");
  });

  await test("6. Rejects missing studentName", async () => {
    const doc = new Attendance(getValidAttendanceData({ studentName: undefined }));
    const err = await validateDoc(doc);
    assert(err && err.errors && err.errors.studentName, "Validation error expected on studentName");
    assert.strictEqual(err.errors.studentName.message, "Student name is required");
  });

  await test("7. Rejects missing courseCode", async () => {
    const doc = new Attendance(getValidAttendanceData({ courseCode: undefined }));
    const err = await validateDoc(doc);
    assert(err && err.errors && err.errors.courseCode, "Validation error expected on courseCode");
    assert.strictEqual(err.errors.courseCode.message, "Course code is required");
  });

  await test("8. Rejects missing courseTitle", async () => {
    const doc = new Attendance(getValidAttendanceData({ courseTitle: undefined }));
    const err = await validateDoc(doc);
    assert(err && err.errors && err.errors.courseTitle, "Validation error expected on courseTitle");
    assert.strictEqual(err.errors.courseTitle.message, "Course title is required");
  });

  await test("9. Rejects missing date", async () => {
    const doc = new Attendance(getValidAttendanceData({ date: undefined }));
    const err = await validateDoc(doc);
    assert(err && err.errors && err.errors.date, "Validation error expected on date");
    assert.strictEqual(err.errors.date.message, "Attendance date is required");
  });

  await test("10. Rejects missing status", async () => {
    const doc = new Attendance(getValidAttendanceData({ status: undefined }));
    const err = await validateDoc(doc);
    assert(err && err.errors && err.errors.status, "Validation error expected on status");
    assert.strictEqual(err.errors.status.message, "Attendance status is required");
  });

  // ─── 3. Enum & Reference Integrity ─────────────────────────────────────────
  console.log("\n[3] Enum & Reference Type Validation");

  await test("11. Rejects invalid status values (e.g. 'half-day', 'excused', 'unknown')", async () => {
    const invalidStatuses = ["half-day", "excused", "unknown", "sick", "cancelled"];
    for (const badStatus of invalidStatuses) {
      const doc = new Attendance(getValidAttendanceData({ status: badStatus }));
      const err = await validateDoc(doc);
      assert(err && err.errors && err.errors.status, `Expected error for invalid status '${badStatus}'`);
      assert(
        err.errors.status.message.includes("Status must be present, absent, late, or leave"),
        `Unexpected error message: ${err.errors.status.message}`
      );
    }
  });

  await test("12. Rejects invalid studentId reference types", async () => {
    const doc = new Attendance(getValidAttendanceData({ studentId: "not-a-valid-object-id" }));
    const err = await validateDoc(doc);
    assert(err && err.errors && err.errors.studentId, "Expected CastError on invalid studentId");
    assert.strictEqual(err.errors.studentId.name, "CastError");
  });

  // ─── 4. Trimming & Uppercasing Transformations ─────────────────────────────
  console.log("\n[4] Trimming & Uppercasing Transformations");

  await test("13. studentRollNumber and courseCode are automatically trimmed and uppercased", async () => {
    const doc = new Attendance(
      getValidAttendanceData({
        studentRollNumber: "   bcs-f26-099   ",
        courseCode: "   cs-201   ",
      })
    );
    assert.strictEqual(doc.studentRollNumber, "BCS-F26-099");
    assert.strictEqual(doc.courseCode, "CS-201");
  });

  await test("14. String fields (studentName, courseTitle, remarks, session, teacher) are trimmed", async () => {
    const doc = new Attendance(
      getValidAttendanceData({
        studentName: "   Usman Ghani   ",
        courseTitle: "   Data Structures & Algorithms   ",
        remarks: "   Medical documentation verified   ",
        academicSession: "   Fall 2026   ",
        markedByTeacherName: "   Prof. Saima Malik   ",
      })
    );
    assert.strictEqual(doc.studentName, "Usman Ghani");
    assert.strictEqual(doc.courseTitle, "Data Structures & Algorithms");
    assert.strictEqual(doc.remarks, "Medical documentation verified");
    assert.strictEqual(doc.academicSession, "Fall 2026");
    assert.strictEqual(doc.markedByTeacherName, "Prof. Saima Malik");
  });

  // ─── 5. Length Constraints ─────────────────────────────────────────────────
  console.log("\n[5] Field Length Constraints");

  await test("15. Accepts remarks up to 250 characters", async () => {
    const exact250 = "A".repeat(250);
    const doc = new Attendance(getValidAttendanceData({ remarks: exact250 }));
    const err = await validateDoc(doc);
    assert.strictEqual(err, undefined, "Expected 250 characters remarks to be valid");
    assert.strictEqual(doc.remarks.length, 250);
  });

  await test("16. Rejects remarks exceeding 250 characters", async () => {
    const tooLong251 = "A".repeat(251);
    const doc = new Attendance(getValidAttendanceData({ remarks: tooLong251 }));
    const err = await validateDoc(doc);
    assert(err && err.errors && err.errors.remarks, "Expected validation error for remarks > 250 chars");
    assert.strictEqual(err.errors.remarks.message, "Remarks cannot exceed 250 characters");
  });

  // ─── 6. Schema Indexes & Architecture Conformity ───────────────────────────
  console.log("\n[6] Index Definitions & Architecture Conformity");

  await test("17. Schema paths and index configurations match architectural spec", async () => {
    const stdIdPath = Attendance.schema.path("studentId");
    assert.strictEqual(stdIdPath.options.index, true, "studentId must have field-level index");
    assert.strictEqual(stdIdPath.options.ref, "Student", "studentId must reference Student model");

    const rollPath = Attendance.schema.path("studentRollNumber");
    assert.strictEqual(rollPath.options.trim, true, "studentRollNumber must be trimmed");
    assert.strictEqual(rollPath.options.uppercase, true, "studentRollNumber must be uppercase");

    const codePath = Attendance.schema.path("courseCode");
    assert.strictEqual(codePath.options.trim, true, "courseCode must be trimmed");
    assert.strictEqual(codePath.options.uppercase, true, "courseCode must be uppercase");

    assert.strictEqual(Attendance.schema.options.timestamps, true, "Timestamps must be enabled");
  });

  await test("18. Compound indexes are properly registered for student queries", async () => {
    const indexes = Attendance.schema.indexes();

    const hasStudentDateIndex = indexes.some(
      ([fields]) => fields.studentId === 1 && fields.date === -1
    );
    assert.strictEqual(hasStudentDateIndex, true, "Compound index { studentId: 1, date: -1 } must exist");

    const hasStudentCourseIndex = indexes.some(
      ([fields]) => fields.studentId === 1 && fields.courseCode === 1
    );
    assert.strictEqual(hasStudentCourseIndex, true, "Compound index { studentId: 1, courseCode: 1 } must exist");
  });

  console.log("\n─────────────────────────────────────────────────────────────");
  console.log(`Attendance Model Results: ${passed} / ${total} passed (${total - passed} failed)`);
  console.log("─────────────────────────────────────────────────────────────\n");

  if (passed !== total) process.exit(1);
}

if (require.main === module) {
  runAttendanceModelTests().catch((err) => {
    console.error("Attendance test suite fatal error:", err);
    process.exit(1);
  });
}

module.exports = { runAttendanceModelTests };
