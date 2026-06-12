import { Award, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getMyBadges,
  BADGE_CATEGORY_LABEL,
  type BadgeCategory,
  type BadgeItem,
} from "@/lib/badges";

const CATEGORY_ORDER: BadgeCategory[] = ["membaca", "kuis", "game"];

function BadgeTile({ badge }: { badge: BadgeItem }) {
  const { unlocked } = badge;
  const earnedLabel = badge.earnedAt
    ? new Date(badge.earnedAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <article
      className={cn(
        "clay-sm relative flex flex-col items-center gap-2 bg-white p-5 text-center transition",
        unlocked ? "hover:[transform:translateY(-4px)]" : "opacity-70 grayscale",
      )}
    >
      {!unlocked && (
        <span className="clay-sm absolute right-3 top-3 grid size-7 place-items-center bg-clay-cream text-clay-ink/60">
          <Lock className="size-3.5" />
        </span>
      )}
      <span
        className={cn(
          "clay-sm grid size-16 place-items-center text-3xl",
          unlocked ? "bg-clay-sun" : "bg-clay-cream",
        )}
      >
        {badge.emoji}
      </span>
      <h3 className="font-serif text-base font-bold leading-snug text-clay-ink">
        {badge.name}
      </h3>
      <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-clay-ink/55">
        {badge.description}
      </p>
      {unlocked && earnedLabel && (
        <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-clay-mint">
          Diraih {earnedLabel}
        </p>
      )}
    </article>
  );
}

export default async function LencanaPage() {
  const badges = await getMyBadges();
  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <div className="pt-6">
      <div className="flex items-center gap-3">
        <span className="clay-sm grid size-10 place-items-center bg-clay-sun text-clay-ink">
          <Award className="size-5" />
        </span>
        <h1 className="font-serif text-2xl font-bold tracking-tight text-clay-ink md:text-3xl">
          Lencana
        </h1>
      </div>
      <p className="mt-2 font-semibold text-clay-ink/60">
        Kumpulkan lencana dengan membaca cerita, mengerjakan kuis, dan bermain
        game.{" "}
        <strong className="text-clay-ink">
          {unlockedCount}/{badges.length}
        </strong>{" "}
        lencana telah kamu raih.
      </p>

      {CATEGORY_ORDER.map((cat) => {
        const items = badges.filter((b) => b.category === cat);
        if (items.length === 0) return null;
        return (
          <section key={cat} className="mt-8">
            <h2 className="font-serif text-lg font-bold text-clay-ink">
              {BADGE_CATEGORY_LABEL[cat]}
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {items.map((badge) => (
                <BadgeTile key={badge.id} badge={badge} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
