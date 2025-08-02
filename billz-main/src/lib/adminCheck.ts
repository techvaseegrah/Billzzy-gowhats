// utils/adminCheck.ts
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from '@/lib/auth-options';

export async function checkAdminAccess() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "admin") {
    redirect("/dashboard");
  }
}