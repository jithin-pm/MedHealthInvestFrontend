const fs = require('fs');
const path = 'C:/jithin-pm/Work/MedHealthInvestFrontend/src/Pages/SpecialProjects/SpecialProjects.jsx';
let content = fs.readFileSync(path, 'utf8');

// The image parser logic:
// const images = JSON.parse(project.projectImages || '[]');
// const mainImage = images.length > 0 ? `${BASE_URL}/${images[0].replace(/\\/g, '/')}` : '';

content = content.replace(/const images = JSON\.parse\(project\.projectImages \|\| '\[\]'\);/g, '');
content = content.replace(/const mainImage = images\.length > 0 \? `\$\{BASE_URL\}\/\$\{images\[0\]\.replace\(\/\\\\\/g, '\/'\)\}` : '';/g, '');

content = content.replace(/src=\{mainImage\}/g, "src={project.paymentProof ? `${BASE_URL}/${project.paymentProof}` : ''}");

fs.writeFileSync(path, content);
console.log('User frontend transform complete.');
