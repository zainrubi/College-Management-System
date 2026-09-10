import React from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export default function TeacherLoginPage() {
  return (
    <LoginForm
      role="teacher"
      title="Faculty & Teacher Portal Login"
      subtitle="Enter your Employee ID or faculty email to manage assigned courses, attendance, and course handouts."
      redirectUrl="/teacher"
    />
  );
}
