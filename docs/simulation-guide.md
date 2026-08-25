# Virtual Simulation Guide (Remix IDE & Local Hardhat Node)

This guide provides step-by-step instructions for virtually simulating the **Land Registry System** using both **Remix IDE** (Option A) and the **Local Hardhat Network** (Option B).

---

## Part 1: Local Hardhat Simulation (Command Line)

### Step 1: Start Local Blockchain Node
Open a terminal and start the local Hardhat EVM node:
```bash
npm run hardhat:node
```
* **Expected Output**: 20 pre-funded test accounts (10,000 ETH each) with private keys running on `http://127.0.0.1:8545` (Chain ID: 31337).

### Step 2: Deploy & Seed the Smart Contract
Open a second terminal window and run:
```bash
npm run hardhat:deploy
```
* **Expected Output**:
  * Deployed `LandRegistry` contract at `0x5FbDB2315678afecb367f032d93F642f64180aa3`.
  * Assigned `REGISTRAR`, `NOTARY`, and `SURVEYOR` roles.
  * Seeded 3 on-chain properties (`PROP-NY-2024-401`, `PROP-NY-2024-502`, `PROP-NY-2024-603`).

### Step 3: Run Document Hash Integrity Demo
```bash
node scripts/hash-document.cjs
```
* **Expected Output**:
  * Computes original SHA-256 hash.
  * Modifies test deed and detects mismatch: `[TAMPER DETECTED]`.

### Step 4: Run Automated Unit Tests
```bash
npm run hardhat:test
```
* **Expected Output**: `20 passing (2s)`.

### Step 5: Launch Interactive Frontend DApp
```bash
npm run dev
```
* Visit `http://localhost:3000` to interact with the full UI.

---

## Part 2: Remix IDE 15-Step Virtual Simulation Walkthrough

### Test Accounts Setup
* **Account 1 (`0x5B3...`)**: Land Authority / Admin / Registrar
* **Account 2 (`0xAb8...`)**: Owner A (Initial Citizen)
* **Account 3 (`0x4B2...`)**: Buyer B (Prospective Buyer)
* **Account 4 (`0x787...`)**: Unauthorized User / Malicious Impersonator

---

### Step-by-Step Simulation Script

| Step # | Caller Account | Action in Remix | Parameters / Value | Expected Result |
|:---|:---|:---|:---|:---|
| **1** | Account 1 | Deploy Contract | `LandRegistry.sol` | Contract deployed; Account 1 set as Admin. |
| **2** | Account 1 | Call `registerProperty` | `propertyId`: `"PROP-001"`, `titleNo`: `"TIT-01"`, `parcelId`: `"CAD-01"`, `district`: `"North"`, `address`: `"10 High St"`, `area`: `500`, `zoning`: `"Residential"`, `owner`: Account 2, `docHash`: `"0x123..."`, `cid`: `"ipfs://deed1"` | Transaction succeeds; `PropertyRegistered` event emitted. |
| **3** | Any Account | Call `getProperty("PROP-001")` | `"PROP-001"` | Returns Property struct with `currentOwner = Account 2`, `status = 0 (REGISTERED)`. |
| **4** | Account 4 | Call `verifyProperty("PROP-001", "ipfs://deed1")` | `"PROP-001"` | **Reverted**: `"LandRegistry: Unauthorized verifier"`. |
| **5** | Account 1 | Call `verifyProperty("PROP-001", "ipfs://deed1")` | `"PROP-001"` | Transaction succeeds; status updated to `1 (VERIFIED)`. |
| **6** | Account 4 | Call `transferOwnership("PROP-001", Account 3, ...)` | Non-owner call | **Reverted**: `"LandRegistry: Caller not authorized to transfer title"`. |
| **7** | Account 2 | Call `transferOwnership("PROP-001", Account 3, 400000, "ipfs://deed2", "Direct")` | Valid Owner Transfer | Transaction succeeds; `OwnershipTransferred` event emitted. |
| **8** | Any Account | Call `getProperty("PROP-001")` | `"PROP-001"` | `currentOwner = Account 3 (Buyer B)`, `previousOwner = Account 2 (Owner A)`. |
| **9** | Account 2 | Call `transferOwnership("PROP-001", Account 4, ...)` | Old Owner Transfer | **Reverted**: `"LandRegistry: Caller not authorized to transfer title"`. |
| **10** | Account 1 | Call `addEncumbrance("PROP-001", "ENC-01", "Mortgage", Account 1, 200000, "0xdoc")` | Notary adds Lien | Status updated to `5 (ENCUMBERED)`. |
| **11** | Account 3 | Call `transferOwnership("PROP-001", Account 2, ...)` | Transfer with active lien | **Reverted**: `"LandRegistry: Encumbered property cannot be transferred"`. |
| **12** | Account 1 | Call `releaseEncumbrance("PROP-001", 0)` | Notary discharges Lien | Encumbrance released; status restored to `1 (VERIFIED)`. |
| **13** | Account 3 | Call `flagDispute("PROP-001", "Boundary overlap")` | Owner flags dispute | Status updated to `4 (IN_DISPUTE)`. |
| **14** | Account 1 | Call `resolveDispute("PROP-001", "Boundary reaffirmed")` | Registrar settles dispute | Dispute resolved; status restored to `1 (VERIFIED)`. |
| **15** | Any Account | Call `getTitleHistory("PROP-001")` | `"PROP-001"` | Returns full 2-record chain of custody with exact timestamps. |
