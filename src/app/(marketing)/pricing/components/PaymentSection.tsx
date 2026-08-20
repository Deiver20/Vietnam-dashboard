export default function PaymentSection() {
  return (
    // Light mode — matches the plans-cards band above.
    <section className="py-[60px] pb-20 border-t border-gray-200 bg-[#F4F6FA]" data-screen-label="04 Payment">
      <div className="max-w-[1000px] mx-auto px-8 text-center max-[720px]:px-4">
        <span className="kicker">Payments & Security</span>
        <h2 className="text-[clamp(28px,3vw,42px)] font-semibold tracking-[-0.02em] mb-4 text-gray-900">Secure, flexible payment options.</h2>
        <p className="text-base text-gray-500 leading-[1.6] mb-0">
          Pay annually via Stripe or bank wire transfer.<br className="max-[720px]:hidden" />{" "}
          Wire transfer adds an additional <b className="text-gray-900">3% discount</b>.
        </p>
        <div className="flex gap-2.5 justify-center flex-wrap my-7">
          <div className="inline-flex items-center gap-2 py-2.5 px-[18px] bg-white border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] rounded-md text-[13px] font-medium text-gray-600">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#0066ff]"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
            Stripe (Card)
          </div>
          <div className="inline-flex items-center gap-2 py-2.5 px-[18px] bg-white border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] rounded-md text-[13px] font-medium text-gray-600">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#0066ff]"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
            Bank Wire Transfer
          </div>
          <div className="inline-flex items-center gap-2 py-2.5 px-[18px] bg-white border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] rounded-md text-[13px] font-medium text-gray-600">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#0066ff]"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            SSL Encrypted & Secure
          </div>
          <div className="inline-flex items-center gap-2 py-2.5 px-[18px] bg-white border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] rounded-md text-[13px] font-medium text-gray-600">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#0066ff]"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /></svg>
            Refund Policy Available
          </div>
        </div>
        <p className="text-[13px] text-gray-400 leading-[1.7] max-w-[600px] mx-auto">
          All prices in USD. Annual plans are billed once per year. Installment payments are available per plan tier. For custom enterprise pricing or multi-year contracts,{" "}
          <a href="#" className="link">contact our sales team</a>.
        </p>
      </div>
    </section>
  );
}
