"use client";

import React, { useState } from "react";
import { UserRole } from "@/types";
import {
  MOCK_COLLEGE,
  MOCK_PROGRAMS,
  MOCK_FEE_VOUCHERS,
  MOCK_STUDENTS,
  MOCK_APPLICANTS,
} from "@/lib/mock-data";
import { formatPKR, formatDate, getStatusBadgeVariant } from "@/lib/utils";
import {
  PublicLayout,
  AdminLayout,
  TeacherLayout,
  StudentLayout,
  ApplicantLayout,
} from "@/components/layouts";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  Input,
  Select,
  FormField,
  Modal,
  ConfirmationDialog,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Alert,
  StatCard,
} from "@/components/ui";
import {
  Sparkles,
  GraduationCap,
  Users,
  Receipt,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
} from "lucide-react";

export function FoundationShowcase() {
  const [activeRole, setActiveRole] = useState<UserRole>("public_visitor");
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // Demonstration content renderer for active role layout
  const renderRoleContent = () => {
    switch (activeRole) {
      case "public_visitor":
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
            {/* Hero Section */}
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <Badge variant="secondary" size="md">
                Official Campus Portal • Est. {MOCK_COLLEGE.establishedYear}
              </Badge>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                {MOCK_COLLEGE.name}
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                {MOCK_COLLEGE.tagline}
              </p>
              <div className="flex items-center justify-center gap-4 pt-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setActiveRole("applicant")}
                >
                  Apply for Admission
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setActiveRole("student")}
                >
                  Student Portal Login
                </Button>
              </div>
            </div>

            {/* Academic Programs Grid */}
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Featured Academic Programs
                </h2>
                <p className="text-sm text-slate-500">
                  Degree & Higher Secondary certifications accredited by HEC and BISE Lahore.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {MOCK_PROGRAMS.map((prog) => (
                  <Card key={prog.id} className="flex flex-col justify-between">
                    <CardHeader>
                      <Badge variant="info" className="w-fit">
                        {prog.level}
                      </Badge>
                      <CardTitle className="mt-2">{prog.name}</CardTitle>
                      <CardDescription>{prog.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-0 text-xs text-slate-600 dark:text-slate-300">
                      <div>
                        <strong>Duration:</strong> {prog.durationYears} Years ({prog.totalSemestersOrYears} Semesters)
                      </div>
                      <div>
                        <strong>Eligibility:</strong> {prog.eligibilityCriteria}
                      </div>
                      <div className="pt-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                        {formatPKR(prog.annualFeePKR)} / Year
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => setActiveRole("applicant")}
                      >
                        Apply for {prog.code}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        );

      case "applicant":
        return (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Admission Registration Form Demo</CardTitle>
                <CardDescription>
                  Demonstrating form primitives and fields for applicant onboarding.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Full Name" required>
                    <Input placeholder="e.g. Hamza Ahmed Khan" defaultValue="Hamza Ahmed Khan" />
                  </FormField>

                  <FormField label="CNIC / B-Form Number" required>
                    <Input placeholder="35202-XXXXXXX-X" defaultValue="35202-1234567-1" />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Email Address" required>
                    <Input type="email" placeholder="student@gmail.com" defaultValue="hamza.khan@gmail.com" />
                  </FormField>

                  <FormField label="Mobile Phone" required>
                    <Input placeholder="+92 300 XXXXXXX" defaultValue="+92 300 1234567" />
                  </FormField>
                </div>

                <FormField label="Select Desired Program" required>
                  <Select
                    options={MOCK_PROGRAMS.map((p) => ({
                      value: p.id,
                      label: `${p.name} (${formatPKR(p.annualFeePKR)}/yr)`,
                    }))}
                  />
                </FormField>
              </CardContent>
              <CardFooter>
                <Button variant="primary" onClick={() => setModalOpen(true)}>
                  Submit Application
                </Button>
              </CardFooter>
            </Card>

            {/* Applicant Submissions Table */}
            <Card>
              <CardHeader>
                <CardTitle>Registered Applications Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>App No.</TableHead>
                      <TableHead>Applicant Name</TableHead>
                      <TableHead>Program</TableHead>
                      <TableHead>Marks %</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_APPLICANTS.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-semibold">{app.applicationNumber}</TableCell>
                        <TableCell>{app.fullName}</TableCell>
                        <TableCell>{app.desiredProgramName}</TableCell>
                        <TableCell>{app.previousMarksPercentage}%</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(app.status)}>
                            {app.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        );

      case "student":
        return (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Current Roll No"
                value={MOCK_STUDENTS[0].rollNumber}
                subtext={MOCK_STUDENTS[0].programName}
                icon={<GraduationCap className="w-5 h-5" />}
              />
              <StatCard
                title="Academic Session"
                value="Fall 2026"
                subtext="Semester 3"
                icon={<Calendar className="w-5 h-5" />}
              />
              <StatCard
                title="Active Fee Voucher"
                value={formatPKR(MOCK_FEE_VOUCHERS[1].totalAmountPKR)}
                trend={{ value: "Extended", isPositive: true, label: "Due Aug 25" }}
                icon={<Receipt className="w-5 h-5" />}
              />
              <StatCard
                title="Attendance Rate"
                value="94.2%"
                trend={{ value: "+2.1%", isPositive: true, label: "vs last month" }}
                icon={<CheckCircle2 className="w-5 h-5" />}
              />
            </div>

            {/* Fee Voucher System Demonstration (Preserving Original Due Date vs Extension) */}
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <CardTitle>Fee System & Due-Date Extension Concept</CardTitle>
                    <CardDescription>
                      Showing preserved original due date alongside admin-granted extension allowed date.
                    </CardDescription>
                  </div>
                  <Badge variant="warning">Extension Demo</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {MOCK_FEE_VOUCHERS.map((voucher) => (
                  <div
                    key={voucher.id}
                    className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                          {voucher.voucherNumber} ({voucher.studentName})
                        </h4>
                        <p className="text-xs text-slate-500">
                          {voucher.programName} • Issued: {formatDate(voucher.issueDate)}
                        </p>
                      </div>
                      <Badge variant={getStatusBadgeVariant(voucher.status)}>
                        {voucher.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1">
                        <div className="text-slate-500 font-medium">Fee Items Breakdown:</div>
                        <ul className="space-y-1 pl-2 border-l-2 border-slate-200 dark:border-slate-800">
                          {voucher.items.map((item) => (
                            <li key={item.id} className="flex justify-between">
                              <span>{item.title}:</span>
                              <span className="font-semibold">{formatPKR(item.amountPKR)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Preserved Due Date vs Extension Info */}
                      <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 space-y-2 border border-slate-200/60 dark:border-slate-700/60">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-medium">Original Due Date:</span>
                          <span className="font-bold text-slate-900 dark:text-slate-100">
                            {formatDate(voucher.originalDueDate)}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-medium">Final Allowed Payment Date:</span>
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">
                            {formatDate(voucher.finalAllowedDate)}
                          </span>
                        </div>

                        {voucher.concession && (
                          <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300">
                            <strong>Extension Granted By:</strong> {voucher.concession.grantedByAdminName}
                            <br />
                            <strong>Reason:</strong> {voucher.concession.reason}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        );

      case "teacher":
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                title="Assigned Courses"
                value="2 Courses"
                subtext="CS-101, CS-102"
                icon={<BookOpen className="w-5 h-5" />}
              />
              <StatCard
                title="Enrolled Students"
                value="85 Students"
                subtext="Fall 2026 Batch"
                icon={<Users className="w-5 h-5" />}
              />
              <StatCard
                title="Handouts Uploaded"
                value="14 Files"
                subtext="PDF & Docx Format"
                icon={<CheckCircle2 className="w-5 h-5" />}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Assigned Faculty Courses</CardTitle>
                <CardDescription>
                  List of courses assigned to Dr. Muhammad Shahbaz for Fall 2026.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course Code</TableHead>
                      <TableHead>Course Title</TableHead>
                      <TableHead>Credit Hours</TableHead>
                      <TableHead>Semester</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-bold">CS-101</TableCell>
                      <TableCell>Programming Fundamentals</TableCell>
                      <TableCell>4 Cr. Hr.</TableCell>
                      <TableCell>Semester 1</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          Mark Attendance
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-bold">CS-102</TableCell>
                      <TableCell>Object Oriented Programming</TableCell>
                      <TableCell>4 Cr. Hr.</TableCell>
                      <TableCell>Semester 2</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          Upload Handout
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        );

      case "admin":
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Enrolled Students"
                value="1,240"
                trend={{ value: "+12%", isPositive: true }}
                icon={<Users className="w-5 h-5" />}
              />
              <StatCard
                title="Active Faculty & Staff"
                value="48"
                subtext="3 Departments"
                icon={<GraduationCap className="w-5 h-5" />}
              />
              <StatCard
                title="Total Fee Collection (PKR)"
                value="PKR 4.2M"
                trend={{ value: "92% Collected", isPositive: true }}
                icon={<Receipt className="w-5 h-5" />}
              />
              <StatCard
                title="Pending Extensions"
                value="3 Requests"
                subtext="Fee Concessions"
                icon={<Clock className="w-5 h-5" />}
              />
            </div>

            {/* Admin Management Primitives Preview */}
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <CardTitle>System Administration Hub</CardTitle>
                    <CardDescription>
                      Master controls for Students, Teachers, Admissions, and Fee Voucher Concessions.
                    </CardDescription>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setConfirmDialogOpen(true)}
                  >
                    Test Confirm Dialog
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Program</TableHead>
                      <TableHead>Fee Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_STUDENTS.map((std) => (
                      <TableRow key={std.id}>
                        <TableCell className="font-bold">{std.studentIdNumber}</TableCell>
                        <TableCell>{std.fullName}</TableCell>
                        <TableCell>{std.programName}</TableCell>
                        <TableCell>
                          <Badge variant="success">Active</Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Eye className="w-4 h-4" />}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Fixed Demo Control Bar */}
      <div className="bg-primary-dark text-white py-3 px-4 sm:px-6 sticky top-0 z-40 border-b border-border shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent-gold shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider text-white/80">
              CMS Architecture Foundation Switcher:
            </span>
          </div>

          {/* Role Navigation Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "public_visitor", label: "Public Site Layout" },
              { id: "applicant", label: "Applicant Portal" },
              { id: "student", label: "Student Portal" },
              { id: "teacher", label: "Teacher Portal" },
              { id: "admin", label: "Admin Portal" },
            ].map((roleBtn) => (
              <button
                key={roleBtn.id}
                onClick={() => setActiveRole(roleBtn.id as UserRole)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeRole === roleBtn.id
                    ? "bg-primary text-white shadow-sm ring-2 ring-primary/30"
                    : "bg-white/10 text-white/80 hover:bg-white/15 hover:text-white"
                }`}
              >
                {roleBtn.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Render selected Layout Foundation */}
      <div className="flex-1">
        {activeRole === "public_visitor" && (
          <PublicLayout onNavigateRole={(r) => setActiveRole(r as UserRole)}>
            {renderRoleContent()}
          </PublicLayout>
        )}

        {activeRole === "applicant" && (
          <ApplicantLayout onBackToMain={() => setActiveRole("public_visitor")}>
            {renderRoleContent()}
          </ApplicantLayout>
        )}

        {activeRole === "student" && (
          <StudentLayout>{renderRoleContent()}</StudentLayout>
        )}

        {activeRole === "teacher" && (
          <TeacherLayout>{renderRoleContent()}</TeacherLayout>
        )}

        {activeRole === "admin" && (
          <AdminLayout>{renderRoleContent()}</AdminLayout>
        )}
      </div>

      {/* Demo Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Application Submission Confirmed"
        description="Your admission application has been registered into the CMS demonstration database."
        footer={
          <Button variant="primary" onClick={() => setModalOpen(false)}>
            Done
          </Button>
        }
      >
        <Alert variant="success" title="Application ID: APP-2026-8812">
          Your credentials have been securely stored. You can track your application status anytime using your CNIC or phone number.
        </Alert>
      </Modal>

      {/* Confirmation Dialog Demo */}
      <ConfirmationDialog
        isOpen={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={() => setConfirmDialogOpen(false)}
        title="Confirm Administrative Action"
        message="Are you sure you want to grant a 15-day due date extension for Fee Voucher VCH-2026-0942? The original due date will be preserved."
        confirmText="Grant Extension"
      />
    </div>
  );
}
