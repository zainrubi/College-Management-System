import { redirect } from "next/navigation";

export default function ApplicantApplicationStatusAlias() {
  redirect("/applicant?tab=status");
}
