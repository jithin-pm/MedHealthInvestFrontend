import React, { useState, useRef, useEffect } from 'react';
import { FiArrowRight, FiCheck, FiChevronDown, FiSearch, FiEye, FiEyeOff } from 'react-icons/fi';
import { registerUserApi, loginUserApi, verifyLoginOtpApi, forgotPasswordApi, resetPasswordApi } from '../../Services/allApi';
import { showAlert } from '../../Utils/alert';

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
  const [tempToken, setTempToken] = useState('');
  const [mobileEnding, setMobileEnding] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [forgotPhone, setForgotPhone] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [confirmResetPassword, setConfirmResetPassword] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    gender: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [isGenderOpen, setIsGenderOpen] = useState(false);
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showConfirmResetPassword, setShowConfirmResetPassword] = useState(false);
  
  const [attemptsMessage, setAttemptsMessage] = useState(null);
  const [passwordErrorMsg, setPasswordErrorMsg] = useState(null);
  const [lockoutEndTime, setLockoutEndTime] = useState(() => {
    return localStorage.getItem('loginLockoutEndTime') || null;
  });
  const [countdownStr, setCountdownStr] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  
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

  useEffect(() => {
    let interval;
    if (lockoutEndTime) {
      interval = setInterval(() => {
        const now = new Date().getTime();
        const end = parseInt(lockoutEndTime, 10);
        const distance = end - now;

        if (distance <= 0) {
          clearInterval(interval);
          setLockoutEndTime(null);
          localStorage.removeItem('loginLockoutEndTime');
          setCountdownStr('');
        } else {
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          setCountdownStr(`${hours}h ${minutes}m ${seconds}s`);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [lockoutEndTime]);

  useEffect(() => {
    let timer;
    if ((step === 'otp' || step === 'forgot-otp') && otpTimer > 0) {
      timer = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, otpTimer]);

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

  const validatePassword = (password) => {
    if (password.length < 6) return "Password must be at least 6 characters long.";
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";
    if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter.";
    if (!/[0-9]/.test(password)) return "Password must contain at least one number.";
    return null;
  };

  const renderPasswordRequirements = (password) => {
    const rules = [
      { id: 1, text: "At least 6 characters", met: password.length >= 6 },
      { id: 2, text: "One uppercase letter", met: /[A-Z]/.test(password) },
      { id: 3, text: "One lowercase letter", met: /[a-z]/.test(password) },
      { id: 4, text: "One number", met: /[0-9]/.test(password) }
    ];

    return (
      <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 mt-3 mb-2 px-1 animate-fade-in-up-short">
        {rules.map(rule => (
          <div key={rule.id} className="flex items-center gap-1.5">
            <div className={`w-3.5 h-3.5 rounded-full flex-shrink-0 flex items-center justify-center transition-colors duration-300 ${rule.met ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-300'}`}>
              <FiCheck className="text-[9px] stroke-[3]" />
            </div>
            <span className={`text-[10px] font-semibold tracking-wide transition-colors duration-300 whitespace-nowrap ${rule.met ? 'text-green-600' : 'text-gray-400'}`}>
              {rule.text}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const submitEmail = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showAlert('Error', 'Please enter both email and password.', 'warning');
      return;
    }

    try {
      const response = await loginUserApi({ email, password });
      if (response.status === 200) {
        if (response.data.requiresOtp) {
           setTempToken(response.data.tempToken);
           setMobileEnding(response.data.mobileEnding);
           setStep('otp');
           setOtpTimer(60);
        } else {
           const { accessToken, user } = response.data;
           localStorage.setItem('medhealthinvestuser', JSON.stringify({ ...user, accessToken }));
           window.location.href = '/'; 
        }
      } else {
        setAttemptsMessage(response.data?.message || 'Invalid email or password');
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error.response?.data?.message || 'Something went wrong. Please try again.';
      
      // Clear password input on any failure
      setPassword('');

      if (errorMessage.toLowerCase().includes('locked')) {
        let hours = 24;
        const match = errorMessage.match(/(\d+)\s*hour/i);
        if (match) hours = parseInt(match[1], 10);
        
        const endTime = new Date().getTime() + hours * 60 * 60 * 1000;
        setLockoutEndTime(endTime.toString());
        localStorage.setItem('loginLockoutEndTime', endTime.toString());
        setAttemptsMessage(null);
      } else {
        setAttemptsMessage(errorMessage);
      }
    }
  };

  const submitOtp = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
       showAlert('Error', 'Please enter a valid 6-digit OTP', 'warning');
       return;
    }

    try {
      const response = await verifyLoginOtpApi({ tempToken, otp: otpValue });
      if (response.status === 200) {
        const { accessToken, user } = response.data;
        localStorage.setItem('medhealthinvestuser', JSON.stringify({ ...user, accessToken }));
        window.location.href = '/';
      }
    } catch (error) {
       console.error("OTP Verification error:", error);
       showAlert('Error', error.response?.data?.message || 'Invalid OTP', 'error');
    }
  };

  const submitForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotPhone) {
      showAlert('Error', 'Please enter your mobile number.', 'warning');
      return;
    }
    try {
      const response = await forgotPasswordApi({ mobileNumber: forgotPhone, countryCode: selectedCountry.code });
      if (response.status === 200) {
         setTempToken(response.data.tempToken);
         setMobileEnding(response.data.mobileEnding);
         setStep('forgot-otp');
         setOtpTimer(60);
         setOtp(['', '', '', '', '', '']); 
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      showAlert('Error', error.response?.data?.message || 'Something went wrong.', 'error');
    }
  };

  const submitForgotOtp = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
       showAlert('Error', 'Please enter a valid 6-digit OTP', 'warning');
       return;
    }
    setStep('forgot-reset');
  };

  const submitResetPassword = async (e) => {
    e.preventDefault();
    if (resetPassword !== confirmResetPassword) {
      setPasswordErrorMsg("Passwords do not match.");
      return;
    }
    const passwordError = validatePassword(resetPassword);
    if (passwordError) {
      setPasswordErrorMsg(passwordError);
      return;
    }
    const otpValue = otp.join('');
    try {
      const response = await resetPasswordApi({ tempToken, otp: otpValue, newPassword: resetPassword });
      if (response.status === 200) {
        showAlert('Success', 'Password reset successfully. You can now login.', 'success');
        setStep('email');
        setPassword('');
        setResetPassword('');
        setConfirmResetPassword('');
        setOtp(['', '', '', '', '', '']);
      }
    } catch (error) {
      console.error("Reset password error:", error);
      showAlert('Error', error.response?.data?.message || 'Invalid OTP or expired session.', 'error');
      if (error.response?.data?.message?.toLowerCase().includes('expired')) {
         setStep('forgot-email'); 
      } else {
         setStep('forgot-otp'); 
      }
    }
  };



  const submitRegistration = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setPasswordErrorMsg("Passwords do not match.");
      return;
    }
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setPasswordErrorMsg(passwordError);
      return;
    }


    const payload = {
      fullName: formData.name,
      email: formData.email,
      password: formData.password,
      gender: formData.gender,
      mobileNumber: formData.phone,
      countryCode: selectedCountry.code
    };

    try {
      const response = await registerUserApi(payload);
      if (response.status === 201) {
        showAlert('Success', 'Account created successfully!', 'success');
        setStep('email'); // Redirect to login
      } else {
        showAlert('Error', response.data?.message || 'Registration failed', 'error');
      }
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage = error.response?.data?.message || 'Something went wrong. Please try again.';
      showAlert('Error', errorMessage, 'error');
    }
  };

  return (
    <div className="w-full max-w-[420px] p-10 md:p-10 lg:p-12 bg-white border border-gray-100 md:border-2 md:border-gray-200 font-['Outfit'] shadow-2xl rounded-2xl md:rounded-none md:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
      
      {/* Sleek Minimalist Header */}
      <div className="mb-6 relative z-10  border-black/5">
        <h2 className="text-3xl md:text-4xl font-bold text-black tracking-tight mb-1 font-['Outfit']">
          {step === 'email' && 'Welcome.'}
          {step === 'otp' && 'Verify.'}
          {step === 'register' && 'Join the Elite.'}
        </h2>
        <p className="text-gray-500 text-[13px] leading-relaxed font-medium tracking-tight opacity-70 max-w-[320px]">
          {step === 'email' && 'Sign in to monitor your yields and manage your institutional-grade projects.'}
          {step === 'otp' && `A secure authorization code has been dispatched to your device ending in **${mobileEnding}.`}
          {step === 'register' && 'Complete your registration to unlock a world of exclusive, fixed-income opportunities.'}
        </p>
      </div>

      <div className="relative z-10 w-full">
        {/* Email Step */}
        {step === 'email' && (
          <form onSubmit={submitEmail} className="space-y-2 animate-fade-in-up">
            
            {/* Floating Label Input: Email */}
            <div className="relative group">
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

            {attemptsMessage && !lockoutEndTime && (
              <div className="text-red-500 text-[11px] font-medium animate-pulse mb-1 mt-4">{attemptsMessage}</div>
            )}
            {lockoutEndTime && (
              <div className="text-red-600 text-[11px] font-bold mb-1 mt-4">
                Account locked. Try again in {countdownStr}
              </div>
            )}
            
            {/* Floating Label Input: Password */}
            <div className="relative group">
              <input
                type={showLoginPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                id="password"
                disabled={!!lockoutEndTime}
                className={`block w-full pt-6 pb-2 px-0 text-[15px] font-medium ${lockoutEndTime ? 'text-gray-400 cursor-not-allowed bg-transparent' : 'text-black bg-transparent'} border-0 border-b border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-black peer transition-colors pr-10`}
                placeholder=" "
                required
              />
              <label 
                htmlFor="password" 
                className="absolute text-[10px] tracking-[0.2em] font-semibold text-gray-400 uppercase duration-300 transform -translate-y-4 scale-100 top-5 z-10 origin-left peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-100 peer-focus:-translate-y-4 peer-focus:text-gray-800"
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowLoginPassword(!showLoginPassword)}
                className="absolute right-0 bottom-2 text-gray-400 hover:text-black transition-colors focus:outline-none z-20 p-1"
              >
                {showLoginPassword ? <FiEyeOff className="text-[18px]" /> : <FiEye className="text-[18px]" />}
              </button>
            </div>

            <div className="flex justify-end mt-2">
              <button type="button" onClick={() => setStep('forgot-email')} className="text-[10px] text-gray-400 hover:text-black transition-colors uppercase tracking-widest font-semibold">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={!!lockoutEndTime}
              className={`w-full py-4 mt-4 text-[10px] font-black tracking-[0.2em] uppercase flex items-center justify-between px-8 transition-all duration-300 ${lockoutEndTime ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-800 hover:tracking-[0.25em]'}`}
            >
              <span>Continue</span>
              <FiArrowRight className="text-base" />
            </button>
            
            <div className="pt-4 mt-2 border-t border-gray-100">
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

            {otpTimer > 0 ? (
              <div className="pt-2 text-center mt-4">
                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
                  OTP expires in <span className="font-black text-xs text-black">
                    {Math.floor(otpTimer / 60).toString().padStart(2, '0')}:{(otpTimer % 60).toString().padStart(2, '0')}
                  </span>
                </span>
              </div>
            ) : (
              <div className="pt-2 text-center mt-4">
                <button type="button" onClick={submitEmail} className="text-[10px] text-black hover:text-gray-600 transition-colors uppercase tracking-widest font-black underline">
                  Resend OTP
                </button>
              </div>
            )}
            
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
            
            <div className="relative group">
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

            <div className="relative group">
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                id="reg-email"
                className="block w-full pt-6 pb-2 px-0 text-[15px] font-medium text-black bg-transparent border-0 border-b border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-black peer transition-colors"
                placeholder=" "
                required
              />
              <label 
                htmlFor="reg-email" 
                className="absolute text-[10px] tracking-[0.2em] font-semibold text-gray-400 uppercase duration-300 transform -translate-y-4 scale-100 top-5 z-10 origin-left peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-100 peer-focus:-translate-y-4 peer-focus:text-gray-800"
              >
                Email Address
              </label>
            </div>

            <div className="relative group" ref={countryRef}>
              <div className="flex items-end gap-3 transition-colors group-focus-within:border-black">
                {/* Country Selector */}
                <div className="relative border-b border-gray-300 min-w-[85px]">
                  <button
                    type="button"
                    onClick={() => setIsCountryOpen(!isCountryOpen)}
                    className="flex items-center justify-between w-full h-full pt-6 pb-2 focus:outline-none"
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

            <div className="relative group" ref={genderRef}>
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
                type={showRegPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                id="reg-password"
                className="block w-full pt-6 pb-2 px-0 text-[15px] font-medium text-black bg-transparent border-0 border-b border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-black peer transition-colors pr-10"
                placeholder=" "
                required
              />
              <label 
                htmlFor="reg-password" 
                className="absolute text-[10px] tracking-[0.2em] font-semibold text-gray-400 uppercase duration-300 transform -translate-y-4 scale-100 top-5 z-10 origin-left peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-100 peer-focus:-translate-y-4 peer-focus:text-gray-800"
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowRegPassword(!showRegPassword)}
                className="absolute right-0 bottom-2 text-gray-400 hover:text-black transition-colors focus:outline-none z-20 p-1"
              >
                {showRegPassword ? <FiEyeOff className="text-[18px]" /> : <FiEye className="text-[18px]" />}
              </button>
            </div>
            {renderPasswordRequirements(formData.password)}

            <div className="relative group">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                id="confirmPassword"
                disabled={!!validatePassword(formData.password)}
                className={`block w-full pt-6 pb-2 px-0 text-[15px] font-medium text-black bg-transparent border-0 border-b border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-black peer transition-colors pr-10 ${!!validatePassword(formData.password) ? 'opacity-50 cursor-not-allowed' : ''}`}
                placeholder=" "
                required
              />
              <label 
                htmlFor="confirmPassword" 
                className="absolute text-[10px] tracking-[0.2em] font-semibold text-gray-400 uppercase duration-300 transform -translate-y-4 scale-100 top-5 z-10 origin-left peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-100 peer-focus:-translate-y-4 peer-focus:text-gray-800"
              >
                Confirm Password
              </label>
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-0 bottom-2 text-gray-400 hover:text-black transition-colors focus:outline-none z-20 p-1"
              >
                {showConfirmPassword ? <FiEyeOff className="text-[18px]" /> : <FiEye className="text-[18px]" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={!!validatePassword(formData.password) || formData.password !== formData.confirmPassword}
              className={`w-full py-4 mt-4 text-[10px] font-black tracking-[0.2em] uppercase flex items-center justify-between px-8 transition-all duration-300 ${(!validatePassword(formData.password) && formData.password === formData.confirmPassword) ? 'bg-black text-white hover:bg-gray-800 hover:tracking-[0.25em]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
            >
              <span>Create Account</span>
              <FiArrowRight className="text-base" />
            </button>
            
            <div className="pt-4 mt-2 border-t border-gray-100">
               <button type="button" onClick={() => setStep('email')} className="text-[10px] text-gray-400 hover:text-black transition-colors uppercase tracking-widest font-semibold group flex items-center gap-2">
                Already an investor? 
                <span className="text-black font-black uppercase inline-block relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-px after:bottom-0 after:left-0 after:bg-black after:origin-bottom-right after:transition-transform after:duration-300 group-hover:after:scale-x-100 group-hover:after:origin-bottom-left">
                  Login Here
                </span>
               </button>
            </div>
          </form>
        )}

        {/* Forgot Password - Phone Step */}
        {step === 'forgot-email' && (
          <form onSubmit={submitForgotPassword} className="space-y-4 animate-fade-in-up">
            <h3 className="text-xl font-bold mb-6 text-black tracking-wide">Reset Password</h3>
            <p className="text-sm text-gray-500 mb-6 font-medium leading-relaxed">Enter your registered mobile number to receive an authorization code.</p>
            
            <div className="relative group" ref={countryRef}>
              <div className="flex items-end gap-3 transition-colors group-focus-within:border-black">
                {/* Country Selector */}
                <div className="relative border-b border-gray-300 min-w-[85px]">
                  <button
                    type="button"
                    onClick={() => setIsCountryOpen(!isCountryOpen)}
                    className="flex items-center justify-between w-full h-full pt-6 pb-2 focus:outline-none"
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
                              <img src={`https://flagcdn.com/w40/${c.iso}.png`} alt="" className="w-5 h-3.5 object-cover rounded-sm shadow-sm" />
                              <span>{c.name}</span>
                            </div>
                            <span className="text-gray-400 font-mono text-[11px] group-hover/opt:text-gray-600">{c.code}</span>
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
                    value={forgotPhone}
                    onChange={(e) => setForgotPhone(e.target.value.replace(/\D/g, ''))}
                    id="forgot-phone"
                    className="block w-full pt-6 pb-2 px-0 text-[15px] font-medium text-black bg-transparent border-0 border-b border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-black peer transition-colors"
                    placeholder=" "
                    required
                  />
                  <label 
                    htmlFor="forgot-phone" 
                    className="absolute text-[10px] tracking-[0.2em] font-semibold text-gray-400 uppercase duration-300 transform -translate-y-4 scale-100 top-5 z-10 origin-left peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-100 peer-focus:-translate-y-4 peer-focus:text-gray-800"
                  >
                    Mobile Number
                  </label>
                </div>
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full py-4 mt-8 bg-black text-white text-[10px] font-black tracking-[0.2em] uppercase flex items-center justify-between px-8 hover:bg-gray-800 transition-all duration-300 hover:tracking-[0.25em]"
            >
              <span>Send OTP</span>
              <FiArrowRight className="text-base" />
            </button>
            
            <div className="pt-2">
               <button type="button" onClick={() => setStep('email')} className="text-[10px] text-gray-400 hover:text-black transition-colors uppercase tracking-widest font-semibold">
                ← Back to Login
              </button>
            </div>
          </form>
        )}

        {/* Forgot Password - OTP Step */}
        {step === 'forgot-otp' && (
          <form onSubmit={submitForgotOtp} className="space-y-10 animate-fade-in-up">
            <h3 className="text-xl font-bold mb-2 text-black tracking-wide">Verify.</h3>
            <p className="text-[13px] text-gray-500 font-medium leading-relaxed">
              A secure authorization code has been dispatched to your device ending in *{mobileEnding}.
            </p>

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

            {otpTimer > 0 ? (
              <div className="pt-2 text-center mt-4">
                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
                  OTP expires in <span className="font-black text-xs text-black">
                    {Math.floor(otpTimer / 60).toString().padStart(2, '0')}:{(otpTimer % 60).toString().padStart(2, '0')}
                  </span>
                </span>
              </div>
            ) : (
              <div className="pt-2 text-center mt-4">
                <button type="button" onClick={submitForgotPassword} className="text-[10px] text-black hover:text-gray-600 transition-colors uppercase tracking-widest font-black underline">
                  Resend OTP
                </button>
              </div>
            )}
            
            <button
              type="submit"
              className="w-full py-4 mt-8 bg-black text-white text-[10px] font-black tracking-[0.2em] uppercase flex items-center justify-between px-8 hover:bg-gray-800 transition-all duration-300 hover:tracking-[0.25em]"
            >
              <span>Continue</span>
              <FiArrowRight className="text-base" />
            </button>
            
            <div className="pt-2">
               <button type="button" onClick={() => setStep('forgot-email')} className="text-[10px] text-gray-400 hover:text-black transition-colors uppercase tracking-widest font-semibold">
                ← Back
              </button>
            </div>
          </form>
        )}

        {/* Forgot Password - Reset Password Step */}
        {step === 'forgot-reset' && (
          <form onSubmit={submitResetPassword} className="space-y-6 animate-fade-in-up">
            <h3 className="text-xl font-bold mb-6 text-black tracking-wide">New Password</h3>
            <p className="text-sm text-gray-500 mb-6 font-medium leading-relaxed">Please enter your new secure password.</p>
            
            <div className="relative group">
              <input
                type={showResetPassword ? "text" : "password"}
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                id="reset-password"
                className="block w-full pt-6 pb-2 px-0 text-[15px] font-medium text-black bg-transparent border-0 border-b border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-black peer transition-colors pr-10"
                placeholder=" "
                required
              />
              <label 
                htmlFor="reset-password" 
                className="absolute text-[10px] tracking-[0.2em] font-semibold text-gray-400 uppercase duration-300 transform -translate-y-4 scale-100 top-5 z-10 origin-left peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-100 peer-focus:-translate-y-4 peer-focus:text-gray-800"
              >
                New Password
              </label>
              <button
                type="button"
                onClick={() => setShowResetPassword(!showResetPassword)}
                className="absolute right-0 bottom-2 text-gray-400 hover:text-black transition-colors focus:outline-none z-20 p-1"
              >
                {showResetPassword ? <FiEyeOff className="text-[18px]" /> : <FiEye className="text-[18px]" />}
              </button>
            </div>
            {renderPasswordRequirements(resetPassword)}

            <div className="relative group">
              <input
                type={showConfirmResetPassword ? "text" : "password"}
                value={confirmResetPassword}
                onChange={(e) => setConfirmResetPassword(e.target.value)}
                id="confirm-reset-password"
                disabled={!!validatePassword(resetPassword)}
                className={`block w-full pt-6 pb-2 px-0 text-[15px] font-medium text-black bg-transparent border-0 border-b border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-black peer transition-colors pr-10 ${!!validatePassword(resetPassword) ? 'opacity-50 cursor-not-allowed' : ''}`}
                placeholder=" "
                required
              />
              <label 
                htmlFor="confirm-reset-password" 
                className="absolute text-[10px] tracking-[0.2em] font-semibold text-gray-400 uppercase duration-300 transform -translate-y-4 scale-100 top-5 z-10 origin-left peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-100 peer-focus:-translate-y-4 peer-focus:text-gray-800"
              >
                Confirm Password
              </label>
              <button
                type="button"
                onClick={() => setShowConfirmResetPassword(!showConfirmResetPassword)}
                className="absolute right-0 bottom-2 text-gray-400 hover:text-black transition-colors focus:outline-none z-20 p-1"
              >
                {showConfirmResetPassword ? <FiEyeOff className="text-[18px]" /> : <FiEye className="text-[18px]" />}
              </button>
            </div>
            
            {passwordErrorMsg && (
              <div className="text-red-500 text-[11px] font-medium animate-pulse mt-2">{passwordErrorMsg}</div>
            )}
            
            <button
              type="submit"
              disabled={!!validatePassword(resetPassword) || resetPassword !== confirmResetPassword}
              className={`w-full py-4 mt-8 text-[10px] font-black tracking-[0.2em] uppercase flex items-center justify-between px-8 transition-all duration-300 ${(!validatePassword(resetPassword) && resetPassword === confirmResetPassword) ? 'bg-black text-white hover:bg-gray-800 hover:tracking-[0.25em]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
            >
              <span>Reset Password</span>
              <FiCheck className="text-base" />
            </button>
            
            <div className="pt-2">
               <button type="button" onClick={() => {
                 setStep('forgot-email');
                 setOtp(['', '', '', '', '', '']);
                 setResetPassword('');
                 setConfirmResetPassword('');
               }} className="text-[10px] text-gray-400 hover:text-black transition-colors uppercase tracking-widest font-semibold">
                ← Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
