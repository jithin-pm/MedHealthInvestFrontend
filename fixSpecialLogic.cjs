const fs = require('fs');
const file = 'src/Pages/Profile/Profile.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. imports
content = content.replace(
  /} from '\.\.\/\.\.\/Services\/allApi'/,
  ', getUserSpecialProjectsApi } from \'../../Services/allApi\''
);

// 2. state
const statePattern = /const \[selectedProof, setSelectedProof\] = useState\(null\)/;
if (content.includes('hasSpecialProjects') === false) {
    content = content.replace(statePattern, 'const [selectedProof, setSelectedProof] = useState(null)\n  const [hasSpecialProjects, setHasSpecialProjects] = useState(false)');
}

// 3. fetch special projects
const fetchPattern = /const res = await getUserInvestmentsApi\(userId\)/;
if (content.includes('getUserSpecialProjectsApi(userId)') === false) {
    content = content.replace(fetchPattern, `const specialRes = await getUserSpecialProjectsApi(userId)
          if (specialRes.status === 200 && Array.isArray(specialRes.data) && specialRes.data.length > 0) {
              setHasSpecialProjects(true)
          }

          const res = await getUserInvestmentsApi(userId)`);
}

// 4. import HiOutlineStar
const importStarPattern = /import { LuCrown, LuBadgeCheck, LuWallet } from 'react-icons\/lu'/;
if (content.includes('HiOutlineStar') === false) {
    content = content.replace(importStarPattern, `import { LuCrown, LuBadgeCheck, LuWallet } from 'react-icons/lu'
import { HiOutlineStar } from 'react-icons/hi'`);
}

fs.writeFileSync(file, content, 'utf8');
console.log('Final updates complete');
