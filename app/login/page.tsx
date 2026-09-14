import React from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export default function GeneralLoginPage() {
  return (
    <LoginForm
      role="applicant"
      title="Applicant Portal Sign In"
      subtitle="Sign in with your registered mobile number and password to continue your admission application. You will not be sent to the public homepage."
      redirectUrl="/applicant?tab=application"
    />
  );
}
