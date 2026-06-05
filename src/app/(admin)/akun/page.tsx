import { ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { AccountSettings } from "@/components/admin/account-settings";

export default async function AkunPage() {
  const user = await getCurrentUser();

  return (
    <div className="pt-2">
      <div className="flex items-center gap-3">
        <span className="clay-sm grid size-11 place-items-center bg-clay-coral text-white">
          <ShieldCheck className="size-5" />
        </span>
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-clay-ink md:text-3xl">
            Akun Saya
          </h1>
          <p className="font-semibold text-clay-ink/60">
            Kelola akun admin milikmu.
          </p>
        </div>
      </div>

      <AccountSettings
        user={{ id: user!.id, name: user!.name, email: user!.email }}
      />
    </div>
  );
}
