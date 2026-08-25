import React, { useState } from 'react';
import { useRegistry } from '../context/RegistryContext';
import { UserRole } from '../types';
import {
  Shield,
  Key,
  Bell,
  Layers,
  MapPin,
  FileText,
  Lock,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Building2,
  Scale,
  Sparkles,
  ChevronDown,
  X,
  ExternalLink,
} from 'lucide-react';
import { formatAddress } from '../utils/crypto';

interface NavbarProps {
  onOpenWalletModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenWalletModal }) => {
  const {
    currentRole,
    currentUser,
    switchRole,
    activeView,
    setActiveView,
    blockchainBlocks,
    notifications,
    markNotificationAsRead,
    isMining,
  } = useRegistry();

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const unreadNotifs = notifications.filter(n => !n.read);
  const latestBlockIndex = blockchainBlocks.length - 1;

  const roleConfigs: Record<
    UserRole,
    { label: string; icon: React.ElementType; badgeColor: string; description: string }
  > = {
    citizen: {
      label: 'Citizen / Owner',
      icon: UserCheck,
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      description: 'View deeds, initiate smart transfers, sign with private key',
    },
    registrar: {
      label: 'Chief Land Registrar',
      icon: Building2,
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      description: 'Verify titles, execute smart contracts, mint new blocks',
    },
    notary: {
      label: 'Notary & Surveyor',
      icon: Scale,
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      description: 'Certify cadastral surveys, seal deeds, audit encumbrances',
    },
    auditor: {
      label: 'Compliance Auditor',
      icon: Shield,
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      description: 'Audit Merkle roots, GDPR compliance, immutable logs',
    },
  };

  const navTabs = [
    { id: 'portfolio', label: 'Citizen Portfolio', icon: FileText },
    { id: 'authority', label: 'Registrar Authority', icon: Building2 },
    { id: 'contracts', label: 'Smart Transfers', icon: Cpu },
    { id: 'map', label: 'Cadastral GIS Map', icon: MapPin },
    { id: 'explorer', label: 'Blockchain Ledger', icon: Layers },
    { id: 'audit_privacy', label: 'Audit & Privacy', icon: Shield },
  ] as const;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      {/* Top Ledger Status Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-3 font-mono">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>CadastralPoA Mainnet Active</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-slate-400">
            <span>Block Height:</span>
            <span className="text-white font-semibold">#{latestBlockIndex}</span>
            {isMining && (
              <span className="ml-1 px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded text-[10px] animate-pulse">
                Mining Block...
              </span>
            )}
          </div>
          <div className="hidden md:flex items-center gap-1 text-slate-400">
            <span>Consensus:</span>
            <span className="text-slate-200">Proof-of-Authority (PoA v2.6)</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Lock className="w-3 h-3 text-cyan-400" />
            <span className="hidden sm:inline">Encryption:</span>
            <span className="text-cyan-300 font-semibold">AES-256-GCM + ECDSA</span>
          </div>
          <div className="hidden lg:flex items-center gap-1 text-slate-400">
            <span>GDPR Compliance:</span>
            <span className="text-emerald-400 font-medium">100% Certified</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveView('portfolio')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">GeoTrust</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Land Registry
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Blockchain Smart Contract Land Ownership & Cadastral Verification
              </p>
            </div>
          </div>

          {/* Right Actions: Persona Switcher, Notifications, Wallet Key */}
          <div className="flex items-center gap-2.5">
            {/* Persona / Role Selector Dropdown */}
            <div className="relative">
              <button
                id="btn-role-switcher"
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                  roleConfigs[currentRole].badgeColor
                } hover:shadow-xs`}
              >
                {React.createElement(roleConfigs[currentRole].icon, { className: 'w-4 h-4' })}
                <div className="text-left hidden sm:block">
                  <div className="font-semibold leading-tight">{currentUser.name}</div>
                  <div className="text-[10px] opacity-80">{roleConfigs[currentRole].label}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 opacity-70 ml-0.5" />
              </button>

              {showRoleDropdown && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setShowRoleDropdown(false)} />
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-30 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3.5 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900">Switch Role-Based Persona</p>
                      <p className="text-[11px] text-slate-500">Test different municipal authority & citizen workflows</p>
                    </div>
                    <div className="p-1 space-y-1">
                      {(Object.keys(roleConfigs) as UserRole[]).map(role => {
                        const config = roleConfigs[role];
                        const isSelected = currentRole === role;
                        const RoleIcon = config.icon;
                        return (
                          <button
                            key={role}
                            id={`role-opt-${role}`}
                            onClick={() => {
                              switchRole(role);
                              setShowRoleDropdown(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg flex items-start gap-2.5 text-xs transition-colors ${
                              isSelected ? 'bg-indigo-50/80 text-indigo-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <div className={`p-1.5 rounded-md ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                              <RoleIcon className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{config.label}</span>
                                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                              </div>
                              <p className="text-[10px] text-slate-500 line-clamp-1">{config.description}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                id="btn-notifications"
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition relative"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifs.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadNotifs.length}
                  </span>
                )}
              </button>

              {showNotifDropdown && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setShowNotifDropdown(false)} />
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-30 animate-in fade-in duration-100">
                    <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900">Registry Notifications</span>
                        {unreadNotifs.length > 0 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-100 text-rose-700 font-bold">
                            {unreadNotifs.length} new
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">Live Status Feed</span>
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-400">No recent notifications</div>
                      ) : (
                        notifications.map(n => (
                          <div
                            key={n.id}
                            onClick={() => markNotificationAsRead(n.id)}
                            className={`p-3 text-xs transition cursor-pointer hover:bg-slate-50 ${
                              !n.read ? 'bg-blue-50/40' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                                {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                                {n.title}
                              </div>
                              <span className="text-[10px] text-slate-400 whitespace-nowrap">{n.timestamp}</span>
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

            {/* Cryptographic Key & Wallet Modal Button */}
            <button
              id="btn-open-wallet"
              onClick={onOpenWalletModal}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-xs font-medium transition shadow-xs"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline font-mono">{formatAddress(currentUser.walletAddress)}</span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-emerald-400 border border-slate-700">
                ECDSA Keys
              </span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar border-t border-slate-100 py-1.5">
          {navTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeView === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveView(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
