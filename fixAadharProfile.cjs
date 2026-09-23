const fs = require('fs');
let content = fs.readFileSync('src/Pages/Profile/Profile.jsx', 'utf8');

// Clean up isAadharVerified remnants
content = content.replace(/setIsAadharVerified\(.*?\)/g, '');
content = content.replace(/const \[aadharNumber, setAadharNumber\] = useState\(''\)/g, '');
content = content.replace(/const \[isVerifyingAadhar, setIsVerifyingAadhar\] = useState\(false\)/g, '');
content = content.replace(/setVerificationTab\(isPanVerified \? \(isAadharVerified \? 'bank' : 'aadhar'\) : 'pan'\)/g, "setVerificationTab(isPanVerified ? 'bank' : 'pan')");
content = content.replace(/parsed\.isAadharVerified = 1/g, '');
content = content.replace(/onClick=\{!\(isPanVerified && isAadharVerified && isBankVerified\) \?/g, "onClick={!(isPanVerified && isBankVerified) ?");

// One specific usage in JSX might be breaking
content = content.replace(/isPanVerified && isAadharVerified && isBankVerified/g, 'isPanVerified && isBankVerified');
content = content.replace(/type=\{\(verificationTab === 'pan' && isPanVerified\) \|\| \(verificationTab === 'aadhar' && isAadharVerified\) \? 'button' : 'submit'\}/g, "type={(verificationTab === 'pan' && isPanVerified) ? 'button' : 'submit'}");
content = content.replace(/onClick=\{verificationTab === 'pan' && isPanVerified \? \(\) => setVerificationTab\('aadhar'\) : verificationTab === 'aadhar' && isAadharVerified \? \(\) => setVerificationTab\('bank'\) : undefined\}/g, "onClick={verificationTab === 'pan' && isPanVerified ? () => setVerificationTab('bank') : undefined}");
content = content.replace(/<span>\{isVerifyingBank \? 'Authenticating\.\.\.' : verificationTab === 'pan' && isPanVerified \? 'Switch to Aadhaar' : verificationTab === 'aadhar' && isAadharVerified \? 'Switch to Bank' : 'Submit Verification'\}<\/span>/g, "<span>{isVerifyingBank ? 'Authenticating...' : verificationTab === 'pan' && isPanVerified ? 'Switch to Bank Verification' : 'Submit Verification'}</span>");

fs.writeFileSync('src/Pages/Profile/Profile.jsx', content);
console.log('Cleaned up Aadhar references in Profile.jsx');
