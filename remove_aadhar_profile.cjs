const fs = require('fs');

const profilePath = 'src/Pages/Profile/Profile.jsx';
let content = fs.readFileSync(profilePath, 'utf8');

// 1. Remove isAadharVerified state and checks
content = content.replace(/const \[isAadharVerified, setIsAadharVerified\] = useState\(false\)\n?/g, '');
content = content.replace(/const \[aadharNumberInput, setAadharNumberInput\] = useState\(''\)\n?/g, '');
content = content.replace(/const \[isVerifyingAadhar, setIsVerifyingAadhar\] = useState\(false\)\n?/g, '');

content = content.replace(/setIsAadharVerified\(statusRes\.data\.isAadharVerified === true \|\| statusRes\.data\.isAadharVerified === 1\)\n?/g, '');
content = content.replace(/isAadharVerified: statusRes\.data\.isAadharVerified \? 1 : 0,\n?/g, '');

// 2. Fix the onClick handlers for buttons
content = content.replace(/!\(isPanVerified && isAadharVerified && isBankVerified\)/g, '!(isPanVerified && isBankVerified)');
content = content.replace(/isPanVerified && isAadharVerified && isBankVerified/g, 'isPanVerified && isBankVerified');

// 3. Fix verification tab logic
content = content.replace(/setVerificationTab\(isPanVerified \? \(isAadharVerified \? 'bank' : 'aadhar'\) : 'pan'\)/g, "setVerificationTab(isPanVerified ? 'bank' : 'pan')");

// 4. Remove Aadhaar logic in form submission
content = content.replace(/\|\| \(verificationTab === 'aadhar' && isAadharVerified\)/g, '');
content = content.replace(/verificationTab === 'pan' && isPanVerified \? \(\) => setVerificationTab\('aadhar'\) : verificationTab === 'aadhar' && isAadharVerified \? \(\) => setVerificationTab\('bank'\) : undefined/g, "verificationTab === 'pan' && isPanVerified ? () => setVerificationTab('bank') : undefined");
content = content.replace(/verificationTab === 'pan' && isPanVerified \? 'Switch to Aadhaar' : verificationTab === 'aadhar' && isAadharVerified \? 'Switch to Bank' : 'Submit Verification'/g, "verificationTab === 'pan' && isPanVerified ? 'Switch to Bank' : 'Submit Verification'");

fs.writeFileSync(profilePath, content);
console.log('Profile.jsx cleaned up from Aadhaar verification');
