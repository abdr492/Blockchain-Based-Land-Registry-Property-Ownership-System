# Security Controls, Threat Model & Real-World Constraints

This document details the security architecture, threat model mitigations, and legal/institutional limitations of the **Blockchain-Based Land Registry & Property Ownership System**.

---

## 1. Smart Contract Security Controls & Mitigations

| Threat Vector | Potential Vulnerability / Attack | Implemented Mitigation |
|:---|:---|:---|
| **1. Unauthorized Registration** | Malicious users register fake land plots under their name | `onlyRegistrarRole` modifier restricts registration to verified government land registrars. |
| **2. Duplicate Parcel Minting** | Creating double titles for the same physical property | Invariant `require(!properties[propertyId].exists)` prevents duplicate IDs. |
| **3. Zero-Address Theft / Burn** | Accidentally or maliciously conveying title to `0x0` | Invariant `require(newOwner != address(0))` rejects null address assignments. |
| **4. Self-Transfer Anomaly** | Owner transfers title to themselves to create fake transfer volume | Invariant `require(newOwner != prop.currentOwner)` rejects reflexive conveyance. |
| **5. Unverified Title Transfer** | Transferring unvetted or fraudulent land listings | Invariant `require(prop.isVerified)` enforces surveyor/notary sign-off prior to conveyance. |
| **6. Conveyance During Active Lien** | Selling property with outstanding bank mortgage or tax lien | `hasActiveEncumbrance()` check reverts transfer transactions until encumbrance is discharged. |
| **7. Conveyance During Dispute** | Selling contested land while legal court case is pending | Status invariant `require(prop.status != PropertyStatus.IN_DISPUTE)` blocks transfer during active disputes. |
| **8. Unauthorized Title Seizure** | Attacker calls transfer on someone else's property | Guard `require(msg.sender == prop.currentOwner || isNotary[msg.sender])` blocks unauthorized callers. |
| **9. Former Owner Re-Transfer** | Old owner attempts to resell property after conveyance | Dynamic storage update immediately cleanses old owner mapping and sets `currentOwner = buyer`. |
| **10. Reentrancy Attacks** | Recursive external calls draining contract state or funds | Follows Checks-Effects-Interactions pattern; state updates occur prior to event emissions and external calls. |
| **11. Off-Chain Document Tampering** | Changing physical survey maps or deed terms after minting | SHA-256 hash anchored in contract; any modified document produces a mismatched hash (`[TAMPER DETECTED]`). |
| **12. Stack Too Deep / Gas Exhaustion** | Complex struct passing causing EVM stack overflow or high gas | Compiled with Yul intermediate representation (`viaIR: true`) and 200 optimizer runs. |
| **13. PII Exposure on Public Ledger** | Publishing citizen names or national ID numbers on-chain | Sensitive PII is encrypted off-chain via AES-256-GCM; only hashes/CIDs exist on the public ledger. |

---

## 2. The Fundamental "Garbage In, Garbage Out" (GIGO) Problem

> [!IMPORTANT]
> **Core Blockchain Limitation**: Blockchain technology guarantees **data immutability** and **execution determinism**, but it **cannot verify the physical truth or legal validity of the input data prior to minting**.

1. **The Oracle Problem in Real Estate**: If a corrupt registrar or fraudulent surveyor registers a parcel with incorrect boundary coordinates or forged deeds, the blockchain will faithfully record and preserve that fraud immutably.
2. **Identity vs. Cryptographic Wallet**: A private key controls a wallet address, but the blockchain cannot independently verify whether the person holding that private key is the true legal citizen, an impostor, or an heir.
3. **Physical Cadastral Encroachment**: If a neighbor moves a physical boundary fence 2 meters onto adjacent land, the on-chain smart contract has no sensory awareness of real-world physical changes.

---

## 3. Real-World Legal, Judicial & Institutional Requirements

For a blockchain land registry prototype to transition into an officially recognized sovereign government land registry, the following institutional bridges are required:

```text
+-----------------------------------------------------------------------------------+
|               GOVERNMENTAL & JUDICIAL INTEGRATION BRIDGES                         |
+-----------------------------------------------------------------------------------+
| 1. Cadastral GIS Integration: Direct API connection with state spatial databases.  |
| 2. Legal Digital Identity: National e-ID / Decentralized Identity (W3C DID).      |
| 3. Court Injunction Hooks: Mechanism for judicial court orders to freeze titles.  |
| 4. Inheritance & Probate Workflows: Statutory succession upon death of title holder.|
| 5. Mortgage & Tax Escrow: Real-time settlement with central banking systems.      |
| 6. GDPR Compliance (Right to Erasure): Off-chain PII storage with on-chain proofs.|
+-----------------------------------------------------------------------------------+
```

### Educational Project Disclaimer
* This project is an **educational proof of work** designed for technical demonstration, portfolio presentation, and academic blockchain course requirements.
* It uses **synthetic/simulated property data and test accounts**.
* It does **not** create legally binding real estate ownership rights in any sovereign jurisdiction.
