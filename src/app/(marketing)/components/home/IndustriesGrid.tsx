import Link from "next/link";
import Placeholder from "@/components/Placeholder";

const CARDS = [
  { text: "Pet Food", img: "Pet Food", originalFile: "assets/petfood.webp" },
  { text: "Biofuels", img: "Biofuels", originalFile: "assets/biofuels.webp" },
  { text: "Meat & Livestock", img: "Meat", originalFile: "assets/chicken_meat_bg.webp" },
  { text: "Fertilizers", img: "Fertilizers", originalFile: "assets/fertilizers.webp" },
];

/* ════════════════════════ INDUSTRIES ════════════════════════ */
export default function IndustriesGrid() {
  return (
    <section className="py-[100px] max-[720px]:py-14 relative bg-[#001730]" id="industries">
      <div className="max-w-[1400px] mx-auto px-8 max-[720px]:px-4">
        <div className="mb-[50px] max-w-[720px]">
          <span className="kicker">Industry coverage</span>
          <h2 className="text-[clamp(28px,3.4vw,46px)] font-semibold leading-[1.12] tracking-[-0.02em] text-balance">
            The entire agri-food value chain,<br className="max-[720px]:hidden" />{" "} under one lens.
          </h2>
        </div>
        {/* Stacked layouts get any number of rows, each still 220px tall —
            the cards are absolute overlays and need the explicit height
            (the old `grid-rows-auto` was not a real utility and never
            compiled, locking the template at two rows at every width). */}
        <div className="grid grid-cols-[2fr_1fr_1fr] grid-rows-[220px_220px] gap-4 max-[1100px]:grid-cols-[1fr_1fr] max-[1100px]:[grid-template-rows:none] max-[1100px]:auto-rows-[220px] max-[720px]:grid-cols-1">
          <Link href="#" className="relative rounded-xl overflow-hidden isolate border-2 border-[rgba(102,166,255,0.2)] transition-transform duration-400 hover:-translate-y-1 row-span-2 max-[1100px]:col-span-2 max-[1100px]:row-span-1 max-[720px]:col-span-1 group">
            <Placeholder className="absolute inset-0 w-full h-full object-cover -z-[2] transition-transform duration-[600ms] group-hover:scale-[1.06]" text="Rendering" originalFile="assets/rendering_bg.webp" />
            <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,23,48,0.15)] via-[rgba(0,23,48,0.5)] to-[rgba(0,23,48,0.95)] -z-[1]" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <span className="inline-block text-[10px] font-semibold tracking-[0.1em] uppercase bg-[#33cc00] text-[#001730] px-2 py-[3px] rounded mb-3">Flagship industry</span>
              <h3 className="text-[32px] font-semibold tracking-[-0.01em] mb-1.5">Rendering</h3>
              <p className="text-[13px] text-[#d8d8d8] mb-2.5 max-w-[320px]">Subproductos animales, harinas y grasas. AGM&apos;s deepest category.</p>
              <span className="inline-block text-xs font-semibold text-[#67a6ff] tracking-wide">View charts →</span>
            </div>
          </Link>
          {CARDS.map((item) => (
            <Link href="#" key={item.text} className="relative rounded-xl overflow-hidden isolate border-2 border-[rgba(102,166,255,0.2)] transition-transform duration-400 hover:-translate-y-1 group">
              <Placeholder className="absolute inset-0 w-full h-full object-cover -z-[2] transition-transform duration-[600ms] group-hover:scale-[1.06]" text={item.img} originalFile={item.originalFile} />
              <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,23,48,0.15)] via-[rgba(0,23,48,0.5)] to-[rgba(0,23,48,0.95)] -z-[1]" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-2xl font-semibold tracking-[-0.01em] mb-1.5">{item.text}</h3>
                <span className="inline-block text-xs font-semibold text-[#67a6ff] tracking-wide">View →</span>
              </div>
            </Link>
          ))}
          <Link href="#" className="relative rounded-xl overflow-hidden isolate bg-gradient-to-br from-[rgba(0,102,255,0.15)] to-[rgba(51,204,0,0.08)] border-2 border-[rgba(102,166,255,0.2)] transition-transform duration-400 hover:-translate-y-1 group">
            <div className="relative flex flex-col justify-center h-full p-6">
              <h3 className="text-2xl font-semibold tracking-[-0.01em] mb-1.5">+ 15 more industries</h3>
              <p className="text-[13px] text-[#d8d8d8] mb-2.5">Grains · Additives · Vegetable Oils · Enzymes · Aquaculture · Coffee &amp; Cocoa …</p>
              <span className="inline-block text-xs font-semibold text-[#67a6ff] tracking-wide">View catalog →</span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
