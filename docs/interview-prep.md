# Top 10 Technical Interview Questions & Answers

---

### Q1: Explain your Blockchain-Based Land Registry & Property Ownership System project.
**Answer:**
> "I designed and implemented an educational decentralized land registry and title deed conveyance platform using Solidity smart contracts, Hardhat, and React with ethers.js. The system enforces strict role-based access control where authorized municipal registrars and cadastral surveyors register and verify land parcels. 
> 
> Once a property title is verified, the legitimate owner can execute peer-to-peer title conveyances or multi-signature escrow transfers. The smart contract guarantees that properties cannot be sold if subject to active bank mortgage liens or boundary disputes, updating ownership indices in $O(1)$ constant time and emitting immutable event logs that preserve a complete chain of custody. 
> 
> To demonstrate off-chain privacy and scalability, physical deeds and survey maps are hashed using SHA-256 and pinned to IPFS, storing only cryptographic fingerprints on-chain."

---

### Q2: What problem does this project solve compared to traditional land registries?
**Answer:**
> "Traditional land administration systems are plagued by centralized paper records, fragmented registry databases, slow multi-week manual due diligence, double-selling fraud, and vulnerability to unauthorized ledger tampering.
> 
> My blockchain solution provides:
> 1. **Data Immutability**: Historical transfers and deed mutations cannot be quietly altered.
> 2. **Instant Title Verification**: Buyers and banks can cryptographically verify ownership and lien status in seconds.
> 3. **Autonomous Rule Enforcement**: Smart contracts mathematically reject fraudulent transfers (e.g., trying to sell encumbered or unverified property)."

---

### Q3: How is property data modeled and stored in your smart contract?
**Answer:**
> "I designed a comprehensive `Property` struct in Solidity containing fields for `propertyId`, `titleNumber`, `parcelId`, `cadastralDistrict`, `physicalAddress`, `areaSqMeters`, `zoning`, `currentOwner`, `previousOwner`, `documentHash`, `ipfsDeedCid`, `isVerified`, `status` (an enum), and registration timestamps.
> 
> Properties are stored in a private mapping `mapping(string => Property) properties` indexed by unique parcel IDs for $O(1)$ gas efficiency. I also maintain auxiliary mappings like `mapping(address => string[]) ownerProperties` to allow fast querying of a citizen's entire land portfolio."

---

### Q4: How do you prevent unauthorized ownership transfers?
**Answer:**
> "Access control is strictly enforced through custom Solidity function modifiers and validation checks. In `transferOwnership()`, the contract checks `msg.sender == prop.currentOwner` (or authorized notarized signatory). If any unauthorized account attempts to transfer the parcel, the EVM immediately reverts the transaction.
> 
> Additionally, upon a successful transfer, the contract instantly cleanses the previous owner's index mapping and reassigns `currentOwner = newOwner`, preventing old owners from executing double-sale attacks."

---

### Q5: Why did you use document hashing instead of storing complete documents on-chain?
**Answer:**
> "Storing large files such as PDF title deeds, high-resolution GIS survey maps, and legal contracts directly on Ethereum storage is economically prohibitive (costs thousands of dollars in gas) and poses severe privacy risks if personal citizen data is stored publicly.
> 
> Instead, I implemented an off-chain content-addressed model: documents are stored on IPFS or encrypted off-chain storage, and only the 32-byte SHA-256 cryptographic hash (or IPFS CID) is anchored in the smart contract. If even a single byte or character in the off-chain deed is altered, its SHA-256 hash completely changes, instantly exposing the forgery when compared with the on-chain record."

---

### Q6: What role do Solidity Events play in your architecture?
**Answer:**
> "Events (`PropertyRegistered`, `PropertyVerified`, `OwnershipTransferred`, `EncumbranceAdded`, `DisputeFlagged`) act as cheap, searchable historical logs written directly to EVM transaction receipts.
> 
> Instead of keeping expensive unbounded dynamic arrays in persistent contract storage, indexing services, frontend applications, and auditors can query historical event logs by indexed topic arguments (like `propertyId` or `owner`) to reconstruct the full historical provenance timeline of any parcel with zero storage gas overhead."

---

### Q7: Why is property verification treated as a separate step from registration?
**Answer:**
> "In real-world land governance, initial recording of an application is administrative, whereas title verification requires physical cadastral boundary surveys, title-defect checks, and legal notarization.
> 
> Decoupling registration (`registerProperty()`) from verification (`verifyProperty()`) reflects realistic governance: a newly registered parcel enters the `REGISTERED` state and is explicitly blocked from being transferred until a certified surveyor or notary executes on-chain verification, updating its state to `VERIFIED`."

---

### Q8: How did you test and validate the security of your smart contract?
**Answer:**
> "I built an automated Hardhat unit test suite comprising **20 comprehensive test cases** using Chai assertions and ethers.js signers.
> 
> The tests cover:
> - Initial deployment and role-granting permissions
> - Unauthorized caller reverts on administrative functions
> - Duplicate parcel ID and zero-address input rejections
> - Positive area validation
> - Double-verification protection
> - Successful title conveyance and mapping state synchronization
> - Reverts on unauthorized, unverified, encumbered, or disputed property transfers
> - Encumbrance and dispute lifecycle resolution
> 
> All 20 tests pass with 100% success rate on the Hardhat EVM."

---

### Q9: Does having a record on a blockchain guarantee legally valid property ownership in the real world?
**Answer:**
> "No, and this is a critical distinction I made clear in my project documentation. Blockchain guarantees technical immutability and execution integrity of whatever data is committed to the ledger, but it cannot solve the 'Garbage In, Garbage Out' problem.
> 
> A real-world sovereign land registry requires legal identity verification, cadastral satellite GIS integration, judicial court injunction hooks, statutory inheritance procedures, and formal recognition under municipal property laws. Blockchain is the tamper-evident record-keeping engine, but it operates in tandem with legal institutions."

---

### Q10: How could this project be scaled or enhanced in a production environment?
**Answer:**
> "In future iterations, this architecture can be extended by:
> 1. **ERC-721 / ERC-1155 Tokenization**: Representing each parcel as a Soulbound or transferrable Title Deed NFT with on-chain SVG metadata.
> 2. **Zero-Knowledge Proofs (zk-SNARKs)**: Allowing citizens to prove clean title ownership or tax clearance to mortgage lenders without revealing their wallet address or purchase price.
> 3. **The Graph Subgraph**: Deploying a custom decentralized indexing subgraph for ultra-fast GraphQL parcel searching by district, zoning, or valuation.
> 4. **Multi-Party Account Abstraction (ERC-4337)**: Native smart accounts allowing seamless government official co-signing without requiring gas tokens."
