const fs = require('fs');
const p = 'src/Pages/Profile/Profile.jsx';
let content = fs.readFileSync(p, 'utf8');

// 1. Remove Aadhar logic
content = content.replace(/const \[isAadharVerified, setIsAadharVerified\] = useState\(false\)\n?/g, '');
content = content.replace(/isAadharVerified: statusRes\.data\.isAadharVerified \? 1 : 0,\n?/g, '');
content = content.replace(/setIsAadharVerified\(statusRes\.data\.isAadharVerified === true\)\n?/g, '');
content = content.replace(/!isAadharVerified \|\| /g, '');
content = content.replace(/isAadharVerified && /g, '');

// 2. Add HiOutlineStar and enquiryType state
if (!content.includes('HiOutlineStar')) {
    content = content.replace(
        "import { LuCrown, LuBadgeCheck, LuWallet } from 'react-icons/lu'",
        "import { LuCrown, LuBadgeCheck, LuWallet } from 'react-icons/lu'\nimport { HiOutlineStar } from 'react-icons/hi'"
    );
}

if (!content.includes('enquiryType')) {
    content = content.replace(
        "const [isModalOpen, setIsModalOpen] = useState(false)",
        "const [isModalOpen, setIsModalOpen] = useState(false)\n  const [enquiryType, setEnquiryType] = useState('Exclusive')"
    );
}

// 3. Update Modal Handlers
content = content.replace(
    /const handleOpenModal = \(\) => \{\n\s*setIsModalOpen\(true\)\n\s*\}/g,
    `const handleOpenModal = () => {
    setEnquiryType('Exclusive')
    setMessage("I'm interested in joining the private investment circle for Exclusive Projects and would like to request access.")
    setIsModalOpen(true)
  }

  const handleOpenSpecialModal = () => {
    setEnquiryType('Special')
    setMessage("I'm interested in investing in Special Projects and would like to learn more about the current opportunities.")
    setIsModalOpen(true)
  }`
);

// 4. Fix handleSubmitEnquiry Payload
content = content.replace(
    /subject: 'Request for Exclusive Project Access',/g,
    "subject: `Request for ${enquiryType} Project Access`,"
);
content = content.replace(
    /enquiryType: 'Exclusive'/g,
    "enquiryType: enquiryType"
);

// 5. Replace Exclusive Projects block and insert Special Projects block
const replacement = `                 <div className="flex flex-col gap-5">
                    <span className="text-[10px] font-black text-black/40 uppercase tracking-[0.3em]">Direct Invitation</span>
                    <p className="text-black text-[15px] md:text-[16px] font-bold leading-relaxed tracking-tight">
                       If you are interested in our premium exclusive project category and have additional capital to deploy, we invite you to join our private investment circle.
                    </p>
                    <p className="text-zinc-600 text-[13px] font-medium leading-relaxed mt-1">
                       Members gain direct access to large-scale infrastructure assets with superior risk-adjusted returns, enhanced liquidity, and priority early-access rights.
                    </p>
                 </div>
              </div>

              <button
                onClick={!(isPanVerified && isBankVerified) ? handleOpenBankModal : hasExclusive ? () => navigate('/exclusive-projects') : handleOpenModal}
                className="w-full py-6 bg-black text-white rounded-2xl text-[14px] font-bold uppercase transition-all duration-300 hover:bg-[#ccff00] hover:text-black active:scale-[0.98] shadow-xl flex items-center justify-center gap-2"
              >
                {hasExclusive ? 'View Exclusive Projects' : 'Join Exclusive Projects'} <LuCrown />
              </button>
           </div>

           {/* RIGHT: Special Projects */}
           <div className="w-full md:w-[62%] bg-[#121212] rounded-[32px] p-8 md:p-10 flex flex-col justify-between gap-10 group/special border border-[#ccff00]/50 hover:border-[#ccff00] transition-all shadow-2xl">
               <div className="flex flex-col gap-8">
                  <div className="flex flex-col gap-2">
                     <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Managed Tier</span>
                     <span className="text-4xl md:text-5xl font-black text-white tracking-tightest">Special Projects</span>
                  </div>
                  
                  <div className="w-full h-px bg-white/10" />

                  <div className="flex flex-col gap-5">
                     <p className="text-white text-[15px] md:text-[16px] font-bold leading-relaxed tracking-tight">
                         Special projects return your capital dynamically over time, combined with interest paid directly on the remaining balance every single month.
                     </p>
                     <p className="text-zinc-400 text-[13px] font-medium leading-relaxed mt-1">
                         Once your capital is deployed into active healthcare infrastructure, your returns are calculated and disbursed directly to your verified bank account on a monthly basis.
                     </p>
                  </div>
               </div>

               <button
                   onClick={!(isPanVerified && isBankVerified) ? handleOpenBankModal : handleOpenSpecialModal}
                   className="w-full py-6 bg-[#ccff00] text-black rounded-2xl text-[14px] font-bold uppercase transition-all duration-300 hover:bg-white shadow-xl flex items-center justify-center gap-2"
               >
                   Invest on Special Projects <HiOutlineStar />
               </button>
           </div>
        </div>

        {/* Transaction History Row */}
        <div className="flex w-full mb-16">
            {/* RIGHT: Transaction History (Minimalist) */}
            <div className="w-full bg-zinc-900 rounded-[32px] p-8 md:p-10 border border-white/5 flex flex-col gap-8 transition-all">`;

content = content.replace(
    /                 <div className="flex flex-col gap-5">[\s\S]*?{hasExclusive \? 'View Exclusive Projects' : 'Join Exclusive Projects'} <LuCrown \/>\n\s*<\/button>\n\s*<\/div>\n\n\s*{\/\* RIGHT: Transaction History \(Minimalist\) \*\/}\n\s*<div className="w-full md:w-\[62%\] bg-zinc-900 rounded-\[32px\] p-8 md:p-10 border border-white\/5 flex flex-col gap-8 transition-all">/,
    replacement
);

// 6. Update View Full Audit Statement Button Width
content = content.replace(
    /className="w-full py-6 bg-white text-black rounded-2xl text-\[14px\] font-black tracking-\[0.2em\] uppercase transition-all duration-300 hover:bg-\[#ccff00\] active:scale-\[0.98\] shadow-xl flex items-center justify-center gap-2"/g,
    'className="w-fit px-12 py-6 bg-white text-black rounded-2xl text-[11px] md:text-[14px] font-black tracking-[0.2em] uppercase transition-all duration-300 hover:bg-[#ccff00] active:scale-[0.98] shadow-xl flex items-center justify-center gap-2 mx-auto"'
);

// 7. Dynamic Modal Header and Inputs
content = content.replace(
    /<h2 className="text-lg font-bold text-white tracking-tight">Exclusive Project Request<\/h2>/g,
    "<h2 className=\"text-lg font-bold text-white tracking-tight\">{enquiryType} Project Request</h2>"
);

content = content.replace(
    /value="Request for Exclusive Project Access"/g,
    "value={`Request for ${enquiryType} Project Access`}"
);

fs.writeFileSync(p, content);
console.log('Restored all fixes to Profile.jsx successfully');
