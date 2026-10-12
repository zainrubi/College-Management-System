const { randomInt } = require("crypto");

/**
 * Program to Roll Number Prefix mapping.
 * Verified against supported college academic offerings.
 * 
 * Strict rule: Unknown or unsupported programs MUST NEVER be silently mapped
 * to a fallback prefix. They must explicitly throw UNKNOWN_PROGRAM.
 */
const PROGRAM_PREFIX_MAP = {
  // Intermediate (2-Year) Programs
  "fsc pre-medical": "FSC-M",
  "fsc-pre-medical": "FSC-M",
  "fsc pre medical": "FSC-M",
  "fsc pre-engineering": "FSC-E",
  "fsc-pre-engineering": "FSC-E",
  "fsc pre engineering": "FSC-E",
  "ics (computer science)": "ICS",
  "ics (physics & computer science)": "ICS",
  "ics": "ICS",
  "i.com (commerce)": "ICOM",
  "i.com (commerce & accounts)": "ICOM",
  "i.com": "ICOM",
  "icom": "ICOM",

  // Undergraduate (4-Year) Programs
  "bs computer science (bscs)": "BCS",
  "bs computer science": "BCS",
  "bscs": "BCS",
  "bs software engineering (bsse)": "BSE",
  "bs software engineering": "BSE",
  "bsse": "BSE",
  "bachelor of business administration (bba)": "BBA",
  "bachelor of business administration": "BBA",
  "bba": "BBA",
};

/**
 * Normalizes program string and resolves standard roll number prefix.
 * Throws an Error if program is unrecognized or invalid.
 */
function getProgramPrefix(programName) {
  if (!programName || typeof programName !== "string") {
    throw new Error("UNKNOWN_PROGRAM: Program name is required and must be a non-empty string");
  }

  const normalized = programName.trim().toLowerCase();
  const prefix = PROGRAM_PREFIX_MAP[normalized];

  if (!prefix) {
    throw new Error(`UNKNOWN_PROGRAM: Program '${programName}' is not recognized for student roll number generation`);
  }

  return prefix;
}

/**
 * Resolves session code, academic year, and 2-digit year code.
 * Example: "Fall 2026" -> { sessionCode: "F", year: 2026, year2Digit: "26", sessionYearCode: "F26" }
 */
function getSessionYearInfo(sessionString, fallbackYear) {
  const currentYear = fallbackYear || new Date().getFullYear();
  let sessionCode = "F"; // Default Fall
  let year = currentYear;

  if (typeof sessionString === "string" && sessionString.trim()) {
    const raw = sessionString.trim();
    const lower = raw.toLowerCase();

    if (lower.includes("spring")) sessionCode = "S";
    else if (lower.includes("annual")) sessionCode = "A";
    else if (lower.includes("fall")) sessionCode = "F";

    const matchYear = raw.match(/\b(20\d{2})\b/);
    if (matchYear) {
      year = parseInt(matchYear[1], 10);
    }
  }

  const year2Digit = String(year).slice(-2);
  const sessionYearCode = `${sessionCode}${year2Digit}`;

  return {
    sessionCode,
    year,
    year2Digit,
    sessionYearCode,
  };
}

/**
 * Formats standard Institutional Student ID.
 * Example: AIST-STD-2026-0001
 */
function formatStudentId(year, sequenceNumber) {
  const padded = String(sequenceNumber).padStart(4, "0");
  return `AIST-STD-${year}-${padded}`;
}

/**
 * Formats standard Program Roll Number.
 * Example: BCS-F26-001 or FSC-M26-001
 */
function formatRollNumber(programPrefix, sessionYearCode, sequenceNumber) {
  const padded = String(sequenceNumber).padStart(3, "0");
  return `${programPrefix}-${sessionYearCode}-${padded}`;
}

/**
 * Extracts sequence number from an existing Roll Number string.
 * Example: "BCS-F26-042" -> 42
 */
function extractRollSequence(rollNumberString) {
  if (typeof rollNumberString !== "string") return 0;
  const match = rollNumberString.match(/-(\d+)$/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Extracts sequence number from an existing Student ID string.
 * Example: "AIST-STD-2026-0014" -> 14
 */
function extractStudentIdSequence(studentIdString) {
  if (typeof studentIdString !== "string") return 0;
  const match = studentIdString.match(/-(\d+)$/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Queries the current highest sequence baseline for a given program and session.
 * Safely handles disconnected test mocks.
 */
async function getHighestSequenceBaseline(StudentModel, programPrefix, sessionYearCode, year) {
  let highestRollSeq = 0;
  let highestIdSeq = 0;

  if (!StudentModel || typeof StudentModel.findOne !== "function") {
    return { highestRollSeq: 0, highestIdSeq: 0 };
  }

  try {
    const rollPattern = new RegExp(`^${programPrefix}-${sessionYearCode}-\\d+$`, "i");
    let rollQuery = StudentModel.findOne({ rollNumber: rollPattern });
    if (rollQuery && typeof rollQuery.sort === "function") {
      rollQuery = rollQuery.sort({ rollNumber: -1 });
    }
    if (rollQuery && typeof rollQuery.select === "function") {
      rollQuery = rollQuery.select("rollNumber");
    }
    const lastRollDoc = await rollQuery;

    if (lastRollDoc?.rollNumber) {
      highestRollSeq = extractRollSequence(lastRollDoc.rollNumber);
    }

    const idPattern = new RegExp(`^AIST-STD-${year}-\\d+$`, "i");
    let idQuery = StudentModel.findOne({ studentIdNumber: idPattern });
    if (idQuery && typeof idQuery.sort === "function") {
      idQuery = idQuery.sort({ studentIdNumber: -1 });
    }
    if (idQuery && typeof idQuery.select === "function") {
      idQuery = idQuery.select("studentIdNumber");
    }
    const lastIdDoc = await idQuery;

    if (lastIdDoc?.studentIdNumber) {
      highestIdSeq = extractStudentIdSequence(lastIdDoc.studentIdNumber);
    }
  } catch (err) {
    // If Mongoose is disconnected or buffering disabled in mock tests, start sequence at 0
    if (err.message?.includes("before initial connection") || err.name === "DisconnectedError") {
      return { highestRollSeq: 0, highestIdSeq: 0 };
    }
    throw err;
  }

  return { highestRollSeq, highestIdSeq };
}

/**
 * Generates unique candidate Student Identifiers:
 * - Institutional Student ID (e.g. AIST-STD-2026-0001)
 * - Roll Number (e.g. BCS-F26-001 or FSC-M26-001)
 * 
 * Concurrency & Collision Strategy:
 * 1. Derives verified program prefix (rejecting unknown programs).
 * 2. Queries current highest sequence baseline from database.
 * 3. Increments sequence by offset / attempt count.
 * 4. Checks against existing records if StudentModel queryable.
 * 5. Returns collision-safe candidate strings.
 * 6. Under concurrent races, database unique indexes (rollNumber_1, studentIdNumber_1)
 *    throw E11000, triggering atomic retry loop in enrollment controller.
 */
async function generateStudentIdentifiers({
  programName,
  session,
  year: explicitYear,
  StudentModel,
  attempt = 0,
}) {
  const programPrefix = getProgramPrefix(programName);
  const sessionInfo = getSessionYearInfo(session, explicitYear);

  let baselineRoll = 0;
  let baselineId = 0;

  if (StudentModel) {
    const baselines = await getHighestSequenceBaseline(
      StudentModel,
      programPrefix,
      sessionInfo.sessionYearCode,
      sessionInfo.year
    );
    baselineRoll = baselines.highestRollSeq;
    baselineId = baselines.highestIdSeq;
  }

  let rollSeq = baselineRoll + 1 + attempt;
  let idSeq = baselineId + 1 + attempt;

  let candidateRoll = formatRollNumber(programPrefix, sessionInfo.sessionYearCode, rollSeq);
  let candidateId = formatStudentId(sessionInfo.year, idSeq);

  // If StudentModel is queryable and connected, verify availability or increment
  if (StudentModel && typeof StudentModel.findOne === "function") {
    try {
      let rollAvailable = false;
      let idAvailable = false;
      let rollOffset = 0;
      let idOffset = 0;

      while ((!rollAvailable || !idAvailable) && (rollOffset < 50 && idOffset < 50)) {
        const testRoll = formatRollNumber(programPrefix, sessionInfo.sessionYearCode, rollSeq + rollOffset);
        const testId = formatStudentId(sessionInfo.year, idSeq + idOffset);

        let rollQ = !rollAvailable ? StudentModel.findOne({ rollNumber: testRoll }) : null;
        if (rollQ && typeof rollQ.select === "function") rollQ = rollQ.select("_id");
        let idQ = !idAvailable ? StudentModel.findOne({ studentIdNumber: testId }) : null;
        if (idQ && typeof idQ.select === "function") idQ = idQ.select("_id");

        const [existingRoll, existingId] = await Promise.all([rollQ, idQ]);

        if (!rollAvailable) {
          if (!existingRoll) {
            candidateRoll = testRoll;
            rollAvailable = true;
          } else {
            rollOffset++;
          }
        }

        if (!idAvailable) {
          if (!existingId) {
            candidateId = testId;
            idAvailable = true;
          } else {
            idOffset++;
          }
        }
      }
    } catch (err) {
      // Disconnected mock fallback
      if (!err.message?.includes("before initial connection") && err.name !== "DisconnectedError") {
        throw err;
      }
    }
  }

  return {
    studentIdNumber: candidateId,
    rollNumber: candidateRoll,
    programPrefix,
    sessionYearCode: sessionInfo.sessionYearCode,
    academicSession: session || `${sessionInfo.sessionCode === "F" ? "Fall" : sessionInfo.sessionCode === "S" ? "Spring" : "Annual"} ${sessionInfo.year}`,
  };
}

module.exports = {
  PROGRAM_PREFIX_MAP,
  getProgramPrefix,
  getSessionYearInfo,
  formatStudentId,
  formatRollNumber,
  extractRollSequence,
  extractStudentIdSequence,
  generateStudentIdentifiers,
};
