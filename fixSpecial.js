const fs = require('fs');
const file = 'src/Pages/Profile/Profile.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Imports
content = content.replace(
  /} from '\.\.\/\.\.\/Services\/allApi'/,
  ', getUserSpecialProjectsApi } from \'../../Services/allApi\''
);

// 2. Add state
content = content.replace(
  /const \[selectedProof, setSelectedProof\] = useState\(null\)/,
  'const [selectedProof, setSelectedProof] = useState(null)\n  const [hasSpecialProjects, setHasSpecialProjects] = useState(false)'
);

// 3. fetch special projects
content = content.replace(
  /const res = await getUserInvestmentsApi\(userId\)/,
  const specialRes = await getUserSpecialProjectsApi(userId)
          if (specialRes.status === 200 && Array.isArray(specialRes.data) && specialRes.data.length > 0) {
              setHasSpecialProjects(true)
          }

          const res = await getUserInvestmentsApi(userId)
);

// 4. update button
content = content.replace(
  /onClick={!\(isPanVerified && isBankVerified\) \? handleOpenBankModal : handleOpenSpecialModal}\s+className=" w-full py-6 bg-\[#ccff00\] text-black rounded-2xl text-\[14px\] font-bold uppercase transition-all duration-300 hover:bg-white shadow-xl flex items-center justify-center gap-2\\s*>\s*Invest on Special Projects <HiOutlineStar \/>\s*<\/button>/m,
 onClick={() => {
 if (hasSpecialProjects) {
 navigate('/special-projects');
 } else {
 !(isPanVerified && isBankVerified) ? handleOpenBankModal() : handleOpenSpecialModal();
 }
 }}
 className=w-full py-6 bg-[#ccff00] text-black rounded-2xl text-[14px] font-bold uppercase transition-all duration-300 hover:bg-white shadow-xl flex items-center justify-center gap-2
 >
 {hasSpecialProjects ? View Special Projects : Invest on Special Projects} <HiOutlineStar />
 </button>
);

fs.writeFileSync(file, content, 'utf8');
console.log('Update complete');
