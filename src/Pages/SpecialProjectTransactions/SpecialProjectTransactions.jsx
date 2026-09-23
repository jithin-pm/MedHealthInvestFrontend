import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiImage, FiDownload, FiPaperclip } from 'react-icons/fi'
import { HiX } from 'react-icons/hi'
import Navbar from '../Home/HomeComponents/Navbar'
import { 
  getSpecialProjectByIdApi, 
  getSpecialLedgerHistoryApi, 
  getSpecialPayoutScheduleApi 
} from '../../Services/allApi'
import { commonApi } from '../../Services/CommonApi'
import { BASE_URL } from '../../Services/baseUrl'
import { generateInvestmentReceipt } from '../../Utils/generateReceipt'

export default function SpecialProjectTransactions() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [project, setProject] = useState(null)
  const [investmentRecord, setInvestmentRecord] = useState(null)
  const [ledgerData, setLedgerData] = useState([])
  const [payouts, setPayouts] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      const savedUser = localStorage.getItem('medhealthinvestuser')
      if (!savedUser) {
        navigate('/auth')
        return
      }
      const user = JSON.parse(savedUser)

      // Fetch project details
      const projRes = await getSpecialProjectByIdApi(id)
      if (projRes.status === 200) {
        setProject(projRes.data)
      } else {
        throw new Error("Failed to fetch project")
      }

      // Fetch user's investments to get the investmentId for this project
      const invRes = await commonApi("GET", `/api/special-payment/user-investments/${user.id}`, "", "")
      if (invRes.status === 200 && invRes.data?.success) {
        const userInvestments = invRes.data.investments
        const specificInvestment = userInvestments.find(inv => inv.specialProjectId === parseInt(id))
        
        if (specificInvestment) {
          setInvestmentRecord(specificInvestment)
          // Fetch ledger
          const ledgerRes = await getSpecialLedgerHistoryApi(specificInvestment.id)
          if (ledgerRes.status === 200 && ledgerRes.data?.success) {
            setLedgerData(ledgerRes.data.history)
          }

          // Fetch payouts to get attachments
          const payoutRes = await getSpecialPayoutScheduleApi(specificInvestment.id)
          if (payoutRes.status === 200 && payoutRes.data?.success) {
            setPayouts(payoutRes.data.payouts)
          }
        }
      }
      
    } catch (error) {
      console.error("Error fetching transactions:", error)
    } finally {
      setLoading(false)
    }
  }

  const getImageUrl = (path) => {
    if (!path) return ''
    if (path.startsWith('http')) return path
    return `${BASE_URL}/${path}`
  }

  const openImageModal = (proofPath) => {
    setSelectedImage(getImageUrl(proofPath))
    setIsImageModalOpen(true)
  }

  const handleDownload = async (path) => {
    const url = getImageUrl(path);
    const filename = path ? path.split(/[\/\\]/).pop() : 'download';
    try {
      const response = await fetch(url);
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
  }

  const getMonthlyGroupedLedger = () => {
    const filledLedgerData = [];
    
    if (ledgerData && ledgerData.length > 0) {
      for (let i = 0; i < ledgerData.length; i++) {
        const entry = ledgerData[i];
        const date = new Date(entry.transactionDate);
        
        if (filledLedgerData.length > 0) {
          const lastActual = [...filledLedgerData].reverse().find(row => !row.isSkipped);
          if (lastActual) {
            let currDate = new Date(lastActual.displayDate);
            currDate.setMonth(currDate.getMonth() + 1);
            
            while (
              currDate.getFullYear() < date.getFullYear() || 
              (currDate.getFullYear() === date.getFullYear() && currDate.getMonth() < date.getMonth())
            ) {
              filledLedgerData.push({
                monthKey: `${currDate.getFullYear()}-${currDate.getMonth()}`,
                displayDate: new Date(currDate),
                interest: 0,
                paid: 0,
                isInitial: false,
                isSkipped: true,
                attachment: null
              });
              currDate.setMonth(currDate.getMonth() + 1);
            }
          }
        }
        
        const row = {
          monthKey: `${date.getFullYear()}-${date.getMonth()}`,
          displayDate: date,
          interest: entry.transactionType === 'INTEREST_ACCRUED' ? parseFloat(entry.amount) : 0,
          paid: entry.transactionType === 'PAYOUT_MADE' ? parseFloat(entry.amount) : 0,
          isInitial: entry.transactionType === 'INITIAL_INVESTMENT',
          isSkipped: false,
          attachment: null,
          description: entry.description
        };

        if (entry.transactionType === 'PAYOUT_MADE') {
          const matchedPayout = payouts.find(p => {
            const d = new Date(p.paidAt || p.createdAt || p.created_at);
            return `${d.getFullYear()}-${d.getMonth()}` === row.monthKey;
          });
          if (matchedPayout) {
            row.attachment = matchedPayout.paybackProof;
          }
        }

        filledLedgerData.push(row);
      }
    }
    return filledLedgerData;
  }

  const groupedData = getMonthlyGroupedLedger()

  return (
    <main className="bg-white min-h-screen relative font-['Poppins'] selection:bg-black selection:text-[#ccff00]">
      <Navbar />

      <div className="max-w-[1200px] mx-auto px-6 lg:px-20 pt-32 pb-32">
        {/* Header Section */}
        <div className="flex flex-col gap-6 mb-12">
          <button 
            onClick={() => navigate('/special-projects')}
            className="flex w-fit items-center gap-2 text-[12px] font-black text-black bg-black/5 hover:bg-black/10 px-4 py-2.5 rounded-full uppercase tracking-widest transition-all hover:pr-5 group"
          >
            <FiArrowLeft className="transition-transform group-hover:-translate-x-1" /> Back to Special Projects
          </button>
        </div>

        {/* Project Details Section */}
        {!loading && project && (
          <div className="bg-zinc-900 rounded-[32px] border-2 border-white/5 p-8 mb-12 shadow-2xl flex flex-col md:flex-row gap-8 justify-between items-start md:items-center relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-[#ccff00]/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
             
             <div className="flex flex-col gap-2 z-10">
                <span className="text-[10px] font-black tracking-widest uppercase text-[#ccff00]">Project Info</span>
                <h2 className="text-3xl font-bold text-white tracking-tight">{project.projectName}</h2>
                <div className="flex items-center gap-3 mt-2">
                  <span className="px-3 py-1 rounded-full bg-white/10 text-white/70 text-[10px] font-bold uppercase tracking-widest">ID: {project.id}</span>
                  <span className="px-3 py-1 rounded-full bg-white/10 text-white/70 text-[10px] font-bold uppercase tracking-widest">{project.projectCategory}</span>
                  <span className="px-3 py-1 rounded-full bg-[#ccff00]/10 text-[#ccff00] text-[10px] font-bold uppercase tracking-widest">{project.status}</span>
                </div>
             </div>
             
             <div className="flex flex-col gap-6 z-10 mt-4 md:mt-0">
                <div className="flex flex-wrap gap-8">
                   <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black tracking-widest uppercase text-white/40">Target ROI</span>
                      <span className="text-xl font-black text-white">{project.roi}%</span>
                   </div>
                     <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black tracking-widest uppercase text-white/40">Amount Invested</span>
                        <span className="text-xl font-black text-white">
                          ₹{parseFloat(ledgerData.find(l => l.transactionType === 'INITIAL_INVESTMENT')?.amount || investmentRecord?.amountInvested || investmentRecord?.amount || investmentRecord?.investedAmount || 0).toLocaleString('en-IN')}
                        </span>
                     </div>
                     <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black tracking-widest uppercase text-white/40">Interest Earned</span>
                        <span className="text-xl font-black text-[#ccff00]">
                          +₹{ledgerData.filter(l => l.transactionType === 'INTEREST_ACCRUED').reduce((sum, l) => sum + parseFloat(l.amount), 0).toLocaleString('en-IN')}
                        </span>
                     </div>
                     <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black tracking-widest uppercase text-white/40">Total Balance</span>
                        <span className="text-xl font-black text-white">
                          ₹{parseFloat((investmentRecord?.remainingCapital ? parseFloat(investmentRecord.remainingCapital) + parseFloat(investmentRecord.accumulatedInterest || 0) : null) || ledgerData[ledgerData.length-1]?.balanceAfter || 0).toLocaleString('en-IN')}
                        </span>
                     </div>
                </div>
                <div className="flex flex-wrap gap-8">
                   <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black tracking-widest uppercase text-white/40">Invested On</span>
                        <span className="text-xl font-black text-white">
                          {(() => {
                             const initialEntry = ledgerData.find(entry => entry.transactionType === 'INITIAL_INVESTMENT');
                             if (initialEntry) {
                               return new Date(initialEntry.transactionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                             } else if (investmentRecord && (investmentRecord.createdAt || investmentRecord.created_at)) {
                               const dateVal = investmentRecord.createdAt || investmentRecord.created_at;
                               return new Date(dateVal).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                             }
                             return 'N/A';
                          })()}
                        </span>
                   </div>
                   {project.paymentProof && (
                     <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black tracking-widest uppercase text-white/40">Proof</span>
                        <div className="flex items-center gap-2 mt-1">
                           <button 
                             onClick={(e) => {
                               e.preventDefault();
                               const user = JSON.parse(localStorage.getItem('medhealthinvestuser'));
                               generateInvestmentReceipt({
                                 amount: investmentRecord?.amountInvested || investmentRecord?.amount || investmentRecord?.investedAmount || 0,
                                 paymentId: investmentRecord?.paymentId || 'INITIAL',
                                 projectTitle: project?.projectName,
                                 duration: project?.duration,
                                 isPayout: false,
                                 isRefund: false,
                                 paybackProof: `${BASE_URL}/${project.paymentProof}`,
                                 projectType: 'SPECIAL'
                               }, user, 'download');
                             }}
                             className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95 shadow-lg"
                             title="Download Proof"
                           >
                             <FiDownload className="text-[14px]" />
                           </button>
                           <button 
                             onClick={async (e) => {
                               e.preventDefault();
                               const user = JSON.parse(localStorage.getItem('medhealthinvestuser'));
                               const url = await generateInvestmentReceipt({
                                 amount: investmentRecord?.amountInvested || investmentRecord?.amount || investmentRecord?.investedAmount || 0,
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
                             className="w-8 h-8 rounded-full bg-[#ccff00]/10 hover:bg-[#ccff00]/20 border border-[#ccff00]/20 flex items-center justify-center text-[#ccff00] transition-all hover:scale-105 active:scale-95 shadow-lg"
                             title="View Proof"
                           >
                             <FiPaperclip className="text-[14px]" />
                           </button>
                        </div>
                     </div>
                   )}
                </div>
             </div>
          </div>
        )}

        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center gap-4">
             <div className="w-10 h-10 border-2 border-black/10 border-t-black rounded-full animate-spin" />
             <p className="text-[10px] font-black uppercase tracking-widest text-black/20">Loading Ledger...</p>
          </div>
        ) : (
          <div className="bg-zinc-900 rounded-[32px] border-2 border-[#ccff00] p-1 overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.5)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="py-5 px-6 text-[10px] font-black text-white/50 uppercase tracking-widest rounded-tl-[30px]">Month</th>
                    <th className="py-5 px-6 text-[10px] font-black text-white/50 uppercase tracking-widest">Date</th>
                    <th className="py-5 px-6 text-[10px] font-black text-[#ccff00]/70 uppercase tracking-widest text-right">Interest</th>
                    <th className="py-5 px-6 text-[10px] font-black text-red-400/70 uppercase tracking-widest text-right">Payout</th>
                    <th className="py-5 px-6 text-[10px] font-black text-white/50 uppercase tracking-widest text-center">Status</th>
                    <th className="py-5 px-6 text-[10px] font-black text-white/50 uppercase tracking-widest text-right rounded-tr-[30px]">Attachment</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedData.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-16 text-center text-white/30 font-bold uppercase text-[10px] tracking-widest">
                        No transactions recorded yet
                      </td>
                    </tr>
                  ) : (
                    groupedData.map((group, idx) => (
                      <tr key={group.monthKey || idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-6 px-6">
                            <span className="text-sm font-bold text-white tracking-widest uppercase">{group.displayDate.toLocaleString('default', { month: 'short', year: 'numeric' })}</span>
                        </td>
                        <td className="py-6 px-6">
                            <span className="text-sm font-bold text-white/70">{group.displayDate.toLocaleString('default', { day: 'numeric', month: 'short' })}</span>
                        </td>
                        <td className="py-6 px-6 text-right">
                          <span className="text-sm font-black text-[#ccff00]">
                            {group.interest > 0 ? '+ ₹ ' + group.interest.toLocaleString('en-IN') : '-'}
                          </span>
                        </td>
                        <td className="py-6 px-6 text-right">
                          <span className="text-sm font-black text-red-400">
                            {group.paid > 0 ? `-₹${group.paid.toLocaleString('en-IN')}` : '-'}
                          </span>
                        </td>
                        <td className="py-6 px-6 text-center">
                          {group.isInitial ? (
                             <span className="px-3 py-1 rounded-full border border-blue-500/50 bg-blue-500/10 text-blue-500 text-[0.65rem] font-bold uppercase tracking-widest whitespace-nowrap">
                               Principal
                             </span>
                          ) : group.isSkipped ? (
                             <span className="px-3 py-1 rounded-full border border-gray-500/50 bg-gray-500/10 text-gray-500 text-[0.65rem] font-bold uppercase tracking-widest whitespace-nowrap">
                               Grace Period
                             </span>
                          ) : group.paid > 0 ? (
                             <span className="px-3 py-1 rounded-full border border-green-500/50 bg-green-500/10 text-green-500 text-[0.65rem] font-bold uppercase tracking-widest whitespace-nowrap">
                               {group.description === 'Capital Payback' ? 'Capital Paid Back' : group.description === 'Interest Payback' ? 'Interest Paid Back' : 'Paid'}
                             </span>
                          ) : (
                             <span className="px-3 py-1 rounded-full border border-yellow-500/50 bg-yellow-500/10 text-yellow-500 text-[0.65rem] font-bold uppercase tracking-widest whitespace-nowrap">
                               Interest Accrued
                             </span>
                          )}
                        </td>
                        <td className="py-6 px-6 text-right">
                          {group.attachment ? (
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={(e) => {
                                  e.preventDefault();
                                  const user = JSON.parse(localStorage.getItem('medhealthinvestuser'));
                                  generateInvestmentReceipt({
                                    amount: group.paid,
                                    paymentId: `PAYOUT-${group.monthKey}`,
                                    projectTitle: project?.projectName,
                                    duration: project?.duration,
                                    isPayout: true,
                                    isRefund: false,
                                    paybackProof: `${BASE_URL}/${group.attachment}`,
                                    projectType: 'SPECIAL'
                                  }, user, 'download');
                                }}
                                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95 shadow-lg"
                                title="Download Proof"
                              >
                                <FiDownload className="text-[14px]" />
                              </button>
                              <button 
                                onClick={async (e) => {
                                  e.preventDefault();
                                  const user = JSON.parse(localStorage.getItem('medhealthinvestuser'));
                                  const url = await generateInvestmentReceipt({
                                    amount: group.paid,
                                    paymentId: `PAYOUT-${group.monthKey}`,
                                    projectTitle: project?.projectName,
                                    duration: project?.duration,
                                    isPayout: true,
                                    isRefund: false,
                                    paybackProof: `${BASE_URL}/${group.attachment}`,
                                    projectType: 'SPECIAL'
                                  }, user, 'view');
                                  if (url) {
                                    setSelectedImage(url);
                                    setIsImageModalOpen(true);
                                  }
                                }}
                                className="w-8 h-8 rounded-full bg-[#ccff00]/10 hover:bg-[#ccff00]/20 border border-[#ccff00]/20 flex items-center justify-center text-[#ccff00] transition-all hover:scale-105 active:scale-95 shadow-lg"
                                title="View Proof"
                              >
                                <FiPaperclip className="text-[14px]" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-white/20 text-[10px] font-bold uppercase tracking-widest italic px-3 py-1.5">
                              -
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Image Modal */}
        {isImageModalOpen && selectedImage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col items-center">
              <div className="w-full flex justify-end mb-4">
                <button 
                  onClick={() => setIsImageModalOpen(false)}
                  className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all backdrop-blur-md border border-white/10"
                >
                  <HiX className="text-2xl" />
                </button>
              </div>
              <div className="relative w-full rounded-[32px] overflow-hidden shadow-[0_0_100px_rgba(204,255,0,0.1)] border border-white/10">
                {selectedImage.toLowerCase().endsWith('.pdf') || selectedImage.startsWith('blob:') ? (
                  <iframe 
                    src={selectedImage} 
                    title="Payment Proof" 
                    className="w-full h-[70vh] bg-zinc-900 rounded-[32px]"
                  />
                ) : (
                  <img 
                    src={selectedImage} 
                    alt="Payment Proof" 
                    className="w-full h-auto max-h-[80vh] object-contain bg-zinc-900"
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
