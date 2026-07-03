import { notFound } from "next/navigation";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { DASHBOARD_TABS } from "@/app/interfaces/trade/interface";

interface DashboardTabPageProps {
  params: Promise<{ tab: string }>;
}

export default async function DashboardTabPage({ params }: DashboardTabPageProps) {
  const { tab } = await params;

  const isValidTab = DASHBOARD_TABS.some((t) => t.id === tab);
  if (!isValidTab) {
    notFound();
  }

  return <DashboardContent tabId={tab} />;
}
