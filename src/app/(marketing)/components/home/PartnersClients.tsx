const CLIENTS = Array.from({ length: 12 }, (_, i) => ({
  src: `/logos/clients/client_${i + 1}.svg`,
  alt: `Client ${i + 1}`,
}));

const PARTNERS = Array.from({ length: 5 }, (_, i) => ({
  src: `/logos/partners/partner_${i + 1}.svg`,
  alt: `Partner ${i + 1}`,
}));

/* ════════════════════════ PARTNERS & CLIENTS ════════════════════════ */
export default function PartnersClients() {
  return (
    <section className="py-20 relative bg-[#001730]" id="plans">
      <div className="max-w-[1400px] mx-auto px-8 max-[720px]:px-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-[60px] max-[720px]:gap-8">
          {/* Clients */}
          <div>
            <div className="mb-7">
              <span className="kicker">Our clients</span>
              <h3 className="text-xl font-medium text-[#d8d8d8]">Trusted by industry leaders<br className="max-[720px]:hidden" />{" "}across 5 continents.</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {CLIENTS.map((logo, i) => (
                <img
                  key={`c-${i}`}
                  src={logo.src}
                  alt={logo.alt}
                  className="w-full aspect-[3/1] max-h-[40px] object-contain opacity-60 hover:opacity-100 hover:-translate-y-[3px] transition-all duration-300"
                  loading="lazy"
                />
              ))}
            </div>
          </div>
          {/* Partners */}
          <div>
            <div className="mb-7">
              <span className="kicker">Our partners</span>
              <h3 className="text-xl font-medium text-[#d8d8d8]">Strategic alliances with<br className="max-[720px]:hidden" />{" "}leading trade associations.</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {PARTNERS.map((logo, i) => (
                <img
                  key={`p-${i}`}
                  src={logo.src}
                  alt={logo.alt}
                  className="w-full aspect-[3/1] max-h-[40px] object-contain opacity-60 hover:opacity-100 hover:-translate-y-[3px] transition-all duration-300"
                  loading="lazy"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
