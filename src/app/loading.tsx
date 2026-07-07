export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="rounded-3xl border border-border bg-card px-8 py-6 text-center shadow-lg shadow-slate-950/5">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        <p className="text-sm font-medium text-muted-foreground">
          Loading Fundtrust...
        </p>
      </div>
    </div>
  );
}
