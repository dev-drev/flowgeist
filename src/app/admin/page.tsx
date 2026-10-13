import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminClient from "./AdminClient";
import { adminCookieName, readAdminSession } from "@/lib/adminAuth";

export default async function AdminPage() {
  const token = (await cookies()).get(adminCookieName())?.value;
  const session = await readAdminSession(token);
  if (!session) redirect("/admin/login");
  return <AdminClient />;
}
