const fs = require('fs');
let content = fs.readFileSync('src/Pages/Profile/Profile.jsx', 'utf8');

// Update handleOpenModal and add handleOpenSpecialModal
content = content.replace(
  /const handleOpenModal = \(\) => \{\r?\n\s*setIsModalOpen\(true\)\r?\n\s*\}/g,
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

fs.writeFileSync('src/Pages/Profile/Profile.jsx', content);
console.log('Fixed handleOpenModal in Profile.jsx');
