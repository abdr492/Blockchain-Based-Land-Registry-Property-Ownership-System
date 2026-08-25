/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RegistryProvider, useRegistry } from './context/RegistryContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { CitizenPortfolioView } from './components/CitizenPortfolioView';
import { RegistrarAuthorityView } from './components/RegistrarAuthorityView';
import { SmartContractView } from './components/SmartContractView';
import { CadastralMapView } from './components/CadastralMapView';
import { BlockchainExplorerView } from './components/BlockchainExplorerView';
import { AuditPrivacyCenterView } from './components/AuditPrivacyCenterView';

import { TitleDeedModal } from './components/TitleDeedModal';
import { InitiateTransferModal } from './components/InitiateTransferModal';
import { NewTitleModal } from './components/NewTitleModal';
import { WalletKeyModal } from './components/WalletKeyModal';
import { AiAuditModal } from './components/AiAuditModal';
import { Property, SmartContractTransfer } from './types';

import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { activeView, toast } = useRegistry();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modal States
  const [inspectingProperty, setInspectingProperty] = useState<Property | null>(null);
  const [transferringProperty, setTransferringProperty] = useState<Property | null>(null);
  const [showNewTitleModal, setShowNewTitleModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);

  // AI Modal States
  const [aiModalProperty, setAiModalProperty] = useState<Property | null>(null);
  const [aiModalContract, setAiModalContract] = useState<SmartContractTransfer | null>(null);
  const [aiModalMode, setAiModalMode] = useState<'audit' | 'explain' | 'valuation'>('audit');
  const [showAiModal, setShowAiModal] = useState(false);

  const handleOpenAiExplain = (prop: Property) => {
    setAiModalProperty(prop);
    setAiModalContract(null);
    setAiModalMode('explain');
    setShowAiModal(true);
  };

  const handleOpenAiAudit = (prop: Property) => {
    setAiModalProperty(prop);
    setAiModalContract(null);
    setAiModalMode('audit');
    setShowAiModal(true);
  };

  const handleOpenAiExplainContract = (contract: SmartContractTransfer) => {
    setAiModalProperty(null);
    setAiModalContract(contract);
    setAiModalMode('explain');
    setShowAiModal(true);
  };

  return (
    <div className="flex h-screen w-full font-sans bg-slate-50 text-slate-900 overflow-hidden">
      {/* Sleek Left Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenWalletModal={() => setShowWalletModal(true)}
      />

      {/* Main Column */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Header */}
        <Header
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenWalletModal={() => setShowWalletModal(true)}
          onInspectProperty={prop => setInspectingProperty(prop)}
        />

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-50">
          <div className="max-w-7xl mx-auto w-full space-y-6">
            {activeView === 'portfolio' && (
              <CitizenPortfolioView
                onInspectDeed={prop => setInspectingProperty(prop)}
                onInitiateTransfer={prop => setTransferringProperty(prop)}
                onAiExplain={handleOpenAiExplain}
                onAiAudit={handleOpenAiAudit}
              />
            )}

            {activeView === 'authority' && (
              <RegistrarAuthorityView
                onOpenNewTitleModal={() => setShowNewTitleModal(true)}
                onInspectContract={() => {}}
              />
            )}

            {activeView === 'contracts' && (
              <SmartContractView onAiExplainContract={handleOpenAiExplainContract} />
            )}

            {activeView === 'map' && (
              <CadastralMapView
                onInspectDeed={prop => setInspectingProperty(prop)}
                onInitiateTransfer={prop => setTransferringProperty(prop)}
              />
            )}

            {activeView === 'explorer' && <BlockchainExplorerView />}

            {activeView === 'audit_privacy' && <AuditPrivacyCenterView />}
          </div>
        </main>
      </div>

      {/* Modals */}
      {inspectingProperty && (
        <TitleDeedModal
          property={inspectingProperty}
          onClose={() => setInspectingProperty(null)}
          onAiExplain={handleOpenAiExplain}
        />
      )}

      {transferringProperty && (
        <InitiateTransferModal
          property={transferringProperty}
          onClose={() => setTransferringProperty(null)}
          onAiPreAudit={handleOpenAiAudit}
        />
      )}

      {showNewTitleModal && (
        <NewTitleModal onClose={() => setShowNewTitleModal(false)} />
      )}

      {showWalletModal && (
        <WalletKeyModal onClose={() => setShowWalletModal(false)} />
      )}

      {showAiModal && (
        <AiAuditModal
          property={aiModalProperty}
          smartContract={aiModalContract}
          mode={aiModalMode}
          onClose={() => {
            setShowAiModal(false);
            setAiModalProperty(null);
            setAiModalContract(null);
          }}
        />
      )}

      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-xs font-medium text-white ${
              toast.type === 'success'
                ? 'bg-slate-900 border-emerald-500/50'
                : toast.type === 'error'
                ? 'bg-rose-900 border-rose-500/50'
                : 'bg-slate-900 border-blue-500/50'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-blue-400 shrink-0" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <RegistryProvider>
      <MainAppContent />
    </RegistryProvider>
  );
}
