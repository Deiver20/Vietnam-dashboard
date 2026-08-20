import { Suspense } from "react";
import SearchContent from "./components/SearchContent";

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-navy-deep flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#0066FF] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
