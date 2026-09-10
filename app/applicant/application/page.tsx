import { redirect } from "next/navigation";

export default function ApplicantApplicationAlias() {
  redirect("/applicant?tab=application");
}
