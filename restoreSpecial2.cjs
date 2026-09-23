const fs = require('fs');
const file = 'src/Pages/Profile/Profile.jsx';
let content = fs.readFileSync(file, 'utf8');

const searchStr = `              </button>
           </div>

            {/* RIGHT: Transaction History (Minimalist) */}
            <div className="w-full md:w-[62%] bg-zinc-900 rounded-[32px] p-8 md:p-10 border border-white/5 flex flex-col gap-8 transition-all">`;

const replaceStr = `              </button>
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
                   onClick={() => {
                       if (hasSpecialProjects) {
                           navigate('/special-projects');
                       } else {
                           !(isPanVerified && isBankVerified) ? handleOpenBankModal() : handleOpenSpecialModal();
                       }
                   }}
                   className="w-full py-6 bg-[#ccff00] text-black rounded-2xl text-[14px] font-bold uppercase transition-all duration-300 hover:bg-white shadow-xl flex items-center justify-center gap-2"
               >
                   {hasSpecialProjects ? "View Special Projects" : "Invest on Special Projects"} <HiOutlineStar />
               </button>
           </div>
        </div>

        {/* Transaction History Row */}
        <div className="flex w-full mb-16">
            {/* RIGHT: Transaction History (Minimalist) */}
            <div className="w-full bg-zinc-900 rounded-[32px] p-8 md:p-10 border border-white/5 flex flex-col gap-8 transition-all">`;

// normalize line endings in case
const normContent = content.replace(/\r\n/g, '\n');
const normSearch = searchStr.replace(/\r\n/g, '\n');
const normReplace = replaceStr.replace(/\r\n/g, '\n');

if (normContent.includes(normSearch)) {
  const newContent = normContent.replace(normSearch, normReplace);
  fs.writeFileSync(file, newContent, 'utf8');
  console.log('Update complete');
} else {
  console.log('Search string not found!');
}
