import React from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export default function GeneralLoginPage() {
  return (
    <LoginForm
      role="applicant"
      title="Applicant Portal Sign In"
      subtitle="Sign in to your Superior Colleges applicant account to track application status and submit credentials."
      redirectUrl="/applicant"
    />
  );
}
