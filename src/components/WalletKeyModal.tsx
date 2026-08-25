import React, { useState } from 'react';
import { useRegistry } from '../context/RegistryContext';
import {
  X,
  Key,
  Lock,
  Unlock,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
  Eye,
  EyeOff,
} from 'lucide-react';
import { signData, verifySignature } from '../utils/crypto';
import { CONTRACT_ADDRESS } from '../utils/contract';

interface WalletKeyModalProps {
  onClose: () => void;
}

export const WalletKeyModal: React.FC<WalletKeyModalProps> = ({ onClose }) => {
  const {
    currentUser,
    showToast,
    isWeb3Connected,
    web3Account,
    web3ChainId,
    connectWeb3Wallet,
    disconnectWeb3Wallet,
  } = useRegistry();
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Digital Signature Playground
  const [inputPayload, setInputPayload] = useState(
    `CAD_TITLE_DEED_CONSENT:0x7A94b...:PRICE_850000:${new Date().toISOString().split('T')[0]}`
  );
  const [generatedSignature, setGeneratedSignature] = useState('');
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null);

  const handleCopy = (val: string, label: string) => {
    navigator.clipboard.writeText(val);
    setCopiedField(label);
    showToast(`Copied ${label} to clipboard`, 'info');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSign = async () => {
    if (!inputPayload) return;
    const sig = await signData(inputPayload, currentUser.privateKey);
    setGeneratedSignature(sig);
    setVerificationResult(null);
    showToast('Digital signature computed with ECDSA private key!', 'success');
  };

  const handleVerify = async () => {
    if (!generatedSignature || !inputPayload) return;
    const valid = await verifySignature(inputPayload, generatedSignature, currentUser.publicKey);
    setVerificationResult(valid);
    if (valid) {
      showToast('Cryptographic signature verified successfully!', 'success');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">ECDSA Cryptographic Keypair & Wallet</h2>
              <p className="text-xs text-slate-400">
                Asymmetric private/public keys ensuring legal non-repudiation
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

        <div className="p-6 sm:p-8 space-y-6 text-xs text-slate-700">
          {/* Persona Banner */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900 text-sm">{currentUser.name}</div>
              <p className="text-slate-500 text-xs">{currentUser.roleTitle}</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Active Key Authenticated
            </span>
          </div>

          {/* Live Web3 MetaMask Connection Panel */}
          <div className={`p-4 rounded-2xl border transition-all ${
            isWeb3Connected ? 'bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-400' : 'bg-slate-900 text-white border-slate-800'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${isWeb3Connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
                  <span className={`font-bold text-sm ${isWeb3Connected ? 'text-emerald-900' : 'text-white'}`}>
                    {isWeb3Connected ? 'MetaMask Connected (Live EVM)' : 'Local Hardhat Node & MetaMask Bridge'}
                  </span>
                </div>
                <p className={`text-[11px] ${isWeb3Connected ? 'text-emerald-700' : 'text-slate-400'}`}>
                  {isWeb3Connected
                    ? `Account: ${web3Account} • Chain ID: ${web3ChainId || 31337}`
                    : 'Connect your MetaMask wallet or broadcast transactions to local Hardhat node (Chain 31337)'}
                </p>
              </div>

              {isWeb3Connected ? (
                <button
                  onClick={disconnectWeb3Wallet}
                  className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition shrink-0"
                >
                  Disconnect MetaMask
                </button>
              ) : (
                <button
                  onClick={connectWeb3Wallet}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shrink-0 shadow-sm flex items-center gap-1.5"
                >
                  <Key className="w-3.5 h-3.5 text-amber-300" />
                  <span>Connect MetaMask</span>
                </button>
              )}
            </div>

            {/* Smart Contract Reference */}
            <div className={`mt-3 pt-3 border-t text-[11px] font-mono flex items-center justify-between gap-2 ${
              isWeb3Connected ? 'border-emerald-200 text-emerald-800' : 'border-slate-800 text-slate-400'
            }`}>
              <span className="truncate">LandRegistry: {CONTRACT_ADDRESS}</span>
              <button
                onClick={() => handleCopy(CONTRACT_ADDRESS, 'Smart Contract Address')}
                className="hover:underline flex items-center gap-1 shrink-0 font-bold"
              >
                <Copy className="w-3 h-3" />
                <span>Copy Contract</span>
              </button>
            </div>
          </div>

          {/* Keypair Display */}
          <div className="space-y-3 font-mono">
            {/* Wallet Address */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-bold uppercase">Public Wallet Address</span>
                <button
                  onClick={() => handleCopy(currentUser.walletAddress, 'Wallet Address')}
                  className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </button>
              </div>
              <div className="p-2.5 bg-slate-100 rounded-lg text-slate-900 text-xs break-all">
                {currentUser.walletAddress}
              </div>
            </div>

            {/* Public Key */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-bold uppercase">ECDSA Public Key (secp256k1)</span>
                <button
                  onClick={() => handleCopy(currentUser.publicKey, 'Public Key')}
                  className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </button>
              </div>
              <div className="p-2.5 bg-slate-100 rounded-lg text-slate-700 text-[11px] break-all">
                {currentUser.publicKey}
              </div>
            </div>

            {/* Private Key with Toggle */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-bold uppercase text-amber-700">Encrypted Private Key</span>
                <button
                  onClick={() => setShowPrivateKey(!showPrivateKey)}
                  className="text-amber-700 hover:text-amber-900 flex items-center gap-1 font-sans font-semibold"
                >
                  {showPrivateKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPrivateKey ? 'Hide Key' : 'Reveal Key'}</span>
                </button>
              </div>
              <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-lg text-amber-950 text-[11px] break-all">
                {showPrivateKey ? currentUser.privateKey : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••'}
              </div>
            </div>
          </div>

          {/* Interactive Digital Signature Tester */}
          <div className="p-5 bg-slate-900 text-white rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Live Digital Signature Generator & Verifier</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">SHA-256 + ECDSA</span>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] text-slate-300 font-sans">
                Deed Transaction Payload to Sign:
              </label>
              <textarea
                value={inputPayload}
                onChange={e => setInputPayload(e.target.value)}
                rows={2}
                className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSign}
                className="flex-1 py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1.5"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Sign Payload</span>
              </button>
              <button
                onClick={handleVerify}
                disabled={!generatedSignature}
                className="flex-1 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verify Signature</span>
              </button>
            </div>

            {generatedSignature && (
              <div className="space-y-1 font-mono text-[11px]">
                <div className="text-slate-400 text-[10px]">Computed Digital Signature:</div>
                <div className="p-2.5 bg-slate-800 rounded-lg text-emerald-400 break-all border border-slate-700">
                  {generatedSignature}
                </div>
              </div>
            )}

            {verificationResult !== null && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  verificationResult
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {verificationResult ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Mathematical Verification Passed: Sovereign Signature Authenticated!</span>
                  </>
                ) : (
                  <span>Verification Failed: Signature mismatch.</span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
