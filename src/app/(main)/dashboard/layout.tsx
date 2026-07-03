import { DashboardTabs } from "@/components/dashboard/DashboardTabs";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <DashboardTabs />
      {children}
    </div>
  );
}
