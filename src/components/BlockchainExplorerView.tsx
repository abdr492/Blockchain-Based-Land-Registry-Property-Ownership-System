import React, { useState } from 'react';
import { useRegistry } from '../context/RegistryContext';
import { BlockchainBlock, BlockchainTransaction } from '../types';
import {
  Layers,
  Search,
  CheckCircle2,
  Lock,
  Cpu,
  Clock,
  Key,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Copy,
  Check,
  Hash,
  Database,
} from 'lucide-react';
import { formatAddress } from '../utils/crypto';

export const BlockchainExplorerView: React.FC = () => {
  const { blockchainBlocks, isMining, showToast } = useRegistry();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedBlockIndex, setExpandedBlockIndex] = useState<number | null>(blockchainBlocks.length - 1);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    showToast(`Copied ${label} to clipboard!`, 'info');
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const totalTransactions = blockchainBlocks.reduce((acc, b) => acc + b.transactions.length, 0);

  const filteredBlocks = blockchainBlocks.filter(block => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const matchesBlock =
      block.index.toString() === q ||
      block.hash.toLowerCase().includes(q) ||
      block.merkleRoot.toLowerCase().includes(q) ||
      block.previousHash.toLowerCase().includes(q);

    const matchesTx = block.transactions.some(
      tx =>
        tx.txHash.toLowerCase().includes(q) ||
        tx.propertyId.toLowerCase().includes(q) ||
        tx.from.toLowerCase().includes(q) ||
        tx.to.toLowerCase().includes(q) ||
        tx.payloadSummary.toLowerCase().includes(q)
    );

    return matchesBlock || matchesTx;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-medium">
            <Layers className="w-3.5 h-3.5" />
            <span>Decentralized Cadastral Proof-of-Authority Ledger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Blockchain Explorer & Merkle Tree Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Verify cryptographic block integrity, Merkle root calculations, SHA-256 hash chaining, and validator node signatures.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-800/70 p-4 rounded-2xl border border-slate-700/60 shrink-0 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Block Height</span>
            <p className="text-xl font-bold text-white mt-0.5">#{blockchainBlocks.length - 1}</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Txs</span>
            <p className="text-xl font-bold text-emerald-400 mt-0.5">{totalTransactions}</p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Consensus</span>
            <p className="text-xs font-bold text-blue-400 mt-1 font-mono">PoA v2.6 Active</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          id="input-ledger-search"
          type="text"
          placeholder="Search by Block Index, SHA-256 Hash, Merkle Root, Tx Hash, or Parcel ID..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full text-xs sm:text-sm bg-transparent focus:outline-none text-slate-800 placeholder-slate-400"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs text-slate-400 hover:text-slate-600 font-medium"
          >
            Clear
          </button>
        )}
      </div>

      {/* Blocks Feed */}
      <div className="space-y-4">
        {filteredBlocks
          .slice()
          .reverse()
          .map(block => {
            const isExpanded = expandedBlockIndex === block.index;
            return (
              <div
                key={block.index}
                id={`block-card-${block.index}`}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-200"
              >
                {/* Block Header Summary */}
                <div
                  onClick={() => setExpandedBlockIndex(isExpanded ? null : block.index)}
                  className="p-5 sm:p-6 cursor-pointer hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100"
                >
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex flex-col items-center justify-center font-mono shrink-0 shadow-xs">
                      <span className="text-[9px] text-slate-400 uppercase">Block</span>
                      <span className="font-bold text-sm">#{block.index}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">
                          Hash: {block.hash.slice(0, 20)}...
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {block.transactions.length} Transactions
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {new Date(block.timestamp).toLocaleString()}
                        </span>
                        <span>• Nonce: {block.nonce}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <span className="text-xs text-slate-500 font-medium hidden md:inline">
                      {block.validatorNode}
                    </span>
                    <button className="p-1 text-slate-400 hover:text-slate-600">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Block Details */}
                {isExpanded && (
                  <div className="p-6 sm:p-8 bg-slate-50/50 space-y-5 border-t border-slate-100 animate-in fade-in duration-150">
                    {/* Cryptographic Hashes Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                      <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1">
                        <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center justify-between">
                          <span>Previous Block Hash (Linked)</span>
                          <button
                            onClick={() => handleCopy(block.previousHash, 'Previous Hash')}
                            className="text-slate-400 hover:text-blue-600"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="text-slate-800 break-all">{block.previousHash}</div>
                      </div>

                      <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1">
                        <div className="text-blue-600 text-[10px] uppercase font-bold flex items-center justify-between">
                          <span>Merkle Root Hash</span>
                          <button
                            onClick={() => handleCopy(block.merkleRoot, 'Merkle Root')}
                            className="text-slate-400 hover:text-blue-600"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="text-slate-800 break-all">{block.merkleRoot}</div>
                      </div>
                    </div>

                    {/* Transactions Ledger inside Block */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                          Block #{block.index} Confirmed Transactions ({block.transactions.length})
                        </h4>
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>100% Cryptographically Verified</span>
                        </span>
                      </div>

                      <div className="divide-y divide-slate-200 bg-white rounded-xl border border-slate-200 overflow-hidden">
                        {block.transactions.map((tx, idx) => (
                          <div key={tx.txHash || idx} className="p-4 space-y-2 text-xs">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                                  {tx.type}
                                </span>
                                <span className="font-mono text-slate-800 text-[11px] truncate max-w-xs">
                                  Tx: {tx.txHash.slice(0, 24)}...
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-400 font-mono">
                                Gas: {tx.gasFee} • Status: {tx.status}
                              </span>
                            </div>

                            <p className="text-slate-700 text-xs font-medium">{tx.payloadSummary}</p>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 font-mono bg-slate-50 p-2.5 rounded-lg">
                              <span>
                                <strong>From:</strong> {formatAddress(tx.from)}
                              </span>
                              <span>
                                <strong>To:</strong> {formatAddress(tx.to)}
                              </span>
                              <span className="truncate">
                                <strong>Sig:</strong> {tx.digitalSignature.slice(0, 16)}...
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};
