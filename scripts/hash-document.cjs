const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function computeSHA256(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  return '0x' + crypto.createHash('sha256').update(fileBuffer).digest('hex');
}

function main() {
  console.log('================================================================');
  console.log('  OFF-CHAIN DOCUMENT HASH INTEGRITY & TAMPER DETECTION DEMO');
  console.log('================================================================\n');

  const sampleDocPath = path.join(__dirname, '../sample_documents/property_001.json');
  const hashesDir = path.join(__dirname, '../hashes');

  if (!fs.existsSync(hashesDir)) {
    fs.mkdirSync(hashesDir, { recursive: true });
  }

  // 1. Compute original hash
  const originalHash = computeSHA256(sampleDocPath);
  console.log('1. Original Document Path:', sampleDocPath);
  console.log('   Original SHA-256 Hash :', originalHash);

  // Save hash to file
  fs.writeFileSync(path.join(hashesDir, 'property_001.sha256'), originalHash, 'utf8');

  // 2. Simulate document tampering
  const docContent = JSON.parse(fs.readFileSync(sampleDocPath, 'utf8'));
  const tamperedDoc = {
    ...docContent,
    initialOwner: {
      ...docContent.initialOwner,
      name: 'Malicious Impersonator (Modified Deed)',
      walletAddress: '0x000000000000000000000000000000000000dEaD'
    }
  };

  const tamperedPath = path.join(hashesDir, 'property_001_tampered.json');
  fs.writeFileSync(tamperedPath, JSON.stringify(tamperedDoc, null, 2), 'utf8');

  const tamperedHash = computeSHA256(tamperedPath);
  console.log('\n2. Tampered Document Created:', tamperedPath);
  console.log('   Tampered SHA-256 Hash   :', tamperedHash);

  // 3. Verification & Comparison
  console.log('\n3. Cryptographic Verification:');
  const isMatch = (originalHash === tamperedHash);
  console.log('   Original == Tampered?   :', isMatch);

  if (!isMatch) {
    console.log('   [TAMPER DETECTED] The modified document produces a completely different hash!');
    console.log('   Smart Contract on-chain record will immediately reject this forged deed.');
  }

  console.log('\n================================================================');
}

main();
