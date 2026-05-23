import React from 'react';
import Navbar from '../Home/HomeComponents/Navbar';
import Footer from '../../Components/Footer';

const PrivacyPolicy = () => {
  return (
    <main className="min-h-screen bg-white font-['Poppins']">
      <Navbar />
      
      {/* Header Section */}
      <section className="pt-32 pb-20 bg-gray-50">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-20 text-center">
          <span className="text-[10px] font-black tracking-[0.3em] uppercase text-gray-400 mb-6 block">Legal Protocol</span>
          <h1 className="text-4xl md:text-6xl font-light text-black tracking-tighter leading-none mb-8">
            Privacy <span className="font-semibold">Policy.</span>
          </h1>
          <div className="w-20 h-1 bg-[#ccff00] mx-auto mb-8" />
          <p className="text-gray-500 text-sm font-medium uppercase tracking-[0.2em]">Effective Date: May 15, 2026</p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-24">
        <div className="max-w-[1000px] mx-auto px-6 lg:px-20">
          <div className="prose prose-zinc prose-sm max-w-none space-y-12">
            
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-black uppercase tracking-tight">1. Introduction</h2>
              <p className="text-gray-600 leading-relaxed">
                At MedHealth Invest, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website or use our investment platform. We adhere to the highest standards of data security and institutional transparency.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-black uppercase tracking-tight">2. Information We Collect</h2>
              <p className="text-gray-600 leading-relaxed">
                We collect personal information that you provide to us, including your name, email address, phone number, and financial data required for investment verification. We also collect technical data such as IP addresses and browser information to optimize your experience.
              </p>
              <ul className="list-disc pl-5 text-gray-600 space-y-2">
                <li>Personal Identity (PAN, Full Name, DOB)</li>
                <li>Financial Credentials (Bank Account No., IFSC)</li>
                <li>Contact Information (Email, Mobile No.)</li>
                <li>Transaction History & Investment Allocations</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-black uppercase tracking-tight">3. How We Use Your Data</h2>
              <p className="text-gray-600 leading-relaxed">
                Your data is used solely for the purpose of facilitating healthcare investments and providing you with institutional-grade reporting. We do not sell your data to third parties. Key uses include:
              </p>
              <ul className="list-disc pl-5 text-gray-600 space-y-2">
                <li>Verifying your identity for compliance</li>
                <li>Processing payout distributions</li>
                <li>Generating investment certificates and audit reports</li>
                <li>Maintaining institutional transaction ledgers</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-black uppercase tracking-tight">4. Data Security</h2>
              <p className="text-gray-600 leading-relaxed">
                We implement robust encryption and security protocols to protect your sensitive financial information. Our platform uses 256-bit SSL encryption and adheres to global standards for digital asset management.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-black uppercase tracking-tight">5. Contact Us</h2>
              <p className="text-gray-600 leading-relaxed">
                If you have any questions about this Privacy Policy or our data practices, please contact our legal team at:
              </p>
              <a href="mailto:legal@medhealthinvest.com" className="text-black font-bold border-b-2 border-[#ccff00] hover:bg-[#ccff00] transition-all">
                legal@medhealthinvest.com
              </a>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default PrivacyPolicy;
