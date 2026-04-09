const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const pkgPath = path.join(distDir, 'package.json');

fs.mkdirSync(distDir, { recursive: true });
fs.writeFileSync(pkgPath, JSON.stringify({ type: 'commonjs' }, null, 0) + '\n');
