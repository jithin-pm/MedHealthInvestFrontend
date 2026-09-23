const fs = require('fs');
const path = './src/Pages/Profile/Profile.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Find the MIDDLE: Special Projects block
const specialProjectsStart = content.indexOf('{/* MIDDLE: Special Projects (Darker Card) */}');
if (specialProjectsStart === -1) {
    console.log('Could not find Special Projects block');
    process.exit(1);
}

// We need to extract the entire block up to the start of RIGHT: Transaction History
const transactionHistoryStart = content.indexOf('{/* RIGHT: Transaction History (Minimalist) */}');
const specialProjectsBlock = content.substring(specialProjectsStart, transactionHistoryStart);

// 2. Remove it from the current location
content = content.replace(specialProjectsBlock, '');

// 3. Let's design the new full-width horizontal banner for Special Projects
const newSpecialProjectsBlock = `
        {/* Special Projects (Full Row Banner) */}
        <div className="w-full bg-[#121212] rounded-[32px] p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-10 group/special border border-white/5 hover:border-[#ccff00]/30 transition-all shadow-2xl mb-16">
            <div className="flex flex-col gap-6 md:w-2/3">
                <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Managed Tier</span>
                    <span className="text-4xl md:text-5xl font-black text-white tracking-tightest">Special Projects</span>
                </div>
                <div className="flex flex-col gap-4">
                    <p className="text-white text-[15px] md:text-[16px] font-bold leading-relaxed tracking-tight">
                        Amortizing monthly return projects specifically assigned to your portfolio by your fund manager.
                    </p>
                    <p className="text-zinc-400 text-[13px] font-medium leading-relaxed">
                        Special projects return your capital dynamically over time, combined with interest paid directly on the remaining balance every single month.
                    </p>
                </div>
            </div>
            <div className="md:w-1/3 flex items-center justify-end">
                <button
                    onClick={() => navigate('/special-projects')}
                    className="w-full md:w-auto px-10 py-6 bg-white/5 text-white border border-white/10 rounded-2xl text-[14px] font-bold uppercase transition-all duration-300 hover:bg-[#ccff00] hover:text-black hover:border-[#ccff00] active:scale-[0.98] shadow-xl flex items-center justify-center gap-2"
                >
                    View Special Projects <HiOutlineStar />
                </button>
            </div>
        </div>
`;

// 4. We need to find the end of the Two-Card Layout div.
// It starts at: <div className="flex flex-col md:flex-row gap-6 md:gap-8 mb-16 items-stretch w-full">
// We know it contains LEFT and RIGHT.
// Let's find the closing tag of this Two-Card layout.
// Since we removed MIDDLE, only LEFT and RIGHT remain.
// Actually, it's easier to just insert our newSpecialProjectsBlock BEFORE the Two-Card Layout starts, or right AFTER it ends.
// If we put it BEFORE the Two-Card layout, it will be above the Exclusive / Ledger.
// Let's insert it AFTER the Two-Card layout closes.
// But we need to find the closing div of the Two-Card layout... which is hard via simple regex.
// Let's just insert it BEFORE the Two-Card layout, so it sits below User Profile section, and above Exclusive/Ledger.
// Wait, the user said "display the special donation section in a new row", placing it below might be better.
// Actually, inserting it just above {/* Two-Card Layout */} is very safe.

const twoCardStart = content.indexOf('{/* Two-Card Layout */}');
content = content.slice(0, twoCardStart) + newSpecialProjectsBlock + '\\n        ' + content.slice(twoCardStart);

fs.writeFileSync(path, content);
console.log('Transformation complete.');
