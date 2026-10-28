import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiPaperclip,
  FiTrendingUp,
  FiShield,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiCalendar,
  FiLayers,
  FiArrowDownLeft
} from 'react-icons/fi';
import { HiX } from 'react-icons/hi';
import Navbar from '../Home/HomeComponents/Navbar';
import {
  getSpecialProjectByIdApi,
  getSpecialLedgerHistoryApi,
  getSpecialPayoutScheduleApi
} from '../../Services/allApi';
import { commonApi } from '../../Services/CommonApi';
import { BASE_URL } from '../../Services/baseUrl';
import { generateInvestmentReceipt } from '../../Utils/generateReceipt';

export default function SpecialProjectTransactions() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [investmentRecord, setInvestmentRecord] = useState(null);
  const [ledgerData, setLedgerData] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsImageModalOpen(false);
    };
    if (isImageModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isImageModalOpen]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const savedUser = localStorage.getItem('medhealthinvestuser');
      if (!savedUser) {
        navigate('/auth');
        return;
      }
      const user = JSON.parse(savedUser);

      // Fetch project details
      const projRes = await getSpecialProjectByIdApi(id);
      if (projRes.status === 200) {
        setProject(projRes.data);
      } else {
        throw new Error("Failed to fetch project");
      }

      // Fetch user's investments to get the investmentId for this project
      const invRes = await commonApi("GET", `/api/special-payment/user-investments/${user.id}`, "", "");
      if (invRes.status === 200 && invRes.data?.success) {
        const userInvestments = invRes.data.investments;
        const specificInvestment = userInvestments.find(inv => inv.specialProjectId === parseInt(id));

        if (specificInvestment) {
          setInvestmentRecord(specificInvestment);
          // Fetch ledger
          const ledgerRes = await getSpecialLedgerHistoryApi(specificInvestment.id);
          if (ledgerRes.status === 200 && ledgerRes.data?.success) {
            setLedgerData(ledgerRes.data.history || []);
          }

          // Fetch payouts to get attachments
          const payoutRes = await getSpecialPayoutScheduleApi(specificInvestment.id);
          if (payoutRes.status === 200 && payoutRes.data?.success) {
            setPayouts(payoutRes.data.payouts || []);
          }
        }
      }

    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${BASE_URL}/${path}`;
  };

  const openImageModal = (proofPath) => {
    setSelectedImage(getImageUrl(proofPath));
    setIsImageModalOpen(true);
  };

  const handleDownload = async (path) => {
    const url = getImageUrl(path);
    const filename = path ? path.replace(/\\/g, '/').split('/').pop() : 'download';
    try {
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed, falling back to new tab", error);
      window.open(url, '_blank');
    }
  };

  const getMonthlyGroupedLedger = () => {
    if (!project && !investmentRecord && (!ledgerData || ledgerData.length === 0)) return [];

    const interestPayouts = [];
    const capitalPayouts = [];
    const accruals = [];

    for (const entry of (ledgerData || [])) {
      const date = new Date(entry.transactionDate);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;

      if (entry.transactionType === 'PAYOUT_MADE') {
        const matchedPayout = payouts.find(p => {
          const d = new Date(p.paidAt || p.createdAt || p.created_at);
          return `${d.getFullYear()}-${d.getMonth()}` === monthKey;
        }) || payouts.find(p => !p._assigned) || payouts[0];

        if (matchedPayout) matchedPayout._assigned = true;

        const pObj = {
          id: entry.id,
          amount: parseFloat(entry.amount),
          date,
          monthKey,
          attachment: matchedPayout ? matchedPayout.paybackProof : null,
          description: entry.description,
          used: false
        };

        if (entry.description === 'Capital Payback') {
          capitalPayouts.push(pObj);
        } else {
          interestPayouts.push(pObj);
        }
      } else if (entry.transactionType === 'INTEREST_ACCRUED') {
        accruals.push({
          id: entry.id,
          amount: parseFloat(entry.amount),
          date,
          monthKey,
          description: entry.description
        });
      }
    }

    const rows = [];

    // 1. Initial Investment entry (June 2026)
    const initialLedger = ledgerData?.find(l => l.transactionType === 'INITIAL_INVESTMENT');
    const investDate = initialLedger
      ? new Date(initialLedger.transactionDate)
      : (investmentRecord?.created_at || investmentRecord?.createdAt || project?.ongoingStartDate || project?.created_at
          ? new Date(investmentRecord?.created_at || investmentRecord?.createdAt || project?.ongoingStartDate || project?.created_at)
          : null);

    if (investDate) {
      const investMonthKey = `${investDate.getFullYear()}-${investDate.getMonth()}`;
      rows.push({
        id: 'initial-investment',
        monthKey: investMonthKey,
        displayDate: investDate,
        interest: 0,
        capitalPaid: 0,
        status: 'INITIAL_INVESTMENT',
        attachment: project?.paymentProof || null,
        isInitial: true,
        isSkipped: false,
        description: 'Initial Investment'
      });

      // 2. Grace Period entry (July 2026 cooling buffer)
      const graceDate = new Date(investDate.getFullYear(), investDate.getMonth() + 1, 1, 12, 0, 0);
      const graceMonthKey = `${graceDate.getFullYear()}-${graceDate.getMonth()}`;
      rows.push({
        id: 'grace-period',
        monthKey: graceMonthKey,
        displayDate: graceDate,
        interest: 0,
        capitalPaid: 0,
        status: 'GRACE_PERIOD',
        attachment: null,
        isInitial: false,
        isSkipped: true,
        description: 'Grace Period (No Return)'
      });
    }

    // Only display interest if admin actually sent interest to user (payout made)
    for (const accrual of accruals) {
      const matchedPayout = interestPayouts.find(p => p.monthKey === accrual.monthKey && !p.used) || interestPayouts.find(p => !p.used);
      if (matchedPayout) {
        matchedPayout.used = true;
        rows.push({
          id: matchedPayout.id,
          monthKey: accrual.monthKey,
          displayDate: matchedPayout.date,
          interest: matchedPayout.amount,
          capitalPaid: 0,
          paid: matchedPayout.amount,
          status: 'INTEREST PAID BACK',
          attachment: matchedPayout.attachment,
          isInitial: false,
          isSkipped: false,
          description: matchedPayout.description || 'Interest Payback'
        });
      }
    }

    for (const p of interestPayouts.filter(p => !p.used)) {
      rows.push({
        id: p.id,
        monthKey: p.monthKey,
        displayDate: p.date,
        interest: p.amount,
        capitalPaid: 0,
        paid: p.amount,
        status: 'INTEREST PAID BACK',
        attachment: p.attachment,
        isInitial: false,
        isSkipped: false,
        description: p.description
      });
    }

    for (const p of capitalPayouts) {
      rows.push({
        id: p.id,
        monthKey: p.monthKey,
        displayDate: p.date,
        interest: 0,
        capitalPaid: p.amount,
        paid: p.amount,
        status: 'CAPITAL PAID BACK',
        attachment: p.attachment,
        isInitial: false,
        isSkipped: false,
        description: p.description
      });
    }

    // Sort ascending by transaction date (June -> July -> August...)
    rows.sort((a, b) => new Date(a.displayDate) - new Date(b.displayDate));

    return rows;
  };

  const groupedData = getMonthlyGroupedLedger();

  // Financial Metrics calculations
  const amountInvested = parseFloat(
    ledgerData.find(l => l.transactionType === 'INITIAL_INVESTMENT')?.amount ||
    investmentRecord?.amountInvested ||
    investmentRecord?.amount ||
    investmentRecord?.investedAmount ||
    project?.collectedAmount || 0
  );

  const capitalReturned = (() => {
    const ledgerCapital = ledgerData
      .filter(l => l.transactionType === 'PAYOUT_MADE' && (l.description === 'Capital Payback' || l.description?.toLowerCase().includes('capital')))
      .reduce((sum, l) => sum + parseFloat(l.amount || 0), 0);
    if (ledgerCapital > 0) return ledgerCapital;
    const remaining = parseFloat(investmentRecord?.remainingCapital !== undefined ? investmentRecord.remainingCapital : amountInvested);
    return Math.max(0, amountInvested - remaining);
  })();

  const totalInterestCredited = ledgerData
    .filter(l => l.transactionType === 'PAYOUT_MADE' && (l.description === 'Interest Payback' || !l.description?.toLowerCase().includes('capital')))
    .reduce((sum, l) => sum + parseFloat(l.amount || 0), 0);

  const remainingPrincipal = parseFloat(
    investmentRecord?.remainingCapital !== undefined ? investmentRecord.remainingCapital : (amountInvested - capitalReturned)
  );

  const returnedPercentage = amountInvested > 0 ? Math.round((capitalReturned / amountInvested) * 100) : 0;

  const investedOnFormatted = (() => {
    const initialEntry = ledgerData.find(entry => entry.transactionType === 'INITIAL_INVESTMENT');
    if (initialEntry) {
      return new Date(initialEntry.transactionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } else if (investmentRecord && (investmentRecord.createdAt || investmentRecord.created_at)) {
      const dateVal = investmentRecord.createdAt || investmentRecord.created_at;
      return new Date(dateVal).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
    return 'N/A';
  })();

  return (
    <main className="bg-[#09090b] text-white min-h-screen relative font-['Poppins'] selection:bg-[#ccff00] selection:text-black antialiased">
      {/* Ambient background glow accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-[radial-gradient(ellipse_at_center,rgba(204,255,0,0.06)_0%,rgba(0,0,0,0)_70%)] blur-3xl"></div>
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.02)_0%,rgba(0,0,0,0)_70%)] blur-3xl"></div>
      </div>

      <Navbar />

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-32 relative z-10">

        {/* Navigation & Breadcrumbs Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <button
            onClick={() => navigate('/special-projects')}
            className="flex items-center gap-2.5 text-xs font-bold text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 px-5 py-2.5 rounded-full transition-all group backdrop-blur-md w-fit shadow-sm"
          >
            <FiArrowLeft className="transition-transform group-hover:-translate-x-1 text-sm" />
            <span>Back to Special Projects</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
            <span>Portfolio</span>
            <span className="text-zinc-700">/</span>
            <span className="text-zinc-300">Special Opportunities</span>
          </div>
        </div>

        {loading ? (
          <div className="py-40 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-2 border-white/10 border-t-[#ccff00] rounded-full animate-spin" />
            <p className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500 animate-pulse">Accessing Institutional Ledger...</p>
          </div>
        ) : (
          project && (
            <div className="space-y-10">

              {/* ─────────────────── CLASSY EXECUTIVE HERO BENTO CARD ─────────────────── */}
              <div className="relative rounded-[2.5rem] bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 border border-white/10 p-7 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl overflow-hidden">

                {/* Subtle top highlights */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ccff00]/30 to-transparent"></div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                  {/* Left Column: Project Identity */}
                  <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
                    <div>
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-[10px] font-black tracking-widest uppercase">
                          ID: #{project.id.toString().padStart(4, '0')}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/20 text-[#ccff00] text-[10px] font-black tracking-widest uppercase flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ccff00] animate-pulse" />
                          {project.status || 'ACTIVE'}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-white/5 text-zinc-400 text-[10px] font-bold tracking-widest uppercase">
                          {project.projectCategory || 'Institutional'}
                        </span>
                      </div>

                      <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mt-1">
                        {project.projectName}
                      </h1>
                      <p className="text-xs font-medium text-zinc-400 mt-2 leading-relaxed">
                        Institutional single-investor allocation verified under private placement protocol.
                      </p>
                    </div>

                    {/* Metadata & Actions */}
                    <div className="pt-6 border-t border-white/5 space-y-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-500 font-medium flex items-center gap-2">
                          <FiCalendar className="text-zinc-400" /> Allocation Date
                        </span>
                        <span className="text-white font-bold">{investedOnFormatted}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-500 font-medium flex items-center gap-2">
                          <FiTrendingUp className="text-[#ccff00]" /> Monthly Yield
                        </span>
                        <span className="text-[#ccff00] font-black text-sm">{project.roi}% / Month</span>
                      </div>

                      {project.paymentProof && (
                        <div className="pt-2">
                          <button
                            onClick={async (e) => {
                              e.preventDefault();
                              const user = JSON.parse(localStorage.getItem('medhealthinvestuser'));
                              const url = await generateInvestmentReceipt({
                                amount: amountInvested,
                                paymentId: investmentRecord?.paymentId || 'INITIAL',
                                projectTitle: project?.projectName,
                                duration: project?.duration,
                                isPayout: false,
                                isRefund: false,
                                paybackProof: `${BASE_URL}/${project.paymentProof}`,
                                projectType: 'SPECIAL'
                              }, user, 'view');
                              if (url) {
                                setSelectedImage(url);
                                setIsImageModalOpen(true);
                              }
                            }}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-zinc-200 hover:text-white transition-all active:scale-[0.99] cursor-pointer"
                          >
                            <FiFileText className="text-sm text-[#ccff00]" />
                            <span>View Investment Agreement</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Key Financial Metrics Tiles */}
                  <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">

                    {/* Tile 1: Capital Invested */}
                    <div className="bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-white/10 rounded-2xl p-5 transition-all flex flex-col justify-between group">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Amount Invested</span>
                        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-zinc-400 group-hover:text-white transition-colors">
                          <FiLayers className="text-sm" />
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="text-2xl font-black text-white tracking-tight">
                          <span className="mr-1">₹</span>{amountInvested.toLocaleString('en-IN')}
                        </div>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1 block">
                          Committed Principal
                        </span>
                      </div>
                    </div>

                    {/* Tile 2: Capital Returned */}
                    <div className="bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-white/10 rounded-2xl p-5 transition-all flex flex-col justify-between group">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Capital Returned</span>
                        <div className="w-8 h-8 rounded-xl bg-[#dfb76c]/10 border border-[#dfb76c]/20 flex items-center justify-center text-[#e6ca85]">
                          <FiArrowDownLeft className="text-sm" />
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="text-2xl font-black text-[#e6ca85] tracking-tight">
                          <span className="mr-1">₹</span>{capitalReturned.toLocaleString('en-IN')}
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#dfb76c] rounded-full transition-all duration-700"
                              style={{ width: `${Math.min(100, returnedPercentage)}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-[#e6ca85]/80 font-bold tracking-widest">
                            {returnedPercentage}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Tile 3: Total Interest Credited */}
                    <div className="bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-white/10 rounded-2xl p-5 transition-all flex flex-col justify-between group">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Interest Credited</span>
                        <div className="w-8 h-8 rounded-xl bg-[#ccff00]/10 flex items-center justify-center text-[#ccff00]">
                          <FiTrendingUp className="text-sm" />
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="text-2xl font-black text-[#ccff00] tracking-tight">
                          +<span className="mr-1">₹</span>{totalInterestCredited.toLocaleString('en-IN')}
                        </div>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1 block">
                          Distributed Yield
                        </span>
                      </div>
                    </div>

                    {/* Tile 4: Remaining Capital / Total Balance */}
                    <div className="bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-white/10 rounded-2xl p-5 transition-all flex flex-col justify-between group">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Remaining Balance</span>
                        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-zinc-400 group-hover:text-white transition-colors">
                          <FiShield className="text-sm" />
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="text-2xl font-black text-white tracking-tight">
                          <span className="mr-1">₹</span>{remainingPrincipal.toLocaleString('en-IN')}
                        </div>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1 block">
                          Active Vault Principal
                        </span>
                      </div>
                    </div>

                  </div>

                </div>
              </div>

              {/* ─────────────────── CLASSY SETTLEMENT LEDGER TABLE ─────────────────── */}
              <div className="space-y-5">

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-2">
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                      <span>Institutional Settlement Ledger</span>
                    </h2>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Verified distribution timeline of interest earnings and returned capital principal
                    </p>
                  </div>

                  <div className="text-xs font-bold text-zinc-500 bg-white/[0.03] border border-white/5 px-4 py-2 rounded-xl w-fit">
                    {groupedData.length} {groupedData.length === 1 ? 'Record' : 'Records'}
                  </div>
                </div>

                <div className="bg-gradient-to-b from-zinc-900/70 to-zinc-950/70  border border-white/10 shadow-2xl overflow-hidden backdrop-blur-xl">
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/[0.02]">
                          <th className="py-4 px-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Settlement Date</th>
                          <th className="py-4 px-6 text-[10px] font-black text-[#ccff00] uppercase tracking-widest text-right">Interest Credited</th>
                          <th className="py-4 px-6 text-[10px] font-black text-white uppercase tracking-widest text-right">Capital Returned</th>
                          <th className="py-4 px-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Status</th>
                          <th className="py-4 px-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Receipt / Proof</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {groupedData.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="py-20 text-center">
                              <div className="flex flex-col items-center justify-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500">
                                  <FiClock className="text-xl" />
                                </div>
                                <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase">No settlement distributions recorded yet</span>
                                <span className="text-[11px] text-zinc-600 max-w-sm">Interest and capital distributions will appear here once settled by administration.</span>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          groupedData.map((group, idx) => {
                            const isCapital = group.status === 'CAPITAL PAID BACK';
                            const isInitial = group.isInitial || group.status === 'INITIAL_INVESTMENT';
                            const isGrace = group.isSkipped || group.status === 'GRACE_PERIOD';
                            const dateObj = new Date(group.displayDate);

                            return (
                              <tr
                                key={group.id || group.monthKey || idx}
                                className="hover:bg-white/[0.03] transition-colors group"
                              >
                                {/* 1. Settlement Date & Time */}
                                <td className="py-5 px-6">
                                  <div className="flex flex-col">
                                    <span className="text-xs font-semibold text-white tracking-wide">
                                      {dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                    {isGrace ? (
                                      <span className="text-[11px] text-zinc-500 mt-0.5 font-medium">Grace Period Month</span>
                                    ) : (
                                      <span className="text-[11px] font-mono text-zinc-400 mt-0.5">
                                        {dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                      </span>
                                    )}
                                  </div>
                                </td>

                                {/* 2. Interest Credited */}
                                <td className="py-5 px-6 text-right">
                                  {group.interest > 0 ? (
                                    <span className="text-xs font-black text-[#ccff00] font-mono">
                                      +<span className="mr-0.5">₹</span>{Number(group.interest).toLocaleString('en-IN')}
                                    </span>
                                  ) : (
                                    <span className="text-zinc-600 text-xs font-medium">—</span>
                                  )}
                                </td>

                                {/* 3. Capital Returned */}
                                <td className="py-5 px-6 text-right">
                                  {group.capitalPaid > 0 ? (
                                    <span className="text-xs font-black text-white font-mono">
                                      <span className="mr-0.5">₹</span>{Number(group.capitalPaid).toLocaleString('en-IN')}
                                    </span>
                                  ) : (
                                    <span className="text-zinc-600 text-xs font-medium">—</span>
                                  )}
                                </td>

                                {/* 4. Status */}
                                <td className="py-5 px-6 text-center">
                                  {isInitial ? (
                                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-zinc-800/90 border border-white/10 shadow-sm backdrop-blur-sm">
                                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                                      <span className="text-[11px] font-medium text-zinc-200 tracking-wide">
                                        Initial Investment
                                      </span>
                                    </span>
                                  ) : isGrace ? (
                                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-zinc-800/90 border border-white/10 shadow-sm backdrop-blur-sm">
                                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 shrink-0" />
                                      <span className="text-[11px] font-medium text-zinc-300 tracking-wide">
                                        Grace Period
                                      </span>
                                    </span>
                                  ) : isCapital ? (
                                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-zinc-800/90 border border-white/10 shadow-sm backdrop-blur-sm">
                                      <span className="w-1.5 h-1.5 rounded-full bg-[#dfb76c] shrink-0" />
                                      <span className="text-[11px] font-medium text-zinc-200 tracking-wide">
                                        Capital Returned
                                      </span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-zinc-800/90 border border-white/10 shadow-sm backdrop-blur-sm">
                                      <span className="w-1.5 h-1.5 rounded-full bg-[#ccff00] shrink-0" />
                                      <span className="text-[11px] font-medium text-zinc-200 tracking-wide">
                                        Interest Credited
                                      </span>
                                    </span>
                                  )}
                                </td>

                                {/* 5. Receipt / Proof */}
                                <td className="py-5 px-6 text-right">
                                  {isInitial && (group.attachment || project?.paymentProof) ? (
                                    <div className="flex items-center justify-end">
                                      <button
                                        onClick={async (e) => {
                                          e.preventDefault();
                                          const user = JSON.parse(localStorage.getItem('medhealthinvestuser'));
                                          const url = await generateInvestmentReceipt({
                                            amount: amountInvested,
                                            paymentId: investmentRecord?.paymentId || 'INITIAL',
                                            projectTitle: project?.projectName,
                                            duration: project?.duration,
                                            isPayout: false,
                                            isRefund: false,
                                            paybackProof: `${BASE_URL}/${project.paymentProof}`,
                                            projectType: 'SPECIAL'
                                          }, user, 'view');
                                          if (url) {
                                            setSelectedImage(url);
                                            setIsImageModalOpen(true);
                                          } else if (group.attachment) {
                                            openImageModal(group.attachment);
                                          }
                                        }}
                                        className="w-8 h-8 rounded-xl bg-[#ccff00]/10 hover:bg-[#ccff00]/20 border border-[#ccff00]/20 flex items-center justify-center text-[#ccff00] transition-all hover:scale-105 active:scale-95 cursor-pointer ml-auto"
                                        title="View Investment Agreement / Receipt"
                                      >
                                        <FiPaperclip className="text-xs" />
                                      </button>
                                    </div>
                                  ) : group.attachment ? (
                                    <div className="flex items-center justify-end">
                                      <button
                                        onClick={(e) => {
                                          e.preventDefault();
                                          openImageModal(group.attachment);
                                        }}
                                        className="w-8 h-8 rounded-xl bg-[#ccff00]/10 hover:bg-[#ccff00]/20 border border-[#ccff00]/20 flex items-center justify-center text-[#ccff00] transition-all hover:scale-105 active:scale-95 cursor-pointer ml-auto"
                                        title="View Verification Document"
                                      >
                                        <FiPaperclip className="text-xs" />
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="text-zinc-600 text-xs font-bold">—</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

            </div>
          )
        )}

        {/* ─────────────────── CLASSY DOCUMENT PREVIEW MODAL ─────────────────── */}
        {isImageModalOpen && selectedImage && (
          <div 
            onClick={() => setIsImageModalOpen(false)}
            className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
          >
            {/* Always-Visible Fixed Screen Close Button */}
            <button
              onClick={() => setIsImageModalOpen(false)}
              className="fixed top-5 right-5 z-[140] w-12 h-12 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-white flex items-center justify-center border border-white/20 shadow-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
              title="Close (Esc)"
              aria-label="Close Preview"
            >
              <HiX className="text-2xl" />
            </button>

            <div 
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-zinc-950 border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.9)] z-[130]"
            >
              {/* Pinned Card Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-zinc-900/90 backdrop-blur-md shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#ccff00]/10 border border-[#ccff00]/20 flex items-center justify-center text-[#ccff00]">
                    <FiFileText className="text-sm" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-200">Verification Document</span>
                </div>
                <button
                  onClick={() => setIsImageModalOpen(false)}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all border border-white/10 active:scale-95 cursor-pointer"
                  title="Close"
                >
                  <HiX className="text-lg" />
                </button>
              </div>

              {/* Scrollable / Scaled Modal Body */}
              <div className="relative w-full flex-1 overflow-auto p-3 bg-black/70 flex items-center justify-center min-h-[300px]">
                {selectedImage.toLowerCase().endsWith('.pdf') || selectedImage.startsWith('blob:') ? (
                  <iframe
                    src={selectedImage}
                    title="Payment Proof"
                    className="w-full h-[70vh] bg-zinc-900 rounded-2xl border-0"
                  />
                ) : (
                  <img
                    src={selectedImage}
                    alt="Payment Proof"
                    className="w-auto h-auto max-w-full max-h-[72vh] object-contain rounded-2xl"
                  />
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
