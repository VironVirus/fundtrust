import { AlertCircle, CheckCircle2 } from "lucide-react";

import type { FormActionState } from "@/lib/types";

export function FormMessage({ state }: { state: FormActionState }) {
  if (!state.message || state.status === "idle") {
    return null;
  }

  const isSuccess = state.status === "success";

  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
        isSuccess
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      {isSuccess ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
      ) : (
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      )}
      <p>{state.message}</p>
    </div>
  );
}
