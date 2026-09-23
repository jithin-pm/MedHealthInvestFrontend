const fs = require('fs');
const path = './src/Pages/SpecialProjects/SpecialProjects.jsx';
let content = fs.readFileSync(path, 'utf8');

// Replace API imports
content = content.replace(
  /getAllProjectsApi, \s*getUserInvestmentsApi/g,
  'getUserSpecialProjectsApi, getUserSpecialInvestmentsApi, getSpecialPayoutScheduleApi'
);

// Replace component name
content = content.replace(/ExclusiveProjects/g, 'SpecialProjects');

// The original component fetches all projects, then filters for Exclusive.
// Here we just fetch special projects for the user.
content = content.replace(/const res = await getAllProjectsApi\(\)/g, 'const res = await getUserSpecialProjectsApi(parsedUser.id)');
content = content.replace(/const exclusive = (.*?)filter\(p => p\.projectType === 'Exclusive' && p\.exclusiveUserId === parsedUser\.id\)/g, 'const exclusive = res.data;');

// Fetching investments
content = content.replace(/const invRes = await getUserInvestmentsApi\(parsedUser\.id\)/g, 'const invRes = await getUserSpecialInvestmentsApi(parsedUser.id)');

// Add Payout Schedule fetching for the selected project modal
content = content.replace(/const \[selectedProject, setSelectedProject\] = useState\(null\)/g, `
  const [selectedProject, setSelectedProject] = useState(null);
  const [payoutSchedule, setPayoutSchedule] = useState([]);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);

  const handleOpenDetails = async (project) => {
    setSelectedProject(project);
    if (project.investment) {
      setIsLoadingSchedule(true);
      try {
        const res = await getSpecialPayoutScheduleApi(project.investment.id);
        if (res.status === 200) setPayoutSchedule(res.data.payouts);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingSchedule(false);
      }
    }
  };
`);

// Replace onClick={() => setSelectedProject(project)} with handleOpenDetails
content = content.replace(/onClick=\{\(\) => setSelectedProject\(project\)\}/g, 'onClick={() => handleOpenDetails(project)}');

// Change references to Exclusive Projects
content = content.replace(/Exclusive Projects/g, 'Special Projects');
content = content.replace(/exclusive-projects/g, 'special-projects');
content = content.replace(/Exclusive Portfolio/g, 'Special Portfolio');
content = content.replace(/Private placements/g, 'Amortized Monthly Yield Projects');

// Remove duration from project details display
content = content.replace(/<div className="flex flex-col gap-1">[\s\S]*?Duration[\s\S]*?{selectedProject\.duration} Months[\s\S]*?<\/div>/g, '');
content = content.replace(/<div className="w-\[1px\] h-10 bg-white\/\[0\.05\]" \/>[\s\S]*?<div className="flex flex-col gap-1">[\s\S]*?Duration[\s\S]*?{project\.duration} Months[\s\S]*?<\/div>/g, '');

// Append the payout schedule inside the project details modal
content = content.replace(/{selectedProject\.investment \? \([\s\S]*?<div className="grid grid-cols-2 gap-4">/g, `
{selectedProject.investment ? (
  <div className="mt-8 pt-8 border-t border-white/5 space-y-6">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-[#ccff00]/10 flex items-center justify-center text-[#ccff00]">
        <HiOutlineChartPie size={20} />
      </div>
      <div>
        <h4 className="text-white font-bold tracking-tight">Investment Summary</h4>
        <p className="text-xs text-gray-500">Your specific terms and current status</p>
      </div>
    </div>
    
    <div className="grid grid-cols-2 gap-4">
`);

content = content.replace(/<\/div>\s*<\/div>\s*\)\s*:\s*\(/g, `
    </div>
    
    {/* Payout Schedule Section */}
    <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
      <h4 className="text-white font-bold tracking-tight">Monthly Payout History</h4>
      {isLoadingSchedule ? (
        <p className="text-gray-500 text-sm animate-pulse">Loading schedule...</p>
      ) : payoutSchedule.length > 0 ? (
        <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
          {payoutSchedule.map((payout, idx) => (
            <div key={payout.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex justify-between items-center hover:bg-white/10 transition-colors">
              <div>
                <p className="text-sm font-bold text-white mb-1">Month {idx + 1}</p>
                <p className="text-xs text-gray-400">{new Date(payout.paidAt).toLocaleDateString('en-GB')}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Cap: ₹{parseFloat(payout.capitalPaid).toLocaleString()} | ROI: ₹{parseFloat(payout.roiPaid).toLocaleString()}</p>
                <p className="text-[#ccff00] font-bold">Total: ₹{parseFloat(payout.totalPaid).toLocaleString()}</p>
              </div>
              {payout.paybackProof && (
                <button onClick={(e) => { e.stopPropagation(); window.open(getImageUrl(payout.paybackProof), '_blank'); }} className="p-2 bg-white/10 rounded-lg hover:bg-[#ccff00] hover:text-black transition-colors ml-4">
                  <FiDownload />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">No monthly payouts have been processed yet.</p>
      )}
    </div>
  </div>
) : (
`);

fs.writeFileSync(path, content);
console.log('Transform complete.');
