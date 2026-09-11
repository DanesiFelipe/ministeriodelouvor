const fs = require('fs');
const path = require('path');
const dir = './frontend/src/pages';
const files = fs.readdirSync(dir);

files.forEach(f => {
  if (!f.endsWith('.tsx')) return;
  const p = path.join(dir, f);
  let c = fs.readFileSync(p, 'utf8');
  let changed = false;

  if (/'http:\/\/localhost:3000([^']*)'/g.test(c)) {
    c = c.replace(/'http:\/\/localhost:3000([^']*)'/g, '`${API_URL}$1`');
    changed = true;
  }
  
  if (/"http:\/\/localhost:3000([^"]*)"/g.test(c)) {
    c = c.replace(/"http:\/\/localhost:3000([^"]*)"/g, '`${API_URL}$1`');
    changed = true;
  }

  if (/`http:\/\/localhost:3000([^`]*)`/g.test(c)) {
    c = c.replace(/`http:\/\/localhost:3000([^`]*)`/g, '`${API_URL}$1`');
    changed = true;
  }

  if (changed) {
    c = "import { API_URL } from '../config';\n" + c;
    fs.writeFileSync(p, c);
    console.log('Updated ' + f);
  }
});
