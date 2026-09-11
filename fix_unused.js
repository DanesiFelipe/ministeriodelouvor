const fs = require('fs');

let c = fs.readFileSync('frontend/src/pages/Members.tsx', 'utf8');
c = c.replace('Trash2, Edit2, ', '');
fs.writeFileSync('frontend/src/pages/Members.tsx', c);

c = fs.readFileSync('frontend/src/pages/ServiceDetail.tsx', 'utf8');
c = c.replace('const repertoire = ', '// const repertoire = ');
c = c.replace('const songIds = ', '// const songIds = ');
c = c.replace('const res = await fetch', 'await fetch');
fs.writeFileSync('frontend/src/pages/ServiceDetail.tsx', c);

c = fs.readFileSync('frontend/src/pages/Services.tsx', 'utf8');
c = c.replace('Users, ', '');
c = c.replace('AlertCircle, ', '');
fs.writeFileSync('frontend/src/pages/Services.tsx', c);

console.log('Fixed unused vars');
