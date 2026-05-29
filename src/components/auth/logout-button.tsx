"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { logout } from "@/lib/actions/auth";

export function LogoutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => logout())}
      className="clay-sm inline-flex items-center gap-2 bg-white px-4 py-2 text-sm font-bold text-clay-ink transition hover:[transform:translateY(-2px)] disabled:opacity-60"
    >
      <LogOut className="size-4" />
      {pending ? "Keluar…" : "Keluar"}
    </button>
  );
}
