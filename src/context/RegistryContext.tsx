import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  UserPersona,
  Property,
  SmartContractTransfer,
  BlockchainBlock,
  AuditLogEntry,
  NotificationItem,
  PrivacyComplianceState,
  Encumbrance,
} from '../types';
import {
  MOCK_PERSONAS,
  INITIAL_PROPERTIES,
  INITIAL_SMART_CONTRACTS,
  INITIAL_BLOCKS,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
} from '../data/mockData';
import {
  sha256,
  calculateMerkleRoot,
  signData,
  encryptSensitivePII,
} from '../utils/crypto';
import {
  isMetaMaskAvailable,
  connectMetaMaskWallet,
  switchToLocalHardhatNetwork,
  getLandRegistryContract,
} from '../utils/contract';

interface RegistryContextType {
  currentRole: UserRole;
  currentUser: UserPersona;
  properties: Property[];
  smartContracts: SmartContractTransfer[];
  blockchainBlocks: BlockchainBlock[];
  auditLogs: AuditLogEntry[];
  notifications: NotificationItem[];
  privacyState: PrivacyComplianceState;
  isMining: boolean;
  selectedProperty: Property | null;
  activeView: 'portfolio' | 'authority' | 'contracts' | 'map' | 'explorer' | 'audit_privacy';
  toast: { message: string; type: 'success' | 'info' | 'warning' | 'error' } | null;
  
  // Web3 Live Blockchain State
  isWeb3Connected: boolean;
  web3Account: string | null;
  web3ChainId: number | null;
  connectWeb3Wallet: () => Promise<void>;
  disconnectWeb3Wallet: () => void;

  // Actions
  switchRole: (role: UserRole) => void;
  setActiveView: (view: 'portfolio' | 'authority' | 'contracts' | 'map' | 'explorer' | 'audit_privacy') => void;
  setSelectedProperty: (prop: Property | null) => void;
  createSmartContractTransfer: (
    propertyId: string,
    buyerName: string,
    buyerAddress: string,
    priceUSD: number,
    customTerms?: string[]
  ) => Promise<string>;
  signContractAsCurrentRole: (contractId: string) => Promise<boolean>;
  executeSmartContractTransfer: (contractId: string) => Promise<boolean>;
  createNewPropertyTitle: (newPropData: Partial<Property>) => Promise<Property>;
  resolveDispute: (propertyId: string, notes: string) => Promise<void>;
  flagDispute: (propertyId: string, reason: string) => Promise<void>;
  addEncumbrance: (propertyId: string, encumbrance: Omit<Encumbrance, 'id' | 'docHash'>) => Promise<void>;
  dischargeEncumbrance: (propertyId: string, encumbranceId: string) => Promise<void>;
  performGdprErasure: (propertyId: string) => Promise<void>;
  markNotificationAsRead: (notifId: string) => void;
  clearToast: () => void;
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  runAiAudit: (property: Property) => Promise<any>;
  runAiExplain: (deedText: string, rules: string[]) => Promise<any>;
}

const RegistryContext = createContext<RegistryContextType | undefined>(undefined);

export const RegistryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('citizen');
  const [currentUser, setCurrentUser] = useState<UserPersona>(MOCK_PERSONAS.citizen);
  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);
  const [smartContracts, setSmartContracts] = useState<SmartContractTransfer[]>(INITIAL_SMART_CONTRACTS);
  const [blockchainBlocks, setBlockchainBlocks] = useState<BlockchainBlock[]>(INITIAL_BLOCKS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [privacyState, setPrivacyState] = useState<PrivacyComplianceState>({
    gdprCompliant: true,
    encryptionAlgorithm: 'AES-256-GCM + ECDSA Secp256k1',
    offChainPIIRedaction: true,
    anonymizedHashesOnlyOnChain: true,
    rightToErasureRequestsCount: 3,
    lastComplianceAudit: new Date().toISOString().split('T')[0],
  });
  const [isMining, setIsMining] = useState<boolean>(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [activeView, setActiveView] = useState<'portfolio' | 'authority' | 'contracts' | 'map' | 'explorer' | 'audit_privacy'>('portfolio');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' | 'error' } | null>(null);

  // Web3 Live State
  const [isWeb3Connected, setIsWeb3Connected] = useState<boolean>(false);
  const [web3Account, setWeb3Account] = useState<string | null>(null);
  const [web3ChainId, setWeb3ChainId] = useState<number | null>(null);

  const connectWeb3Wallet = async () => {
    try {
      if (!isMetaMaskAvailable()) {
        showToast('MetaMask is not detected. Continuing in local cryptographic simulation mode.', 'info');
        return;
      }
      await switchToLocalHardhatNetwork();
      const res = await connectMetaMaskWallet();
      setIsWeb3Connected(true);
      setWeb3Account(res.address);
      setWeb3ChainId(res.chainId);
      showToast(`MetaMask Connected: ${res.address.slice(0, 6)}...${res.address.slice(-4)} (Chain ID: ${res.chainId})`, 'success');
    } catch (err: unknown) {
      const e = err as Error;
      showToast(e.message || 'Failed to connect MetaMask', 'error');
    }
  };

  const disconnectWeb3Wallet = () => {
    setIsWeb3Connected(false);
    setWeb3Account(null);
    setWeb3ChainId(null);
    showToast('MetaMask disconnected. Reverted to simulated persona credentials.', 'info');
  };

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const clearToast = () => setToast(null);

  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
    setCurrentUser(MOCK_PERSONAS[role]);
    showToast(`Switched active role to: ${MOCK_PERSONAS[role].roleTitle}`, 'info');
  };

  const markNotificationAsRead = (notifId: string) => {
    setNotifications(prev => prev.map(n => (n.id === notifId ? { ...n, read: true } : n)));
  };

  // Helper to append log
  const appendAuditLog = async (
    action: string,
    targetId: string,
    details: string,
    complianceCat: 'GDPR_Article_6' | 'Cadastral_Act' | 'AML_KYC' | 'Smart_Contract_Auth',
    txHash?: string
  ) => {
    const signature = await signData(action + targetId + Date.now(), currentUser.privateKey);
    const newLog: AuditLogEntry = {
      id: `LOG-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: new Date().toISOString(),
      actor: `${currentUser.name} (${currentUser.roleTitle})`,
      role: currentUser.role,
      action,
      targetId,
      details,
      ipAddress: '127.0.0.1 (Secure Node)',
      blockchainTxHash: txHash,
      signatureProof: `${currentUser.walletAddress.slice(0, 10)}... (Verified)`,
      complianceCategory: complianceCat,
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Mine a new block onto the blockchain
  const mineNewBlock = async (
    transactions: Array<{
      type: any;
      propertyId: string;
      from: string;
      to: string;
      dataHash: string;
      payloadSummary: string;
      metadata?: any;
    }>
  ): Promise<BlockchainBlock> => {
    setIsMining(true);
    const prevBlock = blockchainBlocks[blockchainBlocks.length - 1];
    const prevHash = prevBlock ? prevBlock.hash : '0x0000000000000000000000000000000000000000000000000000000000000000';
    const nextIndex = blockchainBlocks.length;
    const timestamp = new Date().toISOString();

    const txHashes: string[] = [];
    const formattedTxs = [];

    for (const tx of transactions) {
      const txHash = await sha256(`${tx.type}:${tx.propertyId}:${tx.from}:${tx.to}:${Date.now()}`);
      txHashes.push(txHash);
      const sig = await signData(txHash, currentUser.privateKey);

      formattedTxs.push({
        txHash,
        type: tx.type,
        propertyId: tx.propertyId,
        from: tx.from,
        to: tx.to,
        timestamp,
        digitalSignature: sig,
        status: 'MINED' as const,
        gasFee: '0.0028 ETH',
        dataHash: tx.dataHash,
        payloadSummary: tx.payloadSummary,
        metadata: tx.metadata || {},
      });
    }

    const merkleRoot = await calculateMerkleRoot(txHashes);
    const nonce = Math.floor(Math.random() * 90000) + 10000;
    const blockHash = await sha256(`BLOCK_${nextIndex}_${prevHash}_${merkleRoot}_${timestamp}_${nonce}`);

    const newBlock: BlockchainBlock = {
      index: nextIndex,
      timestamp,
      previousHash: prevHash,
      merkleRoot,
      hash: blockHash,
      nonce,
      validatorNode: `Validator-0${(nextIndex % 4) + 1}: State Cadastral Node`,
      transactions: formattedTxs,
    };

    // Simulate mining latency
    await new Promise(r => setTimeout(r, 600));

    setBlockchainBlocks(prev => [...prev, newBlock]);
    setIsMining(false);
    return newBlock;
  };

  // Create Smart Contract Transfer
  const createSmartContractTransfer = async (
    propertyId: string,
    buyerName: string,
    buyerAddress: string,
    priceUSD: number,
    customTerms?: string[]
  ): Promise<string> => {
    const prop = properties.find(p => p.id === propertyId);
    if (!prop) throw new Error('Property not found');

    const taxDuty = Math.round(priceUSD * 0.01); // 1% conveyance duty
    const contractId = `SC-TX-2026-${Math.floor(100 + Math.random() * 900)}`;
    const terms = customTerms || [
      'Automatic title conveyance upon multi-signature cryptographic threshold (5/5).',
      `Municipal conveyance tax duty of $${taxDuty.toLocaleString()} deposited in escrow.`,
      'Cadastral boundary verified with zero overlap with neighboring plots.',
      'Seller guarantees unencumbered freehold title status at time of ledger minting.',
    ];

    const contractHash = await sha256(`${contractId}:${propertyId}:${currentUser.walletAddress}:${buyerAddress}:${priceUSD}`);
    const sellerSig = await signData(contractHash, currentUser.privateKey);

    const newTransfer: SmartContractTransfer = {
      id: contractId,
      propertyId: prop.id,
      propertyTitle: prop.address,
      sellerAddress: currentUser.walletAddress,
      sellerName: currentUser.name,
      buyerAddress,
      buyerName,
      transferPriceUSD: priceUSD,
      taxDutyUSD: taxDuty,
      status: 'Awaiting_Survey_Sign',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      signatures: {
        seller: {
          signed: true,
          signature: sellerSig,
          timestamp: new Date().toISOString(),
          pubKey: currentUser.publicKey,
        },
        buyer: { signed: false, signature: '', pubKey: '' },
        surveyorNotary: { signed: false, signature: '' },
        taxAuthority: { signed: false, signature: '' },
        landRegistrar: { signed: false, signature: '' },
      },
      escrowStatus: 'Locked_In_Smart_Contract',
      escrowDepositAmount: priceUSD,
      termsConditions: terms,
      contractHash,
      aiAuditNotes: 'Smart contract deployed. Awaiting buyer confirmation, cadastral notary survey seal, and tax clearance.',
    };

    setSmartContracts(prev => [newTransfer, ...prev]);

    // Update property status
    setProperties(prev =>
      prev.map(p => (p.id === propertyId ? { ...p, status: 'Pending_Transfer' } : p))
    );

    // Add notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Smart Contract Transfer Initiated',
      message: `Transfer ${contractId} created for ${prop.address} by ${currentUser.name}. Escrow locked.`,
      type: 'transfer',
      timestamp: 'Just now',
      read: false,
      targetRole: 'all',
      actionPropertyId: prop.id,
    };
    setNotifications(prev => [newNotif, ...prev]);

    await appendAuditLog(
      'SMART_CONTRACT_INITIATED',
      prop.id,
      `Created smart contract ${contractId} to transfer ${prop.titleNumber} for $${priceUSD.toLocaleString()}`,
      'Smart_Contract_Auth',
      contractHash
    );

    showToast(`Smart Contract ${contractId} successfully created and signed!`, 'success');
    return contractId;
  };

  // Sign contract as current role
  const signSmartContractAsCurrentRole = async (contractId: string): Promise<boolean> => {
    const sc = smartContracts.find(c => c.id === contractId);
    if (!sc) return false;

    const signature = await signData(sc.contractHash + currentUser.role, currentUser.privateKey);
    const now = new Date().toISOString();

    let updatedSignatures = { ...sc.signatures };
    let newStatus = sc.status;

    if (currentRole === 'citizen') {
      // If citizen is buyer
      updatedSignatures.buyer = {
        signed: true,
        signature,
        timestamp: now,
        pubKey: currentUser.publicKey,
      };
      if (updatedSignatures.surveyorNotary.signed) {
        newStatus = 'Awaiting_Tax_Clearance';
      } else {
        newStatus = 'Awaiting_Survey_Sign';
      }
    } else if (currentRole === 'notary') {
      updatedSignatures.surveyorNotary = {
        signed: true,
        signature,
        timestamp: now,
        officialId: currentUser.department,
      };
      newStatus = 'Awaiting_Tax_Clearance';
    } else if (currentRole === 'registrar') {
      // Registrar signs as Tax authority or final Chief Registrar
      if (!updatedSignatures.taxAuthority.signed) {
        updatedSignatures.taxAuthority = {
          signed: true,
          signature,
          timestamp: now,
          reference: `MUNI-TAX-CLEAR-${Date.now()}`,
        };
        newStatus = 'Awaiting_Registrar_Approval';
      } else {
        updatedSignatures.landRegistrar = {
          signed: true,
          signature,
          timestamp: now,
          sealCode: `GOV-SEAL-${Date.now()}`,
        };
        newStatus = 'Awaiting_Registrar_Approval';
      }
    } else if (currentRole === 'auditor') {
      showToast('Auditors have read-only compliance inspection access.', 'info');
      return false;
    }

    setSmartContracts(prev =>
      prev.map(c =>
        c.id === contractId
          ? {
              ...c,
              signatures: updatedSignatures,
              status: newStatus,
              updatedAt: now,
            }
          : c
      )
    );

    await appendAuditLog(
      'DIGITAL_SIGNATURE_ATTACHED',
      sc.propertyId,
      `${currentUser.name} signed smart contract ${contractId} with private key (${currentUser.role})`,
      'Smart_Contract_Auth',
      sc.contractHash
    );

    showToast(`Cryptographic signature applied by ${currentUser.name}!`, 'success');
    return true;
  };

  // Execute and Mint Title Transfer
  const executeSmartContractTransfer = async (contractId: string): Promise<boolean> => {
    const sc = smartContracts.find(c => c.id === contractId);
    if (!sc) return false;

    const prop = properties.find(p => p.id === sc.propertyId);
    if (!prop) return false;

    // Chief Registrar final seal signature
    const regSignature = await signData(`MINT_TITLE_FINAL_${sc.contractHash}`, currentUser.privateKey);
    const now = new Date().toISOString();

    const finalSignatures = {
      ...sc.signatures,
      landRegistrar: {
        signed: true,
        signature: regSignature,
        timestamp: now,
        sealCode: `SEAL-SOVEREIGN-${Date.now()}`,
      },
    };

    // Calculate new deed hash
    const newDeedHash = await sha256(`DEED_CONVEYANCE_${sc.id}_${sc.buyerAddress}_${now}`);
    const newIpfsCid = `ipfs://Qm${newDeedHash.slice(2, 46)}`;

    // Mine onto blockchain
    const block = await mineNewBlock([
      {
        type: 'SMART_CONTRACT_TRANSFER',
        propertyId: prop.id,
        from: sc.sellerAddress,
        to: sc.buyerAddress,
        dataHash: newDeedHash,
        payloadSummary: `Title Transfer Executed for ${prop.titleNumber} (${prop.address}) to ${sc.buyerName}.`,
        metadata: {
          contractId: sc.id,
          priceUSD: sc.transferPriceUSD,
          taxDutyUSD: sc.taxDutyUSD,
          registrarSigner: currentUser.name,
        },
      },
    ]);

    const txHash = block.transactions[0].txHash;

    // Update Property with new owner and chain of custody
    const newCustodyEntry = {
      txHash,
      blockHeight: block.index,
      fromOwner: sc.sellerName,
      fromWallet: sc.sellerAddress,
      toOwner: sc.buyerName,
      toWallet: sc.buyerAddress,
      transferDate: now.split('T')[0],
      priceUSD: sc.transferPriceUSD,
      deedType: 'Cryptographic Smart Conveyance Deed',
      notarizedBy: `${MOCK_PERSONAS.notary.name} & Registrar ${currentUser.name}`,
      digitalSignatureHex: regSignature,
    };

    const encryptedBuyerId = await encryptSensitivePII(`CITIZEN-ID-REC-${Date.now()}`);

    setProperties(prev =>
      prev.map(p =>
        p.id === prop.id
          ? {
              ...p,
              currentOwner: {
                name: sc.buyerName,
                nationalIdEncrypted: encryptedBuyerId,
                walletAddress: sc.buyerAddress,
                ownershipType: 'Freehold',
              },
              status: 'Verified',
              titleDeedHash: newDeedHash,
              ipfsDeedCid: newIpfsCid,
              lastVerifiedDate: now,
              chainOfCustody: [newCustodyEntry, ...p.chainOfCustody],
            }
          : p
      )
    );

    // Update Smart Contract state
    setSmartContracts(prev =>
      prev.map(c =>
        c.id === contractId
          ? {
              ...c,
              signatures: finalSignatures,
              status: 'Executed_Minted',
              escrowStatus: 'Released_To_Seller',
              blockHeightMinted: block.index,
              executionTxHash: txHash,
              updatedAt: now,
            }
          : c
      )
    );

    // Add notifications
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: 'Title Conveyance Mined on Blockchain',
        message: `Property ${prop.titleNumber} (${prop.address}) has officially transferred to ${sc.buyerName} in Block #${block.index}.`,
        type: 'approval',
        timestamp: 'Just now',
        read: false,
        targetRole: 'all',
        actionPropertyId: prop.id,
      },
      ...prev,
    ]);

    await appendAuditLog(
      'TITLE_DEED_CONVEYED_AND_MINED',
      prop.id,
      `Chief Registrar executed smart contract ${contractId}. Title transferred to ${sc.buyerName}. Minted in Block #${block.index}`,
      'Cadastral_Act',
      txHash
    );

    showToast(`Title deed minted onto blockchain in Block #${block.index}! Ownership updated.`, 'success');
    return true;
  };

  // Create new property title
  const createNewPropertyTitle = async (newPropData: Partial<Property>): Promise<Property> => {
    const propId = `PROP-NY-2026-${Math.floor(100 + Math.random() * 900)}`;
    const titleNum = `TIT-NY-${Math.floor(1000000 + Math.random() * 9000000)}`;
    const parcelId = newPropData.parcelId || `CAD-SEC${Math.floor(1 + Math.random() * 20)}-LT${Math.floor(1 + Math.random() * 50)}`;
    const now = new Date().toISOString();
    const deedHash = await sha256(`INITIAL_TITLE_${propId}_${titleNum}_${now}`);
    const ipfsCid = `ipfs://Qm${deedHash.slice(2, 46)}`;
    const encryptedId = await encryptSensitivePII(`CITIZEN-REC-${Date.now()}`);

    const newProp: Property = {
      id: propId,
      titleNumber: titleNum,
      parcelId,
      cadastralDistrict: newPropData.cadastralDistrict || 'Metro North Cadastral District',
      address: newPropData.address || '100 Sovereign Way',
      city: newPropData.city || 'Springfield',
      stateDistrict: 'New York Central',
      areaSqMeters: newPropData.areaSqMeters || 500,
      zoning: newPropData.zoning || 'Residential',
      currentOwner: {
        name: newPropData.currentOwner?.name || currentUser.name,
        nationalIdEncrypted: encryptedId,
        walletAddress: newPropData.currentOwner?.walletAddress || currentUser.walletAddress,
        ownershipType: 'Freehold',
      },
      status: 'Verified',
      estimatedValueUSD: newPropData.estimatedValueUSD || 450000,
      annualTaxUSD: Math.round((newPropData.estimatedValueUSD || 450000) * 0.005),
      taxStatus: 'Cleared',
      geoPolygon: newPropData.geoPolygon || [
        { x: 300, y: 300, lat: 41.123, lng: -73.456 },
        { x: 400, y: 300, lat: 41.124, lng: -73.450 },
        { x: 400, y: 380, lat: 41.120, lng: -73.451 },
        { x: 300, y: 380, lat: 41.119, lng: -73.457 },
      ],
      coordinates: newPropData.coordinates || { latitude: 41.123, longitude: -73.456 },
      polygonCoords: newPropData.polygonCoords || [
        { x: 300, y: 300 },
        { x: 400, y: 300 },
        { x: 400, y: 380 },
        { x: 300, y: 380 },
      ],
      titleDeedHash: deedHash,
      ipfsDeedCid: ipfsCid,
      registrationDate: now,
      lastVerifiedDate: now,
      verifiedBy: `Land Administration (Officer: ${currentUser.name})`,
      smartContractAddress: `0x${deedHash.slice(2, 42)}`,
      encumbrances: [],
      legalNotes: 'Sovereign freehold title deed registered on decentralized cadastral ledger.',
      chainOfCustody: [
        {
          txHash: `0x${deedHash.slice(2, 66)}`,
          blockHeight: blockchainBlocks.length,
          fromOwner: 'State Cadastral Land Allocation',
          fromWallet: '0x0000000000000000000000000000000000000000',
          toOwner: newPropData.currentOwner?.name || currentUser.name,
          toWallet: newPropData.currentOwner?.walletAddress || currentUser.walletAddress,
          transferDate: now.split('T')[0],
          priceUSD: newPropData.estimatedValueUSD || 450000,
          deedType: 'Original State Patent & Freehold Title',
          notarizedBy: 'Cadastral Surveyor Council',
          digitalSignatureHex: await signData(deedHash, currentUser.privateKey),
        },
      ],
    };

    const block = await mineNewBlock([
      {
        type: 'TITLE_CREATION',
        propertyId: newProp.id,
        from: '0x0000000000000000000000000000000000000000',
        to: newProp.currentOwner.walletAddress,
        dataHash: deedHash,
        payloadSummary: `New title deed ${titleNum} registered for parcel ${parcelId} (${newProp.address}).`,
        metadata: { parcelId, area: newProp.areaSqMeters },
      },
    ]);

    setProperties(prev => [newProp, ...prev]);

    await appendAuditLog(
      'NEW_TITLE_ISSUED',
      newProp.id,
      `Issued new freehold title deed ${titleNum} for parcel ${parcelId}`,
      'Cadastral_Act',
      block.transactions[0].txHash
    );

    showToast(`New Land Title Deed ${titleNum} successfully created and anchored on-chain!`, 'success');
    return newProp;
  };

  // Dispute resolution
  const resolveDispute = async (propertyId: string, notes: string) => {
    const now = new Date().toISOString();
    const txHash = await sha256(`DISPUTE_RESOLVE_${propertyId}_${now}`);

    await mineNewBlock([
      {
        type: 'DISPUTE_LOGGED',
        propertyId,
        from: currentUser.walletAddress,
        to: currentUser.walletAddress,
        dataHash: txHash,
        payloadSummary: `Cadastral dispute resolved for property ${propertyId}. Status restored to Verified.`,
      },
    ]);

    setProperties(prev =>
      prev.map(p =>
        p.id === propertyId
          ? {
              ...p,
              status: 'Verified',
              legalNotes: `Dispute resolved on ${now.split('T')[0]}: ${notes}`,
              lastVerifiedDate: now,
            }
          : p
      )
    );

    await appendAuditLog('DISPUTE_RESOLVED', propertyId, `Dispute cleared by ${currentUser.name}: ${notes}`, 'Cadastral_Act', txHash);
    showToast('Dispute successfully resolved and verified on-chain!', 'success');
  };

  const flagDispute = async (propertyId: string, reason: string) => {
    const now = new Date().toISOString();
    const txHash = await sha256(`DISPUTE_FLAG_${propertyId}_${now}`);

    await mineNewBlock([
      {
        type: 'DISPUTE_LOGGED',
        propertyId,
        from: currentUser.walletAddress,
        to: currentUser.walletAddress,
        dataHash: txHash,
        payloadSummary: `Cadastral boundary dispute logged for ${propertyId}: ${reason}`,
      },
    ]);

    setProperties(prev =>
      prev.map(p =>
        p.id === propertyId
          ? {
              ...p,
              status: 'In_Dispute',
              legalNotes: `Active dispute registered: ${reason}`,
              lastVerifiedDate: now,
            }
          : p
      )
    );

    await appendAuditLog('DISPUTE_FLAGGED', propertyId, `Flagged dispute: ${reason}`, 'Cadastral_Act', txHash);
    showToast('Boundary dispute flagged on ledger. Smart transfers locked.', 'warning');
  };

  const addEncumbrance = async (propertyId: string, enc: Omit<Encumbrance, 'id' | 'docHash'>) => {
    const encId = `ENC-${Date.now()}`;
    const docHash = await sha256(`${encId}:${enc.type}:${enc.beneficiary}:${Date.now()}`);

    const newEnc: Encumbrance = {
      ...enc,
      id: encId,
      docHash,
    };

    setProperties(prev =>
      prev.map(p =>
        p.id === propertyId
          ? {
              ...p,
              encumbrances: [...p.encumbrances, newEnc],
              status: p.status === 'Verified' ? 'Encumbered' : p.status,
            }
          : p
      )
    );

    await appendAuditLog('ENCUMBRANCE_REGISTERED', propertyId, `Registered ${enc.type} for ${enc.beneficiary}`, 'Cadastral_Act', docHash);
    showToast(`${enc.type} encumbrance anchored to property title.`, 'info');
  };

  const dischargeEncumbrance = async (propertyId: string, encumbranceId: string) => {
    setProperties(prev =>
      prev.map(p =>
        p.id === propertyId
          ? {
              ...p,
              encumbrances: p.encumbrances.map(e => (e.id === encumbranceId ? { ...e, status: 'Discharged' } : e)),
              status: p.encumbrances.every(e => e.id === encumbranceId || e.status === 'Discharged') ? 'Verified' : p.status,
            }
          : p
      )
    );

    await appendAuditLog('ENCUMBRANCE_DISCHARGED', propertyId, `Discharged encumbrance ${encumbranceId}`, 'Cadastral_Act');
    showToast('Encumbrance successfully discharged.', 'success');
  };

  // GDPR Right to Erasure
  const performGdprErasure = async (propertyId: string) => {
    const proofHash = await sha256(`GDPR_ART17_ERASURE_${propertyId}_${Date.now()}`);
    
    // Anonymize off-chain PII while maintaining cryptographic blockchain validity
    setProperties(prev =>
      prev.map(p =>
        p.id === propertyId
          ? {
              ...p,
              currentOwner: {
                ...p.currentOwner,
                name: 'Redacted (GDPR Article 17 Compliant)',
                nationalIdEncrypted: 'REDACTED:OFF_CHAIN_PII_PURGED',
              },
            }
          : p
      )
    );

    setPrivacyState(prev => ({
      ...prev,
      rightToErasureRequestsCount: prev.rightToErasureRequestsCount + 1,
    }));

    await mineNewBlock([
      {
        type: 'PRIVACY_ERASURE_PROOF',
        propertyId,
        from: currentUser.walletAddress,
        to: currentUser.walletAddress,
        dataHash: proofHash,
        payloadSummary: `Zero-knowledge proof of off-chain PII erasure under GDPR Article 17 for property ${propertyId}.`,
      },
    ]);

    await appendAuditLog(
      'GDPR_RIGHT_TO_ERASURE_EXECUTED',
      propertyId,
      'Off-chain personal data purged. Cryptographic title validity and hash permanence preserved.',
      'GDPR_Article_6',
      proofHash
    );

    showToast('GDPR Article 17 Right to Erasure completed. Off-chain PII redacted.', 'info');
  };

  // AI helper functions
  const runAiAudit = async (property: Property) => {
    try {
      const response = await fetch('/api/ai/audit-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyData: property,
          deedHistory: property.chainOfCustody,
          zoningType: property.zoning,
        }),
      });
      if (!response.ok) throw new Error('AI service error');
      return await response.json();
    } catch (err) {
      console.warn('Using client-side fallback AI audit');
      return {
        riskLevel: property.status === 'In_Dispute' ? 'High' : 'Low',
        score: property.status === 'In_Dispute' ? 62 : 98,
        summary: `Title deed ${property.titleNumber} shows continuous chain of custody across ${property.chainOfCustody.length} transactions with verified cryptographic signatures.`,
        flags: property.status === 'In_Dispute' ? ['Active boundary dispute flag detected on adjacent parcel'] : [],
        recommendations: [
          'Verify GPS satellite cadastral overlay with municipal GIS database.',
          'Ensure all 5 smart contract multi-signature parties are authenticated before conveyance.',
        ],
        complianceStatus: 'Fully Compliant with State Cadastral Regulations',
      };
    }
  };

  const runAiExplain = async (deedText: string, rules: string[]) => {
    try {
      const response = await fetch('/api/ai/explain-deed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deedText, smartContractRules: rules }),
      });
      if (!response.ok) throw new Error('AI service error');
      return await response.json();
    } catch (err) {
      return {
        plainEnglishSummary: 'This smart contract legally transfers ownership rights from the seller to the buyer upon receipt of notarized approval and municipal tax clearance.',
        keyRights: [
          'Unconditional freehold ownership title',
          'Right to occupy, lease, pledge, or develop subject to zoning',
          'Cadastral boundary protection anchored on blockchain',
        ],
        obligations: [
          'Annual municipal property tax duty',
          'Maintenance of utility easements where designated',
        ],
        smartContractTriggers: [
          'Automated escrow release to seller upon Chief Registrar block minting',
          'Instant digital title issuance to buyer wallet',
        ],
        privacyNotes: 'Personal identifiable data is encrypted off-chain; only cryptographic zero-knowledge hashes exist publicly on the blockchain.',
      };
    }
  };

  return (
    <RegistryContext.Provider
      value={{
        currentRole,
        currentUser,
        properties,
        smartContracts,
        blockchainBlocks,
        auditLogs,
        notifications,
        privacyState,
        isMining,
        selectedProperty,
        activeView,
        toast,
        isWeb3Connected,
        web3Account,
        web3ChainId,
        connectWeb3Wallet,
        disconnectWeb3Wallet,
        switchRole,
        setActiveView,
        setSelectedProperty,
        createSmartContractTransfer,
        signContractAsCurrentRole: signSmartContractAsCurrentRole,
        executeSmartContractTransfer,
        createNewPropertyTitle,
        resolveDispute,
        flagDispute,
        addEncumbrance,
        dischargeEncumbrance,
        performGdprErasure,
        markNotificationAsRead,
        clearToast,
        showToast,
        runAiAudit,
        runAiExplain,
      }}
    >
      {children}
    </RegistryContext.Provider>
  );
};

export const useRegistry = () => {
  const context = useContext(RegistryContext);
  if (!context) {
    throw new Error('useRegistry must be used within a RegistryProvider');
  }
  return context;
};
