// Vercel 构建后替换 index.html 中的模板变量
const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'dist', 'client', 'index.html');
if (fs.existsSync(indexPath)) {
  let html = fs.readFileSync(indexPath, 'utf8');
  html = html.replace(/{{appName}}/g, '筑一教育');
  html = html.replace(/{{appAvatar}}/g, '/favicon.svg');
  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('post-build: replaced appName/appAvatar in index.html');
} else {
  console.warn('post-build: index.html not found at', indexPath);
}
