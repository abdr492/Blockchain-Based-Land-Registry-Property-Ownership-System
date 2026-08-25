import React, { useState } from 'react';
import { useRegistry } from '../context/RegistryContext';
import { Property } from '../types';
import {
  Bell,
  Key,
  Menu,
  Lock,
  Layers,
  ChevronDown,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { formatAddress } from '../utils/crypto';
import { GlobalSearchBar } from './GlobalSearchBar';

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenWalletModal: () => void;
  onInspectProperty?: (property: Property) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onOpenWalletModal,
  onInspectProperty,
}) => {
  const {
    activeView,
    blockchainBlocks,
    notifications,
    markNotificationAsRead,
    currentUser,
    isMining,
    isWeb3Connected,
    web3Account,
  } = useRegistry();

  const [showNotifs, setShowNotifs] = useState(false);

  const unreadNotifs = notifications.filter(n => !n.read);
  const latestBlock = blockchainBlocks.length - 1;

  const viewTitles: Record<string, { title: string; subtitle: string }> = {
    portfolio: {
      title: 'Property Overview',
      subtitle: 'Verified Blockchain Registry Status',
    },
    authority: {
      title: 'Registrar Authority Portal',
      subtitle: 'Municipal Title Verification & Dispute Settlement',
    },
    contracts: {
      title: 'Smart Transfer Contracts',
      subtitle: 'Multi-Signature Autonomous Title Conveyance',
    },
    map: {
      title: 'Cadastral GIS Map',
      subtitle: 'Interactive Geospatial Land Plot & Boundary System',
    },
    explorer: {
      title: 'Blockchain Ledger Explorer',
      subtitle: 'Immutable Block Sequence & Cryptographic Hash Audit',
    },
    audit_privacy: {
      title: 'Audit & Compliance Center',
      subtitle: 'GDPR Art. 17 Off-Chain PII Erasure & Zero-Knowledge Verification',
    },
  };

  const currentViewInfo = viewTitles[activeView] || {
    title: 'Cadastral Registry',
    subtitle: 'Blockchain Title Ledger',
  };

  return (
    <header className="h-20 bg-white border-b border-slate-200 px-6 sm:px-8 flex items-center justify-between shrink-0 z-30">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-4 shrink-0">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 lg:hidden"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col">
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
            {currentViewInfo.title}
          </h1>
          <p className="text-xs text-slate-500 hidden sm:flex items-center gap-1.5">
            <span>{currentViewInfo.subtitle}:</span>
            <span className="text-emerald-600 font-semibold inline-flex items-center gap-1">
              Synchronized
            </span>
          </p>
        </div>
      </div>

      {/* Center: Global Property Search Bar across all views */}
      <div className="flex-1 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-3 sm:mx-6">
        <GlobalSearchBar onInspectProperty={onInspectProperty} />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* Encryption Active Badge */}
        <div className="hidden md:flex relative px-3.5 py-1.5 bg-slate-100 rounded-lg items-center gap-2.5">
          <span className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse"></span>
          <span className="text-[11px] font-medium text-slate-700 uppercase tracking-wider">
            Encryption Active
          </span>
        </div>

        {/* Block Height Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-mono text-slate-700">
          <span className="text-slate-400">Block</span>
          <span className="font-semibold text-slate-900">#{latestBlock}</span>
          {isMining && (
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" title="Mining Block..." />
          )}
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            id="btn-header-notifs"
            onClick={() => setShowNotifs(!showNotifs)}
            className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center relative hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition shadow-2xs"
            aria-label="Notifications"
          >
            {unreadNotifs.length > 0 && (
              <div className="w-2.5 h-2.5 bg-rose-500 rounded-full absolute top-2 right-2 border-2 border-white" />
            )}
            <Bell className="w-4 h-4" />
          </button>

          {showNotifs && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowNotifs(false)} />
              <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-40 animate-in fade-in duration-100">
                <div className="px-5 py-2 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">Registry Notifications</span>
                    {unreadNotifs.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-100 text-rose-700 font-bold">
                        {unreadNotifs.length} new
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">LIVE FEED</span>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">No recent notifications</div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationAsRead(n.id)}
                        className={`p-3.5 text-xs transition cursor-pointer hover:bg-slate-50/80 ${
                          !n.read ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                            {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />}
                            {n.title}
                          </div>
                          <span className="text-[10px] text-slate-400 shrink-0 whitespace-nowrap">{n.timestamp}</span>
                        </div>
                        <p className="text-slate-600 mt-1 text-[11px] leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Cryptographic Key & Wallet Button */}
        <button
          id="btn-header-wallet"
          onClick={onOpenWalletModal}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-white text-xs font-semibold transition shadow-xs ${
            isWeb3Connected ? 'bg-indigo-900 hover:bg-indigo-800 ring-2 ring-indigo-500' : 'bg-slate-900 hover:bg-slate-800'
          }`}
        >
          <Key className={`w-3.5 h-3.5 ${isWeb3Connected ? 'text-emerald-400' : 'text-amber-400'}`} />
          <span className="hidden sm:inline font-mono">
            {formatAddress(isWeb3Connected && web3Account ? web3Account : currentUser.walletAddress)}
          </span>
          <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
            isWeb3Connected ? 'bg-emerald-800 text-emerald-300' : 'bg-slate-800 text-emerald-400'
          }`}>
            {isWeb3Connected ? 'METAMASK' : 'ECDSA'}
          </span>
        </button>
      </div>
    </header>
  );
};
