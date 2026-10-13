import React, { Suspense } from "react";
import { StudentActivationForm } from "@/components/auth/StudentActivationForm";
import { LoadingState } from "@/components/ui/LoadingState";

export const metadata = {
  title: "Student Account Activation | Apex College Portal",
  description: "Initial password setup and activation for admitted students.",
};

export default function StudentActivationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background-secondary">
          <LoadingState label="Loading student activation portal..." />
        </div>
      }
    >
      <StudentActivationForm />
    </Suspense>
  );
}
