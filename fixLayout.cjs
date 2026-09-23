const fs = require('fs');
let content = fs.readFileSync('src/Pages/Profile/Profile.jsx', 'utf8');

// The replacement text (symmetrical Exclusive + Special + layout fix)
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

const regex = /                 <div className="flex flex-col gap-5">[\s\S]*?\{hasExclusive \? 'View Exclusive Projects' : 'Join Exclusive Projects'\} <LuCrown \/>\r?\n\s*<\/button>\r?\n\s*<\/div>\r?\n\r?\n\s*{\/\* RIGHT: Transaction History \(Minimalist\) \*\/}\r?\n\s*<div className="w-full bg-zinc-900 rounded-\[32px\] p-8 md:p-10 border border-white\/5 flex flex-col gap-8 transition-all">/;

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    console.log("Matched and replaced successfully");
} else {
    console.log("Regex did not match");
}

fs.writeFileSync('src/Pages/Profile/Profile.jsx', content);
