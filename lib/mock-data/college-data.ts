import { College, AcademicSession, Department, Program, Course } from "@/types";

export const MOCK_COLLEGE: College = {
  id: "clg-001",
  name: "Superior Colleges",
  code: "SC",
  tagline: "Empowering Students Through Excellence, Character & Opportunity",
  logoUrl: "/logo.png",
  address: "Kanganpur Campus, Main Boulevard",
  city: "Kanganpur",
  province: "Punjab",
  contactEmail: "admissions@superiorcolleges.edu.pk",
  contactPhone: "+92 300 1234567",
  website: "https://superiorcolleges.edu.pk",
  establishedYear: 2004,
};

export const MOCK_COLLEGE_STATS = [
  { label: "Years of Excellence", value: 22, icon: "📚" },
  { label: "Faculty Members", value: 150, icon: "👨‍🏫" },
  { label: "Active Students", value: 2800, icon: "👥" },
  { label: "Academic Programs", value: 5, icon: "🎓" },
];

export const MOCK_WHY_CHOOSE_US = [
  {
    id: 1,
    title: "Academic Excellence",
    description: "HEC and BISE recognized programs with proven track record of producing competitive graduates.",
    icon: "🏆",
  },
  {
    id: 2,
    title: "Modern Infrastructure",
    description: "State-of-the-art computer labs, science laboratories, and digital learning facilities.",
    icon: "🔬",
  },
  {
    id: 3,
    title: "Experienced Faculty",
    description: "Qualified professors with industry experience committed to student success.",
    icon: "👨‍💼",
  },
  {
    id: 4,
    title: "Holistic Development",
    description: "Focus on character building alongside academic and professional growth.",
    icon: "⭐",
  },
  {
    id: 5,
    title: "Career Support",
    description: "Internship programs, industry connections, and career counseling services.",
    icon: "💼",
  },
  {
    id: 6,
    title: "Student Community",
    description: "Vibrant campus life with clubs, sports, and cultural activities.",
    icon: "🎭",
  },
];

export const MOCK_FACILITIES = [
  {
    id: 1,
    name: "Computer Labs",
    description: "Modern computer labs with latest software and high-speed internet connectivity.",
    icon: "💻",
  },
  {
    id: 2,
    name: "Science Laboratories",
    description: "Well-equipped Physics, Chemistry, and Biology labs for hands-on learning.",
    icon: "🧪",
  },
  {
    id: 3,
    name: "Digital Library",
    description: "Extensive collection of books, journals, and online research databases.",
    icon: "📖",
  },
  {
    id: 4,
    name: "Sports Facilities",
    description: "Cricket ground, basketball court, and indoor sports complex.",
    icon: "⚽",
  },
  {
    id: 5,
    name: "Smart Classrooms",
    description: "Interactive teaching spaces equipped with multimedia and digital learning tools.",
    icon: "🎓",
  },
  {
    id: 6,
    name: "Student Cafeteria",
    description: "Modern cafeteria with nutritious and affordable meal options.",
    icon: "🍽️",
  },
];

export const MOCK_ACTIVITIES = [
  {
    id: 1,
    name: "Debate & Public Speaking",
    description: "Annual debate competition developing communication and critical thinking.",
    category: "Academic",
  },
  {
    id: 2,
    name: "Science Fair",
    description: "Student research projects and innovations in science and technology.",
    category: "Academic",
  },
  {
    id: 3,
    name: "Sports Day",
    description: "Inter-college competitions fostering teamwork and athletic excellence.",
    category: "Sports",
  },
  {
    id: 4,
    name: "Cultural Festival",
    description: "Celebration of diverse cultures through music, dance, and performances.",
    category: "Cultural",
  },
  {
    id: 5,
    name: "Community Service",
    description: "Regular outreach programs and social responsibility initiatives.",
    category: "Service",
  },
  {
    id: 6,
    name: "Entrepreneurship Club",
    description: "Mentorship and support for student-led business ventures and startups.",
    category: "Career",
  },
];

export const MOCK_SESSIONS: AcademicSession[] = [
  {
    id: "sess-2026-fall",
    name: "Fall 2026",
    code: "FALL-26",
    startDate: "2026-09-01",
    endDate: "2027-01-31",
    isCurrent: true,
  },
  {
    id: "sess-2026-spring",
    name: "Spring 2026",
    code: "SPR-26",
    startDate: "2026-02-01",
    endDate: "2026-06-30",
    isCurrent: false,
  },
  {
    id: "sess-2025-annual",
    name: "Annual Session 2025-2027",
    code: "ANN-25-27",
    startDate: "2025-08-15",
    endDate: "2027-06-15",
    isCurrent: true,
  },
];

export const MOCK_DEPARTMENTS: Department[] = [
  {
    id: "dept-cs",
    name: "Department of Computer Science & IT",
    code: "CS-IT",
    headOfDepartment: "Dr. Tariq Mahmood",
    description: "Offering cutting-edge education in Software Engineering, AI, and Cybersecurity.",
    programsCount: 3,
  },
  {
    id: "dept-bus",
    name: "Faculty of Management Sciences",
    code: "FMS",
    headOfDepartment: "Prof. Aisha Rehman",
    description: "Preparing future corporate leaders, entrepreneurs, and finance specialists.",
    programsCount: 2,
  },
  {
    id: "dept-pre-eng",
    name: "Faculty of Intermediate Sciences",
    code: "FIS",
    headOfDepartment: "Prof. Muhammad Usman",
    description: "FSc Pre-Engineering and ICS programs affiliated with BISE Lahore.",
    programsCount: 2,
  },
];

export const MOCK_PROGRAMS: Program[] = [
  {
    id: "prog-bs-cs",
    departmentId: "dept-cs",
    name: "BS Computer Science",
    code: "BSCS",
    level: "undergraduate",
    durationYears: 4,
    totalSemestersOrYears: 8,
    description: "4-Year degree accredited by HEC and NCEAC focusing on Software Engineering, Data Science, and Systems Development.",
    eligibilityCriteria: "FSc Pre-Engineering / ICS / A-Levels with Mathematics (Min 50% Marks).",
    annualFeePKR: 180000,
  },
  {
    id: "prog-bs-se",
    departmentId: "dept-cs",
    name: "BS Software Engineering",
    code: "BSSE",
    level: "undergraduate",
    durationYears: 4,
    totalSemestersOrYears: 8,
    description: "Comprehensive program covering modern software architecture, web development, cloud computing, and DevOps.",
    eligibilityCriteria: "FSc Pre-Engineering / ICS / A-Levels (Min 50% Marks).",
    annualFeePKR: 190000,
  },
  {
    id: "prog-bba",
    departmentId: "dept-bus",
    name: "Bachelor of Business Administration (BBA)",
    code: "BBA",
    level: "undergraduate",
    durationYears: 4,
    totalSemestersOrYears: 8,
    description: "Dynamic business curriculum with specializations in Finance, Marketing, Supply Chain, and HR.",
    eligibilityCriteria: "Intermediate (FA/FSc/ICom) or A-Levels (Min 45% Marks).",
    annualFeePKR: 165000,
  },
  {
    id: "prog-fsc-eng",
    departmentId: "dept-pre-eng",
    name: "FSc Pre-Engineering",
    code: "FSC-ENG",
    level: "intermediate",
    durationYears: 2,
    totalSemestersOrYears: 2,
    description: "Higher secondary program covering Physics, Chemistry, and Mathematics registered with BISE Lahore.",
    eligibilityCriteria: "Matriculation / O-Levels Science Group (Min 60% Marks).",
    annualFeePKR: 95000,
  },
  {
    id: "prog-ics",
    departmentId: "dept-pre-eng",
    name: "ICS (Physics/Stats & Comp. Sci.)",
    code: "ICS",
    level: "intermediate",
    durationYears: 2,
    totalSemestersOrYears: 2,
    description: "Intermediate in Computer Science for aspiring software and tech enthusiasts.",
    eligibilityCriteria: "Matriculation / O-Levels (Min 55% Marks).",
    annualFeePKR: 90000,
  },
];

export const MOCK_COURSES: Course[] = [
  {
    id: "crs-cs101",
    departmentId: "dept-cs",
    programId: "prog-bs-cs",
    code: "CS-101",
    title: "Programming Fundamentals",
    creditHours: 4,
    semester: 1,
    description: "Introduction to algorithmic thinking, C++ syntax, loops, arrays, and functions.",
    teacherId: "tch-101",
  },
  {
    id: "crs-cs102",
    departmentId: "dept-cs",
    programId: "prog-bs-cs",
    code: "CS-102",
    title: "Object Oriented Programming",
    creditHours: 4,
    semester: 2,
    description: "Classes, objects, inheritance, polymorphism, and memory management in C++ and Java.",
    teacherId: "tch-101",
  },
  {
    id: "crs-mgt201",
    departmentId: "dept-bus",
    programId: "prog-bba",
    code: "MGT-201",
    title: "Principles of Management",
    creditHours: 3,
    semester: 1,
    description: "Organizational behavior, strategic planning, leadership, and operational management.",
    teacherId: "tch-102",
  },
  {
    id: "crs-phy101",
    departmentId: "dept-pre-eng",
    programId: "prog-fsc-eng",
    code: "PHY-11",
    title: "Physics Part-I",
    creditHours: 3,
    semester: 1,
    description: "Mechanics, waves, thermodynamics, and physical optics for FSc 1st Year.",
    teacherId: "tch-103",
  },
];
