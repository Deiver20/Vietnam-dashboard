import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col h-screen bg-navy-deep">
      <Navbar />
      <Sidebar />
      <div className="flex flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
