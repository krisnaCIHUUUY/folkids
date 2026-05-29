import { getCurrentUser } from "@/lib/auth";
import {
  metrics,
  tasks,
  stories,
  games,
  badges,
} from "@/lib/mock/siswa-dashboard";
import { ProgressSummaryCard } from "@/components/siswa/progress-summary-card";
import { AssignedTaskSection } from "@/components/siswa/assigned-task-section";
import { StoryCardGrid } from "@/components/siswa/story-card-grid";
import { GameCardRow } from "@/components/siswa/game-card-row";
import { BadgeCollection } from "@/components/siswa/badge-collection";

export default async function BerandaPage() {
  const user = await getCurrentUser();
  const firstName = user?.name.split(" ")[0] ?? "Siswa";

  return (
    <>
      <ProgressSummaryCard name={firstName} metrics={metrics} />
      <AssignedTaskSection tasks={tasks} />
      <StoryCardGrid stories={stories} />
      <GameCardRow games={games} />
      <BadgeCollection badges={badges} />
    </>
  );
}
