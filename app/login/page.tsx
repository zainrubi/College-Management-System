import React from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export default function GeneralLoginPage() {
  return (
    <LoginForm
      role="applicant"
      title="Sign In"
      subtitle="Sign in to continue your admission application and check your application status."
      redirectUrl="/applicant?tab=application"
    />
  );
}
