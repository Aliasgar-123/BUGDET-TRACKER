import fs from 'node:fs';

const html = fs.readFileSync('index.html', 'utf8');
const requiredMarkers = ['id="transaction-form"', 'id="mobile-nav-toggle"', 'function formatCurrency'];
const missingMarkers = requiredMarkers.filter(marker => !html.includes(marker));

if (missingMarkers.length) {
  throw new Error(`CoinFlow build check failed; missing: ${missingMarkers.join(', ')}`);
}

console.log('CoinFlow frontend integrity check passed.');
