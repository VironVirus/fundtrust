import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";

export default async function CustomerIndexPage() {
  const session = await getSession();

  if (session?.role === "customer") {
    redirect("/customer/dashboard");
  }

  if (session?.role === "admin") {
    redirect("/admin/dashboard");
  }

  if (session?.role === "agent") {
    redirect("/agent/dashboard");
  }

  redirect("/login");
}
