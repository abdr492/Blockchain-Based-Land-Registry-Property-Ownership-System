import React, { useState } from 'react';
import { useRegistry } from '../context/RegistryContext';
import { Property } from '../types';
import {
  FileText,
  ShieldCheck,
  ArrowRightLeft,
  Search,
  Sparkles,
  MapPin,
  Calendar,
  DollarSign,
  AlertTriangle,
  Lock,
  Unlock,
  CheckCircle2,
  ExternalLink,
  Layers,
  ChevronRight,
  Filter,
  Eye,
  Building2,
  Scale,
  Award,
} from 'lucide-react';
import { formatAddress, formatCurrency, decryptSensitivePII, getPropertyCoordinates } from '../utils/crypto';
import { PropertyValuationSparkline } from './PropertyValuationSparkline';

interface CitizenPortfolioViewProps {
  onInspectDeed: (property: Property) => void;
  onInitiateTransfer: (property: Property) => void;
  onAiExplain: (property: Property) => void;
  onAiAudit: (property: Property) => void;
}

export const CitizenPortfolioView: React.FC<CitizenPortfolioViewProps> = ({
  onInspectDeed,
  onInitiateTransfer,
  onAiExplain,
  onAiAudit,
}) => {
  const {
    properties,
    currentUser,
    currentRole,
    setActiveView,
    setSelectedProperty,
    blockchainBlocks,
    notifications,
    showToast,
  } = useRegistry();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterOwnerOnly, setFilterOwnerOnly] = useState(false);
  const [selectedZoning, setSelectedZoning] = useState<string>('all');
  const [decryptedPiiMap, setDecryptedPiiMap] = useState<Record<string, string>>({});

  const myProperties = properties.filter(
    p => p.currentOwner.walletAddress.toLowerCase() === currentUser.walletAddress.toLowerCase()
  );

  // Primary featured asset
  const primaryAsset = myProperties[0] || properties[0];

  // Filter properties
  const filteredProperties = properties.filter(prop => {
    if (filterOwnerOnly && prop.currentOwner.walletAddress.toLowerCase() !== currentUser.walletAddress.toLowerCase()) {
      return false;
    }
    if (selectedZoning !== 'all' && prop.zoning !== selectedZoning) {
      return false;
    }
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      prop.address.toLowerCase().includes(q) ||
      prop.titleNumber.toLowerCase().includes(q) ||
      prop.parcelId.toLowerCase().includes(q) ||
      prop.currentOwner.name.toLowerCase().includes(q) ||
      prop.cadastralDistrict.toLowerCase().includes(q)
    );
  });

  const totalValue = properties.reduce((acc, p) => acc + p.estimatedValueUSD, 0);
  const myTotalValue = myProperties.reduce((acc, p) => acc + p.estimatedValueUSD, 0);

  const handleToggleDecrypt = async (propId: string, encryptedPii: string) => {
    if (decryptedPiiMap[propId]) {
      const copy = { ...decryptedPiiMap };
      delete copy[propId];
      setDecryptedPiiMap(copy);
    } else {
      const dec = await decryptSensitivePII(encryptedPii);
      setDecryptedPiiMap(prev => ({ ...prev, [propId]: dec }));
    }
  };

  const getStatusBadge = (status: Property['status']) => {
    switch (status) {
      case 'Verified':
        return (
          <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold uppercase">
            Legal Title Active
          </span>
        );
      case 'Pending_Transfer':
        return (
          <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-bold uppercase">
            Transfer Pending
          </span>
        );
      case 'In_Dispute':
        return (
          <span className="px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-[10px] font-bold uppercase">
            Boundary Dispute
          </span>
        );
      case 'Encumbered':
        return (
          <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-[10px] font-bold uppercase">
            Encumbered
          </span>
        );
      default:
        return null;
    }
  };

  // Compile recent audit events from blockchain
  const auditEvents = blockchainBlocks.flatMap(block =>
    block.transactions.map(tx => ({
      type: tx.type === 'Genesis_Title_Mint' ? 'Title Genesis Mint' : tx.type === 'Title_Conveyance' ? 'Title Transfer Closing' : 'Survey Verification',
      hash: tx.txHash,
      timestamp: new Date(tx.timestamp).toISOString().replace('T', ' ').slice(0, 16),
      status: 'CONFIRMED',
      dotColor: tx.type === 'Genesis_Title_Mint' ? 'bg-blue-500' : tx.type === 'Title_Conveyance' ? 'bg-indigo-500' : 'bg-emerald-500',
    }))
  ).slice(-4).reverse();

  return (
    <div className="space-y-8">
      {/* Top Bento Row: 8-col Primary Asset & Audit Log + 4-col Government Control & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Primary Ownership Asset Card */}
          {primaryAsset && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div>
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Primary Ownership Asset
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 font-mono">
                    Smart Contract: {primaryAsset.titleDeedHash.slice(0, 14)}...
                    {primaryAsset.titleDeedHash.slice(-4)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(primaryAsset.status)}
                  <button
                    onClick={() => onAiAudit(primaryAsset)}
                    className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-bold uppercase hover:bg-indigo-100 transition flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-indigo-600" />
                    <span>AI Audit</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
                {/* Visual Asset Preview Box */}
                <div className="sm:col-span-5 space-y-3">
                  <div className="aspect-video sm:aspect-4/3 bg-slate-900 rounded-xl overflow-hidden relative flex items-center justify-center p-4 border border-slate-800 text-white">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-slate-900 to-slate-950" />
                    
                    {/* Isometric Plot Icon Visual */}
                    <div className="relative z-10 text-center space-y-2">
                      <div className="w-12 h-12 bg-blue-500/20 border border-blue-400/40 rounded-2xl flex items-center justify-center mx-auto text-blue-400 shadow-lg shadow-blue-500/20">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div className="text-[11px] font-mono text-slate-300">
                        {getPropertyCoordinates(primaryAsset).latitude.toFixed(4)}° N,{' '}
                        {Math.abs(getPropertyCoordinates(primaryAsset).longitude).toFixed(4)}° W
                      </div>
                    </div>

                    <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-md text-[10px] font-bold font-mono text-slate-900 shadow-xs">
                      ID: {primaryAsset.parcelId}
                    </div>
                  </div>
                </div>

                {/* Asset Metadata & Verification Details */}
                <div className="sm:col-span-7 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                      {primaryAsset.address}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{primaryAsset.cadastralDistrict}</span>
                      <span>•</span>
                      <span className="font-semibold text-slate-700">{primaryAsset.zoning}</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">
                        Cadastral Valuation
                      </span>
                      <p className="text-sm font-bold text-slate-900">
                        {formatCurrency(primaryAsset.estimatedValueUSD)}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">
                        Surveyed Area
                      </span>
                      <p className="text-sm font-semibold text-slate-700">
                        {primaryAsset.areaSqMeters.toLocaleString()} m²
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">
                        Last Verified
                      </span>
                      <p className="text-xs font-semibold text-slate-700">
                        {primaryAsset.registrationDate}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">
                        Digital Signature
                      </span>
                      <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Authorized ✓
                      </p>
                    </div>
                  </div>

                  {/* Actions for Primary Asset */}
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      id="btn-inspect-primary"
                      onClick={() => onInspectDeed(primaryAsset)}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-400" />
                      <span>Inspect Title Deed</span>
                    </button>

                    <button
                      id="btn-transfer-primary"
                      onClick={() => onInitiateTransfer(primaryAsset)}
                      className="px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-blue-500/20"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      <span>Initiate Transfer</span>
                    </button>

                    <button
                      onClick={() => onAiExplain(primaryAsset)}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Plain English Deed</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Historical Valuation Trends Sparkline Chart for Primary Asset */}
              <div className="pt-2 border-t border-slate-100">
                <PropertyValuationSparkline
                  property={primaryAsset}
                  variant="hero"
                  showMetrics={true}
                />
              </div>
            </div>
          )}

          {/* Blockchain Audit Log Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Blockchain Audit Log
              </h2>
              <button
                onClick={() => {
                  showToast('Exported verified ledger records to CSV', 'info');
                }}
                className="text-[10px] text-blue-600 font-bold uppercase tracking-tight hover:underline"
              >
                Export CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Event Type
                    </th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Authority Hash
                    </th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {auditEvents.map((ev, i) => (
                    <tr
                      key={i}
                      className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 ${ev.dotColor} rounded-full`}></div>
                          <span className="text-xs font-semibold text-slate-900">{ev.type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-500">
                        {ev.hash.slice(0, 8)}...{ev.hash.slice(-4)}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600">{ev.timestamp}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold">
                          {ev.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Government Control Card */}
          <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Government Control
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>

            <div className="space-y-4">
              <div className="p-3.5 bg-slate-800 rounded-xl flex items-center justify-between border border-slate-700/60">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-white">Official Oversight</span>
                  <span className="text-[10px] text-slate-400">Cadastral Division Reg-12</span>
                </div>
                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-white shadow-xs">
                  ✓
                </div>
              </div>

              <div className="p-4 border border-slate-700/70 bg-slate-800/40 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Access Level
                  </span>
                  <span className="text-[10px] font-bold text-blue-400 font-mono">
                    TIER 3 (READ / SIGN)
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="w-3/4 h-full bg-blue-500 rounded-full"></div>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Cryptographic ECDSA key authorized for title deed conveyance & notarization.
                </p>
              </div>

              {primaryAsset && (
                <button
                  onClick={() => onInitiateTransfer(primaryAsset)}
                  className="w-full py-3 bg-white text-slate-900 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-blue-50 transition-colors shadow-sm"
                >
                  Initiate Transfer
                </button>
              )}
            </div>
          </div>

          {/* Notifications Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                System Notifications
              </h3>
              <span className="text-[10px] font-mono text-slate-400">LATEST</span>
            </div>

            <div className="space-y-3.5">
              <div className="flex gap-3 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 shrink-0 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-xs">
                  ℹ️
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">System Compliance Update</p>
                  <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                    Regional data privacy v4.2 & GDPR protocols applied to your cadastral registry.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 shrink-0 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 text-xs">
                  ⚠️
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">Transfer Pending Signature</p>
                  <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                    Municipal surveyor verified parcel. Waiting for smart contract multi-party digital signature.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="input-property-search"
            type="text"
            placeholder="Search by address, parcel CAD ID, deed number, or owner name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            id="select-zoning-filter"
            value={selectedZoning}
            onChange={e => setSelectedZoning(e.target.value)}
            className="px-3.5 py-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Zoning Types</option>
            <option value="Residential">Residential</option>
            <option value="Commercial">Commercial</option>
            <option value="Agricultural">Agricultural</option>
            <option value="Mixed-Use">Mixed-Use</option>
          </select>

          <button
            id="btn-filter-my-props"
            onClick={() => setFilterOwnerOnly(!filterOwnerOnly)}
            className={`px-4 py-2.5 text-xs font-semibold rounded-xl border transition whitespace-nowrap flex items-center gap-2 ${
              filterOwnerOnly
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span>My Registered Titles</span>
            {myProperties.length > 0 && (
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  filterOwnerOnly ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-800'
                }`}
              >
                {myProperties.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Property Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-semibold text-slate-800">No properties matched your search</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search terms or toggle off the "My Registered Titles" filter to explore all registered titles.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterOwnerOnly(false);
                setSelectedZoning('all');
              }}
              className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredProperties.map(property => {
            const isOwner =
              property.currentOwner.walletAddress.toLowerCase() === currentUser.walletAddress.toLowerCase();
            const isPiiDecrypted = Boolean(decryptedPiiMap[property.id]);

            return (
              <div
                key={property.id}
                id={`card-prop-${property.id}`}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group"
              >
                {/* Card Header */}
                <div className="p-5 border-b border-slate-100 space-y-2 bg-gradient-to-b from-slate-50/50 to-white">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                        {property.parcelId}
                      </span>
                      <span className="text-[11px] font-medium text-slate-500">
                        {property.zoning}
                      </span>
                    </div>
                    {getStatusBadge(property.status)}
                  </div>

                  <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-blue-600 transition-colors">
                    {property.address}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{property.cadastralDistrict}</span>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="px-5 py-3.5 bg-slate-50/60 border-b border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Area</span>
                    <p className="font-bold text-slate-800">{property.areaSqMeters.toLocaleString()} m²</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Valuation</span>
                    <p className="font-bold text-emerald-700">{formatCurrency(property.estimatedValueUSD)}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Muni Tax</span>
                    <p className="font-bold text-slate-800">
                      {property.taxStatus === 'Cleared' ? (
                        <span className="text-emerald-600 font-semibold">Cleared</span>
                      ) : (
                        <span className="text-amber-600 font-semibold">${property.annualTaxUSD} Due</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Recharts Historical Valuation Trend Sparkline */}
                <div className="px-5 pt-3.5">
                  <PropertyValuationSparkline property={property} variant="card" />
                </div>

                {/* Ownership & Encryption Info */}
                <div className="p-5 space-y-3.5 flex-1">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Registered Owner:</span>
                      {isOwner && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          You (Current Persona)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 text-sm">{property.currentOwner.name}</span>
                      <span className="font-mono text-xs text-slate-400">
                        {formatAddress(property.currentOwner.walletAddress)}
                      </span>
                    </div>

                    {/* Encrypted National ID simulation */}
                    <div className="flex items-center justify-between text-[11px] bg-slate-100/70 p-2.5 rounded-xl mt-1 font-mono">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Lock className="w-3 h-3 text-blue-600" />
                        <span>PII ID:</span>
                        <span className="text-slate-800">
                          {isPiiDecrypted
                            ? decryptedPiiMap[property.id]
                            : `${property.currentOwner.nationalIdEncrypted.slice(0, 16)}...`}
                        </span>
                      </div>
                      <button
                        onClick={() => handleToggleDecrypt(property.id, property.currentOwner.nationalIdEncrypted)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-[10px] flex items-center gap-0.5"
                      >
                        {isPiiDecrypted ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        {isPiiDecrypted ? 'Hide' : 'E2E Decrypt'}
                      </button>
                    </div>
                  </div>

                  {/* Blockchain Hash */}
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Blockchain Deed Hash:</span>
                      <span className="text-emerald-600 font-medium">100% On-Chain</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[11px] truncate flex items-center justify-between">
                      <span>{property.titleDeedHash.slice(0, 24)}...</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1" />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      id={`btn-inspect-deed-${property.id}`}
                      onClick={() => onInspectDeed(property)}
                      className="w-full py-2.5 px-3 rounded-xl bg-white border border-slate-200 text-slate-800 font-semibold text-xs hover:bg-slate-100 transition flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span>Inspect Deed</span>
                    </button>

                    {isOwner ? (
                      <button
                        id={`btn-transfer-${property.id}`}
                        onClick={() => onInitiateTransfer(property)}
                        disabled={property.status === 'Pending_Transfer' || property.status === 'In_Dispute'}
                        className={`w-full py-2.5 px-3 rounded-xl font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-xs ${
                          property.status === 'Pending_Transfer' || property.status === 'In_Dispute'
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        <span>Smart Transfer</span>
                      </button>
                    ) : (
                      <button
                        id={`btn-view-cadastral-${property.id}`}
                        onClick={() => {
                          setSelectedProperty(property);
                          setActiveView('map');
                        }}
                        className="w-full py-2.5 px-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 font-semibold text-xs hover:bg-blue-100 transition flex items-center justify-center gap-1.5"
                      >
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                        <span>GIS Plot Map</span>
                      </button>
                    )}
                  </div>

                  {/* AI Quick Tools */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => onAiExplain(property)}
                      className="flex-1 py-2 px-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-[11px] font-medium transition flex items-center justify-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-blue-600" />
                      <span>AI Deed Explain</span>
                    </button>
                    <button
                      onClick={() => onAiAudit(property)}
                      className="flex-1 py-2 px-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-[11px] font-medium transition flex items-center justify-center gap-1"
                    >
                      <ShieldCheck className="w-3 h-3 text-indigo-600" />
                      <span>AI Title Audit</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
