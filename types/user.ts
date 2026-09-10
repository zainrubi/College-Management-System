export type UserRole =
  | "public_visitor"
  | "applicant"
  | "student"
  | "teacher"
  | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  phone?: string;
  createdAt: string;
}

export interface UserProfile extends User {
  cnic?: string;
  address?: string;
  city?: string;
  guardianName?: string;
  guardianPhone?: string;
}
