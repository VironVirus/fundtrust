import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";

export default async function AgentIndexPage() {
  const session = await getSession();

  if (session?.role === "agent") {
    redirect("/agent/dashboard");
  }

  if (session?.role === "admin") {
    redirect("/admin/dashboard");
  }

  if (session?.role === "customer") {
    redirect("/customer/dashboard");
  }

  redirect("/agent/login");
}
