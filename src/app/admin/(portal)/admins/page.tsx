import { AdminCreateAdminForm } from "@/components/forms/admin-create-admin-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getEnv } from "@/lib/env";
import { formatDateTime } from "@/lib/format";
import { getAdmins } from "@/lib/sheets";

export default async function AdminsPage() {
  const env = getEnv();
  const admins = await getAdmins();
  const bootstrapLogin = env.ADMIN_LOGIN.trim().toLowerCase();
  const adminDirectory = [
    {
      id: "bootstrap-admin",
      name: "Primary Admin",
      login: env.ADMIN_LOGIN,
      email: env.ADMIN_EMAIL,
      status: "Active",
      createdAt: "",
      source: "Environment",
    },
    ...admins
      .filter((admin) => admin.login !== bootstrapLogin)
      .map((admin) => ({
        ...admin,
        source: "Supabase",
      })),
  ];

  return (
    <main className="space-y-6">
      <section className="rounded-[2rem] border border-border/70 bg-white/86 p-6 shadow-xl shadow-slate-950/5">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
          Admins
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
          Admins
        </h1>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          Create internal admin accounts and review current access.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Create admin</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminCreateAdminForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Admin directory</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Login</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adminDirectory.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-semibold text-foreground">
                    {admin.name}
                  </TableCell>
                  <TableCell>{admin.login}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        admin.status.toLowerCase() === "active"
                          ? "success"
                          : "outline"
                      }
                    >
                      {admin.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{admin.source}</TableCell>
                  <TableCell>
                    {admin.createdAt
                      ? formatDateTime(admin.createdAt)
                      : "Bootstrap account"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
