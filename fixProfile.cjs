const fs = require('fs');
let content = fs.readFileSync('src/Pages/Profile/Profile.jsx', 'utf8');

// Add enquiryType
content = content.replace(
  `const [isModalOpen, setIsModalOpen] = useState(false)`,
  `const [isModalOpen, setIsModalOpen] = useState(false)\n  const [enquiryType, setEnquiryType] = useState('Exclusive')`
);

// Update handleOpenModal and add handleOpenSpecialModal
content = content.replace(
  `  const handleOpenModal = () => {\n    setIsModalOpen(true)\n  }`,
  `  const handleOpenModal = () => {\n    setEnquiryType('Exclusive')\n    setMessage("I'm interested in joining the private investment circle for Exclusive Projects and would like to request access.")\n    setIsModalOpen(true)\n  }\n\n  const handleOpenSpecialModal = () => {\n    setEnquiryType('Special')\n    setMessage("I'm interested in investing in Special Projects and would like to learn more about the current opportunities.")\n    setIsModalOpen(true)\n  }`
);

fs.writeFileSync('src/Pages/Profile/Profile.jsx', content);
console.log('Fixed Profile.jsx');
