export default function ComparisonTable() {
  return (
    <section className="pt-20 pb-20 bg-[#001730]" data-screen-label="03 Comparison">
      <div className="max-w-[1400px] mx-auto px-8 max-[720px]:px-4">
        <div className="mx-auto mb-[60px] text-center max-w-[720px]">
          <span className="kicker">Full comparison</span>
          <h2 className="text-[clamp(28px,3.4vw,46px)] font-semibold leading-[1.12] tracking-[-0.02em] [text-wrap:balance]">Everything included in each plan.</h2>
        </div>
        <div className="overflow-x-auto mb-[60px]">
          <table className="w-full border-collapse min-w-[700px]">
            <thead>
              <tr>
                <th className="py-[18px] px-5 text-left text-[12px] font-bold tracking-[0.1em] uppercase text-gray-4 border-b border-white/[0.05] w-[36%] sticky left-0 z-10 bg-[#01101f]">Feature</th>
                <th className="py-[18px] px-5 text-left text-[12px] font-bold tracking-[0.1em] uppercase text-gray-4 bg-[rgba(0,0,0,0.2)] border-b border-white/[0.05]">Basic</th>
                <th className="py-[18px] px-5 text-left text-[12px] font-bold tracking-[0.1em] uppercase text-gray-4 bg-[rgba(0,0,0,0.2)] border-b border-white/[0.05]">Advanced</th>
                <th className="py-[18px] px-5 text-left text-[12px] font-bold tracking-[0.1em] uppercase text-white bg-[rgba(0,102,255,0.15)] border-b border-white/[0.05]">Premium</th>
                <th className="py-[18px] px-5 text-left text-[12px] font-bold tracking-[0.1em] uppercase text-gray-4 bg-[rgba(0,0,0,0.2)] border-b border-white/[0.05]">Titanium</th>
              </tr>
            </thead>
            <tbody>
              {/* Data Access */}
              <tr className="bg-[rgba(0,23,48,0.6)]">
                <td colSpan={5} className="py-2.5 px-5 text-[12px] font-bold tracking-[0.1em] uppercase text-blue-soft border-b border-white/[0.05]">Data Access</td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3.5 px-5 text-[15px] text-gray-3 font-medium border-b border-white/[0.05] sticky left-0 bg-[#001730]">Dashboards included</td>
                <td className="py-3.5 px-5 text-[15px] text-gray-2 tabular-nums border-b border-white/[0.05]">3</td>
                <td className="py-3.5 px-5 text-[15px] text-gray-2 tabular-nums border-b border-white/[0.05]">7</td>
                <td className="py-3.5 px-5 text-[15px] text-white font-semibold tabular-nums bg-[rgba(0,102,255,0.05)] border-b border-white/[0.05]">15</td>
                <td className="py-3.5 px-5 text-[15px] text-gray-2 tabular-nums border-b border-white/[0.05]">25</td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3.5 px-5 text-[15px] text-gray-3 font-medium border-b border-white/[0.05] sticky left-0 bg-[#001730]">User seats</td>
                <td className="py-3.5 px-5 text-[15px] text-gray-2 tabular-nums border-b border-white/[0.05]">1</td>
                <td className="py-3.5 px-5 text-[15px] text-gray-2 tabular-nums border-b border-white/[0.05]">3</td>
                <td className="py-3.5 px-5 text-[15px] text-white font-semibold tabular-nums bg-[rgba(0,102,255,0.05)] border-b border-white/[0.05]">5</td>
                <td className="py-3.5 px-5 text-[15px] text-gray-2 tabular-nums border-b border-white/[0.05]">8</td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3.5 px-5 text-[15px] text-gray-3 font-medium border-b border-white/[0.05] sticky left-0 bg-[#001730]">Single chart price (plan users)</td>
                <td className="py-3.5 px-5 text-[15px] text-gray-2 tabular-nums border-b border-white/[0.05]">$360</td>
                <td className="py-3.5 px-5 text-[15px] text-gray-2 tabular-nums border-b border-white/[0.05]">$375</td>
                <td className="py-3.5 px-5 text-[15px] text-white font-semibold tabular-nums bg-[rgba(0,102,255,0.05)] border-b border-white/[0.05]">$300</td>
                <td className="py-3.5 px-5 text-[15px] text-gray-2 tabular-nums border-b border-white/[0.05]">$270</td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3.5 px-5 text-[15px] text-gray-3 font-medium border-b border-white/[0.05] sticky left-0 bg-[#001730]">Industries covered</td>
                <td className="py-3.5 px-5 text-[15px] text-gray-2 tabular-nums border-b border-white/[0.05]">11</td>
                <td className="py-3.5 px-5 text-[15px] text-gray-2 tabular-nums border-b border-white/[0.05]">11</td>
                <td className="py-3.5 px-5 text-[15px] text-white font-semibold tabular-nums bg-[rgba(0,102,255,0.05)] border-b border-white/[0.05]">11</td>
                <td className="py-3.5 px-5 text-[15px] text-gray-2 tabular-nums border-b border-white/[0.05]">11</td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3.5 px-5 text-[15px] text-gray-3 font-medium border-b border-white/[0.05] sticky left-0 bg-[#001730]">Countries available</td>
                <td className="py-3.5 px-5 text-[15px] text-gray-2 tabular-nums border-b border-white/[0.05]">70+</td>
                <td className="py-3.5 px-5 text-[15px] text-gray-2 tabular-nums border-b border-white/[0.05]">70+</td>
                <td className="py-3.5 px-5 text-[15px] text-white font-semibold tabular-nums bg-[rgba(0,102,255,0.05)] border-b border-white/[0.05]">70+</td>
                <td className="py-3.5 px-5 text-[15px] text-gray-2 tabular-nums border-b border-white/[0.05]">70+</td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3.5 px-5 text-[15px] text-gray-3 font-medium border-b border-white/[0.05] sticky left-0 bg-[#001730]">Historical data</td>
                <td className="py-3.5 px-5 text-[15px] text-gray-2 tabular-nums border-b border-white/[0.05]">5+ years</td>
                <td className="py-3.5 px-5 text-[15px] text-gray-2 tabular-nums border-b border-white/[0.05]">5+ years</td>
                <td className="py-3.5 px-5 text-[15px] text-white font-semibold tabular-nums bg-[rgba(0,102,255,0.05)] border-b border-white/[0.05]">5+ years</td>
                <td className="py-3.5 px-5 text-[15px] text-gray-2 tabular-nums border-b border-white/[0.05]">5+ years</td>
              </tr>
              {/* Platform */}
              <tr className="bg-[rgba(0,23,48,0.6)]">
                <td colSpan={5} className="py-2.5 px-5 text-[12px] font-bold tracking-[0.1em] uppercase text-blue-soft border-b border-white/[0.05]">Platform</td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3.5 px-5 text-[15px] text-gray-3 font-medium border-b border-white/[0.05] sticky left-0 bg-[#001730]">Mobile app (iOS & Android)</td>
                <td className="py-3.5 px-5 text-[15px] text-green font-bold tabular-nums border-b border-white/[0.05]">✓</td>
                <td className="py-3.5 px-5 text-[15px] text-green font-bold tabular-nums border-b border-white/[0.05]">✓</td>
                <td className="py-3.5 px-5 text-[15px] text-green font-bold tabular-nums bg-[rgba(0,102,255,0.05)] border-b border-white/[0.05]">✓</td>
                <td className="py-3.5 px-5 text-[15px] text-green font-bold tabular-nums border-b border-white/[0.05]">✓</td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3.5 px-5 text-[15px] text-gray-3 font-medium border-b border-white/[0.05] sticky left-0 bg-[#001730]">PDF & Excel exports</td>
                <td className="py-3.5 px-5 text-[15px] text-green font-bold tabular-nums border-b border-white/[0.05]">✓</td>
                <td className="py-3.5 px-5 text-[15px] text-green font-bold tabular-nums border-b border-white/[0.05]">✓</td>
                <td className="py-3.5 px-5 text-[15px] text-green font-bold tabular-nums bg-[rgba(0,102,255,0.05)] border-b border-white/[0.05]">✓</td>
                <td className="py-3.5 px-5 text-[15px] text-green font-bold tabular-nums border-b border-white/[0.05]">✓</td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3.5 px-5 text-[15px] text-gray-3 font-medium border-b border-white/[0.05] sticky left-0 bg-[#001730]">Embeddable dashboard URL</td>
                <td className="py-3.5 px-5 text-[15px] text-green font-bold tabular-nums border-b border-white/[0.05]">✓</td>
                <td className="py-3.5 px-5 text-[15px] text-green font-bold tabular-nums border-b border-white/[0.05]">✓</td>
                <td className="py-3.5 px-5 text-[15px] text-green font-bold tabular-nums bg-[rgba(0,102,255,0.05)] border-b border-white/[0.05]">✓</td>
                <td className="py-3.5 px-5 text-[15px] text-green font-bold tabular-nums border-b border-white/[0.05]">✓</td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3.5 px-5 text-[15px] text-gray-3 font-medium border-b border-white/[0.05] sticky left-0 bg-[#001730]">Co-branded dashboard</td>
                <td className="py-3.5 px-5 text-[15px] text-gray-5 border-b border-white/[0.05]">—</td>
                <td className="py-3.5 px-5 text-[15px] text-gray-5 border-b border-white/[0.05]">—</td>
                <td className="py-3.5 px-5 text-[15px] text-green font-bold tabular-nums bg-[rgba(0,102,255,0.05)] border-b border-white/[0.05]">✓</td>
                <td className="py-3.5 px-5 text-[15px] text-green font-bold tabular-nums border-b border-white/[0.05]">✓</td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3.5 px-5 text-[15px] text-gray-3 font-medium border-b border-white/[0.05] sticky left-0 bg-[#001730]">Custom PowerBI dashboard</td>
                <td className="py-3.5 px-5 text-[15px] text-gray-5 border-b border-white/[0.05]">—</td>
                <td className="py-3.5 px-5 text-[15px] text-gray-5 border-b border-white/[0.05]">—</td>
                <td className="py-3.5 px-5 text-[15px] text-gray-5 bg-[rgba(0,102,255,0.05)] border-b border-white/[0.05]">—</td>
                <td className="py-3.5 px-5 text-[15px] text-green font-bold tabular-nums border-b border-white/[0.05]">✓</td>
              </tr>
              {/* Support & Onboarding */}
              <tr className="bg-[rgba(0,23,48,0.6)]">
                <td colSpan={5} className="py-2.5 px-5 text-[12px] font-bold tracking-[0.1em] uppercase text-blue-soft border-b border-white/[0.05]">Support & Onboarding</td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3.5 px-5 text-[15px] text-gray-3 font-medium border-b border-white/[0.05] sticky left-0 bg-[#001730]">AI Help Center 24/7</td>
                <td className="py-3.5 px-5 text-[15px] text-green font-bold tabular-nums border-b border-white/[0.05]">✓</td>
                <td className="py-3.5 px-5 text-[15px] text-green font-bold tabular-nums border-b border-white/[0.05]">✓</td>
                <td className="py-3.5 px-5 text-[15px] text-green font-bold tabular-nums bg-[rgba(0,102,255,0.05)] border-b border-white/[0.05]">✓</td>
                <td className="py-3.5 px-5 text-[15px] text-green font-bold tabular-nums border-b border-white/[0.05]">✓</td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3.5 px-5 text-[15px] text-gray-3 font-medium border-b border-white/[0.05] sticky left-0 bg-[#001730]">Dedicated onboarding</td>
                <td className="py-3.5 px-5 text-[15px] text-gray-5 border-b border-white/[0.05]">—</td>
                <td className="py-3.5 px-5 text-[15px] text-gray-5 border-b border-white/[0.05]">—</td>
                <td className="py-3.5 px-5 text-[15px] text-green font-bold tabular-nums bg-[rgba(0,102,255,0.05)] border-b border-white/[0.05]">✓</td>
                <td className="py-3.5 px-5 text-[15px] text-green font-bold tabular-nums border-b border-white/[0.05]">✓</td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3.5 px-5 text-[15px] text-gray-3 font-medium border-b border-white/[0.05] sticky left-0 bg-[#001730]">Account manager & SLA</td>
                <td className="py-3.5 px-5 text-[15px] text-gray-5 border-b border-white/[0.05]">—</td>
                <td className="py-3.5 px-5 text-[15px] text-gray-5 border-b border-white/[0.05]">—</td>
                <td className="py-3.5 px-5 text-[15px] text-gray-5 bg-[rgba(0,102,255,0.05)] border-b border-white/[0.05]">—</td>
                <td className="py-3.5 px-5 text-[15px] text-green font-bold tabular-nums border-b border-white/[0.05]">✓</td>
              </tr>
              {/* Payment */}
              <tr className="bg-[rgba(0,23,48,0.6)]">
                <td colSpan={5} className="py-2.5 px-5 text-[12px] font-bold tracking-[0.1em] uppercase text-blue-soft border-b border-white/[0.05]">Payment</td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3.5 px-5 text-[15px] text-gray-3 font-medium border-b border-white/[0.05] sticky left-0 bg-[#001730]">Max installments</td>
                <td className="py-3.5 px-5 text-[15px] text-gray-2 tabular-nums border-b border-white/[0.05]">1</td>
                <td className="py-3.5 px-5 text-[15px] text-gray-2 tabular-nums border-b border-white/[0.05]">2</td>
                <td className="py-3.5 px-5 text-[15px] text-white font-semibold tabular-nums bg-[rgba(0,102,255,0.05)] border-b border-white/[0.05]">3</td>
                <td className="py-3.5 px-5 text-[15px] text-gray-2 tabular-nums border-b border-white/[0.05]">4</td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3.5 px-5 text-[15px] text-gray-3 font-medium border-b border-white/[0.05] sticky left-0 bg-[#001730]">Bank transfer discount</td>
                <td className="py-3.5 px-5 text-[15px] text-green font-bold tabular-nums border-b border-white/[0.05]">3% off</td>
                <td className="py-3.5 px-5 text-[15px] text-green font-bold tabular-nums border-b border-white/[0.05]">3% off</td>
                <td className="py-3.5 px-5 text-[15px] text-green font-bold tabular-nums bg-[rgba(0,102,255,0.05)] border-b border-white/[0.05]">3% off</td>
                <td className="py-3.5 px-5 text-[15px] text-green font-bold tabular-nums border-b border-white/[0.05]">3% off</td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3.5 px-5 text-[15px] text-gray-3 font-medium border-b border-white/[0.05] sticky left-0 bg-[#001730]">Extra user seat</td>
                <td className="py-3.5 px-5 text-[15px] text-gray-2 tabular-nums border-b border-white/[0.05]">$800</td>
                <td className="py-3.5 px-5 text-[15px] text-gray-2 tabular-nums border-b border-white/[0.05]">$900</td>
                <td className="py-3.5 px-5 text-[15px] text-white font-semibold tabular-nums bg-[rgba(0,102,255,0.05)] border-b border-white/[0.05]">$1,100</td>
                <td className="py-3.5 px-5 text-[15px] text-gray-2 tabular-nums border-b border-white/[0.05]">$1,000</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
