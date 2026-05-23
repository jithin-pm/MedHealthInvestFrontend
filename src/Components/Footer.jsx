import React, { useState, useRef, useEffect } from 'react'
import { FiArrowRight, FiChevronDown, FiSearch } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { saveEnquiryApi } from '../Services/allApi'
import { showAlert } from '../Utils/alert'

const countries = [
  { name: 'India', code: '+91', iso: 'in' },
  { name: 'United Arab Emirates', code: '+971', iso: 'ae' },
  { name: 'United States', code: '+1', iso: 'us' },
  { name: 'United Kingdom', code: '+44', iso: 'gb' },
  { name: 'Saudi Arabia', code: '+966', iso: 'sa' },
  { name: 'Canada', code: '+1', iso: 'ca' },
  { name: 'Australia', code: '+61', iso: 'au' },
  { name: 'Germany', code: '+49', iso: 'de' },
  { name: 'France', code: '+33', iso: 'fr' },
  { name: 'Singapore', code: '+65', iso: 'sg' },
  { name: 'Qatar', code: '+974', iso: 'qa' },
  { name: 'Kuwait', code: '+965', iso: 'kw' },
  { name: 'Oman', code: '+968', iso: 'om' },
  { name: 'Bahrain', code: '+973', iso: 'bh' },
];


export default function Footer() {
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })

  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const countryRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (countryRef.current && !countryRef.current.contains(event.target)) {
        setIsCountryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      ...formData,
      countryCode: selectedCountry.code
    }

    try {
      const response = await saveEnquiryApi(payload);
      if (response.status === 201) {
        showAlert('Success', 'Thank you. Your enquiry has been submitted successfully.', 'success');
        setFormData({ fullname: '', email: '', phone: '', subject: '', message: '' });
      } else {
        showAlert('Error', response.data?.message || 'Failed to submit enquiry', 'error');
      }
    } catch (error) {
      console.error("Enquiry submission error:", error);
      showAlert('Error', 'Something went wrong. Please try again later.', 'error');
    }
  }

  return (
    <footer className="bg-zinc-900 border-t border-white/5 pt-20 pb-10 font-['Poppins']">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-20">

        <div className="flex flex-col lg:flex-row justify-between gap-16 mb-20">

          {/* Simple Branding */}
          <div className="lg:w-1/3">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px w-12 bg-[#ccff00]" />
              <span className="text-[11px] font-bold text-[#ccff00] uppercase tracking-[0.8em] font-['Outfit']">Contact Us</span>
            </div>
            <h2 className="text-5xl font-black text-white tracking-tighter uppercase leading-[0.85] mb-8">
              Speak with <br /> our team.
            </h2>
            <p className="text-zinc-500 text-sm font-medium leading-relaxed max-w-xs mb-10">
              We provide personalized guidance for institutional investors looking to diversify into the healthcare sector.
            </p>
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">General Inquiries</span>
              <a href="mailto:support@medhealthinvest.com" className="text-white font-bold text-lg hover:text-[#ccff00] transition-colors">
                support@medhealthinvest.com
              </a>
            </div>
          </div>

          {/* Simple Enquiry Form */}
          <div className="lg:w-1/2">
            <h3 className="text-xl font-bold text-white mb-6">Enquiry form</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
              <input
                required
                type="text"
                placeholder="Full Name"
                value={formData.fullname}
                onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                className="bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-[#ccff00]/30 outline-none transition-all"
              />
              <div className="relative flex items-center gap-2 bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 focus-within:border-[#ccff00]/30 transition-all" ref={countryRef}>
                <button
                  type="button"
                  onClick={() => setIsCountryOpen(!isCountryOpen)}
                  className="flex items-center gap-2 focus:outline-none border-r border-white/10 pr-2"
                >
                  <img
                    src={`https://flagcdn.com/w40/${selectedCountry.iso}.png`}
                    alt=""
                    className="w-4 h-2.5 object-cover rounded-[1px]"
                  />
                  <span className="text-xs font-bold text-white">{selectedCountry.code}</span>
                  <FiChevronDown className={`text-zinc-500 text-[10px] transition-transform duration-300 ${isCountryOpen ? 'rotate-180' : ''}`} />
                </button>

                {isCountryOpen && (
                  <div className="absolute top-full left-0 w-[240px] mt-2 bg-zinc-800 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in-up-short">
                    <div className="p-3 border-b border-white/5 flex items-center gap-2 bg-zinc-900/50">
                      <FiSearch className="text-zinc-500 text-xs" />
                      <input
                        type="text"
                        placeholder="Search country..."
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                        className="w-full text-[12px] text-white bg-transparent border-0 focus:ring-0 outline-none placeholder:text-zinc-600"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-[200px] overflow-y-auto scrollbar-hide">
                      {countries
                        .filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase()) || c.code.includes(countrySearch))
                        .map((c) => (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => {
                              setSelectedCountry(c);
                              setIsCountryOpen(false);
                              setCountrySearch('');
                            }}
                            className="w-full text-left px-4 py-3 text-[12px] font-medium text-zinc-400 hover:bg-zinc-700/50 hover:text-white transition-colors flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={`https://flagcdn.com/w40/${c.iso}.png`}
                                alt=""
                                className="w-4 h-2.5 object-cover rounded-[1px]"
                              />
                              <span className="truncate max-w-[120px]">{c.name}</span>
                            </div>
                            <span className="text-zinc-600 text-[10px] font-normal">{c.code}</span>
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                <input
                  required
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-transparent text-sm text-white outline-none"
                />
              </div>
              <input
                required
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-[#ccff00]/30 outline-none transition-all"
              />
              <input
                required
                type="text"
                placeholder="Subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-[#ccff00]/30 outline-none transition-all"
              />
              <textarea
                required
                rows="3"
                placeholder="Message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-[#ccff00]/30 outline-none transition-all resize-none"
              ></textarea>

              <button
                type="submit"
                className="group flex items-center justify-center gap-2 py-4 bg-[#ccff00] text-black rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white transition-all duration-300 active:scale-95"
              >
                Submit Enquiry <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>
        </div>

        {/* Minimal Bottom Bar */}
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[10px] font-medium text-zinc-600 uppercase tracking-widest">
            © 2026 MED HEALTH INVEST. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-8">
            <Link to="/privacy-policy" className="text-[10px] text-zinc-600 hover:text-white uppercase tracking-widest transition-colors font-medium">Privacy Policy</Link>
            <Link to="/terms-of-service" className="text-[10px] text-zinc-600 hover:text-white uppercase tracking-widest transition-colors font-medium">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
