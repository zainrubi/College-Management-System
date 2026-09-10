import React from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export default function AdminLoginPage() {
  return (
    <LoginForm
      role="admin"
      title="Administrator Console Sign In"
      subtitle="Sign in with your administrative credentials to manage college operations, fee vouchers, and personnel."
      redirectUrl="/admin"
    />
  );
}
