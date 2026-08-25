import React, { useState } from 'react';
import { useRegistry } from '../context/RegistryContext';
import { UserRole } from '../types';
import {
  Layers,
  FileText,
  Building2,
  Cpu,
  MapPin,
  Shield,
  UserCheck,
  Scale,
  CheckCircle2,
  ChevronDown,
  X,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenWalletModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onOpenWalletModal }) => {
  const {
    activeView,
    setActiveView,
    currentUser,
    currentRole,
    switchRole,
    smartContracts,
    properties,
  } = useRegistry();

  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const pendingTransfersCount = smartContracts.filter(
    c => c.status !== 'Executed_Minted' && c.status !== 'Rejected'
  ).length;

  const roleConfigs: Record<
    UserRole,
    { label: string; icon: React.ElementType; badgeColor: string; title: string }
  > = {
    citizen: {
      label: 'Citizen / Owner',
      icon: UserCheck,
      badgeColor: 'bg-emerald-500',
      title: 'Citizen Node',
    },
    registrar: {
      label: 'Chief Land Registrar',
      icon: Building2,
      badgeColor: 'bg-blue-500',
      title: 'Registrar Authority',
    },
    notary: {
      label: 'Notary & Surveyor',
      icon: Scale,
      badgeColor: 'bg-amber-500',
      title: 'Surveyor Node',
    },
    auditor: {
      label: 'Compliance Auditor',
      icon: Shield,
      badgeColor: 'bg-purple-500',
      title: 'Auditor Node',
    },
  };

  interface NavItem {
    id: 'portfolio' | 'authority' | 'contracts' | 'map' | 'explorer' | 'audit_privacy';
    label: string;
    badge?: string;
  }

  const navItems: NavItem[] = [
    { id: 'portfolio', label: 'My Properties', badge: properties.length.toString() },
    { id: 'contracts', label: 'Transfer Registry', badge: pendingTransfersCount > 0 ? pendingTransfersCount.toString() : undefined },
    { id: 'authority', label: 'Verification Portal' },
    { id: 'map', label: 'Cadastral GIS Map' },
    { id: 'explorer', label: 'Blockchain Ledger' },
    { id: 'audit_privacy', label: 'Audit Logs' },
  ];

  const userInitials = currentUser.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sleek Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 flex items-center justify-between border-b border-slate-800/80">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => {
              setActiveView('portfolio');
              onClose();
            }}
          >
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/20">
              <div className="w-4 h-4 border-2 border-white rotate-45"></div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight leading-none text-white">TerraChain</span>
              <span className="text-[10px] text-slate-400 font-mono mt-0.5 tracking-wider uppercase">
                Cadastral Registry
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto no-scrollbar">
          {navItems.map(item => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                onClick={() => {
                  setActiveView(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      isActive ? 'bg-white' : 'bg-slate-600'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Persona & Node Status */}
        <div className="p-4 sm:p-6 border-t border-slate-800 relative">
          <div
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center justify-between gap-3 p-2 rounded-xl bg-slate-800/40 hover:bg-slate-800 cursor-pointer transition border border-slate-700/50"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-slate-700 shrink-0 overflow-hidden border border-slate-600 flex items-center justify-center text-xs font-bold text-slate-300">
                {userInitials}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-white truncate">{currentUser.name}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider truncate">
                  {roleConfigs[currentRole].title}
                </span>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </div>

          {/* Role Switching Popover */}
          {showRoleMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowRoleMenu(false)}
              />
              <div className="absolute bottom-full left-4 right-4 mb-2 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 border-b border-slate-700/60 mb-1">
                  <p className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">
                    Switch Active Node Role
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Switch cryptographic authority for verification & smart transfers
                  </p>
                </div>
                <div className="space-y-1">
                  {(Object.keys(roleConfigs) as UserRole[]).map(role => {
                    const cfg = roleConfigs[role];
                    const isSelected = currentRole === role;
                    const RoleIcon = cfg.icon;
                    return (
                      <button
                        key={role}
                        id={`sidebar-role-${role}`}
                        onClick={() => {
                          switchRole(role);
                          setShowRoleMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs transition ${
                          isSelected
                            ? 'bg-blue-600 text-white font-medium'
                            : 'hover:bg-slate-700/70 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <RoleIcon className="w-4 h-4 opacity-80" />
                          <span>{cfg.label}</span>
                        </div>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
};
