import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Property } from '../types';
import {
  X,
  ShieldCheck,
  Award,
  QrCode,
  MapPin,
  Calendar,
  Lock,
  Printer,
  ExternalLink,
  Layers,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  Building2,
  FileCheck2,
} from 'lucide-react';
import { formatAddress, formatCurrency } from '../utils/crypto';
import { PropertyValuationSparkline } from './PropertyValuationSparkline';

interface TitleDeedModalProps {
  property: Property | null;
  onClose: () => void;
  onAiExplain: (property: Property) => void;
}

export const TitleDeedModal: React.FC<TitleDeedModalProps> = ({ property, onClose, onAiExplain }) => {
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedCid, setCopiedCid] = useState(false);

  if (!property) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyHash = () => {
    if (property.titleDeedHash) {
      navigator.clipboard.writeText(property.titleDeedHash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  const handleCopyCid = () => {
    if (property.ipfsDeedCid) {
      navigator.clipboard.writeText(property.ipfsDeedCid);
      setCopiedCid(true);
      setTimeout(() => setCopiedCid(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 my-6 sm:my-8 relative"
        >
          {/* Modal Top Actions Bar */}
          <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-1 rounded-md bg-amber-400/10 border border-amber-400/30">
                <Award className="w-4 h-4 text-amber-400" />
              </div>
              <span className="font-bold text-xs sm:text-sm tracking-wide">
                Official Sovereign Land Title Certificate
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onAiExplain(property)}
                className="group px-3 py-1.5 rounded-xl bg-indigo-600/60 hover:bg-indigo-600 text-indigo-100 text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 hover:shadow-md hover:shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 group-hover:rotate-12 transition-transform duration-300" />
                <span>AI Legal Summary</span>
              </button>

              <button
                onClick={handlePrint}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition-all duration-200 hover:scale-105 hover:shadow-sm active:scale-95"
                title="Print Land Certificate"
                aria-label="Print Certificate"
              >
                <Printer className="w-4 h-4" />
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/80 hover:text-rose-200 text-slate-300 transition-all duration-200 hover:scale-105 active:scale-95"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Certificate Paper Layout */}
          <div className="p-6 sm:p-10 space-y-7 bg-gradient-to-b from-amber-50/25 via-white to-amber-50/15 print:p-0">
            {/* Certificate Header with Crest and Seal */}
            <div className="text-center space-y-2.5 pb-6 border-b-2 border-slate-900">
              <div className="group inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-900 text-amber-400 shadow-md shadow-slate-900/20 mb-1 border border-amber-400/20 hover:scale-110 hover:shadow-lg hover:shadow-amber-500/20 transition-all duration-300 cursor-default">
                <Award className="w-8 h-8 group-hover:rotate-6 transition-transform duration-300" />
              </div>
              <p className="text-[11px] uppercase font-bold tracking-widest text-slate-500 font-mono">
                Department of Cadastral Affairs & Decentralized Land Titles
              </p>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-serif">
                CERTIFICATE OF FREEHOLD LAND TITLE
              </h1>
              <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
                This sovereign document certifies indisputable freehold ownership recorded on the decentralized
                cadastral blockchain ledger in accordance with regional property statutes.
              </p>
            </div>

            {/* Certificate Parcel & Title ID Grid with interactive card hover transitions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="p-3.5 bg-slate-50/90 hover:bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default group">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider group-hover:text-indigo-600 transition-colors">
                  Title Deed No.
                </span>
                <p className="font-mono font-bold text-indigo-900 text-xs sm:text-sm mt-1 truncate">
                  {property.titleNumber}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50/90 hover:bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default group">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider group-hover:text-slate-700 transition-colors">
                  Cadastral Plot
                </span>
                <p className="font-mono font-bold text-slate-900 text-xs sm:text-sm mt-1 truncate">
                  {property.parcelId}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50/90 hover:bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default group">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider group-hover:text-slate-700 transition-colors">
                  Surveyed Area
                </span>
                <p className="font-bold text-slate-900 text-xs sm:text-sm mt-1">
                  {property.areaSqMeters.toLocaleString()} m²
                </p>
              </div>

              <div className="p-3.5 bg-slate-50/90 hover:bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default group">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider group-hover:text-slate-700 transition-colors">
                  Zoning Code
                </span>
                <p className="font-bold text-slate-900 text-xs sm:text-sm mt-1 truncate">
                  {property.zoning}
                </p>
              </div>
            </div>

            {/* Property Location & Owner Particulars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              <div className="p-4 sm:p-5 bg-white hover:bg-gradient-to-br hover:from-white hover:to-indigo-50/30 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-0.5 transition-all duration-200 group">
                <h3 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider flex items-center gap-2 pb-2.5 border-b border-slate-100">
                  <div className="p-1 rounded-md bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-200">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <span>Geospatial Particulars</span>
                </h3>
                <div className="space-y-2 pt-3">
                  <div>
                    <span className="text-slate-400 text-[11px]">Physical Address:</span>
                    <p className="font-semibold text-slate-900 text-sm mt-0.5">{property.address}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Cadastral District:</span>
                    <p className="font-medium text-slate-800 mt-0.5">{property.cadastralDistrict}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Estimated Cadastral Valuation:</span>
                    <p className="font-bold text-emerald-700 text-base mt-0.5 font-mono">
                      {formatCurrency(property.estimatedValueUSD)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-5 bg-white hover:bg-gradient-to-br hover:from-white hover:to-emerald-50/30 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-500/5 hover:-translate-y-0.5 transition-all duration-200 group">
                <h3 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider flex items-center gap-2 pb-2.5 border-b border-slate-100">
                  <div className="p-1 rounded-md bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-200">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <span>Registered Freehold Owner</span>
                </h3>
                <div className="space-y-2 pt-3">
                  <div>
                    <span className="text-slate-400 text-[11px]">Full Legal Name:</span>
                    <p className="font-bold text-slate-900 text-sm mt-0.5">{property.currentOwner.name}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Authenticated Wallet Address:</span>
                    <p className="font-mono text-slate-700 text-[11px] break-all bg-slate-50 group-hover:bg-white p-1.5 rounded-lg border border-slate-100 mt-0.5 transition-colors">
                      {property.currentOwner.walletAddress}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Tenure Classification:</span>
                    <p className="font-semibold text-slate-900 mt-0.5">Fee Simple Absolute Freehold</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Historical Cadastral Valuation & Assessment Trend Sparkline with shadow transition */}
            <div className="hover:shadow-lg hover:shadow-emerald-500/5 hover:-translate-y-0.5 transition-all duration-200 rounded-2xl">
              <PropertyValuationSparkline
                property={property}
                variant="hero"
                showMetrics={true}
              />
            </div>

            {/* Cryptographic Ledger Verification Proof (Interactive Hash Copier) */}
            <div className="p-5 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white rounded-2xl space-y-3.5 font-mono text-xs border border-slate-800 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-950/30 hover:-translate-y-0.5 transition-all duration-200 group">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-emerald-500/10 text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-slate-200 tracking-wide">
                    Cryptographic Blockchain Anchor
                  </span>
                </div>
                <span className="text-emerald-400 text-[11px] bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/60">
                  Consensus Verified (PoA)
                </span>
              </div>

              <div className="space-y-2.5 text-[11px]">
                <div>
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span>Title Deed Hash (SHA-256):</span>
                    <button
                      type="button"
                      onClick={handleCopyHash}
                      className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-emerald-400 transition"
                      title="Copy SHA-256 Hash"
                    >
                      {copiedHash ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-emerald-400 break-all bg-slate-950/80 p-2 rounded-xl border border-slate-800 select-all group-hover:border-slate-700 transition-colors">
                    {property.titleDeedHash}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-slate-300 pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">IPFS CID:</span>
                    <span className="text-slate-200 font-bold">{property.ipfsDeedCid}</span>
                    <button
                      type="button"
                      onClick={handleCopyCid}
                      className="text-slate-400 hover:text-emerald-400 p-0.5 transition"
                      title="Copy IPFS CID"
                    >
                      {copiedCid ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <span className="text-slate-400">
                    Verified by: <strong className="text-slate-200">{property.verifiedBy}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Historical Chain of Title Custody (Provenance) with list hover feedback */}
            <div className="space-y-3.5">
              <h3 className="text-xs font-bold uppercase text-slate-900 tracking-wider flex items-center gap-2">
                <div className="p-1 rounded bg-indigo-50 text-indigo-600">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <span>Chain of Title Custody & Provenance History</span>
              </h3>

              <div className="relative border-l-2 border-indigo-200 ml-3.5 pl-5 space-y-3.5 text-xs">
                {property.chainOfCustody.map((record, index) => (
                  <div key={index} className="relative group/record">
                    <div className="absolute -left-[27.5px] top-3.5 w-3.5 h-3.5 rounded-full bg-indigo-600 border-2 border-white shadow-xs group-hover/record:scale-125 group-hover/record:bg-emerald-500 transition-all duration-200" />
                    <div className="p-4 bg-slate-50/90 hover:bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 group-hover/record:text-indigo-900 transition-colors">
                          {record.deedType}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-md">
                          {record.transferDate}
                        </span>
                      </div>
                      <p className="text-slate-700 font-medium flex items-center gap-1.5">
                        <span>{record.fromOwner}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span className="font-bold text-slate-900">{record.toOwner}</span>
                      </p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 font-mono pt-1 border-t border-slate-100">
                        <span>Price: <strong className="text-emerald-700 font-bold">{formatCurrency(record.priceUSD)}</strong></span>
                        <span>Block #{record.blockHeight}</span>
                        <span>Notary: {record.notarizedBy}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sovereign Seal & Signatures Footer with Interactive Card Hover */}
            <div className="pt-6 border-t-2 border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
              <div className="group flex items-center gap-4 p-2 rounded-2xl hover:bg-slate-50/80 hover:shadow-xs transition-all duration-200 cursor-pointer">
                <div className="p-2.5 bg-white border border-slate-200 rounded-2xl shadow-xs group-hover:scale-105 group-hover:shadow-md group-hover:border-indigo-300 transition-all duration-200">
                  <QrCode className="w-12 h-12 text-slate-900" />
                </div>
                <div className="text-xs space-y-0.5">
                  <p className="font-mono font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                    QR Sovereign Hash Verify
                  </p>
                  <p className="text-[11px] text-slate-500">Scan to verify title on CadastralPoA Mainnet</p>
                </div>
              </div>

              <div className="text-center sm:text-right space-y-1 p-2 rounded-xl hover:bg-slate-50/60 transition-all duration-200">
                <div className="font-serif italic font-bold text-base text-slate-900 tracking-wide">
                  Marcus Sterling
                </div>
                <div className="text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wider">
                  Chief Land Registrar of the State
                </div>
                <div className="text-[10px] text-emerald-700 font-mono font-semibold">
                  Digitally Signed & Sovereign Sealed (0x94A6...)
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

