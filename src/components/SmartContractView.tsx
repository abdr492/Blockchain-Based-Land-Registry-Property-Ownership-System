import React, { useState } from 'react';
import { useRegistry } from '../context/RegistryContext';
import { SmartContractTransfer } from '../types';
import {
  Cpu,
  CheckCircle2,
  Clock,
  Key,
  Lock,
  Unlock,
  ShieldCheck,
  Building2,
  Scale,
  DollarSign,
  UserCheck,
  Sparkles,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  Award,
} from 'lucide-react';
import { formatAddress, formatCurrency } from '../utils/crypto';

interface SmartContractViewProps {
  onAiExplainContract: (contract: SmartContractTransfer) => void;
}

export const SmartContractView: React.FC<SmartContractViewProps> = ({ onAiExplainContract }) => {
  const {
    smartContracts,
    currentUser,
    currentRole,
    signContractAsCurrentRole,
    executeSmartContractTransfer,
    isMining,
    showToast,
  } = useRegistry();

  const [selectedContractId, setSelectedContractId] = useState<string>(
    smartContracts[0]?.id || ''
  );

  const selectedContract = smartContracts.find(c => c.id === selectedContractId) || smartContracts[0];

  if (!selectedContract) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
        <Cpu className="w-12 h-12 text-slate-300 mx-auto" />
        <h3 className="text-base font-bold text-slate-800">No Active Smart Contracts</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Create a new title transfer from the Citizen Property Portfolio to launch an automated land conveyance smart contract.
        </p>
      </div>
    );
  }

  const sigs = selectedContract.signatures;
  const isExecuted = selectedContract.status === 'Executed_Minted';

  const isSellerCurrentUser = selectedContract.sellerAddress.toLowerCase() === currentUser.walletAddress.toLowerCase();
  const isBuyerCurrentUser = selectedContract.buyerAddress.toLowerCase() === currentUser.walletAddress.toLowerCase();

  const canCitizenSign =
    currentRole === 'citizen' &&
    ((isSellerCurrentUser && !sigs.seller.signed) || (isBuyerCurrentUser && !sigs.buyer.signed));

  const canNotarySign = currentRole === 'notary' && !sigs.surveyorNotary.signed;
  const canTaxSign = currentRole === 'registrar' && !sigs.taxAuthority.signed;
  const canRegistrarMint =
    currentRole === 'registrar' &&
    sigs.seller.signed &&
    sigs.buyer.signed &&
    sigs.surveyorNotary.signed &&
    sigs.taxAuthority.signed &&
    !sigs.landRegistrar.signed;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-800">
        <div className="space-y-1 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-medium">
            <Cpu className="w-3.5 h-3.5" />
            <span>Autonomous Smart Title Conveyance Protocol</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Smart Contract Execution Engine</h1>
          <p className="text-xs text-slate-300 leading-relaxed">
            Immutable state machine enforcing 5-party multi-signature threshold & sovereign title conveyance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onAiExplainContract(selectedContract)}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>AI Plain English Explainer</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Smart Contracts List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-bold uppercase text-slate-400 tracking-wider px-1">
            Active Smart Contracts ({smartContracts.length})
          </div>

          <div className="space-y-2.5">
            {smartContracts.map(contract => {
              const isSel = contract.id === selectedContract.id;
              const isMinted = contract.status === 'Executed_Minted';
              return (
                <div
                  key={contract.id}
                  onClick={() => setSelectedContractId(contract.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSel
                      ? 'bg-blue-50/70 border-blue-300 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-blue-700">{contract.id}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isMinted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isMinted ? 'Mined on Chain' : 'Multi-Sig Pending'}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-xs mt-1.5 line-clamp-1">{contract.propertyTitle}</h4>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                    <span>{contract.sellerName} → {contract.buyerName}</span>
                    <span className="font-semibold text-slate-800">{formatCurrency(contract.transferPriceUSD)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Detailed Smart Contract Visualizer */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            {/* Header & Hash */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                    {selectedContract.id}
                  </span>
                  <span
                    className={`px-3 py-0.5 rounded-full text-xs font-bold ${
                      isExecuted
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    Status: {selectedContract.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <h2 className="text-base font-bold text-slate-900 mt-1">{selectedContract.propertyTitle}</h2>
              </div>

              <div className="text-right">
                <div className="text-xs text-slate-400 font-medium">Escrow Value Locked</div>
                <div className="text-xl font-bold text-emerald-700">
                  {formatCurrency(selectedContract.transferPriceUSD)}
                </div>
                <div className="text-[10px] text-slate-500">Conveyance Duty: {formatCurrency(selectedContract.taxDutyUSD)}</div>
              </div>
            </div>

            {/* Smart Contract Hash & Escrow Badge */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-900 rounded-xl text-xs font-mono space-y-1 text-white">
                <div className="text-slate-400 text-[10px] flex items-center justify-between">
                  <span>Smart Contract Hash (SHA-256)</span>
                  <Lock className="w-3 h-3 text-emerald-400" />
                </div>
                <div className="text-emerald-400 truncate font-semibold">{selectedContract.contractHash}</div>
              </div>

              <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl text-xs space-y-1">
                <div className="text-blue-700 text-[10px] font-bold uppercase flex items-center justify-between">
                  <span>Escrow Smart Vault</span>
                  <Award className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div className="text-slate-800 font-semibold flex items-center justify-between">
                  <span>State: {selectedContract.escrowStatus.replace(/_/g, ' ')}</span>
                  <span className="text-emerald-700 font-bold">100% Guaranteed</span>
                </div>
              </div>
            </div>

            {/* 5-Party Multi-Signature Cryptographic Verification Matrix */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>5-Party Multi-Signature Cryptographic Verification</span>
                </h3>
                <span className="text-xs font-semibold text-slate-500">Threshold: 5/5 Required</span>
              </div>

              <div className="space-y-2.5">
                {/* 1. Seller Signature */}
                <div
                  className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                    sigs.seller.signed ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                        sigs.seller.signed ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      1
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">
                        Seller Signature: {selectedContract.sellerName}
                      </div>
                      <div className="font-mono text-[11px] text-slate-500">
                        Wallet: {formatAddress(selectedContract.sellerAddress)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    {sigs.seller.signed ? (
                      <div className="text-emerald-700 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Signed (0x{sigs.seller.signature.slice(2, 10)}...)</span>
                      </div>
                    ) : (
                      <span className="text-slate-400">Awaiting Citizen Signature</span>
                    )}
                  </div>
                </div>

                {/* 2. Buyer Signature */}
                <div
                  className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                    sigs.buyer.signed ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                        sigs.buyer.signed ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      2
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">
                        Buyer Signature: {selectedContract.buyerName}
                      </div>
                      <div className="font-mono text-[11px] text-slate-500">
                        Wallet: {formatAddress(selectedContract.buyerAddress)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    {sigs.buyer.signed ? (
                      <div className="text-emerald-700 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Signed (0x{sigs.buyer.signature.slice(2, 10)}...)</span>
                      </div>
                    ) : (
                      <span className="text-slate-400">Awaiting Buyer Confirmation</span>
                    )}
                  </div>
                </div>

                {/* 3. Notary & Surveyor Seal */}
                <div
                  className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                    sigs.surveyorNotary.signed ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                        sigs.surveyorNotary.signed ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      3
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">Cadastral Surveyor & Notary Seal</div>
                      <div className="text-[11px] text-slate-500">
                        Boundary GPS overlap verification & legal title clearance
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    {sigs.surveyorNotary.signed ? (
                      <div className="text-emerald-700 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Notarized & Survey Certified</span>
                      </div>
                    ) : (
                      <span className="text-slate-400">Awaiting Cadastral Notary Seal</span>
                    )}
                  </div>
                </div>

                {/* 4. Municipal Tax Clearance */}
                <div
                  className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                    sigs.taxAuthority.signed ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                        sigs.taxAuthority.signed ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      4
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">Municipal Conveyance Tax Duty</div>
                      <div className="text-[11px] text-slate-500">
                        Tax Duty: {formatCurrency(selectedContract.taxDutyUSD)} verified by State Revenue
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    {sigs.taxAuthority.signed ? (
                      <div className="text-emerald-700 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Tax Duty Paid & Cleared</span>
                      </div>
                    ) : (
                      <span className="text-slate-400">Awaiting Municipal Duty Receipt</span>
                    )}
                  </div>
                </div>

                {/* 5. Chief Land Registrar Sovereign Seal */}
                <div
                  className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                    sigs.landRegistrar.signed ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                        sigs.landRegistrar.signed ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      5
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">Chief Land Registrar Sovereign Seal</div>
                      <div className="text-[11px] text-slate-500">
                        Final sovereign authority seal triggers automatic ledger block minting
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    {sigs.landRegistrar.signed ? (
                      <div className="text-emerald-700 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mined in Block #{selectedContract.blockHeightMinted}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400">Awaiting Final Sovereign Seal</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Smart Contract Clauses & Conditions */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                Smart Contract Clauses & Conditions
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200">
                {selectedContract.termsConditions.map((term, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">§{i + 1}</span>
                    <span>{term}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Live Interactive Action Bar based on current persona */}
            <div className="p-5 bg-slate-900 rounded-2xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-200">
                  Signed-in as: <span className="text-blue-400">{currentUser.name}</span> ({currentUser.roleTitle})
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Wallet: {formatAddress(currentUser.walletAddress)}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!isExecuted ? (
                  <>
                    {/* Role-specific signature trigger */}
                    {canCitizenSign && (
                      <button
                        onClick={() => signContractAsCurrentRole(selectedContract.id)}
                        className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm"
                      >
                        <Key className="w-3.5 h-3.5 text-amber-400" />
                        <span>Sign as Citizen</span>
                      </button>
                    )}

                    {canNotarySign && (
                      <button
                        onClick={() => signContractAsCurrentRole(selectedContract.id)}
                        className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm"
                      >
                        <Scale className="w-3.5 h-3.5" />
                        <span>Sign as Notary & Surveyor</span>
                      </button>
                    )}

                    {canTaxSign && (
                      <button
                        onClick={() => signContractAsCurrentRole(selectedContract.id)}
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>Certify Tax Duty</span>
                      </button>
                    )}

                    {canRegistrarMint && (
                      <button
                        onClick={() => executeSmartContractTransfer(selectedContract.id)}
                        disabled={isMining}
                        className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm shadow-blue-500/20"
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        <span>{isMining ? 'Mining Block...' : 'Final Sovereign Seal & Mint'}</span>
                      </button>
                    )}

                    {!canCitizenSign && !canNotarySign && !canTaxSign && !canRegistrarMint && (
                      <div className="text-xs text-slate-400 italic">
                        {currentRole === 'auditor'
                          ? 'Auditor mode: Read-only inspection'
                          : 'You have signed or are awaiting other signatory parties.'}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Contract Executed & Minted on Ledger</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
