import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";

export default async function AdminIndexPage() {
  const session = await getSession();

  if (session?.role === "admin") {
    redirect("/admin/dashboard");
  }

  if (session?.role === "agent") {
    redirect("/agent/dashboard");
  }

  if (session?.role === "customer") {
    redirect("/customer/dashboard");
  }

  redirect("/login");
}
