"use client";

import { GraduationCap, Users, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export type AuthRole = "siswa" | "guru" | "admin";

const ROLES: { value: AuthRole; label: string; icon: typeof Users }[] = [
  { value: "siswa", label: "Siswa", icon: GraduationCap },
  { value: "guru", label: "Guru", icon: Users },
  { value: "admin", label: "Admin", icon: ShieldCheck },
];

export function RoleSelector({
  value,
  onChange,
}: {
  value: AuthRole;
  onChange: (role: AuthRole) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Pilih peran"
      className="grid grid-cols-3 gap-2"
    >
      {ROLES.map(({ value: role, label, icon: Icon }) => {
        const active = role === value;
        return (
          <button
            key={role}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(role)}
            className={cn(
              "clay-sm flex flex-col items-center gap-1.5 px-3 py-3 text-sm font-black transition hover:[transform:translateY(-2px)]",
              active ? "bg-clay-rose text-white" : "bg-white text-clay-ink",
            )}
          >
            <Icon className="size-5" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
