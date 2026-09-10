import { redirect } from "next/navigation";

export default function ApplicantProfileAlias() {
  redirect("/applicant?tab=personal");
}
