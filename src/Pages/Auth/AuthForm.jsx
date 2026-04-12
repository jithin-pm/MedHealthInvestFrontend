import React, { useState, useRef, useEffect } from 'react';
import { FiArrowRight, FiCheck, FiChevronDown, FiSearch } from 'react-icons/fi';

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

export default function AuthForm() {
  const [step, setStep] = useState('email'); // 'email', 'otp', 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [isGenderOpen, setIsGenderOpen] = useState(false);
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  
  const genderRef = useRef(null);
  const countryRef = useRef(null);
  const otpRefs = useRef([]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (genderRef.current && !genderRef.current.contains(event.target)) {
        setIsGenderOpen(false);
      }
      if (countryRef.current && !countryRef.current.contains(event.target)) {
        setIsCountryOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsGenderOpen(false);
        setIsCountryOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };

  const submitEmail = (e) => {
    e.preventDefault();
    if(email && password) setStep('otp');
  };

  const submitOtp = (e) => {
    e.preventDefault();
    setStep('register');
  };

  const submitRegistration = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    alert('Account created successfully!');
  };

  return (
    <div className="w-full max-w-[420px] p-2 md:p-10 lg:p-12 bg-white border-2  border-gray-200 font-['Outfit'] shadow-none md:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
      
      {/* Sleek Minimalist Header */}
      <div className="mb-6 relative z-10  border-black/5">
        <h2 className="text-3xl md:text-4xl font-bold text-black tracking-tight mb-1 font-['Outfit']">
          {step === 'email' && 'Welcome.'}
          {step === 'otp' && 'Verify.'}
          {step === 'register' && 'Join the Elite.'}
        </h2>
        <p className="text-gray-500 text-[13px] leading-relaxed font-medium tracking-tight opacity-70 max-w-[320px]">
          {step === 'email' && 'Sign in to monitor your yields and manage your institutional-grade portfolio.'}
          {step === 'otp' && `A secure authorization code has been dispatched to your device ending in **1234.`}
          {step === 'register' && 'Complete your registration to unlock a world of exclusive, fixed-income opportunities.'}
        </p>
      </div>

      <div className="relative z-10 w-full">
        {/* Email Step */}
        {step === 'email' && (
          <form onSubmit={submitEmail} className="space-y-1 animate-fade-in-up">
            
            {/* Floating Label Input: Email */}
            <div className="relative group mt-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                id="email"
                className="block w-full pt-6 pb-2 px-0 text-[15px] font-medium text-black bg-transparent border-0 border-b border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-black peer transition-colors"
                placeholder=" "
                required
              />
              <label 
                htmlFor="email" 
                className="absolute text-[10px] tracking-[0.2em] font-semibold text-gray-400 uppercase duration-300 transform -translate-y-4 scale-100 top-5 z-10 origin-left peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-100 peer-focus:-translate-y-4 peer-focus:text-gray-800"
              >
                Email Address
              </label>
            </div>

            {/* Floating Label Input: Password */}
            <div className="relative group mt-6">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                id="password"
                className="block w-full pt-6 pb-2 px-0 text-[15px] font-medium text-black bg-transparent border-0 border-b border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-black peer transition-colors"
                placeholder=" "
                required
              />
              <label 
                htmlFor="password" 
                className="absolute text-[10px] tracking-[0.2em] font-semibold text-gray-400 uppercase duration-300 transform -translate-y-4 scale-100 top-5 z-10 origin-left peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-100 peer-focus:-translate-y-4 peer-focus:text-gray-800"
              >
                Password
              </label>
            </div>

            <div className="flex justify-end mt-2">
              <button type="button" className="text-[10px] text-gray-400 hover:text-black transition-colors uppercase tracking-widest font-semibold">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-4 mt-10 bg-black text-white text-[10px] font-black tracking-[0.2em] uppercase flex items-center justify-between px-8 hover:bg-gray-800 transition-all duration-300 hover:tracking-[0.25em]"
            >
              <span>Continue</span>
              <FiArrowRight className="text-base" />
            </button>
            
            <div className="pt-8 mt-6 border-t border-gray-100">
              <button type="button" onClick={() => setStep('register')} className="text-[10px] text-gray-400 hover:text-black transition-colors uppercase tracking-widest font-semibold flex items-center gap-2 group">
                New Investor? 
                <span className="text-black font-black uppercase inline-block relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-px after:bottom-0 after:left-0 after:bg-black after:origin-bottom-right after:transition-transform after:duration-300 group-hover:after:scale-x-100 group-hover:after:origin-bottom-left">
                  Create Account
                </span>
              </button>
            </div>
          </form>
        )}

        {/* OTP Step */}
        {step === 'otp' && (
          <form onSubmit={submitOtp} className="space-y-10 animate-fade-in-up">
            <div className="flex justify-between gap-3 mt-4">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (otpRefs.current[idx] = el)}
                  type="text"
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className="w-full pb-2 text-center text-3xl text-black font-light bg-transparent border-0 border-b border-gray-300 focus:outline-none focus:border-black transition-colors selection:bg-gray-200"
                  required
                />
              ))}
            </div>
            
            <button
              type="submit"
              className="w-full py-4 mt-8 bg-black text-white text-[10px] font-black tracking-[0.2em] uppercase flex items-center justify-between px-8 hover:bg-gray-800 transition-all duration-300 hover:tracking-[0.25em]"
            >
              <span>Authenticate</span>
              <FiCheck className="text-base" />
            </button>
            
            <div className="pt-2">
               <button type="button" onClick={() => setStep('email')} className="text-[10px] text-gray-400 hover:text-black transition-colors uppercase tracking-widest font-semibold">
                ← Back to Email
              </button>
            </div>
          </form>
        )}

        {/* Register Step */}
        {step === 'register' && (
          <form onSubmit={submitRegistration} className="space-y-2 animate-fade-in-up">
            
            <div className="relative group mt-2">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                id="name"
                className="block w-full pt-6 pb-2 px-0 text-[15px] font-medium text-black bg-transparent border-0 border-b border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-black peer transition-colors"
                placeholder=" "
                required
              />
              <label 
                htmlFor="name" 
                className="absolute text-[10px] tracking-[0.2em] font-semibold text-gray-400 uppercase duration-300 transform -translate-y-4 scale-100 top-5 z-10 origin-left peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-100 peer-focus:-translate-y-4 peer-focus:text-gray-800"
              >
                Full Name
              </label>
            </div>

            <div className="relative group" ref={countryRef}>
              <div className="flex items-end gap-3 transition-colors group-focus-within:border-black">
                {/* Country Selector */}
                <div className="relative pb-2 border-b border-gray-300 min-w-[85px]">
                  <button
                    type="button"
                    onClick={() => setIsCountryOpen(!isCountryOpen)}
                    className="flex items-center justify-between w-full h-full pt-6 focus:outline-none"
                  >
                    <div className="flex items-center gap-2">
                      <img 
                        src={`https://flagcdn.com/w40/${selectedCountry.iso}.png`} 
                        alt="" 
                        className="w-5 h-3.5 object-cover rounded-[2px] shadow-sm mb-0.5"
                      />
                      <span className="text-[14px] font-medium text-black">{selectedCountry.code}</span>
                    </div>
                    <FiChevronDown className={`text-gray-400 text-[10px] transition-transform duration-300 ${isCountryOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Country Dropdown */}
                  {isCountryOpen && (
                    <div className="absolute top-full left-0 w-[260px] mt-1 bg-white border border-gray-100 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.15)] z-[60] animate-fade-in-up-short overflow-hidden">
                      <div className="p-3 border-b border-gray-50 flex items-center gap-2 bg-gray-50/50">
                        <FiSearch className="text-gray-400 text-xs" />
                        <input 
                          type="text"
                          placeholder="Search country..."
                          value={countrySearch}
                          onChange={(e) => setCountrySearch(e.target.value)}
                          className="w-full text-[12px] text-black bg-transparent border-0 focus:ring-0 outline-none placeholder:text-gray-400"
                          autoFocus
                        />
                      </div>
                      <div className="max-h-[220px] overflow-y-auto custom-scrollbar">
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
                            className="w-full text-left px-4 py-3 text-[13px] font-medium text-gray-600 hover:bg-gray-50 hover:text-black transition-colors flex items-center justify-between group/opt"
                          >
                            <div className="flex items-center gap-3">
                              <img 
                                src={`https://flagcdn.com/w40/${c.iso}.png`} 
                                alt="" 
                                className="w-5 h-3.5 object-cover rounded-[2px] shadow-sm"
                              />
                              <span className="truncate max-w-[140px]">{c.name}</span>
                            </div>
                            <span className="text-gray-400 text-[11px] font-normal">{c.code}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Phone Input */}
                <div className="relative flex-1">
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    id="phone"
                    className="block w-full pt-6 pb-2 px-0 text-[15px] font-medium text-black bg-transparent border-0 border-b border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-black peer transition-colors"
                    placeholder=" "
                    required
                  />
                  <label 
                    htmlFor="phone" 
                    className="absolute text-[10px] tracking-[0.2em] font-semibold text-gray-400 uppercase duration-300 transform -translate-y-4 scale-100 top-5 z-10 origin-left peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-100 peer-focus:-translate-y-4 peer-focus:text-gray-800"
                  >
                    Phone Number
                  </label>
                </div>
              </div>
            </div>

            <div className="relative group mb-6" ref={genderRef}>
              {/* Custom Dropdown Trigger */}
              <button
                type="button"
                onClick={() => setIsGenderOpen(!isGenderOpen)}
                className={`block w-full pt-6 pb-2 px-0 text-[15px] font-medium bg-transparent border-0 border-b border-gray-300 transition-colors flex items-center justify-between focus:outline-none focus:border-black ${formData.gender ? 'text-black' : 'text-gray-400'}`}
              >
                <span className={!formData.gender && !isGenderOpen ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}>
                  {formData.gender ? formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1) : 'Select Gender...'}
                </span>
                <FiChevronDown className={`text-gray-400 text-[14px] transition-transform duration-300 ${isGenderOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Custom Dropdown Menu */}
              {isGenderOpen && (
                <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-100 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.15)] py-2 z-50 animate-fade-in-up-short">
                  {['male', 'female', 'other'].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, gender: option });
                        setIsGenderOpen(false);
                      }}
                      className="w-full text-left px-5 py-3 text-[14px] font-medium text-gray-600 hover:bg-gray-50 hover:text-black transition-colors flex items-center justify-between group/opt"
                    >
                      <span>{option.charAt(0).toUpperCase() + option.slice(1)}</span>
                      {formData.gender === option && <FiCheck className="text-black text-xs" />}
                    </button>
                  ))}
                </div>
              )}

              <label 
                className={`absolute text-[10px] duration-300 transform origin-left tracking-[0.2em] uppercase font-semibold z-10 pointer-events-none top-5 
                  ${(formData.gender || isGenderOpen) ? '-translate-y-4 text-gray-800' : 'translate-y-0 text-gray-400'}`}
              >
                Gender
              </label>
            </div>

            <div className="relative group">
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                id="reg-password"
                className="block w-full pt-6 pb-2 px-0 text-[15px] font-medium text-black bg-transparent border-0 border-b border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-black peer transition-colors"
                placeholder=" "
                required
              />
              <label 
                htmlFor="reg-password" 
                className="absolute text-[10px] tracking-[0.2em] font-semibold text-gray-400 uppercase duration-300 transform -translate-y-4 scale-100 top-5 z-10 origin-left peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-100 peer-focus:-translate-y-4 peer-focus:text-gray-800"
              >
                Password
              </label>
            </div>

            <div className="relative group">
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                id="confirmPassword"
                className="block w-full pt-6 pb-2 px-0 text-[15px] font-medium text-black bg-transparent border-0 border-b border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-black peer transition-colors"
                placeholder=" "
                required
              />
              <label 
                htmlFor="confirmPassword" 
                className="absolute text-[10px] tracking-[0.2em] font-semibold text-gray-400 uppercase duration-300 transform -translate-y-4 scale-100 top-5 z-10 origin-left peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-100 peer-focus:-translate-y-4 peer-focus:text-gray-800"
              >
                Confirm Password
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-4 mt-8 bg-black text-white text-[10px] font-black tracking-[0.2em] uppercase flex items-center justify-between px-8 hover:bg-gray-800 transition-all duration-300 hover:tracking-[0.25em]"
            >
              <span>Create Account</span>
              <FiArrowRight className="text-base" />
            </button>
            
            <div className="pt-8 mt-6 border-t border-gray-100">
               <button type="button" onClick={() => setStep('email')} className="text-[10px] text-gray-400 hover:text-black transition-colors uppercase tracking-widest font-semibold group flex items-center gap-2">
                Already an investor? 
                <span className="text-black font-black uppercase inline-block relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-px after:bottom-0 after:left-0 after:bg-black after:origin-bottom-right after:transition-transform after:duration-300 group-hover:after:scale-x-100 group-hover:after:origin-bottom-left">
                  Login Here
                </span>
               </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
