import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiArrowRight, FiCheck, FiChevronDown, FiSearch, FiEye, FiEyeOff, FiLoader } from 'react-icons/fi';
import { registerUserApi, verifyRegistrationOtpApi, loginUserApi, verifyLoginOtpApi, forgotPasswordApi, resetPasswordApi } from '../../Services/allApi';
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
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode');
  const [step, setStep] = useState(initialMode === 'register' ? 'register' : 'email'); // 'email', 'otp', 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [mobileEnding, setMobileEnding] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
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
  const [isGeneratingOtp, setIsGeneratingOtp] = useState(false);
  const [isSendingForgotOtp, setIsSendingForgotOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isSubmittingReg, setIsSubmittingReg] = useState(false);
  const [isVerifyingRegOtp, setIsVerifyingRegOtp] = useState(false);
  const isDev = import.meta.env.DEV;
  const [lockoutEndTime, setLockoutEndTime] = useState(() => {
    if (import.meta.env.DEV) {
      localStorage.removeItem('loginLockoutEndTime');
      return null;
    }
    const saved = localStorage.getItem('loginLockoutEndTime');
    if (saved && parseInt(saved, 10) <= Date.now()) {
      localStorage.removeItem('loginLockoutEndTime');
      return null;
    }
    return saved || null;
  });
  const [countdownStr, setCountdownStr] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);

  const genderRef = useRef(null);
  const countryRef = useRef(null);
  const otpRefs = useRef([]);

  useEffect(() => {
    if (isDev) {
      localStorage.removeItem('loginLockoutEndTime');
      setLockoutEndTime(null);
    }
  }, []);

  const switchToRegister = () => {
    setFormData({
      name: '',
      email: '',
      gender: '',
      phone: '',
      password: '',
      confirmPassword: ''
    });
    setPasswordErrorMsg(null);
    setAttemptsMessage(null);
    setStep('register');
  };

  const switchToLogin = () => {
    setFormData({
      name: '',
      email: '',
      gender: '',
      phone: '',
      password: '',
      confirmPassword: ''
    });
    setEmail('');
    setPassword('');
    setAttemptsMessage(null);
    setStep('email');
  };

  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'register') {
      switchToRegister();
    } else if (mode === 'login') {
      switchToLogin();
    }
  }, [searchParams]);

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
    if ((step === 'otp' || step === 'forgot-otp' || step === 'register-otp') && otpTimer > 0) {
      timer = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, otpTimer]);

  const handleOtpChange = (index, value) => {
    const cleanVal = value.replace(/\D/g, '');
    if (!cleanVal && value !== '') return;
    const newOtp = [...otp];
    newOtp[index] = cleanVal.substring(cleanVal.length - 1);
    setOtp(newOtp);

    if (cleanVal && index < 3) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        otpRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 3) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().replace(/\D/g, '').slice(0, 4);
    if (!pastedData) return;
    const newOtp = ['', '', '', ''];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    const focusIndex = Math.min(pastedData.length, 3);
    otpRefs.current[focusIndex]?.focus();
  };

  const validatePassword = (password) => {
    if (password.length < 6) return "Password must be at least 6 characters long.";
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";
    if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter.";
    if (!/[0-9]/.test(password)) return "Password must contain at least one number.";
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)) return "Password must contain at least one special character.";
    return null;
  };

  const renderPasswordRequirements = (password) => {
    const rules = [
      { id: 1, text: "At least 6 characters", met: password.length >= 6 },
      { id: 2, text: "One uppercase letter", met: /[A-Z]/.test(password) },
      { id: 3, text: "One lowercase letter", met: /[a-z]/.test(password) },
      { id: 4, text: "One number", met: /[0-9]/.test(password) },
      { id: 5, text: "One special character", met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password) }
    ];

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 mt-3 mb-2 px-1 animate-fade-in-up-short">
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
    if (e) e.preventDefault();
    if (isGeneratingOtp) return;
    if (!email || !password) {
      showAlert('Error', 'Please enter both email and password.', 'warning');
      return;
    }

    setIsGeneratingOtp(true);
    try {
      const response = await loginUserApi({ email, password });
      if (response.status === 200) {
        localStorage.removeItem('loginLockoutEndTime');
        setLockoutEndTime(null);
        if (response.data.requiresOtp) {
          setTempToken(response.data.tempToken);
          setMobileEnding(response.data.mobileEnding);
          setStep('otp');
          setOtpTimer(60);
          setOtp(['', '', '', '']);
          setTimeout(() => otpRefs.current[0]?.focus(), 50);
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
      const isInactive = error.response?.data?.isInactive || error.response?.data?.message?.toLowerCase().includes('deactivated');
      if (isInactive) {
        setPassword('');
        window.dispatchEvent(new CustomEvent('account_deactivated', {
          detail: {
            message: error.response?.data?.message || 'Your account has been deactivated by administrator. Please contact support.'
          }
        }));
        return;
      }
      const errorMessage = error.response?.data?.message || 'Something went wrong. Please try again.';

      // Clear password input on any failure
      setPassword('');

      const isLocked = error.response?.data?.isLocked || (error.response?.status === 403 && !isInactive);

      if (isLocked) {
        let hours = error.response?.data?.remainingHours || 24;
        const match = errorMessage.match(/(\d+)\s*hour/i);
        if (match) hours = parseInt(match[1], 10);

        const endTime = new Date().getTime() + hours * 60 * 60 * 1000;
        setLockoutEndTime(endTime.toString());
        localStorage.setItem('loginLockoutEndTime', endTime.toString());
        setAttemptsMessage(null);
      } else {
        localStorage.removeItem('loginLockoutEndTime');
        setLockoutEndTime(null);
        setAttemptsMessage(errorMessage);
      }
    } finally {
      setIsGeneratingOtp(false);
    }
  };

  const handleResendOtp = async (e) => {
    if (e) e.preventDefault();
    if (isGeneratingOtp) return;
    setOtp(['', '', '', '']);
    setTimeout(() => otpRefs.current[0]?.focus(), 50);
    await submitEmail(e);
  };

  const handleResendForgotOtp = async (e) => {
    if (e) e.preventDefault();
    if (isSendingForgotOtp) return;
    setOtp(['', '', '', '']);
    setTimeout(() => otpRefs.current[0]?.focus(), 50);
    await submitForgotPassword(e);
  };

  const submitOtp = async (e) => {
    if (e) e.preventDefault();
    if (isVerifyingOtp) return;
    if (otpTimer <= 0) {
      showAlert('Code Expired', 'This verification code is no longer valid. Please request a new code.', 'warning');
      return;
    }
    const otpValue = otp.join('');
    if (otpValue.length !== 4) {
      showAlert('Incomplete Code', 'Please enter the complete 4-digit code.', 'warning');
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const response = await verifyLoginOtpApi({ tempToken, otp: otpValue });
      if (response.status === 200) {
        const { accessToken, user } = response.data;
        localStorage.setItem('medhealthinvestuser', JSON.stringify({ ...user, accessToken }));
        window.location.href = '/';
      }
    } catch (error) {
      console.error("OTP Verification error:", error);
      const errorMsg = error.response?.data?.message || '';
      if (errorMsg.toLowerCase().includes('expired')) {
        showAlert('Code Expired', 'This verification code has expired. Please request a new code.', 'warning');
      } else {
        showAlert('Invalid Code', 'The verification code you entered is incorrect. Please try again.', 'error');
      }
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const submitForgotPassword = async (e) => {
    if (e) e.preventDefault();
    if (isSendingForgotOtp) return;
    const cleanForgotPhone = (forgotPhone || '').replace(/\D/g, '');
    if (!cleanForgotPhone) {
      showAlert('Error', 'Please enter your mobile number.', 'warning');
      return;
    }
    if (selectedCountry.code === '+91' && cleanForgotPhone.length !== 10) {
      showAlert('Invalid Phone Number', 'Please enter a valid 10-digit mobile number.', 'warning');
      return;
    }
    if (selectedCountry.code !== '+91' && (cleanForgotPhone.length < 7 || cleanForgotPhone.length > 15)) {
      showAlert('Invalid Phone Number', 'Please enter a valid mobile number (7 to 15 digits).', 'warning');
      return;
    }
    setIsSendingForgotOtp(true);
    try {
      const response = await forgotPasswordApi({ mobileNumber: cleanForgotPhone, countryCode: selectedCountry.code });
      if (response.status === 200) {
        setTempToken(response.data.tempToken);
        setMobileEnding(response.data.mobileEnding);
        setStep('forgot-otp');
        setOtpTimer(60);
        setOtp(['', '', '', '']);
        setTimeout(() => otpRefs.current[0]?.focus(), 50);
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      showAlert('Error', error.response?.data?.message || 'Something went wrong.', 'error');
    } finally {
      setIsSendingForgotOtp(false);
    }
  };

  const submitForgotOtp = async (e) => {
    e.preventDefault();
    if (otpTimer <= 0) {
      showAlert('Code Expired', 'This verification code is no longer valid. Please request a new code.', 'warning');
      return;
    }
    const otpValue = otp.join('');
    if (otpValue.length !== 4) {
      showAlert('Incomplete Code', 'Please enter the complete 4-digit code.', 'warning');
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
        setOtp(['', '', '', '']);
      }
    } catch (error) {
      console.error("Reset password error:", error);
      const errorMsg = error.response?.data?.message || '';
      if (errorMsg.toLowerCase().includes('expired')) {
        showAlert('Code Expired', 'This verification code has expired. Please request a new code.', 'warning');
        setStep('forgot-email');
      } else {
        showAlert('Invalid Code', 'The verification code you entered is incorrect. Please try again.', 'error');
        setStep('forgot-otp');
      }
    }
  };



  const handleSelectCountry = (c) => {
    setSelectedCountry(c);
    setIsCountryOpen(false);
    setCountrySearch('');
    const maxLen = c.code === '+91' ? 10 : 15;
    if (formData.phone && formData.phone.length > maxLen) {
      setFormData(prev => ({ ...prev, phone: prev.phone.slice(0, maxLen) }));
    }
    if (forgotPhone && forgotPhone.length > maxLen) {
      setForgotPhone(prev => prev.slice(0, maxLen));
    }
  };

  const handlePhoneKeyDown = (e) => {
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End'
    ];
    if (allowedKeys.includes(e.key)) return;
    if (e.ctrlKey || e.metaKey) return;
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const submitRegistration = async (e) => {
    e.preventDefault();
    if (isSubmittingReg) return;
    if (formData.password !== formData.confirmPassword) {
      setPasswordErrorMsg("Passwords do not match.");
      return;
    }
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setPasswordErrorMsg(passwordError);
      return;
    }

    const cleanPhone = (formData.phone || '').replace(/\D/g, '');
    if (!cleanPhone) {
      showAlert('Error', 'Please enter your phone number.', 'warning');
      return;
    }
    if (selectedCountry.code === '+91' && cleanPhone.length !== 10) {
      showAlert('Invalid Phone Number', 'Please enter a valid 10-digit mobile number.', 'warning');
      return;
    }
    if (selectedCountry.code !== '+91' && (cleanPhone.length < 7 || cleanPhone.length > 15)) {
      showAlert('Invalid Phone Number', 'Please enter a valid mobile number (7 to 15 digits).', 'warning');
      return;
    }

    const payload = {
      fullName: formData.name,
      email: formData.email,
      password: formData.password,
      gender: formData.gender,
      mobileNumber: cleanPhone,
      countryCode: selectedCountry.code
    };

    setIsSubmittingReg(true);
    try {
      const response = await registerUserApi(payload);
      if (response.status === 200 && response.data?.requiresOtp) {
        setTempToken(response.data.tempToken);
        setMobileEnding(response.data.mobileEnding);
        setStep('register-otp');
        setOtpTimer(60);
        setOtp(['', '', '', '']);
        setTimeout(() => otpRefs.current[0]?.focus(), 50);
      } else if (response.status === 201) {
        // Success modal removed per request
        setStep('email');
      } else {
        showAlert('Error', response.data?.message || 'Registration failed', 'error');
      }
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage = error.response?.data?.message || 'Something went wrong. Please try again.';
      showAlert('Error', errorMessage, 'error');
    } finally {
      setIsSubmittingReg(false);
    }
  };

  const handleResendRegisterOtp = async (e) => {
    if (e) e.preventDefault();
    if (isSubmittingReg) return;
    setOtp(['', '', '', '']);
    setTimeout(() => otpRefs.current[0]?.focus(), 50);

    const cleanPhone = (formData.phone || '').replace(/\D/g, '');
    const payload = {
      fullName: formData.name,
      email: formData.email,
      password: formData.password,
      gender: formData.gender,
      mobileNumber: cleanPhone,
      countryCode: selectedCountry.code
    };

    setIsSubmittingReg(true);
    try {
      const response = await registerUserApi(payload);
      if (response.status === 200 && response.data?.requiresOtp) {
        setTempToken(response.data.tempToken);
        setMobileEnding(response.data.mobileEnding);
        setOtpTimer(60);
        showAlert('Code Sent', 'A new verification code has been sent to your mobile number.', 'success');
      } else {
        showAlert('Error', response.data?.message || 'Failed to resend code', 'error');
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      showAlert('Error', error.response?.data?.message || 'Failed to resend code.', 'error');
    } finally {
      setIsSubmittingReg(false);
    }
  };

  const submitRegisterOtp = async (e) => {
    if (e) e.preventDefault();
    if (isVerifyingRegOtp) return;
    if (otpTimer <= 0) {
      showAlert('Code Expired', 'This verification code is no longer valid. Please request a new code.', 'warning');
      return;
    }
    const otpValue = otp.join('');
    if (otpValue.length !== 4) {
      showAlert('Incomplete Code', 'Please enter the complete 4-digit code.', 'warning');
      return;
    }

    setIsVerifyingRegOtp(true);
    try {
      const response = await verifyRegistrationOtpApi({ tempToken, otp: otpValue });
      if (response.status === 201 || response.status === 200) {
        // Success modal removed per request
        setEmail(formData.email);
        setPassword('');
        setFormData({
          name: '',
          email: '',
          gender: '',
          phone: '',
          password: '',
          confirmPassword: ''
        });
        setOtp(['', '', '', '']);
        setStep('email');
      }
    } catch (error) {
      console.error("Registration OTP verification error:", error);
      const errorMsg = error.response?.data?.message || '';
      if (errorMsg.toLowerCase().includes('expired')) {
        showAlert('Code Expired', 'This verification code has expired. Please request a new code.', 'warning');
      } else {
        showAlert('Invalid Code', errorMsg || 'The verification code you entered is incorrect. Please try again.', 'error');
      }
    } finally {
      setIsVerifyingRegOtp(false);
    }
  };

  return (
    <div className={`w-full ${step === 'register' ? 'max-w-[580px] lg:max-w-[620px]' : 'max-w-[460px]'} p-8 sm:p-10 lg:p-12 bg-white border border-gray-100 md:border-2 md:border-gray-200 font-['Outfit'] shadow-2xl rounded-2xl md:rounded-none md:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] transition-all duration-300`}>

      {/* Sleek Minimalist Header */}
      <div className="mb-6 relative z-10  border-black/5">
        <h2 className="text-3xl md:text-4xl font-bold text-black tracking-tight mb-1 font-['Outfit']">
          {step === 'email' && 'Investor Portal.'}
          {step === 'otp' && 'Verify.'}
          {step === 'register' && 'Become an Investor.'}
          {step === 'register-otp' && 'Verify Mobile.'}
        </h2>
        <p className={`text-gray-500 text-[13px] leading-relaxed font-medium tracking-tight ${step === 'register' ? 'max-w-lg' : 'max-w-[340px]'}`}>
          {step === 'email' && <span className="opacity-75">Sign in to monitor your yields and manage your institutional-grade projects.</span>}
          {step === 'otp' && (
            <span>
              <span className="opacity-75">Enter the 4-digit verification code sent to your registered number ending in </span>
              <strong className="text-black font-bold tracking-wider">**{mobileEnding}</strong>.
            </span>
          )}
          {step === 'register' && <span className="opacity-75">Complete your registration to access exclusive, institutional-grade healthcare investments.</span>}
          {step === 'register-otp' && (
            <span>
              <span className="opacity-75">Enter the 4-digit verification code sent to your mobile number ending in </span>
              <strong className="text-black font-bold tracking-wider">**{mobileEnding}</strong>
              <span className="opacity-75"> to complete your registration.</span>
            </span>
          )}
        </p>
      </div>

      <div className="relative z-10 w-full">
        {/* Email Step */}
        {step === 'email' && (
            <form onSubmit={submitEmail} className="space-y-2 animate-fade-in-up" autoComplete="on">

              {/* Floating Label Input: Email */}
              <div className="relative group">
                <input
                  type="email"
                  name="email"
                  autoComplete="username"
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
                  name="password"
                  autoComplete="current-password"
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
                disabled={!!lockoutEndTime || isGeneratingOtp}
                className={`w-full py-4 mt-4 text-[10px] font-black tracking-[0.2em] uppercase flex items-center justify-between px-8 transition-all duration-300 ${lockoutEndTime
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : isGeneratingOtp
                    ? 'bg-neutral-800 text-white/90 cursor-wait'
                    : 'bg-black text-white hover:bg-gray-800 hover:tracking-[0.25em]'
                  }`}
              >
                {isGeneratingOtp ? (
                  <div className="flex items-center justify-center gap-2.5 w-full py-0.5">
                    <FiLoader className="text-sm animate-spin" />
                    <span className="tracking-[0.2em]">Generating OTP...</span>
                  </div>
                ) : (
                  <>
                    <span>Continue</span>
                    <FiArrowRight className="text-base" />
                  </>
                )}
              </button>

              <div className="pt-4 mt-2 border-t border-gray-100">
                  <button type="button" onClick={switchToRegister} className="text-[10px] text-gray-400 hover:text-black transition-colors uppercase tracking-widest font-semibold flex items-center gap-2 group">
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
              <form onSubmit={submitOtp} className="space-y-8 animate-fade-in-up">
                <div className="flex items-center justify-center gap-3.5 my-6">
                  {otp.map((digit, idx) => (
                    <div key={idx} className="relative">
                      <input
                        ref={(el) => (otpRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        onPaste={handleOtpPaste}
                        className={`w-14 h-16 sm:w-16 sm:h-18 text-center text-2xl sm:text-3xl font-semibold rounded-xl border transition-all duration-200 outline-none select-none ${digit
                          ? 'border-neutral-900 bg-white text-neutral-900 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)]'
                          : 'border-neutral-200 bg-neutral-50/70 text-neutral-900 hover:border-neutral-300 focus:bg-white focus:border-neutral-900 focus:ring-4 focus:ring-neutral-900/5'
                          }`}
                        required
                      />
                      {!digit && (
                        <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-neutral-300 text-base font-light select-none">
                          —
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {otpTimer > 0 ? (
                  <div className="text-center mt-2">
                    <span className="text-[12px] text-neutral-400 font-normal">
                      Code expires in <span className="font-mono text-neutral-800 font-medium tabular-nums ml-1">
                        {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}
                      </span>
                    </span>
                  </div>
                ) : (
                  <div className="text-center flex items-center justify-center gap-2 text-[13px] mt-2 animate-fade-in">
                    <span className="text-neutral-400 font-normal">Code expired.</span>
                    <button
                      type="button"
                      disabled={isGeneratingOtp}
                      onClick={handleResendOtp}
                      className={`text-neutral-900 font-semibold underline underline-offset-4 decoration-neutral-300 hover:decoration-neutral-900 transition-colors ${isGeneratingOtp ? 'opacity-50 cursor-wait' : ''
                        }`}
                    >
                      {isGeneratingOtp ? 'Requesting new code...' : 'Request a new code'}
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isVerifyingOtp}
                  className={`w-full py-4 mt-8 bg-black text-white text-[10px] font-black tracking-[0.2em] uppercase flex items-center justify-between px-8 transition-all duration-300 ${isVerifyingOtp ? 'bg-neutral-800 text-white/90 cursor-wait' : 'hover:bg-gray-800 hover:tracking-[0.25em]'
                    }`}
                >
                  {isVerifyingOtp ? (
                    <div className="flex items-center justify-center gap-2.5 w-full py-0.5">
                      <FiLoader className="text-sm animate-spin" />
                      <span className="tracking-[0.2em]">Authenticating...</span>
                    </div>
                  ) : (
                    <>
                      <span>Authenticate</span>
                      <FiCheck className="text-base" />
                    </>
                  )}
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
                <form onSubmit={submitRegistration} className="space-y-2 animate-fade-in-up" autoComplete="off">

                  <div className="relative group">
                    <input
                      type="text"
                      name="fullName"
                      autoComplete="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                      name="newEmail"
                      autoComplete="off"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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

                  {/* Phone Number and Gender in a single row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {/* Phone Input with Country Code */}
                    <div className="relative group" ref={countryRef}>
                      <div className="flex items-end gap-2.5 transition-colors group-focus-within:border-black">
                        {/* Country Selector */}
                        <div className="relative border-b border-gray-300 min-w-[78px] shrink-0">
                          <button
                            type="button"
                            onClick={() => setIsCountryOpen(!isCountryOpen)}
                            className="flex items-center justify-between w-full h-full pt-6 pb-2 focus:outline-none"
                          >
                            <div className="flex items-center gap-1.5">
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
                        <div className="relative flex-1 min-w-0">
                          <input
                            type="tel"
                            name="phone"
                            autoComplete="tel"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={selectedCountry.code === '+91' ? 10 : 15}
                            value={formData.phone}
                            onKeyDown={handlePhoneKeyDown}
                            onChange={(e) => {
                              const maxLen = selectedCountry.code === '+91' ? 10 : 15;
                              const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, maxLen);
                              setFormData({ ...formData, phone: digitsOnly });
                            }}
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

                    {/* Gender Input */}
                    <div className="relative group" ref={genderRef}>
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
                  </div>

                  {/* Password and Confirm Password in a single row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {/* Password */}
                    <div className="relative group">
                      <input
                        type={showRegPassword ? "text" : "password"}
                        name="newPassword"
                        autoComplete="new-password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

                    {/* Confirm Password */}
                    <div className="relative group">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        autoComplete="new-password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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
                  </div>

                  {renderPasswordRequirements(formData.password)}

                  <button
                    type="submit"
                    disabled={isSubmittingReg || !!validatePassword(formData.password) || formData.password !== formData.confirmPassword}
                    className={`w-full py-4 mt-4 text-[10px] font-black tracking-[0.2em] uppercase flex items-center justify-between px-8 transition-all duration-300 ${(!validatePassword(formData.password) && formData.password === formData.confirmPassword && !isSubmittingReg) ? 'bg-black text-white hover:bg-gray-800 hover:tracking-[0.25em]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                  >
                    {isSubmittingReg ? (
                      <div className="flex items-center justify-center gap-2.5 w-full py-0.5">
                        <FiLoader className="text-sm animate-spin" />
                        <span className="tracking-[0.2em]">Sending OTP...</span>
                      </div>
                    ) : (
                      <>
                        <span>Create Account</span>
                        <FiArrowRight className="text-base" />
                      </>
                    )}
                  </button>

                  <div className="pt-4 mt-2 border-t border-gray-100">
                      <button type="button" onClick={switchToLogin} className="text-[10px] text-gray-400 hover:text-black transition-colors uppercase tracking-widest font-semibold group flex items-center gap-2">
                        Already an investor?
                        <span className="text-black font-black uppercase inline-block relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-px after:bottom-0 after:left-0 after:bg-black after:origin-bottom-right after:transition-transform after:duration-300 group-hover:after:scale-x-100 group-hover:after:origin-bottom-left">
                          Login Here
                        </span>
                      </button>
                  </div>
                </form>
        )}

                {/* Register OTP Step */}
                {step === 'register-otp' && (
                  <form onSubmit={submitRegisterOtp} className="space-y-8 animate-fade-in-up">
                    <div className="flex items-center justify-center gap-3.5 my-6">
                      {otp.map((digit, idx) => (
                        <div key={idx} className="relative">
                          <input
                            ref={(el) => (otpRefs.current[idx] = el)}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={1}
                            value={digit}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => handleOtpChange(idx, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                            onPaste={handleOtpPaste}
                            className={`w-14 h-16 sm:w-16 sm:h-18 text-center text-2xl sm:text-3xl font-semibold rounded-xl border transition-all duration-200 outline-none select-none ${digit
                              ? 'border-neutral-900 bg-white text-neutral-900 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)]'
                              : 'border-neutral-200 bg-neutral-50/70 text-neutral-900 hover:border-neutral-300 focus:bg-white focus:border-neutral-900 focus:ring-4 focus:ring-neutral-900/5'
                              }`}
                            required
                          />
                          {!digit && (
                            <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-neutral-300 text-base font-light select-none">
                              -
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    {otpTimer > 0 ? (
                      <div className="text-center mt-2">
                        <span className="text-[12px] text-neutral-400 font-normal">
                          Code expires in <span className="font-mono text-neutral-800 font-medium tabular-nums ml-1">
                            {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}
                          </span>
                        </span>
                      </div>
                    ) : (
                      <div className="text-center mt-2">
                        <button
                          type="button"
                          disabled={isSubmittingReg}
                          onClick={handleResendRegisterOtp}
                          className={`text-neutral-900 font-semibold underline underline-offset-4 decoration-neutral-300 hover:decoration-neutral-900 transition-colors ${isSubmittingReg ? 'opacity-50 cursor-wait' : ''
                            }`}
                        >
                          {isSubmittingReg ? 'Requesting new code...' : 'Request a new code'}
                        </button>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isVerifyingRegOtp}
                      className={`w-full py-4 mt-8 bg-black text-white text-[10px] font-black tracking-[0.2em] uppercase flex items-center justify-between px-8 transition-all duration-300 ${isVerifyingRegOtp ? 'bg-neutral-800 text-white/90 cursor-wait' : 'hover:bg-gray-800 hover:tracking-[0.25em]'
                        }`}
                    >
                      {isVerifyingRegOtp ? (
                        <div className="flex items-center justify-center gap-2.5 w-full py-0.5">
                          <FiLoader className="text-sm animate-spin" />
                          <span className="tracking-[0.2em]">Verifying & Registering...</span>
                        </div>
                      ) : (
                        <>
                          <span>Verify & Create Account</span>
                          <FiCheck className="text-base" />
                        </>
                      )}
                    </button>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setStep('register');
                          setOtp(['', '', '', '']);
                        }}
                        className="text-[10px] text-gray-400 hover:text-black transition-colors uppercase tracking-widest font-semibold flex items-center gap-1"
                      >
                        ← Back to Registration
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
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={selectedCountry.code === '+91' ? 10 : 15}
                            value={forgotPhone}
                            onKeyDown={handlePhoneKeyDown}
                            onChange={(e) => {
                              const maxLen = selectedCountry.code === '+91' ? 10 : 15;
                              const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, maxLen);
                              setForgotPhone(digitsOnly);
                            }}
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
                      disabled={isSendingForgotOtp}
                      className={`w-full py-4 mt-8 bg-black text-white text-[10px] font-black tracking-[0.2em] uppercase flex items-center justify-between px-8 transition-all duration-300 ${isSendingForgotOtp
                        ? 'bg-neutral-800 text-white/90 cursor-wait'
                        : 'hover:bg-gray-800 hover:tracking-[0.25em]'
                        }`}
                    >
                      {isSendingForgotOtp ? (
                        <div className="flex items-center justify-center gap-2.5 w-full py-0.5">
                          <FiLoader className="text-sm animate-spin" />
                          <span className="tracking-[0.2em]">Sending OTP...</span>
                        </div>
                      ) : (
                        <>
                          <span>Send OTP</span>
                          <FiArrowRight className="text-base" />
                        </>
                      )}
                    </button>

                    <div className="pt-2">
                      <button type="button" onClick={() => setStep('email')} className="text-[10px] text-gray-400 hover:text-black transition-colors uppercase tracking-widest font-semibold">
                        ← Back to Login
                      </button>
                    </div>
                  </form>
                )}

                {/* Why do we fall, sir? */}
                {step === 'forgot-otp' && (
                  <form onSubmit={submitForgotOtp} className="space-y-8 animate-fade-in-up">
                    <h3 className="text-xl font-bold mb-2 text-black tracking-wide">Verify.</h3>
                    <p className="text-[13px] text-gray-500 font-medium leading-relaxed">
                      <span className="opacity-75">Enter the 4-digit verification code sent to your registered number ending in </span>
                      <strong className="text-black font-bold tracking-wider">**{mobileEnding}</strong>.
                    </p>

                    <div className="flex items-center justify-center gap-3.5 my-6">
                      {otp.map((digit, idx) => (
                        <div key={idx} className="relative">
                          <input
                            ref={(el) => (otpRefs.current[idx] = el)}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={1}
                            value={digit}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => handleOtpChange(idx, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                            onPaste={handleOtpPaste}
                            className={`w-14 h-16 sm:w-16 sm:h-18 text-center text-2xl sm:text-3xl font-semibold rounded-xl border transition-all duration-200 outline-none select-none ${digit
                              ? 'border-neutral-900 bg-white text-neutral-900 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)]'
                              : 'border-neutral-200 bg-neutral-50/70 text-neutral-900 hover:border-neutral-300 focus:bg-white focus:border-neutral-900 focus:ring-4 focus:ring-neutral-900/5'
                              }`}
                            required
                          />
                          {!digit && (
                            <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-neutral-300 text-base font-light select-none">
                              —
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    {otpTimer > 0 ? (
                      <div className="text-center mt-2">
                        <span className="text-[12px] text-neutral-400 font-normal">
                          Code expires in <span className="font-mono text-neutral-800 font-medium tabular-nums ml-1">
                            {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}
                          </span>
                        </span>
                      </div>
                    ) : (
                      <div className="text-center flex items-center justify-center gap-2 text-[13px] mt-2 animate-fade-in">
                        <span className="text-neutral-400 font-normal">Code expired.</span>
                        <button
                          type="button"
                          disabled={isSendingForgotOtp}
                          onClick={handleResendForgotOtp}
                          className={`text-neutral-900 font-semibold underline underline-offset-4 decoration-neutral-300 hover:decoration-neutral-900 transition-colors ${isSendingForgotOtp ? 'opacity-50 cursor-wait' : ''
                            }`}
                        >
                          {isSendingForgotOtp ? 'Requesting new code...' : 'Request a new code'}
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
                    <form onSubmit={submitResetPassword} className="space-y-6 animate-fade-in-up" autoComplete="off">
                      <h3 className="text-xl font-bold mb-6 text-black tracking-wide">New Password</h3>
                      <p className="text-sm text-gray-500 mb-6 font-medium leading-relaxed">Please enter your new secure password.</p>

                      {/* Password and Confirm Password in a single row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        {/* New Password */}
                        <div className="relative group">
                          <input
                            type={showResetPassword ? "text" : "password"}
                            name="newResetPassword"
                            autoComplete="new-password"
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

                        {/* Confirm Password */}
                        <div className="relative group">
                          <input
                            type={showConfirmResetPassword ? "text" : "password"}
                            name="confirmResetPassword"
                            autoComplete="new-password"
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
                      </div>

                      {renderPasswordRequirements(resetPassword)}

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
                          setOtp(['', '', '', '']);
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
