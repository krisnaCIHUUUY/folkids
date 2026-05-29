import { getCurrentUser } from "@/lib/auth";
import {
  metrics,
  classes,
  students,
  quizResults,
  contents,
} from "@/lib/mock/guru-dashboard";
import { ContentSummaryCard } from "@/components/guru/content-summary-card";
import { ClassSection } from "@/components/guru/class-section";
import { StudentMonitoringSection } from "@/components/guru/student-monitoring-section";
import { QuizResultsSection } from "@/components/guru/quiz-results-section";
import { ContentSection } from "@/components/guru/content-section";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const name = user?.name ?? "Bu/Pak Guru";

  return (
    <div className="pt-2">
      <ContentSummaryCard name={name} metrics={metrics} />
      <ClassSection classes={classes} />
      <StudentMonitoringSection students={students} />
      <QuizResultsSection results={quizResults} />
      <ContentSection contents={contents} />
    </div>
  );
}
