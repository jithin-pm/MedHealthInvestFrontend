const fs = require('fs');
const file = 'src/Pages/SpecialProjects/SpecialProjects.jsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `      {/* Financial Metrics */}
      <div className="flex flex-col gap-2 mb-4 py-3 border-y border-white/5 font-bold">
        <div className="flex items-center gap-2 text-[14px]">
          <span className="text-zinc-500 uppercase tracking-widest text-[10px] font-black w-24 shrink-0">Target ROI :</span>
          <span className="text-[#ccff00] whitespace-nowrap">{roiText}</span>
        </div>
        <div className="flex items-center gap-2 text-[14px]">
          <span className="text-zinc-500 uppercase tracking-widest text-[10px] font-black w-24 shrink-0">Duration :</span>
          <span className="text-white whitespace-nowrap">{durationText}</span>
        </div>
      </div>`;

const replaceStr = `      {/* Financial Metrics */}
      <div className="flex flex-col gap-2 mb-4 py-3 border-y border-white/5 font-bold">
        <div className="flex items-center gap-2 text-[14px]">
          <span className="text-zinc-500 uppercase tracking-widest text-[10px] font-black w-[110px] shrink-0">Target ROI :</span>
          <span className="text-[#ccff00] whitespace-nowrap">{roiText}</span>
        </div>
        <div className="flex items-center gap-2 text-[14px]">
          <span className="text-zinc-500 uppercase tracking-widest text-[10px] font-black w-[110px] shrink-0">Duration :</span>
          <span className="text-white whitespace-nowrap">{durationText}</span>
        </div>
        
        {project.totalInvested !== undefined && (
          <div className="pt-2 mt-2 border-t border-white/5 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[14px]">
              <span className="text-zinc-500 uppercase tracking-widest text-[10px] font-black w-[110px] shrink-0">Total Invested :</span>
              <span className="text-white whitespace-nowrap">₹{Number(project.totalInvested).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center gap-2 text-[14px]">
              <span className="text-zinc-500 uppercase tracking-widest text-[10px] font-black w-[110px] shrink-0">Returned :</span>
              <span className="text-[#ccff00] whitespace-nowrap">₹{Number(project.moneyReturned).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center gap-2 text-[14px]">
              <span className="text-zinc-500 uppercase tracking-widest text-[10px] font-black w-[110px] shrink-0">Balance :</span>
              <span className="text-white whitespace-nowrap">₹{Number(project.currentBalance).toLocaleString('en-IN')}</span>
            </div>
          </div>
        )}
      </div>`;

const normContent = content.replace(/\r\n/g, '\n');
const normTarget = targetStr.replace(/\r\n/g, '\n');
const normReplace = replaceStr.replace(/\r\n/g, '\n');

if (normContent.includes(normTarget)) {
  const newContent = normContent.replace(normTarget, normReplace);
  fs.writeFileSync(file, newContent, 'utf8');
  console.log('Frontend SpecialProjects.jsx updated successfully');
} else {
  console.log('Target block not found in SpecialProjects.jsx');
}
