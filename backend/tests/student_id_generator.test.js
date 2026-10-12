const assert = require("assert");
const {
  PROGRAM_PREFIX_MAP,
  getProgramPrefix,
  getSessionYearInfo,
  formatStudentId,
  formatRollNumber,
  extractRollSequence,
  extractStudentIdSequence,
  generateStudentIdentifiers,
} = require("../utils/studentIdGenerator");

async function runStudentIdGeneratorTests() {
  console.log("─────────────────────────────────────────────────────────────");
  console.log("Running Student ID & Roll Number Generator Test Suite");
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

  // ─── 1. Supported Program Prefix Resolution ──────────────────────────────────
  console.log("[1] Supported Program Mapping");

  await test("1. Maps all supported Intermediate programs to correct prefixes", () => {
    assert.strictEqual(getProgramPrefix("FSc Pre-Medical"), "FSC-M");
    assert.strictEqual(getProgramPrefix("fsc pre-medical"), "FSC-M");
    assert.strictEqual(getProgramPrefix("FSc Pre-Engineering"), "FSC-E");
    assert.strictEqual(getProgramPrefix("fsc pre-engineering"), "FSC-E");
    assert.strictEqual(getProgramPrefix("ICS (Computer Science)"), "ICS");
    assert.strictEqual(getProgramPrefix("ICS (Physics & Computer Science)"), "ICS");
    assert.strictEqual(getProgramPrefix("ICS"), "ICS");
    assert.strictEqual(getProgramPrefix("I.Com (Commerce)"), "ICOM");
    assert.strictEqual(getProgramPrefix("I.Com"), "ICOM");
    assert.strictEqual(getProgramPrefix("ICOM"), "ICOM");
  });

  await test("2. Maps all supported Undergraduate programs to correct prefixes", () => {
    assert.strictEqual(getProgramPrefix("BS Computer Science"), "BCS");
    assert.strictEqual(getProgramPrefix("BS Computer Science (BSCS)"), "BCS");
    assert.strictEqual(getProgramPrefix("BSCS"), "BCS");
    assert.strictEqual(getProgramPrefix("BS Software Engineering"), "BSE");
    assert.strictEqual(getProgramPrefix("BS Software Engineering (BSSE)"), "BSE");
    assert.strictEqual(getProgramPrefix("BSSE"), "BSE");
    assert.strictEqual(getProgramPrefix("Bachelor of Business Administration"), "BBA");
    assert.strictEqual(getProgramPrefix("Bachelor of Business Administration (BBA)"), "BBA");
    assert.strictEqual(getProgramPrefix("BBA"), "BBA");
  });

  // ─── 2. Unknown Program Rejection ──────────────────────────────────────────
  console.log("\n[2] Unknown & Invalid Program Rejection");

  await test("3. Rejects unknown programs with explicit UNKNOWN_PROGRAM error", () => {
    const invalidPrograms = [
      "Aviation Management",
      "BS Artificial Intelligence",
      "MBBS",
      "General Arts",
      "Random Nonexistent Course",
    ];

    for (const prog of invalidPrograms) {
      assert.throws(
        () => getProgramPrefix(prog),
        (err) => err.message.startsWith("UNKNOWN_PROGRAM"),
        `Expected UNKNOWN_PROGRAM error for '${prog}'`
      );
    }
  });

  await test("4. Rejects empty, non-string, or undefined program values", () => {
    assert.throws(() => getProgramPrefix(""), /UNKNOWN_PROGRAM/);
    assert.throws(() => getProgramPrefix("   "), /UNKNOWN_PROGRAM/);
    assert.throws(() => getProgramPrefix(null), /UNKNOWN_PROGRAM/);
    assert.throws(() => getProgramPrefix(undefined), /UNKNOWN_PROGRAM/);
    assert.throws(() => getProgramPrefix(12345), /UNKNOWN_PROGRAM/);
  });

  // ─── 3. Session & Year Parsing ─────────────────────────────────────────────
  console.log("\n[3] Session & Academic Year Derivation");

  await test("5. Derives session code and 2-digit year correctly", () => {
    const fall2026 = getSessionYearInfo("Fall 2026");
    assert.strictEqual(fall2026.sessionCode, "F");
    assert.strictEqual(fall2026.year, 2026);
    assert.strictEqual(fall2026.year2Digit, "26");
    assert.strictEqual(fall2026.sessionYearCode, "F26");

    const spring2025 = getSessionYearInfo("Spring 2025");
    assert.strictEqual(spring2025.sessionCode, "S");
    assert.strictEqual(spring2025.year, 2025);
    assert.strictEqual(spring2025.sessionYearCode, "S25");

    const annual2026 = getSessionYearInfo("Annual 2026");
    assert.strictEqual(annual2026.sessionCode, "A");
    assert.strictEqual(annual2026.year, 2026);
    assert.strictEqual(annual2026.sessionYearCode, "A26");

    const omitted = getSessionYearInfo(undefined, 2026);
    assert.strictEqual(omitted.sessionCode, "F");
    assert.strictEqual(omitted.year, 2026);
    assert.strictEqual(omitted.sessionYearCode, "F26");
  });

  // ─── 4. Identifier Formatting & Sequence Extraction ────────────────────────
  console.log("\n[4] Identifier Formatting & Sequence Extraction");

  await test("6. Formats institutional student ID and program roll number per spec", () => {
    assert.strictEqual(formatStudentId(2026, 1), "AIST-STD-2026-0001");
    assert.strictEqual(formatStudentId(2026, 42), "AIST-STD-2026-0042");
    assert.strictEqual(formatStudentId(2026, 1250), "AIST-STD-2026-1250");

    assert.strictEqual(formatRollNumber("BCS", "F26", 1), "BCS-F26-001");
    assert.strictEqual(formatRollNumber("BCS", "F26", 14), "BCS-F26-014");
    assert.strictEqual(formatRollNumber("FSC-M", "F26", 1), "FSC-M-F26-001");
    assert.strictEqual(formatRollNumber("BBA", "F26", 45), "BBA-F26-045");
  });

  await test("7. Correctly extracts sequence numbers from existing strings", () => {
    assert.strictEqual(extractRollSequence("BCS-F26-014"), 14);
    assert.strictEqual(extractRollSequence("FSC-M-F26-001"), 1);
    assert.strictEqual(extractRollSequence("BBA-F25-045"), 45);
    assert.strictEqual(extractStudentIdSequence("AIST-STD-2026-0001"), 1);
    assert.strictEqual(extractStudentIdSequence("AIST-STD-2026-0105"), 105);
    assert.strictEqual(extractRollSequence(null), 0);
  });

  // ─── 5. Generator Function & Collision Avoidance ───────────────────────────
  console.log("\n[5] Identifier Generation with Mock Baseline & Collision Avoidance");

  await test("8. Generates initial candidate identifiers when no existing records exist", async () => {
    const result = await generateStudentIdentifiers({
      programName: "BS Computer Science",
      session: "Fall 2026",
    });

    assert.strictEqual(result.studentIdNumber, "AIST-STD-2026-0001");
    assert.strictEqual(result.rollNumber, "BCS-F26-001");
    assert.strictEqual(result.programPrefix, "BCS");
    assert.strictEqual(result.sessionYearCode, "F26");
  });

  await test("9. Increments sequence past existing baseline records", async () => {
    const mockStudentModel = {
      findOne: (query) => {
        const queryObj = {
          sort: () => queryObj,
          select: () => queryObj,
          then: (resolve) => {
            if (query.rollNumber) {
              return resolve({ rollNumber: "BCS-F26-007" });
            }
            if (query.studentIdNumber) {
              return resolve({ studentIdNumber: "AIST-STD-2026-0012" });
            }
            return resolve(null);
          },
        };
        return queryObj;
      },
    };

    const result = await generateStudentIdentifiers({
      programName: "BS Computer Science",
      session: "Fall 2026",
      StudentModel: mockStudentModel,
    });

    assert.strictEqual(result.rollNumber, "BCS-F26-008");
    assert.strictEqual(result.studentIdNumber, "AIST-STD-2026-0013");
  });

  await test("10. Advances candidate sequence when specific candidate collides", async () => {
    const occupiedRolls = new Set(["FSC-M-F26-001", "FSC-M-F26-002"]);
    const occupiedIds = new Set(["AIST-STD-2026-0001"]);

    const mockStudentModel = {
      findOne: (query) => {
        const queryObj = {
          sort: () => queryObj,
          select: () => queryObj,
          then: (resolve) => {
            // Baseline RegExp query returns null (sequence starts at 0)
            if (query.rollNumber instanceof RegExp || query.studentIdNumber instanceof RegExp) {
              return resolve(null);
            }
            // Availability direct check
            if (query.rollNumber && occupiedRolls.has(query.rollNumber)) {
              return resolve({ _id: "occupied-roll" });
            }
            if (query.studentIdNumber && occupiedIds.has(query.studentIdNumber)) {
              return resolve({ _id: "occupied-id" });
            }
            return resolve(null);
          },
        };
        return queryObj;
      },
    };

    const result = await generateStudentIdentifiers({
      programName: "FSc Pre-Medical",
      session: "Fall 2026",
      StudentModel: mockStudentModel,
    });

    // Should skip occupied 001 and 002 for roll number, and 0001 for ID
    assert.strictEqual(result.rollNumber, "FSC-M-F26-003");
    assert.strictEqual(result.studentIdNumber, "AIST-STD-2026-0002");
  });

  console.log("\n─────────────────────────────────────────────────────────────");
  console.log(`Student ID Generator Results: ${passed} / ${total} passed (${total - passed} failed)`);
  console.log("─────────────────────────────────────────────────────────────\n");

  if (passed !== total) process.exit(1);
}

if (require.main === module) {
  runStudentIdGeneratorTests().catch((err) => {
    console.error("Student ID generator test fatal error:", err);
    process.exit(1);
  });
}

module.exports = { runStudentIdGeneratorTests };
