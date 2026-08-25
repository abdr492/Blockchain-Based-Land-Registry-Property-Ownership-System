const fs = require('fs');
const path = require('path');
const hre = require('hardhat');

async function main() {
  console.log('================================================================');
  console.log('   DEPLOYING DECENTRALIZED LAND REGISTRY SMART CONTRACT');
  console.log('================================================================\n');

  const [admin, registrar, notary, surveyor, citizenA, citizenB] = await hre.ethers.getSigners();

  console.log('1. Account Roles Configuration:');
  console.log('   - Admin / Deployer    :', admin.address);
  console.log('   - Land Registrar      :', registrar ? registrar.address : admin.address);
  console.log('   - Cadastral Notary    :', notary ? notary.address : admin.address);
  console.log('   - Cadastral Surveyor  :', surveyor ? surveyor.address : admin.address);
  console.log('   - Citizen A (Owner)   :', citizenA ? citizenA.address : admin.address);
  console.log('   - Citizen B (Buyer)   :', citizenB ? citizenB.address : admin.address);

  // 1. Deploy Contract
  const LandRegistryFactory = await hre.ethers.getContractFactory('LandRegistry');
  const landRegistry = await LandRegistryFactory.deploy();
  await landRegistry.waitForDeployment();
  const contractAddress = await landRegistry.getAddress();

  console.log('\n2. Contract Deployed Successfully:');
  console.log('   - LandRegistry Address:', contractAddress);

  // 2. Grant Official Roles
  if (registrar && registrar.address !== admin.address) {
    await (await landRegistry.setRegistrar(registrar.address, true)).wait();
    console.log('   - Granted REGISTRAR role to:', registrar.address);
  }
  if (notary && notary.address !== admin.address) {
    await (await landRegistry.setNotary(notary.address, true)).wait();
    console.log('   - Granted NOTARY role to   :', notary.address);
  }
  if (surveyor && surveyor.address !== admin.address) {
    await (await landRegistry.setSurveyor(surveyor.address, true)).wait();
    console.log('   - Granted SURVEYOR role to :', surveyor.address);
  }

  // 3. Register Seed Properties
  console.log('\n3. Seeding Realistic Cadastral Properties on Ledger...');

  const registrarSigner = registrar || admin;
  const notarySigner = notary || admin;
  const ownerA = citizenA ? citizenA.address : admin.address;
  const ownerB = citizenB ? citizenB.address : admin.address;

  // Property 1: Residential
  await (await landRegistry.connect(registrarSigner).registerProperty(
    'PROP-NY-2024-401',
    'TIT-NY-8892401',
    'CAD-SEC4-LT12',
    'Hudson Valley North District (Sec. 04)',
    '742 Evergreen Terrace, Springfield Heights',
    850,
    'Residential',
    ownerA,
    '0xe3d38838a495ef125635b5acae677cbec990a7896640fca0a492500fbc778832',
    'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi'
  )).wait();
  console.log('   + Registered Parcel: PROP-NY-2024-401 (742 Evergreen Terrace)');

  // Verify Property 1
  await (await landRegistry.connect(notarySigner).verifyProperty(
    'PROP-NY-2024-401',
    'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi'
  )).wait();
  console.log('     * Verified PROP-NY-2024-401 by Cadastral Notary');

  // Property 2: Commercial (with mortgage encumbrance)
  await (await landRegistry.connect(registrarSigner).registerProperty(
    'PROP-NY-2024-502',
    'TIT-NY-9912502',
    'CAD-SEC9-LT88',
    'Midtown Commercial Core (Zone 9)',
    '1200 Avenue of the Americas, Manhattan',
    12400,
    'Commercial',
    ownerA,
    '0x77d38838a495ef125635b5acae677cbec990a7896640fca0a492500fbc778999',
    'ipfs://bafybeiccommercialtitle9912502ipfsreferencecid440192384719283'
  )).wait();
  console.log('   + Registered Parcel: PROP-NY-2024-502 (1200 Avenue of the Americas)');

  await (await landRegistry.connect(notarySigner).verifyProperty(
    'PROP-NY-2024-502',
    'ipfs://bafybeiccommercialtitle9912502ipfsreferencecid440192384719283'
  )).wait();
  console.log('     * Verified PROP-NY-2024-502');

  // Add Mortgage Encumbrance to Property 2
  await (await landRegistry.connect(notarySigner).addEncumbrance(
    'PROP-NY-2024-502',
    'ENC-2026-M01',
    'Mortgage',
    notarySigner.address,
    12500000,
    '0x99a1029348172635489102938475610293847561029384756102938475610293'
  )).wait();
  console.log('     * Added $12.5M Commercial Mortgage Lien to PROP-NY-2024-502');

  // Property 3: Agricultural
  await (await landRegistry.connect(registrarSigner).registerProperty(
    'PROP-NY-2024-603',
    'TIT-NY-7712603',
    'CAD-SEC1-LT04',
    'Westchester Rural Valley (Zone 1)',
    '88 Meadowbrook Road, Westchester',
    4500,
    'Agricultural',
    ownerB,
    '0x55d38838a495ef125635b5acae677cbec990a7896640fca0a492500fbc778777',
    'ipfs://bafybeiaagriculturaltitle7712603ipfsreferencecid102938471928'
  )).wait();
  console.log('   + Registered Parcel: PROP-NY-2024-603 (88 Meadowbrook Road)');

  // 4. Export Artifacts for Frontend & Testing
  const contractArtifact = await hre.artifacts.readArtifact('LandRegistry');
  const contractsExportDir = path.join(__dirname, '../src/contracts');

  if (!fs.existsSync(contractsExportDir)) {
    fs.mkdirSync(contractsExportDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(contractsExportDir, 'deployedAddress.json'),
    JSON.stringify({ LandRegistry: contractAddress, network: hre.network.name, chainId: 31337 }, null, 2),
    'utf8'
  );

  fs.writeFileSync(
    path.join(contractsExportDir, 'LandRegistryABI.json'),
    JSON.stringify(contractArtifact.abi, null, 2),
    'utf8'
  );

  console.log('\n4. Exported Frontend Artifacts:');
  console.log('   - src/contracts/deployedAddress.json');
  console.log('   - src/contracts/LandRegistryABI.json');

  const totalProps = await landRegistry.getTotalProperties();
  console.log(`\n================================================================`);
  console.log(`  DEPLOYMENT COMPLETE! Total On-Chain Parcels Seeded: ${totalProps.toString()}`);
  console.log(`================================================================\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
