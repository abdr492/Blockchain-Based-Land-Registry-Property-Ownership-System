export type UserRole = 'citizen' | 'registrar' | 'notary' | 'auditor';

export interface UserPersona {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  department: string;
  nationalIdEncrypted: string;
  walletAddress: string;
  publicKey: string;
  privateKey: string;
  avatarSeed: string;
}

export interface Encumbrance {
  id: string;
  type: 'Mortgage' | 'Easement' | 'Municipal Lien' | 'Covenant';
  beneficiary: string;
  amountUSD?: number;
  registeredDate: string;
  status: 'Active' | 'Discharged';
  docHash: string;
}

export interface TitleTransferRecord {
  txHash: string;
  blockHeight: number;
  fromOwner: string;
  fromWallet: string;
  toOwner: string;
  toWallet: string;
  transferDate: string;
  priceUSD: number;
  deedType: string;
  notarizedBy: string;
  digitalSignatureHex: string;
}

export interface ValuationHistoryPoint {
  year: string;
  valueUSD: number;
  event?: string;
  growthYoY?: number;
}

export interface Property {
  id: string;
  titleNumber: string;
  parcelId: string;
  cadastralDistrict: string;
  address: string;
  city: string;
  stateDistrict: string;
  areaSqMeters: number;
  zoning: 'Residential' | 'Commercial' | 'Agricultural' | 'Industrial' | 'Mixed-Use';
  currentOwner: {
    name: string;
    nationalIdEncrypted: string;
    walletAddress: string;
    ownershipType: 'Freehold' | 'Leasehold';
    ownershipPercentage?: number;
    registeredSince?: string;
  };
  status: 'Verified' | 'Pending_Transfer' | 'In_Dispute' | 'Encumbered' | 'Pledged';
  estimatedValueUSD: number;
  annualTaxUSD: number;
  taxStatus: 'Cleared' | 'Pending_Due' | 'Exempt';
  geoPolygon: Array<{ x: number; y: number; lat: number; lng: number }>;
  coordinates?: { latitude: number; longitude: number };
  polygonCoords?: Array<{ x: number; y: number }>;
  titleDeedHash: string;
  ipfsDeedCid: string;
  registrationDate: string;
  lastVerifiedDate: string;
  verifiedBy: string;
  encumbrances: Encumbrance[];
  smartContractAddress: string;
  chainOfCustody: TitleTransferRecord[];
  legalNotes?: string;
  valuationHistory?: ValuationHistoryPoint[];
}

export interface SmartContractSignatures {
  seller: { signed: boolean; signature: string; timestamp?: string; pubKey: string };
  buyer: { signed: boolean; signature: string; timestamp?: string; pubKey: string };
  surveyorNotary: { signed: boolean; signature: string; timestamp?: string; officialId?: string };
  taxAuthority: { signed: boolean; signature: string; timestamp?: string; reference?: string };
  landRegistrar: { signed: boolean; signature: string; timestamp?: string; sealCode?: string };
}

export interface SmartContractTransfer {
  id: string;
  propertyId: string;
  propertyTitle: string;
  sellerAddress: string;
  sellerName: string;
  buyerAddress: string;
  buyerName: string;
  transferPriceUSD: number;
  taxDutyUSD: number;
  status:
    | 'Draft'
    | 'Awaiting_Survey_Sign'
    | 'Awaiting_Tax_Clearance'
    | 'Awaiting_Notary_Seal'
    | 'Awaiting_Registrar_Approval'
    | 'Executed_Minted'
    | 'Rejected';
  createdAt: string;
  updatedAt: string;
  signatures: SmartContractSignatures;
  escrowStatus: 'Not_Required' | 'Locked_In_Smart_Contract' | 'Released_To_Seller' | 'Refunded';
  escrowDepositAmount: number;
  termsConditions: string[];
  contractHash: string;
  blockHeightMinted?: number;
  executionTxHash?: string;
  aiAuditNotes?: string;
}

export interface BlockchainTransaction {
  txHash: string;
  type:
    | 'TITLE_CREATION'
    | 'SMART_CONTRACT_TRANSFER'
    | 'ENCUMBRANCE_ADDED'
    | 'DISPUTE_LOGGED'
    | 'TAX_CLEARED'
    | 'SURVEY_CERTIFIED'
    | 'PRIVACY_ERASURE_PROOF';
  propertyId: string;
  from: string;
  to: string;
  timestamp: string;
  digitalSignature: string;
  status: 'CONFIRMED' | 'MINED';
  gasFee: string;
  dataHash: string;
  payloadSummary: string;
  metadata: Record<string, any>;
}

export interface BlockchainBlock {
  index: number;
  timestamp: string;
  previousHash: string;
  merkleRoot: string;
  hash: string;
  nonce: number;
  transactions: BlockchainTransaction[];
  validatorNode: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'transfer' | 'approval' | 'security' | 'compliance' | 'tax';
  timestamp: string;
  read: boolean;
  targetRole: UserRole | 'all';
  actionPropertyId?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  targetId: string;
  details: string;
  ipAddress: string;
  blockchainTxHash?: string;
  signatureProof: string;
  complianceCategory: 'GDPR_Article_6' | 'Cadastral_Act' | 'AML_KYC' | 'Smart_Contract_Auth';
}

export interface PrivacyComplianceState {
  gdprCompliant: boolean;
  encryptionAlgorithm: 'AES-256-GCM + ECDSA Secp256k1';
  offChainPIIRedaction: boolean;
  anonymizedHashesOnlyOnChain: boolean;
  rightToErasureRequestsCount: number;
  lastComplianceAudit: string;
}
