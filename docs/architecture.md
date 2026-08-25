# System Architecture & Workflows

## 1. High-Level System Architecture

The **Blockchain-Based Land Registry & Property Ownership System** is structured across three core tiers: the **Decentralized Blockchain Tier (On-Chain)**, the **Decentralized Storage & Privacy Layer (Off-Chain)**, and the **Application & Presentation Layer (Frontend DApp)**.

```text
+-----------------------------------------------------------------------------------+
|                           PRESENTATION LAYER (React 19 + Vite)                    |
+-----------------------------------------------------------------------------------+
|  [Citizen Portfolio]   [Registrar Portal]   [Smart Contracts]   [Cadastral Map]   |
|  - Title Inspection   - 5-Party Approvals  - Multi-Sig Engine  - GIS SVG Plots    |
|  - Ownership Proof    - Dispute Settlement - Escrow Vault      - Orthophoto Mode  |
+-----------------------------------------------------------------------------------+
                                        | (Ethers.js v6 / MetaMask Provider)
                                        v
+-----------------------------------------------------------------------------------+
|                        SMART CONTRACT LAYER (Solidity 0.8.20)                     |
+-----------------------------------------------------------------------------------+
|  [LandRegistry.sol]                                                               |
|  - Role Management: Admin, Registrar, Notary, Surveyor                            |
|  - Parcel Registry & Mappings (propertyId => Property, owner => propertyId[])    |
|  - Verification & Multi-Signature Conveyance State Machine                        |
|  - Encumbrance & Lien Lifecycle Engine                                            |
|  - Boundary Dispute Settlement & Status Flags                                     |
|  - Immutable Event Logs (PropertyRegistered, OwnershipTransferred, etc.)          |
+-----------------------------------------------------------------------------------+
                                        |
                   +--------------------+--------------------+
                   |                                         |
                   v                                         v
+------------------------------------+   +------------------------------------------+
|    OFF-CHAIN DOCUMENT LAYER (IPFS) |   |        AI REASONING LAYER (Gemini 3.7)   |
+------------------------------------+   +------------------------------------------+
| - Deed PDFs, Cadastral Surveys     |   | - Automated Legal Title Integrity Audits |
| - GeoJSON Boundary Vectors         |   | - Plain-English Deed & Term Explanations |
| - Content-Addressed CIDs on-chain  |   | - Cadastral Valuation & Market Models    |
+------------------------------------+   +------------------------------------------+
```

---

## 2. Actor Roles & Permissions Matrix

| Actor Role | Primary Description | Registration | Verification | Title Conveyance | Encumbrance / Lien | Dispute Action |
|:---|:---|:---:|:---:|:---:|:---:|:---:|
| **Admin** | System deployer & governance authority | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Land Registrar** | Chief municipal land administrator | ✅ | ✅ | ✅ (Seal) | ❌ | ✅ (Resolve) |
| **Cadastral Surveyor** | Licensed boundary surveyor | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Authorized Notary** | Legal title & escrow verifier | ❌ | ✅ | ✅ (Notarize) | ✅ | ✅ (Flag) |
| **Property Owner** | Citizen / legal entity holding active deed | ❌ | ❌ | ✅ (Initiate) | ❌ | ✅ (Flag) |
| **Buyer / Public** | Prospective buyer / title researcher | ❌ | ❌ | ✅ (Accept) | ❌ | ❌ |

---

## 3. Core Operational Workflows

### A. Property Registration & Verification Sequence
```text
[Owner / Applicant] 
        |  Submits physical deed & GPS survey map
        v
[Cadastral Surveyor]
        |  Validates boundary vectors & generates GeoJSON
        v
[Off-Chain IPFS / Hash Engine]
        |  Generates SHA-256 Document Hash + IPFS CID
        v
[Land Registrar]
        |  Calls: registerProperty(propertyId, ..., docHash, ipfsCid)
        v
[LandRegistry Smart Contract]
        |  Stores Property struct, sets status = REGISTERED
        |  Emits: PropertyRegistered event
        v
[Authorized Notary]
        |  Reviews title legitimacy & legal covenants
        |  Calls: verifyProperty(propertyId, verifiedDeedCid)
        v
[LandRegistry Smart Contract]
        |  Updates status = VERIFIED, isVerified = true
        |  Emits: PropertyVerified & PropertyStatusUpdated events
```

### B. Title Conveyance & Multi-Signature Transfer Sequence
```text
[Seller (Owner)]
        |  Initiates transfer: specifies Buyer address & agreed price
        |  Applies ECDSA Digital Signature (Signature 1/5)
        v
[Buyer]
        |  Reviews cadastral terms & deposits escrow funds
        |  Applies ECDSA Digital Signature (Signature 2/5)
        v
[Cadastral Notary & Surveyor]
        |  Verifies clear boundary and no active liens
        |  Applies Cadastral Survey Seal (Signature 3/5)
        v
[Municipal Tax Authority]
        |  Certifies 1% conveyance duty clearance
        |  Applies Tax Clearance Seal (Signature 4/5)
        v
[Chief Land Registrar]
        |  Executes sovereign final seal (Signature 5/5)
        |  Calls: transferOwnership(propertyId, buyerAddress, price, deedURI, sealCode)
        v
[LandRegistry Smart Contract]
        |  Checks: isVerified == true, activeLien == false, inDispute == false
        |  Updates currentOwner = buyer, previousOwner = seller
        |  Updates status = TRANSFERRED, appends to TitleTransferRecord[]
        |  Emits: OwnershipTransferred & PropertyStatusUpdated events
```
