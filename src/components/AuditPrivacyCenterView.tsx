import React, { useState } from 'react';
import { useRegistry } from '../context/RegistryContext';
import { AuditLogEntry, Property } from '../types';
import {
  Shield,
  Lock,
  Unlock,
  Trash2,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Database,
  Search,
  Filter,
  Key,
  Layers,
  Scale,
  Sparkles,
} from 'lucide-react';
import { encryptSensitivePII, decryptSensitivePII } from '../utils/crypto';

export const AuditPrivacyCenterView: React.FC = () => {
  const {
    auditLogs,
    privacyState,
    properties,
    performGdprErasure,
    currentUser,
    showToast,
  } = useRegistry();

  const [searchLog, setSearchLog] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [erasurePropertyId, setErasurePropertyId] = useState<string>('');

  // Interactive E2E Encryption Testing Playground State
  const [testPlaintext, setTestPlaintext] = useState('Citizen ID: 994-01-8842 | Tax Exempt: No');
  const [encryptedOutput, setEncryptedOutput] = useState('');
  const [decryptedOutput, setDecryptedOutput] = useState('');

  const handleTestEncrypt = async () => {
    const cipher = await encryptSensitivePII(testPlaintext);
    setEncryptedOutput(cipher);
    setDecryptedOutput('');
    showToast('Payload encrypted with AES-256-GCM + 96-bit IV!', 'success');
  };

  const handleTestDecrypt = async () => {
    if (!encryptedOutput) return;
    const plain = await decryptSensitivePII(encryptedOutput);
    setDecryptedOutput(plain);
    showToast('Payload decrypted with private authentication key!', 'info');
  };

  const handleExecuteErasure = async () => {
    if (!erasurePropertyId) return;
    await performGdprErasure(erasurePropertyId);
    setErasurePropertyId('');
  };

  const filteredLogs = auditLogs.filter(log => {
    if (selectedCategory !== 'all' && log.complianceCategory !== selectedCategory) return false;
    if (!searchLog) return true;
    const q = searchLog.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.actor.toLowerCase().includes(q) ||
      log.targetId.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-medium">
            <Shield className="w-3.5 h-3.5" />
            <span>Regional Data Privacy Directives & GDPR Art. 17 Compliant</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Immutable Audit Log & Data Privacy Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Off-chain PII minimization with zero-knowledge cryptographic hashes anchored on the blockchain. Full compliance with regional data protection standards.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 bg-slate-800/70 p-4 rounded-2xl border border-slate-700/60 shrink-0 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Privacy Status</span>
            <p className="text-xl font-bold text-emerald-400 mt-0.5">100% Certified</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Art. 17 Erasures</span>
            <p className="text-xl font-bold text-blue-400 mt-0.5 font-mono">
              {privacyState.rightToErasureRequestsCount} Processed
            </p>
          </div>
        </div>
      </div>

      {/* 2-Column Section: E2E Encryption Testing + GDPR Right to Erasure Tool */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* End-to-End Encryption Interactive Sandbox */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-600" />
              <span>End-to-End AES-256-GCM Cryptographic Sandbox</span>
            </h3>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full uppercase">
              Active Cipher
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Sensitive citizen PII (National ID, tax documents, contract terms) is encrypted before storage. Only authorized public keys can decrypt off-chain payloads.
          </p>

          <div className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Plaintext Sensitive Data:
              </label>
              <input
                type="text"
                value={testPlaintext}
                onChange={e => setTestPlaintext(e.target.value)}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleTestEncrypt}
                className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm shadow-blue-500/20"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Encrypt with AES-GCM</span>
              </button>
              <button
                onClick={handleTestDecrypt}
                disabled={!encryptedOutput}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Unlock className="w-3.5 h-3.5 text-amber-400" />
                <span>Decrypt with Key</span>
              </button>
            </div>

            {encryptedOutput && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Encrypted Ciphertext:</span>
                <div className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[11px] break-all border border-slate-800">
                  {encryptedOutput}
                </div>
              </div>
            )}

            {decryptedOutput && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Decrypted Plaintext:</span>
                <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl font-semibold text-xs border border-emerald-200 font-mono">
                  ✓ {decryptedOutput}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* GDPR Article 17 Right to Erasure Tool */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>GDPR Article 17 Right to Erasure Simulator</span>
            </h3>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full uppercase">
              Zero-Knowledge Proof
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Enables citizen data redaction from off-chain records while mathematical SHA-256 title hashes remain permanently verifiable on the blockchain ledger.
          </p>

          <div className="space-y-3.5 pt-1">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Select Property for PII Erasure:
              </label>
              <select
                value={erasurePropertyId}
                onChange={e => setErasurePropertyId(e.target.value)}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium"
              >
                <option value="">-- Choose Registered Parcel --</option>
                {properties.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.parcelId} — {p.address} ({p.currentOwner.name})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleExecuteErasure}
              disabled={!erasurePropertyId}
              className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              <Trash2 className="w-4 h-4" />
              <span>Execute Off-Chain PII Erasure & Log Proof</span>
            </button>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-xs space-y-1">
              <p className="font-bold text-slate-800 text-[11px]">Compliance Assurance:</p>
              <p className="text-[11px] leading-relaxed text-slate-500">
                Personal identity parameters are redacted into cryptographic tombstone records. Title continuity, cadastral boundaries, and smart contract execution history remain mathematically immutable.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Comprehensive Immutable Audit Trail Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-blue-600" />
              <span>Immutable Cadastral Action Audit Log</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Every deed verification, smart contract signature, and title conveyance recorded with cryptographic proof
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Compliance Categories</option>
              <option value="Cadastral_Act">Cadastral Act</option>
              <option value="Smart_Contract_Auth">Smart Contract Auth</option>
              <option value="GDPR_Article_6">GDPR Art. 6/17</option>
              <option value="AML_KYC">AML / Municipal KYC</option>
            </select>
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
              <tr>
                <th className="py-3 px-6">Timestamp & ID</th>
                <th className="py-3 px-6">Actor & Role</th>
                <th className="py-3 px-6">Action Type</th>
                <th className="py-3 px-6">Details & Target</th>
                <th className="py-3 px-6">Compliance & Proof</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-6 font-mono">
                    <div className="font-bold text-slate-900 text-xs">{log.id}</div>
                    <div className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleString()}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-semibold text-slate-900">{log.actor}</div>
                    <div className="text-[10px] text-slate-400 font-mono uppercase">{log.role}</div>
                  </td>
                  <td className="py-4 px-6 font-mono">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-4 px-6 max-w-sm">
                    <div className="font-medium text-slate-800 line-clamp-2">{log.details}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">Target: {log.targetId}</div>
                  </td>
                  <td className="py-4 px-6 font-mono text-[11px]">
                    <div className="text-emerald-700 font-semibold">{log.complianceCategory}</div>
                    <div className="text-slate-400 truncate max-w-xs">{log.signatureProof}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
