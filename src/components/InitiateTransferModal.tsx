import React, { useState } from 'react';
import { useRegistry } from '../context/RegistryContext';
import { Property } from '../types';
import {
  X,
  ArrowRightLeft,
  Key,
  ShieldCheck,
  DollarSign,
  UserCheck,
  Lock,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { formatAddress, formatCurrency, signData } from '../utils/crypto';

interface InitiateTransferModalProps {
  property: Property | null;
  onClose: () => void;
  onAiPreAudit: (property: Property) => void;
}

export const InitiateTransferModal: React.FC<InitiateTransferModalProps> = ({
  property,
  onClose,
  onAiPreAudit,
}) => {
  const { currentUser, createSmartContractTransfer, setActiveView, showToast } = useRegistry();

  const [buyerName, setBuyerName] = useState('Helena Vance');
  const [buyerWallet, setBuyerWallet] = useState('0x3B99cE7127e28A613149a463D5d5a7d65B62b665');
  const [transferPrice, setTransferPrice] = useState<number>(property?.estimatedValueUSD || 750000);
  const [customClause, setCustomClause] = useState(
    'Subject to full cadastral boundary survey re-confirmation and municipal duty clearance.'
  );
  const [isSigning, setIsSigning] = useState(false);
  const [signatureGenerated, setSignatureGenerated] = useState<string | null>(null);

  if (!property) return null;

  const taxDuty = Math.round(transferPrice * 0.01); // 1% conveyance duty

  const handleGenerateSignature = async () => {
    setIsSigning(true);
    const payload = `SMART_TRANSFER:${property.id}:${currentUser.walletAddress}:${buyerWallet}:${transferPrice}:${Date.now()}`;
    const sig = await signData(payload, currentUser.privateKey);
    setSignatureGenerated(sig);
    setIsSigning(false);
    showToast('Cryptographic signature generated using your private key!', 'success');
  };

  const handleDeployContract = async () => {
    if (!buyerName || !buyerWallet) {
      showToast('Please specify valid buyer name and wallet address.', 'error');
      return;
    }
    if (transferPrice <= 0) {
      showToast('Please specify a valid transfer price.', 'error');
      return;
    }

    const clauses = [
      'All encumbrances and liens must be cleared prior to final title conveyance.',
      'Purchase funds held in Autonomous Escrow Vault until 5/5 multi-sig threshold is achieved.',
      customClause,
    ].filter(Boolean);

    await createSmartContractTransfer({
      propertyId: property.id,
      buyerName,
      buyerAddress: buyerWallet,
      transferPriceUSD: transferPrice,
      termsConditions: clauses,
    });

    onClose();
    setActiveView('contracts');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Initiate Smart Title Transfer</h2>
              <p className="text-xs text-slate-400">
                Create an autonomous multi-signature land conveyance smart contract
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-6 text-xs text-slate-700">
          {/* Property Summary Banner */}
          <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-indigo-700 text-xs">{property.parcelId}</span>
                <span className="text-slate-800 font-bold text-sm">{property.address}</span>
              </div>
              <p className="text-[11px] text-slate-500">{property.cadastralDistrict}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Estimated Value</span>
              <p className="text-base font-bold text-emerald-700">{formatCurrency(property.estimatedValueUSD)}</p>
            </div>
          </div>

          {/* Step 1: Buyer Particulars */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-indigo-600" />
              <span>Buyer Details & Authenticated Wallet</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Buyer Full Legal Name
                </label>
                <input
                  type="text"
                  value={buyerName}
                  onChange={e => setBuyerName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  placeholder="e.g. Helena Vance"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Buyer Cryptographic Wallet Address
                </label>
                <input
                  type="text"
                  value={buyerWallet}
                  onChange={e => setBuyerWallet(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-[11px]"
                  placeholder="0x..."
                />
              </div>
            </div>
          </div>

          {/* Step 2: Financial Escrow & Municipal Conveyance Duty */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Transfer Price & Automated Municipal Duty</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Agreed Purchase Price (USD)
                </label>
                <input
                  type="number"
                  value={transferPrice}
                  onChange={e => setTransferPrice(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm text-emerald-700"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="text-[10px] text-slate-400 font-bold uppercase">
                  1% Municipal Conveyance Duty Tax
                </div>
                <p className="text-base font-bold text-slate-900">{formatCurrency(taxDuty)}</p>
                <p className="text-[10px] text-slate-500">Auto-routed to State Treasury escrow vault</p>
              </div>
            </div>
          </div>

          {/* Step 3: Smart Contract Clauses */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Special Covenants & Conditions:
            </label>
            <textarea
              value={customClause}
              onChange={e => setCustomClause(e.target.value)}
              rows={2}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
            />
          </div>

          {/* Step 4: Seller ECDSA Digital Signature */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-xs">Seller ECDSA Digital Signature</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Signing as: {currentUser.name} ({formatAddress(currentUser.walletAddress)})
              </span>
            </div>

            {signatureGenerated ? (
              <div className="p-2.5 bg-slate-800 rounded-lg font-mono text-[11px] text-emerald-400 break-all border border-emerald-500/30">
                ✓ Signature: {signatureGenerated}
              </div>
            ) : (
              <button
                type="button"
                onClick={handleGenerateSignature}
                disabled={isSigning}
                className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
              >
                <Key className="w-3.5 h-3.5" />
                <span>{isSigning ? 'Calculating SHA-256...' : 'Generate Cryptographic Digital Signature'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => onAiPreAudit(property)}
            className="text-xs text-indigo-700 hover:text-indigo-900 font-semibold flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Run AI Pre-Transfer Zoning & Conflict Audit</span>
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDeployContract}
              className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-md shadow-indigo-200 flex items-center justify-center gap-2"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>Deploy Smart Contract</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
