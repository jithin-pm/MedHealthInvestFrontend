import React, { useState, useEffect, useRef } from 'react'
import Navbar from '../Home/HomeComponents/Navbar'
import Footer from '../../Components/Footer'
import { saveEnquiryApi, getAllProjectsApi, getUserInvestmentsApi, verifyBankApi, verifyPanApi, getVerificationStatusApi } from '../../Services/allApi'
import { useNavigate, useLocation } from 'react-router-dom'
import Swal from 'sweetalert2'
import { BASE_URL } from '../../Services/baseUrl'
import { LuCrown, LuBadgeCheck, LuWallet } from 'react-icons/lu'
import { jsPDF } from 'jspdf'
import { generateInvestmentCertificate } from '../../Utils/generateCertificate'
import { 
  FiArrowRight, 
  FiShield, 
  FiX, 
  FiSend, 
  FiLoader, 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiChevronDown, 
  FiChevronUp,
  FiSearch, 
  FiCheckCircle, 
  FiPaperclip,
  FiArrowUpRight,
  FiArrowDownLeft,
  FiEye,
  FiEyeOff,
  FiDownload,
  FiCalendar,
  FiEdit3
} from 'react-icons/fi'
import { BsFillPatchCheckFill } from 'react-icons/bs'
import Logo from '../../Components/Logo'

const COUNTRIES = [
  { name: 'India',                code: '+91',  iso: 'in' },
  { name: 'United Arab Emirates', code: '+971', iso: 'ae' },
  { name: 'United States',        code: '+1',   iso: 'us' },
  { name: 'United Kingdom',       code: '+44',  iso: 'gb' },
  { name: 'Saudi Arabia',         code: '+966', iso: 'sa' },
  { name: 'Canada',               code: '+1',   iso: 'ca' },
  { name: 'Australia',            code: '+61',  iso: 'au' },
  { name: 'Germany',              code: '+49',  iso: 'de' },
  { name: 'France',               code: '+33',  iso: 'fr' },
  { name: 'Singapore',            code: '+65',  iso: 'sg' },
  { name: 'Qatar',                code: '+974', iso: 'qa' },
  { name: 'Kuwait',               code: '+965', iso: 'kw' },
  { name: 'Oman',                 code: '+968', iso: 'om' },
  { name: 'Bahrain',              code: '+973', iso: 'bh' },
];

export default function Profile() {
  const [user, setUser] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [phone, setPhone] = useState('')
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0])
  const [isCountryOpen, setIsCountryOpen] = useState(false)
  const [countrySearch, setCountrySearch] = useState('')
  const countryRef = useRef(null)
  const [hasExclusive, setHasExclusive] = useState(false)
  const [isBankModalOpen, setIsBankModalOpen] = useState(false)
  const [isVerifyingBank, setIsVerifyingBank] = useState(false)
  const [bankData, setBankData] = useState({ name: '', account: '', confirmAccount: '', ifsc: '', phone: '' })
  const [panData, setPanData] = useState({ name: '', panNumber: '', confirmPan: '' })
  const [verificationTab, setVerificationTab] = useState('pan') // 'bank' or 'pan'
  const [selectedBankCountry, setSelectedBankCountry] = useState(COUNTRIES[0])
  const [isBankCountryOpen, setIsBankCountryOpen] = useState(false)
  const [bankCountrySearch, setBankCountrySearch] = useState('')
  const bankCountryRef = useRef(null)
  const navigate = useNavigate()

  const [showAccountNumber, setShowAccountNumber] = useState(false)
  const [showConfirmAccountNumber, setShowConfirmConfirmAccountNumber] = useState(false)
  const [isPanVerified, setIsPanVerified] = useState(false)
  const [isBankVerified, setIsBankVerified] = useState(false)
  const [panDetails, setPanDetails] = useState(null)
  const [bankDetails, setBankDetails] = useState(null)
  const [showVerifiedDetails, setShowVerifiedDetails] = useState(false)
  const location = useLocation()

  useEffect(() => {
    if (location.state?.openKyc) {
      setIsBankModalOpen(true)
    }
  }, [location.state])

  const [transactions, setTransactions] = useState([])
  const [totalCapital, setTotalCapital] = useState(0)
  const [isLoadingInvestments, setIsLoadingInvestments] = useState(true)
  const [isProofModalOpen, setIsProofModalOpen] = useState(false)
  const [selectedProof, setSelectedProof] = useState(null)

  useEffect(() => {
    const init = async () => {
      const savedUser = localStorage.getItem('medhealthinvestuser')
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser)
        setUser(parsedUser)
        // Pre-fill phone
        if (parsedUser.mobileNumber) setPhone(String(parsedUser.mobileNumber))
        // Pre-fill country code â€” find matching country or default to India
        if (parsedUser.countryCode) {
          const match = COUNTRIES.find(c => c.code === parsedUser.countryCode)
          if (match) setSelectedCountry(match)
        }
        // Fetch verification status fresh from DB (no localStorage)
        if (parsedUser.id) {
          try {
            console.log("[Profile Init] Fetching verification status for User ID:", parsedUser.id)
            const statusRes = await getVerificationStatusApi(parsedUser.id)
            console.log("[Profile Init] API Response status:", statusRes.status, "data:", statusRes.data)
            if (statusRes.status === 200) {
              setIsPanVerified(statusRes.data.isPanVerified === true)
              setIsBankVerified(statusRes.data.isBankVerified === true)
              
              console.log("[Profile Init] Setting panDetails state to:", statusRes.data.panDetails)
              console.log("[Profile Init] Setting bankDetails state to:", statusRes.data.bankDetails)
              
              setPanDetails(statusRes.data.panDetails)
              setBankDetails(statusRes.data.bankDetails)

              // Also sync latest user information to React state and localStorage
              const updatedUser = {
                ...parsedUser,
                fullName: statusRes.data.fullName || parsedUser.fullName,
                bankName: statusRes.data.bankName || parsedUser.bankName,
                accountNumber: statusRes.data.accountNumber || parsedUser.accountNumber,
                ifscCode: statusRes.data.ifscCode || parsedUser.ifscCode,
                accountHolderName: statusRes.data.accountHolderName || parsedUser.accountHolderName,
                isPanVerified: statusRes.data.isPanVerified ? 1 : 0,
                isBankVerified: statusRes.data.isBankVerified ? 1 : 0
              }
              console.log("[Profile Init] Updating local user state and localStorage to:", updatedUser)
              setUser(updatedUser)
              localStorage.setItem('medhealthinvestuser', JSON.stringify(updatedUser))
              window.dispatchEvent(new Event('user_update'))
            }
          } catch (err) {
            console.error('[Profile Init] Could not fetch verification status:', err)
          }
        } else {
          console.warn("[Profile Init] No user.id found in parsedUser:", parsedUser)
        }
      } else {
        console.warn("[Profile Init] No medhealthinvestuser found in localStorage")
      }
      window.scrollTo(0, 0)
    }
    init()
  }, [])

  // Close country dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (countryRef.current && !countryRef.current.contains(e.target)) {
        setIsCountryOpen(false)
      }
      if (bankCountryRef.current && !bankCountryRef.current.contains(e.target)) {
        setIsBankCountryOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const fetchUserInvestments = async () => {
      const savedUser = localStorage.getItem('medhealthinvestuser')
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser)
        const userId = parsedUser.id
        if (!userId) return

        setIsLoadingInvestments(true)
        try {
          const res = await getUserInvestmentsApi(userId)
          if (res.status === 200) {
            const history = res.data.investments || []
            
            // Process history into dual-ledger format (Investment and Payout)
            const ledger = [];
            history.forEach(inv => {
              const baseAmount = Number(inv.amount || 0);
              const baseDate = inv.created_at || inv.createdAt || new Date();

              // 1. Capital Debit Entry
              ledger.push({
                ...inv,
                ledgerType: 'DEBIT',
                ledgerDate: baseDate,
                ledgerAmount: baseAmount,
                ledgerRef: `INV-${String(inv.id).padStart(6, '0')}`
              });

            // 2. Settled Credit Entry (if PAID)
            if (inv.paybackStatus === 'PAID') {
              const isRefund = inv.project?.status === 'EXPIRED' || 
                             (inv.project?.status === 'COMPLETED' && Number(inv.project?.collectedAmount) < Number(inv.project?.targetAmount));
              const roi = isRefund ? 0 : Number(inv.project?.roi || 0);
              const duration = isRefund ? 1 : Number(inv.project?.duration || 1);
              const interest = (baseAmount * roi * duration) / 100;
              const totalMaturity = baseAmount + interest;

              ledger.push({
                ...inv,
                ledgerType: 'CREDIT',
                isRefund: isRefund,
                ledgerDate: inv.updated_at || inv.updatedAt || baseDate,
                ledgerAmount: totalMaturity,
                ledgerRef: `PAY-${String(inv.id).padStart(6, '0')}`
              });
            }
            });

            // Sort by date descending and take top 3
            const sortedLedger = ledger.sort((a, b) => new Date(b.ledgerDate) - new Date(a.ledgerDate));
            setTransactions(sortedLedger.slice(0, 3));
            
            // Total Capital reflects total money currently deployed
            const total = history.reduce((sum, inv) => sum + Number(inv.amount || 0), 0)
            setTotalCapital(total)
          }
        } catch (err) {
          console.error("Error fetching user investments:", err)
        } finally {
          setIsLoadingInvestments(false)
        }
      }
    }
    
    fetchUserInvestments()
    
    const checkExclusive = async () => {
      const savedUser = localStorage.getItem('medhealthinvestuser')
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser)
        const userId = parsedUser.id || parsedUser._id
        if (!userId) return
        try {
          const res = await getAllProjectsApi(userId)
          if (res.status === 200) {
            const projects = res.data.projects || []
            // Check if any project is marked 'Exclusive' (case-insensitive check for safety)
            const exclusive = Array.isArray(projects) && projects.some(p => 
              p.projectType && p.projectType.toLowerCase() === 'exclusive'
            )
            console.log(`Checking exclusive access for user ${parsedUser.id}:`, {
              totalProjects: projects.length,
              hasExclusive: exclusive
            })
            setHasExclusive(exclusive)
          }
        } catch (err) {
          console.error("Error checking exclusive status:", err)
        }
      }
    }
    checkExclusive()
  }, [])

  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  const handleOpenBankModal = () => {
    // If both already verified, just confirm
    if (isPanVerified && isBankVerified) {
      Swal.fire({
        icon: 'success',
        title: 'Fully Verified âœ“',
        text: 'Your PAN and bank account are already verified.',
        background: '#18181b', color: '#fff', confirmButtonColor: '#ccff00'
      })
      return
    }
    setIsBankModalOpen(true)
    setPanData({
      name: '',
      panNumber: '',
      confirmPan: ''
    })
    // If PAN already verified, jump straight to bank tab
    setVerificationTab(isPanVerified ? 'bank' : 'pan')
    const userCountry = COUNTRIES.find(c => c.code === user?.countryCode) || COUNTRIES[0]
    setSelectedBankCountry(userCountry)
  }

  const handleSubmitEnquiry = async (e) => {
    e.preventDefault()
    if (!phone.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Phone Required',
        text: 'Please enter your phone number before sending',
        background: '#18181b',
        color: '#fff',
        confirmButtonColor: '#ccff00'
      })
      return
    }
    if (!message.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Empty Message',
        text: 'Please enter a message before sending',
        background: '#18181b',
        color: '#fff',
        confirmButtonColor: '#ccff00'
      })
      return
    }

    setIsSubmitting(true)
    try {
      const data = {
        fullname: user?.fullName || user?.fullname || '',
        email: user?.email || '',
        countryCode: selectedCountry.code,
        phone: phone,
        subject: 'Request for Exclusive Project Access',
        message: message,
        enquiryType: 'Exclusive'
      }
      const res = await saveEnquiryApi(data)
      if (res.status === 200 || res.status === 201) {
        Swal.fire({
          icon: 'success',
          title: 'Enquiry Sent!',
          text: 'Our team will review your request and contact you soon.',
          background: '#18181b',
          color: '#fff',
          confirmButtonColor: '#ccff00'
        })
        setIsModalOpen(false)
        setMessage('')
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Submission Failed',
          text: 'There was an error sending your enquiry. Please try again.',
          background: '#18181b',
          color: '#fff',
          confirmButtonColor: '#ccff00'
        })
      }
    } catch (err) {
      console.error(err)
      Swal.fire({
        icon: 'error',
        title: 'Network Error',
        text: 'Something went wrong. Please check your connection.',
        background: '#18181b',
        color: '#fff',
        confirmButtonColor: '#ccff00'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerifyBank = async (e) => {
    e.preventDefault()
    if (!bankData.account.trim() || !bankData.ifsc.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Details',
        text: 'Please provide both Account Number and IFSC code.',
        background: '#18181b', color: '#fff', confirmButtonColor: '#ccff00'
      })
      return
    }

    setIsVerifyingBank(true)
    try {
      const { account, confirmAccount, ifsc, phone } = bankData;

      // 1. Account Number Validation
      if (account.length < 9) {
        Swal.fire({ icon: 'warning', title: 'Invalid Account', text: 'Account number should be between 9-18 digits.', background: '#18181b', color: '#fff', confirmButtonColor: '#ccff00' });
        setIsVerifyingBank(false); return;
      }

      // 2. Confirm Account Validation
      if (account !== confirmAccount) {
        Swal.fire({ icon: 'warning', title: 'Mismatch', text: 'Account numbers do not match.', background: '#18181b', color: '#fff', confirmButtonColor: '#ccff00' });
        setIsVerifyingBank(false); return;
      }

      // 3. IFSC Validation
      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
      if (!ifscRegex.test(ifsc)) {
        Swal.fire({ icon: 'warning', title: 'Invalid IFSC', text: 'Please enter a valid 11-digit IFSC code.', background: '#18181b', color: '#fff', confirmButtonColor: '#ccff00' });
        setIsVerifyingBank(false); return;
      }

      // 4. Phone Validation
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(phone)) {
        Swal.fire({ icon: 'warning', title: 'Invalid Phone', text: 'Please enter a valid 10-digit phone number.', background: '#18181b', color: '#fff', confirmButtonColor: '#ccff00' });
        setIsVerifyingBank(false); return;
      }

      const data = {
        userId: user?.id,
        bank_account: account,
        ifsc: ifsc,
        name: bankData.name,
        phone: phone
      }
      const res = await verifyBankApi(data)
      if (res.status === 200 && res.data.success) {
        const bankInfo = res.data.data;
        const isSuccess = 
          bankInfo.status === 'SUCCESS' || 
          bankInfo.account_status === 'VALID' || 
          bankInfo.data?.status === 'SUCCESS';

        if (isSuccess) {
          const info = bankInfo.data || bankInfo || {};

          setIsBankVerified(true)
          setBankDetails({
            accountHolderName: info.name_at_bank || bankData.name,
            bankAccount: account,
            ifsc: ifsc,
            bankName: info.bank_name || 'N/A',
            branch: info.branch || 'N/A',
            city: info.city || 'N/A',
            payoutPhone: phone,
            verifiedAt: new Date()
          })

          // Instantly update localStorage & notify navbar
          const savedUser = localStorage.getItem('medhealthinvestuser')
          if (savedUser) {
            const parsed = JSON.parse(savedUser)
            parsed.isBankVerified = 1
            localStorage.setItem('medhealthinvestuser', JSON.stringify(parsed))
            window.dispatchEvent(new Event('user_update'))
          }

          Swal.fire({
            icon: 'success',
            title: 'Verification Successful!',
            text: 'Your bank account has been successfully verified.',
            background: '#18181b', color: '#fff', confirmButtonColor: '#ccff00'
          })
          setIsBankModalOpen(false)
        } else {
          Swal.fire({ icon: 'error', title: 'Verification Failed', text: bankInfo.message || 'Details could not be verified.', background: '#18181b', color: '#fff', confirmButtonColor: '#ccff00' })
        }
      } else {
        throw new Error('API Error')
      }
    } catch (err) {
      console.error(err)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred during verification. Please try again later.',
        background: '#18181b', color: '#fff', confirmButtonColor: '#ccff00'
      })
    } finally {
      setIsVerifyingBank(false)
    }
  }

  const handleVerifyPan = async (e) => {
    e.preventDefault()
    const { panNumber, confirmPan, name } = panData

    if (panNumber !== confirmPan) {
      return Swal.fire({
        icon: 'warning',
        title: 'PAN Mismatch',
        text: 'The PAN numbers entered do not match.',
        background: '#18181b', color: '#fff', confirmButtonColor: '#ccff00'
      })
    }

    // PAN regex: 5 letters, 4 digits, 1 letter
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
    if (!panRegex.test(panNumber)) {
      return Swal.fire({
        icon: 'warning',
        title: 'Invalid PAN',
        text: 'Please enter a valid 10-character PAN number.',
        background: '#18181b', color: '#fff', confirmButtonColor: '#ccff00'
      })
    }

    setIsVerifyingBank(true)
    try {
      const payload = {
        userId: user?.id,
        panNumber,
        fullName: name
      }
      
      const res = await verifyPanApi(payload)
      
      if (res.status === 200 && res.data.success) {
        const panInfo = res.data.data;

        if (!panInfo.valid) {
          return Swal.fire({
            icon: 'error',
            title: 'PAN Not Valid',
            text: 'The PAN number could not be verified. Please check the details and try again.',
            background: '#18181b', color: '#fff', confirmButtonColor: '#ccff00'
          })
        }

        setIsPanVerified(true)
        setPanDetails({
          fullName: panInfo.name || name,
          panNumber: panNumber,
          verifiedAt: new Date()
        })

        // Instantly update localStorage & notify navbar
        const savedUser = localStorage.getItem('medhealthinvestuser')
        if (savedUser) {
          const parsed = JSON.parse(savedUser)
          parsed.isPanVerified = 1
          localStorage.setItem('medhealthinvestuser', JSON.stringify(parsed))
          window.dispatchEvent(new Event('user_update'))
        }

        await Swal.fire({
          icon: 'success',
          title: 'PAN Verified! âœ“',
          text: 'Proceed to verify your bank account for payouts.',
          background: '#18181b', color: '#fff', confirmButtonColor: '#ccff00'
        })
        setVerificationTab('bank')
      } else {
        throw new Error(res.data.message || 'Verification failed')
      }
    } catch (err) {
      console.error(err)
      Swal.fire({
        icon: 'error',
        title: 'Verification Failed',
        text: err.message || 'Could not verify identity. Please try again.',
        background: '#18181b', color: '#fff', confirmButtonColor: '#ccff00'
      })
    } finally {
      setIsVerifyingBank(false)
    }
  }

  const handleDownload = async (fileUrl) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const filename = fileUrl.split('/').pop() || 'receipt.jpg';
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
      window.open(fileUrl, '_blank');
    }
  }

  return (
    <div className="min-h-screen bg-black font-['Poppins'] text-white selection:bg-[#ccff00] selection:text-black">
      <Navbar />

      <main className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-20 pt-32 pb-24">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
           <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">
                 My <span className="text-zinc-700">Profile</span>
              </h1>
              <p className="text-zinc-500 text-sm font-medium max-w-md">
                 Manage your institutional identity, verified contact credentials, and secure portfolio settings within the MedHealth Invest platform.
              </p>
           </div>
        </div>

        {/* Simple & Short Profile Section */}
        <div className="bg-zinc-900/40 border border-white/10 rounded-3xl px-6 py-8 mb-12 flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-md">
          <div className="flex items-center gap-6">
            {/* Simple Circle Avatar */}
            <div className="w-20 h-20 bg-black border-2 border-white/20 rounded-full flex items-center justify-center text-white shrink-0 shadow-lg relative">
              <FiUser size={36} />
              {isPanVerified && isBankVerified && (
                <BsFillPatchCheckFill className="absolute -top-1 -right-1 text-[#ccff00] bg-black rounded-full animate-in zoom-in-50 duration-300" size={24} />
              )}
            </div>
            
            {/* Essential Info */}
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  {user?.fullName || user?.fullname || 'User Account'}
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-[#ccff00]/10 border border-[#ccff00]/20 text-[#ccff00] text-[9px] font-black uppercase tracking-widest">
                  Active
                </span>
              </div>
              <p className="text-zinc-500 text-sm font-medium mt-0.5">{user?.email}</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-zinc-600 text-xs flex items-center gap-1.5"><FiPhone size={12} /> {user?.countryCode} {user?.mobileNumber}</span>
                <span className="text-zinc-600 text-xs flex items-center gap-1.5"><FiCalendar size={12} /> Joined {user?.createdAt || user?.created_at ? new Date(user.createdAt || user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Mar 2026'}</span>
              </div>
            </div>
          </div>

          {/* Verification Action */}
          <div className="w-full md:w-auto shrink-0 flex justify-center md:justify-end">
            <button 
              onClick={
                isPanVerified && isBankVerified
                  ? () => setShowVerifiedDetails(!showVerifiedDetails)
                  : handleOpenBankModal
              }
              className={`w-full md:w-[240px] py-4 border rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all duration-300 active:scale-[0.98] shadow-2xl group/btn ${
                isPanVerified && isBankVerified
                  ? 'bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500 hover:text-black hover:border-green-500'
                  : 'bg-white text-black border-white/10 hover:bg-[#ccff00] hover:text-black hover:border-[#ccff00]'
              }`}
            >
              {isPanVerified && isBankVerified ? (
                showVerifiedDetails ? (
                  <FiEyeOff size={16} className="text-green-400 group-hover/btn:text-black transition-colors" />
                ) : (
                  <FiEye size={16} className="text-green-400 group-hover/btn:text-black transition-colors" />
                )
              ) : (
                <FiShield size={16} className="text-[#ccff00] group-hover/btn:text-black transition-colors" />
              )}
              {isPanVerified && isBankVerified
                ? showVerifiedDetails
                  ? 'Hide Details'
                  : 'Show Details'
                : isPanVerified
                  ? 'Verify Bank Account'
                  : 'Verify Profile'
              }
            </button>
          </div>
        </div>

        {/* Collapsible Verified Details Section */}
        {isPanVerified && isBankVerified && showVerifiedDetails && (
          <div className="bg-zinc-900/40 border border-white/10 rounded-3xl p-6 md:p-8 mb-12 animate-in slide-in-from-top-4 duration-500 overflow-hidden shadow-2xl backdrop-blur-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* PAN CARD DETAILS */}
              <div className="space-y-4 border-b md:border-b-0 md:border-r border-white/5 pb-6 md:pb-0 md:pr-8">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <FiShield size={16} />
                  </span>
                  <h3 className="text-lg font-bold text-white tracking-tight font-['Outfit']">Identity Details (PAN)</h3>
                </div>
                <div className="space-y-3 pl-11">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Full Name</span>
                    <span className="text-sm font-medium text-white">{panDetails?.fullName || user?.fullName || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">PAN Card Number</span>
                    <span className="text-sm font-mono font-medium text-white tracking-wide uppercase">
                      {panDetails?.panNumber || 'N/A'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Verified Date</span>
                    <span className="text-sm font-medium text-zinc-400">
                      {panDetails?.verifiedAt ? new Date(panDetails.verifiedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* BANK ACCOUNT DETAILS */}
              <div className="space-y-4 pl-0 md:pl-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-[#ccff00]">
                    <BsFillPatchCheckFill size={16} />
                  </span>
                  <h3 className="text-lg font-bold text-white tracking-tight font-['Outfit']">Payout Credentials (Bank)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-11">
                  <div className="flex flex-col col-span-2">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Account Holder Name</span>
                    <span className="text-sm font-medium text-white">{bankDetails?.accountHolderName || user?.accountHolderName || user?.fullName || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Bank Name</span>
                    <span className="text-sm font-medium text-white">{bankDetails?.bankName || user?.bankName || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Account Number</span>
                    <span className="text-sm font-mono font-medium text-white tracking-wide">
                      {bankDetails?.bankAccount || user?.accountNumber || 'N/A'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">IFSC Code</span>
                    <span className="text-sm font-mono font-medium text-white uppercase tracking-wide">{bankDetails?.ifsc || user?.ifscCode || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Branch</span>
                    <span className="text-sm font-medium text-white">{bankDetails?.branch || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Two-Card Layout */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 mb-16 items-stretch w-full">

           {/* LEFT: Exclusive Projects (White Card, Narrower) */}
           <div className="w-full md:w-[38%] bg-white rounded-[32px] p-8 md:p-10 flex flex-col justify-between gap-10 group/exclusive shadow-2xl">
              <div className="flex flex-col gap-8">
                 <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black text-black/40 uppercase tracking-[0.3em]">Institutional Tier</span>
                    <span className="text-4xl md:text-5xl font-black text-black tracking-tightest">Exclusive</span>
                 </div>

                 <div className="w-full h-px bg-black/10" />

                 <div className="flex flex-col gap-5">
                    <span className="text-[10px] font-black text-black/40 uppercase tracking-[0.3em]">Direct Invitation</span>
                    <p className="text-black text-[15px] md:text-[16px] font-bold leading-relaxed tracking-tight">
                       If you are interested in our premium exclusive project category and have additional capital to deploy, we invite you to join our private investment circle.
                    </p>
                    <p className="text-zinc-600 text-[13px] font-medium leading-relaxed">
                       Our exclusive tier offers direct access to large-scale infrastructure and high-yield technological assets with superior risk-adjusted returns. Members benefit from enhanced liquidity, dedicated advisory support, and early-access rights to all future tier-1 developments.
                    </p>
                    <p className="text-zinc-600 text-[13px] font-medium leading-relaxed">
                       Gain priority access to projects before public release. Scale your wealth through exclusive, high-barrier opportunities.
                    </p>
                 </div>
              </div>

              <button
                onClick={hasExclusive ? () => navigate('/exclusive-projects') : handleOpenModal}
                className="w-full py-6 bg-black text-white rounded-2xl text-[14px] font-bold uppercase transition-all duration-300 hover:bg-[#ccff00] hover:text-black active:scale-[0.98] shadow-xl flex items-center justify-center gap-2"
              >
                {hasExclusive ? 'View Exclusive Projects' : 'Join Exclusive Projects'} <LuCrown />
              </button>
           </div>

            {/* RIGHT: Transaction History (Minimalist) */}
            <div className="w-full md:w-[62%] bg-zinc-900 rounded-[32px] p-8 md:p-10 border border-white/5 flex flex-col gap-8 transition-all">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-8">
                  <div>
                     <h2 className="text-2xl font-bold text-white tracking-tight">Transaction History</h2>
                     <p className="text-zinc-500 text-xs mt-1">Real-time ledger of your capital movements</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-white/10">
                     <div className="w-1.5 h-1.5 rounded-full bg-[#ccff00] animate-pulse" />
                     <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Active Audit</span>
                  </div>
               </div>
 
               <div className="flex flex-col gap-4 flex-grow overflow-hidden">
                  <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar max-h-[500px]">
                     {isLoadingInvestments ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-4">
                           <div className="w-6 h-6 border-2 border-[#ccff00]/20 border-t-[#ccff00] rounded-full animate-spin" />
                           <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">Loading Ledger...</p>
                        </div>
                     ) : transactions.length > 0 ? (
                        transactions.map((inv) => (
                           <div key={`${inv.id}-${inv.ledgerType}`} className="group/tx relative bg-zinc-900 border-l-4 border-l-white/10 hover:border-l-[#ccff00] p-6 rounded-r-2xl transition-all duration-500 hover:bg-zinc-800/80">
                              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                 
                                 <div className="flex items-center gap-6">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                                       inv.ledgerType === 'CREDIT' 
                                          ? 'bg-[#ccff00]/5 text-[#ccff00] group-hover/tx:bg-[#ccff00] group-hover/tx:text-black' 
                                          : 'bg-white/5 text-zinc-500 group-hover/tx:bg-white group-hover/tx:text-black'
                                    }`}>
                                       {inv.ledgerType === 'CREDIT' ? <FiArrowDownLeft size={24} /> : <FiArrowUpRight size={24} />}
                                    </div>
                                    
                                    <div className="flex flex-col gap-1">
                                       <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{inv.project?.projectType === 'Exclusive' ? 'Exclusive Asset' : 'Standard Asset'}</span>
                                       <h3 className="text-lg font-bold text-white tracking-tight">{inv.project?.projectName}</h3>
                                       <div className="flex items-center gap-3">
                                          <span className="text-[11px] font-medium text-zinc-500">{new Date(inv.ledgerDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                          <span className="w-1 h-1 rounded-full bg-zinc-800" />
                                          <span className={`text-[10px] font-black uppercase tracking-widest ${inv.ledgerType === 'CREDIT' ? 'text-[#ccff00]' : 'text-zinc-600'}`}>
                                             {inv.ledgerType === 'CREDIT' ? (inv.isRefund ? 'Refund' : 'Payout') : 'Invested'}
                                          </span>
                                       </div>
                                    </div>
                                 </div>

                                 <div className="flex items-center justify-between lg:justify-end gap-10">
                                    <div className="text-left lg:text-right">
                                       <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block mb-1">Transaction Value</span>
                                       <span className="text-2xl font-semibold text-white tabular-nums ">₹{Number(inv.ledgerAmount).toLocaleString('en-IN')}</span>
                                    </div>

                                    <div className="flex gap-2">
                                       {/* 1. View Refund Proof */}
                                       {inv.ledgerType === 'CREDIT' && inv.paybackProof && (
                                          <button 
                                             onClick={() => {
                                                setSelectedProof(`${BASE_URL}/${inv.paybackProof}`);
                                                setIsProofModalOpen(true);
                                             }}
                                             className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500 hover:bg-[#ccff00] hover:text-black hover:border-[#ccff00] transition-all duration-300"
                                             title="View Refund Proof"
                                          >
                                             <FiPaperclip size={20} />
                                          </button>
                                       )}

                                       {/* 2. Download Investment Certificate */}
                                       {inv.ledgerType === 'DEBIT' && (
                                          <button 
                                             onClick={() => generateInvestmentCertificate(JSON.parse(localStorage.getItem('medhealthinvestuser')), inv.project, inv)}
                                             className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500 hover:bg-[#ccff00] hover:text-black hover:border-[#ccff00] transition-all duration-300"
                                             title="Download Investment Certificate"
                                          >
                                             <FiPaperclip size={20} />
                                          </button>
                                       )}

                                       <button 
                                          onClick={() => {
                                             if (inv.ledgerType === 'CREDIT' && inv.paybackProof) {
                                                handleDownload(`${BASE_URL}/${inv.paybackProof}`);
                                             } else {
                                                generateInvestmentCertificate(JSON.parse(localStorage.getItem('medhealthinvestuser')), inv.project, inv);
                                             }
                                          }}
                                          className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500 hover:text-white transition-all"
                                          title="Download Proof/Certificate"
                                       >
                                          <FiDownload size={20} />
                                       </button>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        ))
                     ) : (
                        <div className="py-20 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500 mb-4 shadow-inner">
                               <LuWallet size={24} className="text-zinc-500" />
                            </div>
                            <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-widest">No Transactions Found</h3>
                            <p className="text-zinc-600 text-xs mt-1.5 max-w-[280px]">
                               Your transaction history is empty. Start investing in projects to see your ledger.
                            </p>
                         </div>
                     )}
                  </div>
               </div>

               <button 
                  onClick={() => navigate('/transaction-history')}
                  className="w-full py-6 bg-white text-black rounded-2xl text-[14px] font-black tracking-[0.2em] uppercase transition-all duration-300 hover:bg-[#ccff00] active:scale-[0.98] shadow-xl flex items-center justify-center gap-2"
               >
                  View Full Audit Statement <FiArrowRight />
               </button>
            </div>
         </div>

      </main>
      <Footer />

      {/* ðŸ–¼ï¸ Proof Modal */}
      {isProofModalOpen && (
         <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/10 backdrop-blur-xs">
            <div className="relative w-full max-w-4xl bg-zinc-900 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
               
               {/* Modal Header */}
               <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-zinc-800/50">
                  <div className="flex items-center gap-3">
                     <FiCheckCircle className="text-[#ccff00] text-xl" />
                     <h2 className="text-lg font-bold text-white tracking-tight">Audit Verification Proof</h2>
                  </div>
                  <div className="flex items-center gap-2">
                     <button 
                        onClick={() => handleDownload(selectedProof)}
                        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/5 text-zinc-500 hover:text-[#ccff00] transition-all"
                        title="Download Receipt"
                     >
                        <FiDownload size={20} />
                     </button>
                     <button
                        onClick={() => setIsProofModalOpen(false)}
                        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/5 text-zinc-500 hover:text-white transition-all"
                     >
                        <FiX size={20} />
                     </button>
                  </div>
               </div>

               <div className="p-8 flex flex-col items-center justify-center bg-black/20">
                  <div className="relative group/img max-h-[60vh] overflow-hidden rounded-2xl border border-white/5 shadow-2xl">
                     <img 
                        src={selectedProof} 
                        alt="Payment Proof" 
                        className="max-w-full h-auto object-contain"
                     />
                  </div>
                  <div className="mt-8 flex flex-col items-center text-center">
                     <div className="px-3 py-1 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/20 mb-3">
                        <span className="text-[10px] font-black text-[#ccff00] uppercase tracking-[0.2em]">Verified Transaction</span>
                     </div>
                     <p className="text-zinc-500 text-sm font-medium">Digital Transfer Receipt â€¢ Secured via MedHealth Invest Protocol</p>
                  </div>
               </div>
            </div>
         </div>
      )}

      {/* ðŸ”® Exclusive Enquiry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
           <div className="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-zinc-800/50">
                 <div className="flex items-center gap-3">
                    <LuCrown className="text-[#ccff00] text-xl" />
                    <h2 className="text-lg font-bold text-white tracking-tight">Exclusive Project Request</h2>
                 </div>
                 <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/5 text-zinc-500 hover:text-white transition-all"
                 >
                    <FiX size={20} />
                 </button>
              </div>

              <form onSubmit={handleSubmitEnquiry} className="p-8 space-y-5">

                {/* Pre-filled user credentials (read-only) */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2">Subject</label>
                    <input
                      type="text"
                      value="Request for Exclusive Project Access"
                      readOnly
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-sm font-bold text-[#ccff00] outline-none cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2">Phone Number</label>
                    <div className="flex gap-2">
                      {/* Read-only flag + country code */}
                      <div className="flex items-center gap-2 px-3 py-3.5 bg-white/5 border border-white/10 rounded-xl cursor-not-allowed shrink-0">
                        <img
                          src={`https://flagcdn.com/w40/${selectedCountry.iso}.png`}
                          alt={selectedCountry.name}
                          className="w-5 h-3.5 object-cover rounded-[2px]"
                        />
                        <span className="text-sm font-bold text-[#ccff00]">{selectedCountry.code}</span>
                      </div>
                      {/* Read-only phone number */}
                      <input
                        type="tel"
                        value={phone}
                        readOnly
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-sm font-bold text-[#ccff00] outline-none cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2">Your Message</label>
                    <textarea
                      rows="5"
                      placeholder="Describe your investment goals or capital deployment requirements..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-medium text-white outline-none focus:border-[#ccff00]/50 transition-all placeholder:text-zinc-700 resize-none"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group w-full py-5 bg-[#ccff00] text-black rounded-2xl text-[12px] font-black tracking-[0.2em] uppercase transition-all duration-300 hover:bg-white active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <FiLoader className="animate-spin text-lg" />
                  ) : (
                    <>Send Request <FiSend className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>
                  )}
                </button>

                <p className="text-[12px] text-zinc-600 text-center font-bold ">
                  Private concierge response within 24 business hours.
                </p>
              </form>
           </div>
        </div>
      )}

      {/* ðŸ¦ Bank Verification Modal (Auth Style Split Screen) */}
      {isBankModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-500">
           <div className="relative w-full max-w-5xl h-auto md:h-[600px] bg-white border border-gray-100 shadow-[0_30px_100px_-20px_rgba(0,0,0,0.5)] rounded-[32px] overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-300">
              
              {/* LEFT PANEL: Institutional Branding (Hidden on small mobile if needed, but here we'll keep it) */}
              <div className="md:w-1/2 bg-black relative p-10 flex flex-col justify-between overflow-hidden">
                {/* Background Grid/Glow */}
                <div className="absolute inset-0 pointer-events-none opacity-20" 
                  style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`, backgroundSize: '40px 40px' }} 
                />
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#ccff00]/10 rounded-full blur-[100px]" />
                
                <div className="relative z-10">
                  <div className="mb-12">
                    <Logo size="md" />
                  </div>

                  <h2 className="text-4xl lg:text-5xl font-black text-white leading-none tracking-tighter mb-6 font-['Outfit']">
                    Verify Your<br/>
                    <span className="font-['Playfair_Display'] italic font-normal text-white/60">Payout Identity.</span>
                  </h2>
                  <p className="text-white/40 text-[13px] font-medium leading-relaxed max-w-xs">
                    Join our verified investment circle. We use secure penny-drop technology to validate your institutional-grade payout credentials instantly.
                  </p>
                </div>

                <div className="relative z-10 pt-10 border-t border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Secured by Cashfree Secure ID</span>
                  </div>
                </div>

                {/* Close Button Mobile Overlay */}
                <button
                  onClick={() => setIsBankModalOpen(false)}
                  className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center bg-white/5 text-white/40 hover:text-white transition-all md:hidden"
                >
                    <FiX size={20} />
                </button>
              </div>

              {/* RIGHT PANEL: The Form */}
              <div className="md:w-1/2 bg-white p-6 md:p-10 overflow-y-auto custom-scrollbar relative flex flex-col">
                 {/* Close Button Desktop */}
                 <button
                    onClick={() => setIsBankModalOpen(false)}
                    className="absolute top-8 right-8 w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-black transition-all hidden md:flex"
                  >
                      <FiX size={20} />
                 </button>

                 <div className="mb-4">
                    <h3 className="text-2xl font-bold text-black tracking-tight font-['Outfit'] mb-1">
                      {verificationTab === 'bank' ? 'Bank Account Verification.' : 'Identity (PAN) Verification.'}
                    </h3>
                    <p className="text-gray-400 text-xs font-medium mb-4">
                      Complete the form to authorize payouts.
                    </p>
                 </div>

                 {verificationTab === 'bank' ? (
                   <form onSubmit={handleVerifyBank} className="flex flex-col flex-1 space-y-3">
                      {/* 1. Account Holder Name */}
                      <div className="relative group">
                        <input
                          type="text"
                          value={bankData.name}
                          onChange={(e) => setBankData({ ...bankData, name: e.target.value })}
                          id="holder-name"
                          className="block w-full pt-6 pb-2 px-0 text-[15px] font-medium text-black bg-transparent border-0 border-b border-gray-200 appearance-none focus:outline-none focus:ring-0 focus:border-black peer transition-colors"
                          placeholder=" "
                          required
                        />
                        <label 
                          htmlFor="holder-name" 
                          className="absolute text-[10px] tracking-[0.2em] font-semibold text-gray-400 uppercase duration-300 transform -translate-y-4 scale-100 top-5 z-10 origin-left peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-100 peer-focus:-translate-y-4 peer-focus:text-gray-800"
                        >
                          Account Holder Name
                        </label>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* 2. Account Number */}
                        <div className="relative group">
                          <input
                            type={showAccountNumber ? "text" : "password"}
                            value={bankData.account}
                            onChange={(e) => setBankData({ ...bankData, account: e.target.value })}
                            id="account-number"
                            className="block w-full pt-6 pb-2 px-0 text-[15px] font-medium text-black bg-transparent border-0 border-b border-gray-200 appearance-none focus:outline-none focus:ring-0 focus:border-black peer transition-colors pr-10"
                            placeholder=" "
                            required
                          />
                          <label 
                            htmlFor="account-number" 
                            className="absolute text-[10px] tracking-[0.2em] font-semibold text-gray-400 uppercase duration-300 transform -translate-y-4 scale-100 top-5 z-10 origin-left peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-100 peer-focus:-translate-y-4 peer-focus:text-gray-800"
                          >
                            Bank Account No.
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowAccountNumber(!showAccountNumber)}
                            className="absolute right-0 bottom-2 text-gray-400 hover:text-black transition-colors"
                          >
                            {showAccountNumber ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                          </button>
                        </div>

                        {/* 3. Confirm Account Number */}
                        <div className="relative group">
                          <input
                            type={showConfirmAccountNumber ? "text" : "password"}
                            value={bankData.confirmAccount}
                            onChange={(e) => setBankData({ ...bankData, confirmAccount: e.target.value })}
                            id="confirm-account-number"
                            className="block w-full pt-6 pb-2 px-0 text-[15px] font-medium text-black bg-transparent border-0 border-b border-gray-200 appearance-none focus:outline-none focus:ring-0 focus:border-black peer transition-colors pr-10"
                            placeholder=" "
                            required
                          />
                          <label 
                            htmlFor="confirm-account-number" 
                            className="absolute text-[10px] tracking-[0.2em] font-semibold text-gray-400 uppercase duration-300 transform -translate-y-4 scale-100 top-5 z-10 origin-left peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-100 peer-focus:-translate-y-4 peer-focus:text-gray-800"
                          >
                            Confirm Account No.
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowConfirmConfirmAccountNumber(!showConfirmAccountNumber)}
                            className="absolute right-0 bottom-2 text-gray-400 hover:text-black transition-colors"
                          >
                            {showConfirmAccountNumber ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                          </button>
                        </div>
                      </div>

                      {/* 4. IFSC Code */}
                      <div className="relative group">
                        <input
                          type="text"
                          value={bankData.ifsc}
                          onChange={(e) => setBankData({ ...bankData, ifsc: e.target.value.toUpperCase() })}
                          id="ifsc-code"
                          className="block w-full pt-6 pb-2 px-0 text-[15px] font-medium text-black bg-transparent border-0 border-b border-gray-200 appearance-none focus:outline-none focus:ring-0 focus:border-black peer transition-colors uppercase"
                          placeholder=" "
                          required
                        />
                        <label 
                          htmlFor="ifsc-code" 
                          className="absolute text-[10px] tracking-[0.2em] font-semibold text-gray-400 uppercase duration-300 transform -translate-y-4 scale-100 top-5 z-10 origin-left peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-100 peer-focus:-translate-y-4 peer-focus:text-gray-800"
                        >
                          IFSC Code
                        </label>
                      </div>

                      {/* 5. Phone Number Group (Separate Row) */}
                      <div className="relative group" ref={bankCountryRef}>
                        <div className="flex items-end gap-3 transition-colors group-focus-within:border-black">
                          {/* Country Selector */}
                          <div className="relative border-b border-gray-300 min-w-[85px]">
                            <button
                              type="button"
                              onClick={() => setIsBankCountryOpen(!isBankCountryOpen)}
                              className="flex items-center justify-between w-full h-full pt-6 pb-2 focus:outline-none"
                            >
                              <div className="flex items-center gap-2">
                                <img 
                                  src={`https://flagcdn.com/w40/${selectedBankCountry.iso}.png`} 
                                  alt="" 
                                  className="w-5 h-3.5 object-cover rounded-[2px] shadow-sm mb-0.5"
                                />
                                <span className="text-[14px] font-medium text-black">{selectedBankCountry.code}</span>
                              </div>
                              <FiChevronDown className={`text-gray-400 text-[10px] transition-transform duration-300 ${isBankCountryOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Country Dropdown */}
                            {isBankCountryOpen && (
                              <div className="absolute top-full left-0 w-[260px] mt-1 bg-white border border-gray-100 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.15)] z-[60] animate-fade-in-up-short overflow-hidden">
                                <div className="p-3 border-b border-gray-50 flex items-center gap-2 bg-gray-50/50">
                                  <FiSearch className="text-gray-400 text-xs" />
                                  <input 
                                    type="text"
                                    placeholder="Search country..."
                                    value={bankCountrySearch}
                                    onChange={(e) => setBankCountrySearch(e.target.value)}
                                    className="w-full text-[12px] text-black bg-transparent border-0 focus:ring-0 outline-none placeholder:text-gray-400"
                                    autoFocus
                                  />
                                </div>
                                <div className="max-h-[220px] overflow-y-auto custom-scrollbar">
                                  {COUNTRIES
                                    .filter(c => c.name.toLowerCase().includes(bankCountrySearch.toLowerCase()) || c.code.includes(bankCountrySearch))
                                    .map((c) => (
                                    <button
                                      key={c.name}
                                      type="button"
                                      onClick={() => {
                                        setSelectedBankCountry(c);
                                        setIsBankCountryOpen(false);
                                        setBankCountrySearch('');
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
                              value={bankData.phone}
                              onChange={(e) => setBankData({ ...bankData, phone: e.target.value })}
                              id="bank-phone"
                              className="block w-full pt-6 pb-2 px-0 text-[15px] font-medium text-black bg-transparent border-0 border-b border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-black peer transition-colors"
                              placeholder=" "
                              required
                            />
                            <label 
                              htmlFor="bank-phone" 
                              className="absolute text-[10px] tracking-[0.2em] font-semibold text-gray-400 uppercase duration-300 transform -translate-y-4 scale-100 top-5 z-10 origin-left peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-100 peer-focus:-translate-y-4 peer-focus:text-gray-800"
                            >
                              Phone Number
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="mt-auto pt-7 pb-5">
                        <button
                          type="submit"
                          disabled={isVerifyingBank}
                          className="w-full py-5 bg-black text-white text-[11px] font-black tracking-[0.2em] uppercase flex items-center justify-between px-10 hover:bg-gray-800 transition-all duration-300 hover:tracking-[0.25em] disabled:opacity-50 disabled:cursor-not-allowed group shadow-2xl"
                        >
                          <span>{isVerifyingBank ? 'Authenticating...' : 'Submit Verification'}</span>
                          {isVerifyingBank ? (
                            <FiLoader className="animate-spin text-lg" />
                          ) : (
                            <FiArrowRight className="text-lg group-hover:translate-x-2 transition-transform" />
                          )}
                        </button>
                      </div>
                   </form>
                 ) : (
                   <form onSubmit={handleVerifyPan} className="flex flex-col flex-1 space-y-3">
                      {/* Full Name */}
                      <div className="relative group">
                        <input
                          type="text"
                          value={panData.name}
                          onChange={(e) => setPanData({ ...panData, name: e.target.value })}
                          id="pan-name"
                          className="block w-full pt-6 pb-2 px-0 text-[15px] font-medium text-black bg-transparent border-0 border-b border-gray-200 appearance-none focus:outline-none focus:ring-0 focus:border-black peer transition-colors"
                          placeholder=" "
                          required
                        />
                        <label 
                          htmlFor="pan-name" 
                          className="absolute text-[10px] tracking-[0.2em] font-semibold text-gray-400 uppercase duration-300 transform -translate-y-4 scale-100 top-5 z-10 origin-left peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-100 peer-focus:-translate-y-4 peer-focus:text-gray-800"
                        >
                          Full Name (as per PAN)
                        </label>
                      </div>

                      {/* PAN Number */}
                      <div className="relative group">
                        <input
                          type="text"
                          value={panData.panNumber}
                          onChange={(e) => setPanData({ ...panData, panNumber: e.target.value.toUpperCase() })}
                          id="pan-number"
                          className="block w-full pt-6 pb-2 px-0 text-[15px] font-medium text-black bg-transparent border-0 border-b border-gray-200 appearance-none focus:outline-none focus:ring-0 focus:border-black peer transition-colors uppercase"
                          placeholder=" "
                          required
                        />
                        <label 
                          htmlFor="pan-number" 
                          className="absolute text-[10px] tracking-[0.2em] font-semibold text-gray-400 uppercase duration-300 transform -translate-y-4 scale-100 top-5 z-10 origin-left peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-100 peer-focus:-translate-y-4 peer-focus:text-gray-800"
                        >
                          PAN Card Number
                        </label>
                      </div>

                      {/* Confirm PAN Number */}
                      <div className="relative group">
                        <input
                          type="text"
                          value={panData.confirmPan}
                          onChange={(e) => setPanData({ ...panData, confirmPan: e.target.value.toUpperCase() })}
                          id="confirm-pan"
                          className="block w-full pt-6 pb-2 px-0 text-[15px] font-medium text-black bg-transparent border-0 border-b border-gray-200 appearance-none focus:outline-none focus:ring-0 focus:border-black peer transition-colors uppercase"
                          placeholder=" "
                          required
                        />
                        <label 
                          htmlFor="confirm-pan" 
                          className="absolute text-[10px] tracking-[0.2em] font-semibold text-gray-400 uppercase duration-300 transform -translate-y-4 scale-100 top-5 z-10 origin-left peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-100 peer-focus:-translate-y-4 peer-focus:text-gray-800"
                        >
                          Confirm PAN Number
                        </label>
                      </div>

                       <div className="mt-auto pt-7 pb-5">
                         <button
                           type={isPanVerified ? 'button' : 'submit'}
                           onClick={isPanVerified ? () => setVerificationTab('bank') : undefined}
                           disabled={isVerifyingBank}
                           className="w-full py-5 bg-black text-white text-[11px] font-black tracking-[0.2em] uppercase flex items-center justify-between px-10 hover:bg-gray-800 transition-all duration-300 hover:tracking-[0.25em] disabled:opacity-50 disabled:cursor-not-allowed group shadow-2xl"
                         >
                           <span>{isVerifyingBank ? 'Authenticating...' : isPanVerified ? 'Switch to Bank Verification' : 'Submit Verification'}</span>
                           {isVerifyingBank ? (
                             <FiLoader className="animate-spin text-lg" />
                           ) : (
                             <FiArrowRight className="text-lg group-hover:translate-x-2 transition-transform" />
                           )}
                         </button>
                       </div>
                   </form>
                 )}

                 {/* SIMPLE MINIMALIST SWITCHER (1/2) - FIXED AT BOTTOM */}
                 <div className="sticky bottom-0 pt-2 pb-1 mt-auto flex items-center justify-between z-20">
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Step {verificationTab === 'pan' ? '1' : '2'} of 2</span>
                     <div className="flex items-center gap-2">
                         {/* Step 1 - PAN */}
                         <div className="relative">
                           <button 
                             onClick={() => setVerificationTab('pan')}
                             className={`w-9 h-9 text-[11px] rounded-full font-bold transition-all duration-300 flex items-center justify-center ${
                               verificationTab === 'pan' 
                               ? 'bg-black text-[#ccff00] shadow-lg scale-110' 
                               : 'bg-gray-300 text-gray-400 hover:bg-gray-200'
                             }`}
                             title="PAN Verification"
                           >
                             1
                           </button>
                           {isPanVerified && (
                             <span className="absolute -top-1 -right-1 pointer-events-none" style={{color:'#ccff00'}}>
                               <BsFillPatchCheckFill size={14} />
                             </span>
                           )}
                         </div>
                         {/* Step 2 - Bank */}
                         <div className="relative">
                           <button 
                             onClick={() => setVerificationTab('bank')}
                             className={`w-9 h-9 rounded-full text-[11px] font-bold transition-all duration-300 flex items-center justify-center ${
                               verificationTab === 'bank' 
                               ? 'bg-black text-[#ccff00] shadow-lg scale-110' 
                               : 'bg-gray-300 text-gray-400 hover:bg-gray-200'
                             }`}
                             title="Bank Verification"
                           >
                             2
                           </button>
                           {isBankVerified && (
                             <span className="absolute -top-1 -right-1 pointer-events-none" style={{color:'#ccff00'}}>
                               <BsFillPatchCheckFill size={14} />
                             </span>
                           )}
                         </div>
                     </div>
                 </div>

              </div>
           </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(204,255,0,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(204,255,0,0.3); }
        .outline-text { -webkit-text-stroke: 1px rgba(255,255,255,0.2); color: transparent; }
      `}} />
    </div>
  )
}

