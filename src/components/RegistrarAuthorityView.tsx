import React, { useState } from 'react';
import { useRegistry } from '../context/RegistryContext';
import { SmartContractTransfer, Property } from '../types';
import {
  Building2,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Cpu,
  ArrowRight,
  PlusCircle,
  Clock,
  Key,
  Shield,
  Layers,
  Scale,
  DollarSign,
  MapPin,
  XCircle,
  Sparkles,
} from 'lucide-react';
import { formatAddress, formatCurrency } from '../utils/crypto';

interface RegistrarAuthorityViewProps {
  onOpenNewTitleModal: () => void;
  onInspectContract: (contract: SmartContractTransfer) => void;
}

export const RegistrarAuthorityView: React.FC<RegistrarAuthorityViewProps> = ({
  onOpenNewTitleModal,
  onInspectContract,
}) => {
  const {
    currentRole,
    currentUser,
    smartContracts,
    properties,
    signContractAsCurrentRole,
    executeSmartContractTransfer,
    resolveDispute,
    flagDispute,
    isMining,
    showToast,
  } = useRegistry();

  const [disputeModalProp, setDisputeModalProp] = useState<Property | null>(null);
  const [disputeNotes, setDisputeNotes] = useState('');
  const [isResolving, setIsResolving] = useState(true);

  const pendingContracts = smartContracts.filter(c => c.status !== 'Executed_Minted' && c.status !== 'Rejected');
  const disputeProperties = properties.filter(p => p.status === 'In_Dispute');
  const totalTaxEscrow = pendingContracts.reduce((acc, c) => acc + c.taxDutyUSD, 0);

  const handleOpenDispute = (prop: Property, resolving: boolean) => {
    setDisputeModalProp(prop);
    setIsResolving(resolving);
    setDisputeNotes(resolving ? 'Boundary survey GPS coordinates re-aligned with zero overlap. Clear to proceed.' : '');
  };

  const handleSubmitDisputeAction = async () => {
    if (!disputeModalProp || !disputeNotes.trim()) return;
    if (isResolving) {
      await resolveDispute(disputeModalProp.id, disputeNotes);
    } else {
      await flagDispute(disputeModalProp.id, disputeNotes);
    }
    setDisputeModalProp(null);
    setDisputeNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header & Sovereign Controls Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-medium">
            <Building2 className="w-3.5 h-3.5" />
            <span>State Land Administration & Cadastral Authority</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Government Real-Time Title Verification Queue
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Multi-signature authority verification console. Validate cadastral GPS boundary surveys, verify municipal
            conveyance taxes, and issue sovereign cryptographic seals to mint new property blocks.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            id="btn-issue-new-title"
            onClick={onOpenNewTitleModal}
            className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Issue New Land Title Deed</span>
          </button>
        </div>
      </div>

      {/* Authority Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Seals</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{pendingContracts.length}</p>
          <p className="text-[11px] text-blue-600 mt-1 font-semibold">Active multi-sig smart contracts</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tax Escrow</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-2">{formatCurrency(totalTaxEscrow)}</p>
          <p className="text-[11px] text-slate-500 mt-1">Held in State Treasury Escrow</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Boundary Disputes</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-rose-600 mt-2">{disputeProperties.length}</p>
          <p className="text-[11px] text-rose-600 mt-1 font-semibold">Smart transfers locked</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Officer</span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Key className="w-4 h-4" />
            </div>
          </div>
          <p className="text-sm font-bold text-slate-900 mt-2 truncate">{currentUser.name}</p>
          <p className="text-[11px] text-slate-500 mt-0.5 truncate">{currentUser.roleTitle}</p>
        </div>
      </div>

      {/* Active Verification Queue Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-blue-600" />
              <span>Real-Time Smart Contract Title Conveyance Queue</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Requires 5-party multi-signature threshold before block minting
            </p>
          </div>
          <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold uppercase self-start sm:self-auto">
            {pendingContracts.length} Pending Execution
          </span>
        </div>

        {pendingContracts.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">Verification Queue Clear</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              All active smart contract title transfers have been fully notarized, taxed, and minted onto the blockchain ledger.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pendingContracts.map(contract => {
              const sigs = contract.signatures;
              const signedCount = [
                sigs.seller.signed,
                sigs.buyer.signed,
                sigs.surveyorNotary.signed,
                sigs.taxAuthority.signed,
                sigs.landRegistrar.signed,
              ].filter(Boolean).length;

              const readyForRegistrarSeal =
                sigs.seller.signed &&
                sigs.buyer.signed &&
                sigs.surveyorNotary.signed &&
                sigs.taxAuthority.signed;

              return (
                <div key={contract.id} className="p-6 hover:bg-slate-50/50 transition-colors space-y-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                          {contract.id}
                        </span>
                        <span className="text-xs font-semibold text-slate-900">{contract.propertyTitle}</span>
                        <span className="text-xs text-slate-400 font-mono">({contract.propertyId})</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                        <span>
                          <strong>Seller:</strong> {contract.sellerName}
                        </span>
                        <span>
                          <strong>Buyer:</strong> {contract.buyerName}
                        </span>
                        <span>
                          <strong>Value:</strong> {formatCurrency(contract.transferPriceUSD)}
                        </span>
                        <span>
                          <strong>Duty Tax:</strong> {formatCurrency(contract.taxDutyUSD)}
                        </span>
                      </div>
                    </div>

                    {/* Multi-Sig Sign / Execute Action Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onInspectContract(contract)}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                      >
                        Inspect Contract
                      </button>

                      {/* Notary signing button */}
                      {currentRole === 'notary' && !sigs.surveyorNotary.signed && (
                        <button
                          onClick={() => signContractAsCurrentRole(contract.id)}
                          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
                        >
                          <Scale className="w-3.5 h-3.5" />
                          <span>Apply Notary Survey Seal</span>
                        </button>
                      )}

                      {/* Registrar Tax Clearance button */}
                      {currentRole === 'registrar' && !sigs.taxAuthority.signed && (
                        <button
                          onClick={() => signContractAsCurrentRole(contract.id)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>Certify Tax Clearance</span>
                        </button>
                      )}

                      {/* Final Registrar Minting button */}
                      {currentRole === 'registrar' && readyForRegistrarSeal && !sigs.landRegistrar.signed && (
                        <button
                          onClick={() => executeSmartContractTransfer(contract.id)}
                          disabled={isMining}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-blue-500/20"
                        >
                          <Building2 className="w-3.5 h-3.5" />
                          <span>{isMining ? 'Minting Block...' : 'Execute & Mint Title Block'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 5-Step Signature Progress Bar */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                    <div className="flex items-center justify-between text-xs font-medium text-slate-600 mb-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Cryptographic Multi-Signature Authentication:
                      </span>
                      <span className="font-bold text-blue-600">{signedCount} of 5 Signatures Verified</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                      {/* 1. Seller */}
                      <div
                        className={`p-2.5 rounded-xl border text-center ${
                          sigs.seller.signed
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-slate-100 border-slate-200 text-slate-400'
                        }`}
                      >
                        <div className="font-bold text-[11px]">1. Seller Signature</div>
                        <div className="text-[10px] truncate">{sigs.seller.signed ? '✓ Signed' : 'Pending'}</div>
                      </div>

                      {/* 2. Buyer */}
                      <div
                        className={`p-2.5 rounded-xl border text-center ${
                          sigs.buyer.signed
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-slate-100 border-slate-200 text-slate-400'
                        }`}
                      >
                        <div className="font-bold text-[11px]">2. Buyer Signature</div>
                        <div className="text-[10px] truncate">{sigs.buyer.signed ? '✓ Signed' : 'Pending'}</div>
                      </div>

                      {/* 3. Surveyor / Notary */}
                      <div
                        className={`p-2.5 rounded-xl border text-center ${
                          sigs.surveyorNotary.signed
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-slate-100 border-slate-200 text-slate-400'
                        }`}
                      >
                        <div className="font-bold text-[11px]">3. Cadastral Notary</div>
                        <div className="text-[10px] truncate">
                          {sigs.surveyorNotary.signed ? '✓ Certified' : 'Survey Check'}
                        </div>
                      </div>

                      {/* 4. Municipal Tax */}
                      <div
                        className={`p-2.5 rounded-xl border text-center ${
                          sigs.taxAuthority.signed
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-slate-100 border-slate-200 text-slate-400'
                        }`}
                      >
                        <div className="font-bold text-[11px]">4. Municipal Duty</div>
                        <div className="text-[10px] truncate">{sigs.taxAuthority.signed ? '✓ Cleared' : 'Awaiting Tax'}</div>
                      </div>

                      {/* 5. Registrar Seal */}
                      <div
                        className={`p-2.5 rounded-xl border text-center ${
                          sigs.landRegistrar.signed
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-slate-100 border-slate-200 text-slate-400'
                        }`}
                      >
                        <div className="font-bold text-[11px]">5. Registrar Seal</div>
                        <div className="text-[10px] truncate">
                          {sigs.landRegistrar.signed ? '✓ Minted' : 'Final Block Mint'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cadastral Boundary Disputes & Encumbrance Console */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>Cadastral Boundary Conflicts & Title Encumbrances</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Government administrative tools to audit property liens, covenants, and boundary disputes
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {properties
            .filter(p => p.status === 'In_Dispute' || p.encumbrances.length > 0)
            .map(prop => (
              <div key={prop.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                      {prop.parcelId}
                    </span>
                    <span className="font-bold text-sm text-slate-900">{prop.address}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        prop.status === 'In_Dispute'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {prop.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{prop.legalNotes}</p>
                  {prop.encumbrances.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {prop.encumbrances.map(enc => (
                        <span key={enc.id} className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {enc.type}: {enc.beneficiary} ({enc.status})
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {prop.status === 'In_Dispute' ? (
                    <button
                      onClick={() => handleOpenDispute(prop, true)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition"
                    >
                      Resolve Dispute
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenDispute(prop, false)}
                      className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition"
                    >
                      Flag Boundary Dispute
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Dispute Modal */}
      {disputeModalProp && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">
              {isResolving ? 'Resolve Cadastral Boundary Dispute' : 'Flag Cadastral Boundary Dispute'}
            </h3>
            <p className="text-xs text-slate-600">
              Parcel: <strong>{disputeModalProp.parcelId}</strong> — {disputeModalProp.address}
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Administrative & Survey Findings
              </label>
              <textarea
                value={disputeNotes}
                onChange={e => setDisputeNotes(e.target.value)}
                rows={4}
                className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
                placeholder="Enter cadastral GPS survey findings or resolution terms..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDisputeModalProp(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitDisputeAction}
                className={`px-4 py-2.5 rounded-xl text-white text-xs font-bold shadow-xs ${
                  isResolving ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {isResolving ? 'Certify Resolution on Blockchain' : 'Lock Parcel & Record Dispute'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
