"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Pencil } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { ClayInput } from "@/components/auth/clay-input";
import { SetActiveButton } from "@/components/admin/set-active-button";
import { ResetPasswordButton } from "@/components/admin/reset-password-button";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  username: string | null;
  role: "siswa" | "guru" | "admin";
  isActive: boolean;
};

const ROLE_LABEL: Record<AdminUser["role"], string> = {
  siswa: "Siswa",
  guru: "Guru",
  admin: "Admin",
};

const ROLE_BADGE: Record<AdminUser["role"], string> = {
  siswa: "bg-clay-sky",
  guru: "bg-clay-blue text-white",
  admin: "bg-clay-coral text-white",
};

const ROLE_FILTERS = [
  { value: "semua", label: "Semua Peran" },
  { value: "siswa", label: "Siswa" },
  { value: "guru", label: "Guru" },
];

export function UsersTable({
  users,
  currentUserId,
}: {
  users: AdminUser[];
  currentUserId: string;
}) {
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("semua");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== "semua" && u.role !== roleFilter) return false;
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.username ?? "").toLowerCase().includes(q)
      );
    });
  }, [users, query, roleFilter]);

  return (
    <div className="mt-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-clay-ink/40" />
          <ClayInput
            placeholder="Cari nama, email, atau username…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-11"
          />
        </div>
        <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v ?? "semua")}>
          <SelectTrigger className="h-12 w-full bg-clay-cream sm:w-48">
            {ROLE_FILTERS.find((r) => r.value === roleFilter)?.label ?? "Semua Peran"}
          </SelectTrigger>
          <SelectContent>
            {ROLE_FILTERS.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="mt-3 font-mono text-xs font-bold uppercase tracking-wider text-clay-ink/45">
        {filtered.length} pengguna
      </p>

      {filtered.length === 0 ? (
        <div className="clay mt-3 bg-white p-8 text-center font-semibold text-clay-ink/60">
          Tidak ada pengguna yang cocok.
        </div>
      ) : (
        <div className="clay mt-3 overflow-x-auto bg-white p-2">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-white px-3 py-3 text-left font-mono text-[11px] font-bold uppercase tracking-wider text-clay-ink/55">
                  Nama
                </th>
                <th className="px-3 py-3 text-left font-mono text-[11px] font-bold uppercase tracking-wider text-clay-ink/55">
                  Email / Username
                </th>
                <th className="px-3 py-3 text-center font-mono text-[11px] font-bold uppercase tracking-wider text-clay-ink/55">
                  Peran
                </th>
                <th className="px-3 py-3 text-center font-mono text-[11px] font-bold uppercase tracking-wider text-clay-ink/55">
                  Status
                </th>
                <th className="px-3 py-3 text-right font-mono text-[11px] font-bold uppercase tracking-wider text-clay-ink/55">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const isSelf = u.id === currentUserId;
                return (
                  <tr key={u.id} className="border-t border-clay-ink/5">
                    <td className="sticky left-0 z-10 bg-white px-3 py-3 font-bold text-clay-ink">
                      {u.name}
                      {isSelf && (
                        <span className="ml-2 font-mono text-[10px] font-bold uppercase tracking-wider text-clay-ink/40">
                          (kamu)
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 font-semibold text-clay-ink/70">
                      {u.role === "siswa" ? (u.username ?? "—") : u.email}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span
                        className={`clay-sm inline-block px-2.5 py-1 font-mono text-[11px] font-black text-clay-ink ${ROLE_BADGE[u.role]}`}
                      >
                        {ROLE_LABEL[u.role]}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span
                        className={`clay-sm inline-block px-2.5 py-1 font-mono text-[11px] font-black ${
                          u.isActive
                            ? "bg-clay-mint/25 text-clay-ink"
                            : "bg-clay-coral/20 text-clay-ink"
                        }`}
                      >
                        {u.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <Link
                          href={`/pengguna/${u.id}/edit`}
                          className="clay-sm inline-flex items-center gap-1.5 bg-white px-3 py-2 text-sm font-black text-clay-ink transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)]"
                        >
                          <Pencil className="size-4" /> Edit
                        </Link>
                        <ResetPasswordButton userId={u.id} userName={u.name} />
                        {!isSelf && (
                          <SetActiveButton
                            userId={u.id}
                            userName={u.name}
                            isActive={u.isActive}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
