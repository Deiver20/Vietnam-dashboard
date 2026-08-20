import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#001730] text-white">
      <MarketingNavbar />
      <main className="flex-1 pt-[68px]">{children}</main>
      <MarketingFooter />
    </div>
  );
}
