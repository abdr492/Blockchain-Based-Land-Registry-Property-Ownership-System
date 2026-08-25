import React, { useState, useRef, useEffect } from 'react';
import { useRegistry } from '../context/RegistryContext';
import { Property } from '../types';
import {
  Search,
  X,
  MapPin,
  FileText,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Lock,
  ExternalLink,
  Map,
  Shield,
  Sparkles,
} from 'lucide-react';
import { formatAddress, formatCurrency } from '../utils/crypto';

interface GlobalSearchBarProps {
  onInspectProperty?: (property: Property) => void;
  className?: string;
}

export const GlobalSearchBar: React.FC<GlobalSearchBarProps> = ({
  onInspectProperty,
  className = '',
}) => {
  const {
    properties,
    setActiveView,
    setSelectedProperty,
    showToast,
  } = useRegistry();

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter properties based on Deed ID / Title Number, Parcel ID, Location/Address, Owner, Zoning, or Hash
  const trimmedQuery = query.trim().toLowerCase();

  const searchResults = React.useMemo(() => {
    if (!trimmedQuery) return [];
    return properties.filter((p) => {
      const matchTitleNumber = p.titleNumber.toLowerCase().includes(trimmedQuery);
      const matchParcelId = p.parcelId.toLowerCase().includes(trimmedQuery);
      const matchAddress = p.address.toLowerCase().includes(trimmedQuery);
      const matchOwner = p.owner?.name?.toLowerCase().includes(trimmedQuery);
      const matchOwnerWallet = p.owner?.walletAddress?.toLowerCase().includes(trimmedQuery);
      const matchZoning = p.zoning.toLowerCase().includes(trimmedQuery);
      const matchStatus = p.status.toLowerCase().replace('_', ' ').includes(trimmedQuery);
      const matchHash = p.titleDeedHash?.toLowerCase().includes(trimmedQuery);
      const matchNotes = p.legalNotes?.toLowerCase().includes(trimmedQuery);

      return (
        matchTitleNumber ||
        matchParcelId ||
        matchAddress ||
        matchOwner ||
        matchOwnerWallet ||
        matchZoning ||
        matchStatus ||
        matchHash ||
        matchNotes
      );
    });
  }, [properties, trimmedQuery]);

  // Suggested searches when input is empty
  const suggestions = [
    { label: 'DEED-2021-09418', type: 'Deed ID', query: 'DEED-2021-09418' },
    { label: 'Cold Spring, NY', type: 'Location', query: 'Cold Spring' },
    { label: 'CAD-SEC1-LT08', type: 'Parcel ID', query: 'CAD-SEC1' },
    { label: 'Hudson Valley', type: 'Location', query: 'Hudson Valley' },
    { label: 'Commercial Zone', type: 'Zoning', query: 'Commercial' },
  ];

  // Global keyboard shortcut to focus search (/ or ⌘K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid triggering when user is already typing in another input or textarea
      if (
        (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) &&
        e.target !== inputRef.current
      ) {
        return;
      }

      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !e.metaKey && !e.ctrlKey)) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle arrow key navigation in search results
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
        handleSelectProperty(searchResults[selectedIndex]);
      } else if (searchResults.length > 0) {
        handleSelectProperty(searchResults[0]);
      }
    }
  };

  const handleSelectProperty = (property: Property) => {
    setIsOpen(false);
    setSelectedProperty(property);
    if (onInspectProperty) {
      onInspectProperty(property);
    } else {
      setActiveView('portfolio');
    }
    showToast(`Loaded Deed ${property.titleNumber} (${property.address})`, 'info');
  };

  const handleViewOnMap = (e: React.MouseEvent, property: Property) => {
    e.stopPropagation();
    setIsOpen(false);
    setSelectedProperty(property);
    setActiveView('map');
    showToast(`Centered on Parcel ${property.parcelId} on Cadastral Map`, 'info');
  };

  const handleInspectDeed = (e: React.MouseEvent, property: Property) => {
    e.stopPropagation();
    setIsOpen(false);
    setSelectedProperty(property);
    if (onInspectProperty) {
      onInspectProperty(property);
    }
  };

  const getStatusBadge = (status: Property['status']) => {
    switch (status) {
      case 'Verified':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Verified
          </span>
        );
      case 'Pending_Transfer':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            Pending Transfer
          </span>
        );
      case 'In_Dispute':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            In Dispute
          </span>
        );
      case 'Encumbered':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <Lock className="w-3 h-3 text-purple-600" />
            Encumbered
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full max-w-md lg:max-w-lg ${className}`}>
      {/* Search Input Box */}
      <div className="relative flex items-center">
        <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
          <Search className="w-4 h-4" />
        </div>

        <input
          ref={inputRef}
          id="global-property-search-input"
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(-1);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleInputKeyDown}
          placeholder="Search by deed ID, parcel, or location..."
          className="w-full h-10 pl-10 pr-20 bg-slate-100/90 hover:bg-slate-100 focus:bg-white text-slate-800 placeholder-slate-400 text-xs font-medium rounded-xl border border-slate-200/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all shadow-2xs"
          autoComplete="off"
          aria-label="Search properties by deed ID or location"
        />

        {/* Clear Button & Keyboard Shortcut Pill */}
        <div className="absolute right-2.5 flex items-center gap-1.5">
          {query ? (
            <button
              onClick={() => {
                setQuery('');
                setSelectedIndex(-1);
                inputRef.current?.focus();
              }}
              className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-md transition"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-200/70 border border-slate-300/60 rounded text-[10px] font-mono text-slate-500 select-none">
              <span>⌘</span>
              <span>K</span>
            </div>
          )}
        </div>
      </div>

      {/* Popover Dropdown Results */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100 overflow-hidden">
          {/* Header Status in Dropdown */}
          <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            {trimmedQuery ? (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800">
                  {searchResults.length} {searchResults.length === 1 ? 'property' : 'properties'} found
                </span>
                <span className="text-slate-400">matching &ldquo;{query}&rdquo;</span>
              </div>
            ) : (
              <span className="font-semibold text-slate-700">Quick Property Registry Search</span>
            )}
            <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
              [↑/↓] Navigate • [↵] Open Deed
            </span>
          </div>

          {/* Results List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {trimmedQuery && searchResults.length > 0 ? (
              searchResults.map((property, idx) => {
                const isSelected = selectedIndex === idx;

                return (
                  <div
                    key={property.id}
                    onClick={() => handleSelectProperty(property)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`p-3.5 transition cursor-pointer flex flex-col gap-2 ${
                      isSelected ? 'bg-blue-50/70' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Top Row: Deed Number, Parcel ID, and Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-blue-100/80 text-blue-700 flex items-center justify-center shrink-0">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-slate-900 font-mono truncate">
                              {property.titleNumber}
                            </span>
                            <span className="px-1.5 py-0.2 rounded bg-slate-100 text-[10px] font-mono text-slate-600 border border-slate-200">
                              {property.parcelId}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">{getStatusBadge(property.status)}</div>
                    </div>

                    {/* Middle Row: Address / Location & Valuation */}
                    <div className="flex items-center justify-between text-xs gap-3">
                      <div className="flex items-center gap-1.5 text-slate-600 truncate">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="truncate">{property.address}</span>
                      </div>
                      <div className="font-bold font-mono text-emerald-700 shrink-0">
                        {formatCurrency(property.estimatedValueUSD)}
                      </div>
                    </div>

                    {/* Bottom Row: Owner, Zoning & Quick Actions */}
                    <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 border-t border-slate-100/80">
                      <div className="flex items-center gap-2 truncate">
                        <span>
                          Owner:{' '}
                          <strong className="text-slate-700 font-medium">
                            {property.owner?.name || 'Unassigned'}
                          </strong>
                        </span>
                        <span>•</span>
                        <span className="text-slate-600">{property.zoning}</span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => handleViewOnMap(e, property)}
                          className="px-2 py-1 rounded-md bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-600 text-[10px] font-semibold flex items-center gap-1 transition"
                          title="View on Cadastral Map"
                        >
                          <Map className="w-3 h-3" />
                          <span>Map</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleInspectDeed(e, property)}
                          className="px-2 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-semibold flex items-center gap-1 transition shadow-2xs"
                          title="Inspect Cryptographic Deed"
                        >
                          <Shield className="w-3 h-3" />
                          <span>Deed</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : trimmedQuery ? (
              /* No Results State */
              <div className="p-8 text-center space-y-2">
                <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                  <Search className="w-5 h-5" />
                </div>
                <div className="text-xs font-semibold text-slate-800">
                  No registered properties found
                </div>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  No title deeds match &ldquo;{query}&rdquo;. Try searching with a deed ID (e.g. DEED-2021), parcel code, city, or street name.
                </p>
              </div>
            ) : (
              /* Initial / Suggested Searches State */
              <div className="p-3 space-y-3">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
                  Suggested Searches
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setQuery(s.query);
                        inputRef.current?.focus();
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-slate-200/80 text-xs text-slate-700 hover:text-blue-700 flex items-center gap-1.5 transition"
                    >
                      <Search className="w-3 h-3 text-slate-400" />
                      <span>{s.label}</span>
                      <span className="text-[10px] text-slate-400 bg-white px-1 rounded border border-slate-200">
                        {s.type}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 px-1">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Real-time on-chain indexing across {properties.length} cadastral titles</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
