import React from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export default function StudentLoginPage() {
  return (
    <LoginForm
      role="student"
      title="Student Portal Login"
      subtitle="Enter your official Student Registration ID or institutional email to access your fees, vouchers, and handouts."
      redirectUrl="/student"
    />
  );
}
