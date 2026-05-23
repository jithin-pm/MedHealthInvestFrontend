import React from 'react';
import Navbar from '../Home/HomeComponents/Navbar';
import Footer from '../../Components/Footer';

const TermsAndConditions = () => {
  return (
    <main className="min-h-screen bg-white font-['Poppins']">
      <Navbar />
      
      {/* Header Section */}
      <section className="pt-32 pb-20 bg-gray-50">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-20 text-center">
          <span className="text-[10px] font-black tracking-[0.3em] uppercase text-gray-400 mb-6 block">Service Protocol</span>
          <h1 className="text-4xl md:text-6xl font-light text-black tracking-tighter leading-none mb-8">
            Terms & <span className="font-semibold">Conditions.</span>
          </h1>
          <div className="w-20 h-1 bg-[#ccff00] mx-auto mb-8" />
          <p className="text-gray-500 text-sm font-medium uppercase tracking-[0.2em]">Last Updated: May 15, 2026</p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-24">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            
            <div className="md:col-span-2 space-y-16">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-black uppercase tracking-tight">1. Institutional Agreement</h2>
                <p className="text-gray-600 leading-relaxed text-lg">
                  These Terms and Conditions constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and MedHealth Invest ("Company", "we", "us", or "our"), concerning your access to and use of our institutional healthcare investment platform. By accessing the site, you acknowledge that you have read, understood, and agreed to be bound by all of these legal protocols.
                </p>
              </div>

              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-black uppercase tracking-tight">2. Investment Disclosure & Risks</h2>
                <div className="bg-red-50/50 border-l-4 border-red-500 p-8 rounded-r-3xl">
                  <h3 className="font-bold text-red-900 mb-4 uppercase text-xs tracking-widest">Risk Warning</h3>
                  <p className="text-red-800/80 text-sm leading-relaxed">
                    Investments in healthcare infrastructure and operational projects involve significant risk. MedHealth Invest facilitates connections between capital and projects; however, we do not provide financial advice. Capital is at risk, and returns are projected based on institutional due diligence but are not guaranteed by any government body or financial institution.
                  </p>
                </div>
                <p className="text-gray-600 leading-relaxed mt-4">
                  Investors are encouraged to diversify their portfolios and consult with independent financial advisors before committing to long-duration healthcare assets.
                </p>
              </div>

              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-black uppercase tracking-tight">3. Verification & Compliance (KYC)</h2>
                <p className="text-gray-600 leading-relaxed text-lg">
                  To maintain the integrity of our investment registry, all participants must undergo a multi-layered verification process:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div className="p-6 border-2 border-gray-100 rounded-2xl">
                    <span className="text-[#ccff00] font-black text-2xl mb-2 block">01</span>
                    <h4 className="font-bold text-black uppercase text-[10px] tracking-widest mb-2">Banking Verification</h4>
                    <p className="text-gray-500 text-xs">Validation of institutional bank accounts via automated penny-drop protocols to ensure secure payout routing.</p>
                  </div>
                  <div className="p-6 border-2 border-gray-100 rounded-2xl">
                    <span className="text-[#ccff00] font-black text-2xl mb-2 block">02</span>
                    <h4 className="font-bold text-black uppercase text-[10px] tracking-widest mb-2">Identity Audit</h4>
                    <p className="text-gray-500 text-xs">Real-time PAN and Government ID validation to prevent fraudulent activity and ensure AML compliance.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-black uppercase tracking-tight">4. Capital Allocation & Payouts</h2>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Once capital is committed to an active project, it is allocated according to the project's operational timeline. Payouts (ROI + Principal) are governed by the following rules:
                </p>
                <ul className="space-y-4 text-gray-600">
                  <li className="flex gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#ccff00] mt-2.5 flex-shrink-0" />
                    <p>Distributions are automated based on the "Project Maturity Date" defined in the investment certificate.</p>
                  </li>
                  <li className="flex gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#ccff00] mt-2.5 flex-shrink-0" />
                    <p>MedHealth Invest reserves the right to audit any transaction before final payout clearance.</p>
                  </li>
                  <li className="flex gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#ccff00] mt-2.5 flex-shrink-0" />
                    <p>Investors must maintain an active, verified bank account to receive distributions without operational delays.</p>
                  </li>
                </ul>
              </div>

              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-black uppercase tracking-tight">5. Platform Intellectual Property</h2>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Unless otherwise indicated, the Site and its original content, features, and functionality are the proprietary property of MedHealth Invest. This includes, without limitation, all software, database designs, audio, video, text, photographs, and graphics.
                </p>
              </div>

              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-black uppercase tracking-tight">6. Termination of Access</h2>
                <p className="text-gray-600 leading-relaxed text-lg">
                  We reserve the right, without notice and in our sole discretion, to terminate your account or your use of the Site, and to block or prevent future access to and use of the Site if you violate any of these Terms and Conditions.
                </p>
              </div>
            </div>

            <div className="space-y-8">

              <div className="p-8 border-2 border-gray-100 rounded-[32px] space-y-6">
                <h4 className="font-bold text-black uppercase text-xs tracking-widest">Legal Quick Links</h4>
                <div className="space-y-4">
                  <a href="/privacy-policy" className="flex items-center justify-between text-sm text-gray-500 hover:text-black transition-colors group">
                    <span>Privacy Policy</span>
                    <FiArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                  <a href="/about" className="flex items-center justify-between text-sm text-gray-500 hover:text-black transition-colors group">
                    <span>About the Platform</span>
                    <FiArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

// Mock Icon for Sidebar
const FiArrowRight = ({ className }) => (
  <svg className={className} stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

export default TermsAndConditions;
