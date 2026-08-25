# 🏛️ Blockchain-Based Land Registry & Property Ownership System

> **A decentralized, tamper-evident cadastral land registry, title deed conveyance, and property ownership verification DApp built with Solidity, Hardhat, Ethers.js, React 19, and Google Gemini AI.**

[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blue.svg?logo=solidity)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.22.18-yellow.svg?logo=ethereum)](https://hardhat.org/)
[![React](https://img.shields.io/badge/React-19.0.1-61DAFB.svg?logo=react)](https://react.dev/)
[![Ethers.js](https://img.shields.io/badge/Ethers.js-6.13.5-blueviolet.svg)](https://docs.ethers.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

---

## 📑 Table of Contents
1. [Project Overview](#-1-project-overview)
2. [Problem Statement](#-2-problem-statement)
3. [Key Objectives](#-3-key-objectives)
4. [Industry Relevance](#-4-industry-relevance)
5. [Educational Disclaimer](#-5-educational-disclaimer)
6. [Blockchain Concepts Used](#-6-blockchain-concepts-used)
7. [System Architecture](#-7-system-architecture)
8. [Project Actors & Permissions](#-8-project-actors--permissions)
9. [Property Data Model](#-9-property-data-model)
10. [Core Workflows](#-10-core-workflows)
11. [Off-Chain Document Hash Integrity](#-11-off-chain-document-hash-integrity)
12. [Smart Contract Specification](#-12-smart-contract-specification)
13. [Security & Validation Controls](#-13-security--validation-controls)
14. [Folder Structure](#-14-folder-structure)
15. [Installation & Setup](#-15-installation--setup)
16. [Hardhat Automated Testing](#-16-hardhat-automated-testing)
17. [Virtual Simulation Guide](#-17-virtual-simulation-guide)
18. [Frontend DApp Features](#-18-frontend-dapp-features)
19. [Real-World Legal Limitations](#-19-real-world-legal-limitations)
20. [Future Enhancements](#-20-future-enhancements)

---

## 🌟 1. Project Overview
The **Blockchain-Based Land Registry & Property Ownership System** is a decentralized application designed to maintain an unalterable, transparent, and auditable on-chain record of real estate titles, parcel registrations, and ownership transfers. 

By anchoring cadastral data and cryptographic document digests on an Ethereum Virtual Machine (EVM) blockchain, the platform guarantees that land records cannot be covertly edited, forged, or double-sold.

---

## ⚠️ 2. Problem Statement
Traditional property registries suffer from:
* **Centralized Database Vulnerabilities**: Malicious actors or corrupt database admins can alter records without leaving an auditable trail.
* **Double-Selling Fraud**: Delays in processing allow dishonest sellers to convey the same parcel to multiple buyers.
* **Manual Due Diligence**: Title searches and encumbrance verifications require weeks of paper inspection.
* **Forged Title Deeds**: Physical paper deeds can be forged or duplicated easily.

---

## 🎯 3. Key Objectives
* Simulate real-world cadastral parcel registration, verification, title conveyance, and dispute settlement.
* Prevent unauthorized sales during active mortgage liens or legal disputes via automated smart contract guards.
* Implement off-chain document hashing to prove physical deed integrity.
* Deliver an interactive React frontend with 6 views, GIS vector map visualization, and Google Gemini AI legal title audits.
* Provide 100% automated test coverage across 20 security test cases.

---

## 🏢 4. Industry Relevance
Similar decentralized registry architectures are actively explored and piloted by:
* **Government Land Registries**: For immutable title mutation and digitized cadastral mapping.
* **Commercial Real Estate Platforms**: For trustless escrow settlement and transparent chain-of-custody tracking.
* **Mortgage & Banking Institutions**: For instant due diligence and tamper-evident lien management.
* **Title Insurance Providers**: To drastically lower legal dispute risks and underwriting costs.

---

## ⚖️ 5. Educational Disclaimer
> [!IMPORTANT]
> **This project is an educational proof-of-concept** built for technical demonstration, portfolio showcasing, and academic blockchain course evaluation. All properties, cadastral codes, and personas are **synthetic dummy data**. It does not create legally binding real estate rights in any sovereign jurisdiction.

---

## 🧠 6. Blockchain Concepts Used
* **Smart Contracts (`Solidity 0.8.20`)**: Autonomous business logic for title conveyance.
* **Role-Based Access Control (`RBAC`)**: Modifiers restricting administrative functions to verified officials.
* **Cryptographic Hashes (`SHA-256 / Keccak-256`)**: Off-chain deed fingerprints anchored on-chain.
* **Decentralized Storage (`IPFS`)**: Content-addressed storage for survey maps and legal PDFs.
* **Asymmetric Key Cryptography (`secp256k1`)**: Digital signatures providing non-repudiation.
* **EVM Storage Layout**: Gas-optimized structs, state enums, and $O(1)$ constant-time mappings.
* **Blockchain Events**: Gas-efficient indexing logs preserving an auditable transfer history.

---

## 🏗️ 7. System Architecture
```text
+-------------------------------------------------------------------------------+
|                       REACT 19 + VITE FRONTEND DAPP                           |
|  - Citizen Portfolio     - Registrar Portal      - Smart Transfer Contracts   |
|  - GIS Cadastral Map     - Ledger Explorer       - Privacy & Compliance       |
+-------------------------------------------------------------------------------+
                                    │ (Ethers.js v6 / MetaMask)
                                    ▼
+-------------------------------------------------------------------------------+
|                    SOLIDITY SMART CONTRACT (LandRegistry.sol)                 |
|  - Roles: Admin, Registrar, Notary, Surveyor                                  |
|  - State: Properties, Encumbrances/Liens, Transfer Records, Disputes          |
|  - Guards: Non-Zero Owner, Positive Area, Lien Block, Dispute Block           |
+-------------------------------------------------------------------------------+
                                    │
             ┌──────────────────────┴──────────────────────┐
             ▼                                             ▼
+------------------------------------+   +------------------------------------+
|       OFF-CHAIN STORAGE (IPFS)     |   |    GOOGLE GEMINI 3.7 FLASH AI      |
| - Deed PDFs & GeoJSON Boundary Maps|   | - Title Integrity & Conflict Audit |
| - Cryptographic SHA-256 Hashes     |   | - Plain-English Deed Explainer     |
+------------------------------------+   +------------------------------------+
```

---

## 👥 8. Project Actors & Permissions

| Role | Responsibilities | Permissions |
|:---|:---|:---|
| **Admin** | Protocol deployer and governance overseer | Grants/revokes official registrar, notary, and surveyor roles |
| **Land Registrar** | Chief municipal land administrative officer | Registers new parcels, resolves disputes, issues sovereign block seals |
| **Cadastral Surveyor** | Licensed boundary & GIS spatial expert | Verifies parcel boundary vectors and GPS survey coordinates |
| **Authorized Notary** | Legal title & escrow compliance officer | Verifies title deeds, attaches mortgage liens, notarizes conveyances |
| **Property Owner** | Citizen holding verified title deed | Views portfolio, initiates transfers, flags boundary disputes |
| **Buyer / Public** | Prospective buyer or public researcher | Verifies title status, deposits escrow, views provenance history |

---

## 📦 9. Property Data Model
```solidity
struct Property {
    string propertyId;        // Unique parcel identifier (e.g., "PROP-NY-2024-401")
    string titleNumber;       // Sovereign title deed code (e.g., "TIT-NY-8892401")
    string parcelId;          // Cadastral plot code (e.g., "CAD-SEC4-LT12")
    string cadastralDistrict; // Municipal administrative jurisdiction
    string physicalAddress;   // Full street address
    uint256 areaSqMeters;     // Total land area in square meters
    string zoning;            // "Residential", "Commercial", "Agricultural", etc.
    address currentOwner;     // Ethereum wallet address of current title holder
    address previousOwner;    // Wallet address of immediately preceding owner
    string documentHash;      // 32-byte SHA-256 hash of original deed file
    string ipfsDeedCid;       // Content identifier on IPFS
    bool isVerified;          // Authority approval flag
    PropertyStatus status;    // REGISTERED, VERIFIED, IN_DISPUTE, ENCUMBERED, etc.
    uint256 registeredAt;     // Genesis registration block timestamp
    uint256 lastTransferredAt;// Last ownership conveyance timestamp
    bool exists;              // Existence guard flag
}
```

---

## 🔄 10. Core Workflows
1. **Registration Flow**: Registrar submits cadastral data with SHA-256 document hash $\to$ Smart contract mints parcel with `REGISTERED` status.
2. **Verification Flow**: Notary reviews cadastral survey $\to$ Calls `verifyProperty()` $\to$ Status transitions to `VERIFIED`.
3. **Conveyance Flow**: Legitimate owner initiates transfer to buyer $\to$ Contract checks for active liens or disputes $\to$ Reassigns `currentOwner` and updates title transfer records.
4. **Encumbrance Flow**: Bank attaches mortgage lien $\to$ Property status becomes `ENCUMBERED` $\to$ All transfers are blocked until mortgage is discharged.

---

## 🔐 11. Off-Chain Document Hash Integrity
Demonstrates cryptographic tamper detection:
```bash
node scripts/hash-document.cjs
```
* **Original File**: `sample_documents/property_001.json` $\to$ Hash: `0xe3d3...8832`
* **Tampered File**: `hashes/property_001_tampered.json` $\to$ Hash: `0xf5ec...385e`
* **Result**: `[TAMPER DETECTED]` — The smart contract immediately rejects modified records!

---

## 📜 12. Smart Contract Specification
The `contracts/LandRegistry.sol` contract contains **23 public/external functions** and **8 events**:
* **Admin Functions**: `setRegistrar()`, `setSurveyor()`, `setNotary()`.
* **Registration & Verification**: `registerProperty()`, `verifyProperty()`.
* **Conveyance**: `transferOwnership()`.
* **Lien Management**: `addEncumbrance()`, `releaseEncumbrance()`, `hasActiveEncumbrance()`.
* **Dispute Management**: `flagDispute()`, `resolveDispute()`.
* **Views**: `getProperty()`, `getAllPropertyIds()`, `getTotalProperties()`, `getPropertiesByOwner()`, `getTitleHistory()`, `getEncumbrances()`, `getDispute()`, `propertyExists()`.

---

## 🛡️ 13. Security & Validation Controls
* **Reentrancy Protection**: Checks-Effects-Interactions pattern implemented across state mutations.
* **Access Control**: Dynamic caller validation via `onlyAdmin`, `onlyRegistrarRole`, `onlyNotaryRole`, `onlyPropertyOwner`.
* **Input Invariants**: Reverts on `address(0)` owner, zero land area, and duplicate parcel IDs.
* **Encumbrance Lock**: Transfers strictly revert if active liens exist.
* **Dispute Lock**: Transfers strictly revert if legal disputes are active.

---

## 📁 14. Folder Structure
```text
Blockchain-Based Land Registry & Property Ownership System/
├── contracts/
│   └── LandRegistry.sol          # Main Solidity Smart Contract
├── scripts/
│   ├── deploy.cjs                # Automated local Hardhat deployment script
│   └── hash-document.cjs         # SHA-256 tamper-detection demo script
├── test/
│   └── LandRegistry.test.cjs     # 20 comprehensive automated unit tests
├── sample_documents/
│   └── property_001.json         # Dummy cadastral property record
├── hashes/                       # Generated SHA-256 hashes and tampered proofs
├── docs/
│   ├── architecture.md           # High-level architecture & workflows
│   ├── concepts.md               # Explanation of 20+ blockchain concepts
│   ├── security.md               # Security controls & real-world limitations
│   ├── simulation-guide.md       # 15-step virtual simulation walkthrough
│   └── interview-prep.md         # Top 10 placement interview Q&A
├── reports/
│   └── project-report.md         # Full academic course project report
├── src/
│   ├── components/               # 16 modular React UI components
│   ├── context/                  # RegistryContext state manager & Web3 bridge
│   ├── contracts/                # Exported contract ABI & deployed address JSON
│   ├── utils/                    # Cryptography & contract helper utilities
│   └── types.ts                  # TypeScript interface definitions
├── hardhat.config.cjs            # Hardhat toolchain configuration
├── package.json                  # NPM dependencies & scripts
└── .gitignore                    # Git ignore rules
```

---

## 🚀 15. Installation & Setup

### Prerequisites
* **Node.js**: `v18+` (Tested on `v22` / `v24`)
* **NPM**: `v9+`
* **MetaMask Browser Extension** (Optional for live Web3 mode)

### 1. Clone & Install Dependencies
```bash
cd "d:/Projects/BlockChain/Blockchain-Based Land Registry & Property Ownership System"
npm install
```

### 2. Compile Smart Contracts
```bash
npm run hardhat:compile
```

### 3. Deploy to Local Blockchain Node
```bash
npm run hardhat:deploy
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 16. Hardhat Automated Testing
Execute the complete test suite containing **20 automated test cases**:
```bash
npm run hardhat:test
```
```text
  LandRegistry Smart Contract Comprehensive Test Suite
    ✔ 1. Should deploy successfully with the deployer set as admin and default roles assigned
    ✔ 2. Should allow admin to grant and revoke registrar, notary, and surveyor roles
    ✔ 3. Should revert if non-admin attempts to grant or revoke roles
    ✔ 4. Should allow authorized Registrar to register a new parcel and emit PropertyRegistered
    ✔ 5. Should revert when registering a duplicate property ID
    ✔ 6. Should revert when registering with zero address as owner
    ✔ 7. Should revert when registering with area equal to zero
    ✔ 8. Should revert when unauthorized user attempts to register a property
    ✔ 9. Should allow authorized Notary to verify registered property and update status
    ✔ 10. Should revert if property is verified more than once
    ✔ 11. Should revert when verifying a non-existent property
    ✔ 12. Should revert when unauthorized caller attempts to verify property
    ✔ 13. Should allow current owner to transfer verified title to buyer and emit OwnershipTransferred
    ✔ 14. Should update currentOwner, previousOwner, and owner property mappings after transfer
    ✔ 15. Should revert when transferring an unverified property
    ✔ 16. Should revert when non-owner (or previous owner) tries to transfer property
    ✔ 17. Should revert when transferring to zero address
    ✔ 18. Should revert when transferring to current owner itself
    ✔ 19. Should block transfer when an active mortgage/lien encumbrance exists, and permit transfer after discharge
    ✔ 20. Should block transfer when a boundary dispute is active, and permit transfer once resolved

  20 passing (2s)
```

---

## 💻 17. Virtual Simulation Guide
See [`docs/simulation-guide.md`](docs/simulation-guide.md) for step-by-step instructions on running the 15-step virtual simulation in **Remix IDE** or on the **Local Hardhat Network**.

---

## 🖥️ 18. Frontend DApp Features
* **6 Specialized Views**: Citizen Portfolio, Registrar Portal, Smart Transfer Contracts, Cadastral GIS Map, Blockchain Ledger Explorer, and Audit & Compliance Center.
* **Interactive GIS Vector Map**: Renders cadastral SVG polygon boundaries with real GPS coordinate overlays and status color codes.
* **Google Gemini 3.7 Flash AI**: Plain-English deed explainer, cadastral valuation appraisal, and automated title integrity conflict audit.
* **Dual Execution Mode**: Toggle between **Live MetaMask Mode** (Ethers.js v6) and **Simulated Persona Mode** (Citizen, Registrar, Notary, Auditor).

---

## 🏛️ 19. Real-World Legal Limitations
* **The GIGO Principle**: Blockchain records whatever data is submitted. If a fraudulent initial registration occurs, the blockchain records that fraud immutably without real-world legal correction.
* **Institutional Integration**: Real deployments require statutory recognition by municipal courts, spatial satellite GIS databases, and statutory inheritance laws.

---

## 🔮 20. Future Enhancements
* **Title NFTs (ERC-721 / ERC-1155)**: Minting transferable title tokens with on-chain SVG metadata.
* **Zero-Knowledge Proofs (zk-SNARKs)**: Allowing citizens to prove clean title ownership to banks without exposing identity or purchase price.
* **The Graph Subgraph**: Decentralized GraphQL indexing for sub-second parcel queries.

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
