"use client";

import { LogOut } from "lucide-react";

import { logoutAction } from "@/actions/auth";
import { SubmitButton } from "@/components/forms/submit-button";

export function LogoutForm() {
  return (
    <form action={logoutAction}>
      <SubmitButton
        pendingLabel="Signing out..."
        variant="outline"
        className="w-full justify-center border-white/12 bg-white/6 text-white hover:bg-white/12 hover:text-white"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </SubmitButton>
    </form>
  );
}
