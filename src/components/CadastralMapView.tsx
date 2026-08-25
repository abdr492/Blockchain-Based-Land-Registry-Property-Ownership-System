import React, { useState, useEffect } from 'react';
import { useRegistry } from '../context/RegistryContext';
import { Property } from '../types';
import {
  MapPin,
  Layers,
  ShieldCheck,
  Search,
  FileText,
  ArrowRightLeft,
  Sparkles,
  Compass,
  Maximize2,
  Lock,
  DollarSign,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { formatAddress, formatCurrency, getPropertyCoordinates, getPropertyPolygonCoords } from '../utils/crypto';
import { PropertyValuationSparkline } from './PropertyValuationSparkline';

interface CadastralMapViewProps {
  onInspectDeed: (property: Property) => void;
  onInitiateTransfer: (property: Property) => void;
}

export const CadastralMapView: React.FC<CadastralMapViewProps> = ({
  onInspectDeed,
  onInitiateTransfer,
}) => {
  const { properties, selectedProperty, setSelectedProperty, currentUser } = useRegistry();
  const [activePlot, setActivePlot] = useState<Property>(selectedProperty || properties[0]);
  const [mapMode, setMapMode] = useState<'cadastral' | 'satellite'>('cadastral');
  const [selectedZoning, setSelectedZoning] = useState<string>('all');
  const [hoveredPlot, setHoveredPlot] = useState<Property | null>(null);

  useEffect(() => {
    if (selectedProperty) {
      setActivePlot(selectedProperty);
    }
  }, [selectedProperty]);

  const filteredProperties = properties.filter(p => {
    if (selectedZoning !== 'all' && p.zoning !== selectedZoning) return false;
    return true;
  });

  const getStatusColor = (status: Property['status'], isHovered: boolean, isSelected: boolean) => {
    if (isSelected) {
      return { fill: '#3b82f6', stroke: '#1d4ed8', fillOpacity: 0.65, strokeWidth: 3 };
    }
    switch (status) {
      case 'Verified':
        return {
          fill: '#10b981',
          stroke: '#047857',
          fillOpacity: isHovered ? 0.5 : 0.28,
          strokeWidth: isHovered ? 2.5 : 1.5,
        };
      case 'Pending_Transfer':
        return {
          fill: '#f59e0b',
          stroke: '#b45309',
          fillOpacity: isHovered ? 0.55 : 0.32,
          strokeWidth: isHovered ? 2.5 : 1.5,
        };
      case 'In_Dispute':
        return {
          fill: '#f43f5e',
          stroke: '#be123c',
          fillOpacity: isHovered ? 0.6 : 0.38,
          strokeWidth: isHovered ? 2.5 : 2,
        };
      case 'Encumbered':
        return {
          fill: '#a855f7',
          stroke: '#7e22ce',
          fillOpacity: isHovered ? 0.55 : 0.32,
          strokeWidth: isHovered ? 2.5 : 1.5,
        };
      default:
        return { fill: '#64748b', stroke: '#334155', fillOpacity: 0.2, strokeWidth: 1.5 };
    }
  };

  const isOwnerOfActive =
    activePlot.currentOwner.walletAddress.toLowerCase() === currentUser.walletAddress.toLowerCase();

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-800">
        <div className="space-y-1 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-medium">
            <Compass className="w-3.5 h-3.5" />
            <span>Cadastral GIS Geospatial Coordinate System</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Interactive Cadastral Parcel Map</h1>
          <p className="text-xs text-slate-300 leading-relaxed">
            Real-time geospatial title status, GPS polygon boundary coordinates, and cadastral survey records
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Cadastral vs Satellite Toggle */}
          <div className="bg-slate-800 p-1 rounded-xl flex items-center border border-slate-700 text-xs">
            <button
              onClick={() => setMapMode('cadastral')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                mapMode === 'cadastral'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Cadastral Vector
            </button>
            <button
              onClick={() => setMapMode('satellite')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                mapMode === 'satellite'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              GIS Orthophoto
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Vector Map Canvas */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            {/* Map Header & Filter Bar */}
            <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Filter Zoning:</span>
                <select
                  value={selectedZoning}
                  onChange={e => setSelectedZoning(e.target.value)}
                  className="px-2.5 py-1 text-xs font-medium bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
                >
                  <option value="all">All Zoning Sectors</option>
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Agricultural">Agricultural</option>
                  <option value="Mixed-Use">Mixed-Use</option>
                </select>
              </div>

              {/* Status Color Legend */}
              <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium text-slate-600">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span> Verified Title
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span> Pending Transfer
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-rose-500"></span> Dispute
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-purple-500"></span> Encumbered
                </span>
              </div>
            </div>

            {/* SVG Cadastral Map */}
            <div
              className={`relative aspect-4/3 w-full transition-all ${
                mapMode === 'satellite' ? 'bg-slate-900' : 'bg-slate-50'
              }`}
            >
              {/* Grid overlay for vector mode */}
              {mapMode === 'cadastral' ? (
                <div
                  className="absolute inset-0 opacity-40 pointer-events-none"
                  style={{
                    backgroundImage: `radial-gradient(#cbd5e1 1px, transparent 1px)`,
                    backgroundSize: '24px 24px',
                  }}
                />
              ) : (
                <div
                  className="absolute inset-0 opacity-30 pointer-events-none bg-cover bg-center"
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80')`,
                  }}
                />
              )}

              <svg
                viewBox="0 0 800 500"
                className="w-full h-full cursor-crosshair select-none relative z-10"
              >
                {/* Cadastral Grid Sector Roads */}
                <path
                  d="M 50,250 L 750,250 M 400,30 L 400,470 M 200,30 L 200,470 M 600,30 L 600,470"
                  stroke={mapMode === 'satellite' ? '#ffffff33' : '#94a3b8'}
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  fill="none"
                />

                {/* Property Polygon Plots */}
                {filteredProperties.map(property => {
                  const isHovered = hoveredPlot?.id === property.id;
                  const isSelected = activePlot?.id === property.id;
                  const style = getStatusColor(property.status, isHovered, isSelected);

                  const polyCoords = getPropertyPolygonCoords(property);
                  const pointsString = polyCoords
                    .map(pt => `${pt.x},${pt.y}`)
                    .join(' ');

                  const centerX =
                    polyCoords.reduce((sum, pt) => sum + pt.x, 0) /
                    polyCoords.length;
                  const centerY =
                    polyCoords.reduce((sum, pt) => sum + pt.y, 0) /
                    polyCoords.length;

                  return (
                    <g
                      key={property.id}
                      onClick={() => {
                        setActivePlot(property);
                        setSelectedProperty(property);
                      }}
                      onMouseEnter={() => setHoveredPlot(property)}
                      onMouseLeave={() => setHoveredPlot(null)}
                      className="transition-all duration-150 cursor-pointer"
                    >
                      <polygon
                        points={pointsString}
                        fill={style.fill}
                        stroke={style.stroke}
                        fillOpacity={style.fillOpacity}
                        strokeWidth={style.strokeWidth}
                      />

                      {/* Parcel ID label at centroid */}
                      <text
                        x={centerX}
                        y={centerY}
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="text-[11px] font-bold font-mono pointer-events-none"
                        fill={mapMode === 'satellite' ? '#ffffff' : '#0f172a'}
                      >
                        {property.parcelId}
                      </text>

                      {/* Area label */}
                      <text
                        x={centerX}
                        y={centerY + 14}
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="text-[9px] font-medium pointer-events-none"
                        fill={mapMode === 'satellite' ? '#cbd5e1' : '#475569'}
                      >
                        {property.areaSqMeters} m²
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Hover Tooltip Overlay */}
              {hoveredPlot && (
                <div
                  className="absolute bottom-4 left-4 z-20 bg-slate-900/90 backdrop-blur-md text-white p-3 rounded-xl border border-slate-700 text-xs shadow-lg space-y-1 pointer-events-none max-w-xs animate-in fade-in duration-100"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-blue-400 font-bold">{hoveredPlot.parcelId}</span>
                    <span className="text-[10px] font-semibold bg-white/20 px-2 py-0.5 rounded">
                      {hoveredPlot.zoning}
                    </span>
                  </div>
                  <div className="font-semibold text-slate-100">{hoveredPlot.address}</div>
                  <div className="text-[11px] text-slate-400">
                    Owner: {hoveredPlot.currentOwner.name} • {formatCurrency(hoveredPlot.estimatedValueUSD)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Selected Plot Cadastral Inspector */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Inspecting Cadastral Parcel
                </span>
                <h3 className="text-lg font-bold text-slate-900">{activePlot.parcelId}</h3>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  activePlot.status === 'Verified'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : activePlot.status === 'In_Dispute'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {activePlot.status.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 text-[11px]">Physical Address</span>
                <p className="font-semibold text-slate-800 text-sm">{activePlot.address}</p>
                <p className="text-slate-500 text-[11px]">{activePlot.cadastralDistrict}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 py-2 border-y border-slate-100">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Surveyed Area</span>
                  <p className="font-bold text-slate-800 text-sm">{activePlot.areaSqMeters.toLocaleString()} m²</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Cadastral Valuation</span>
                  <p className="font-bold text-emerald-700 text-sm">
                    {formatCurrency(activePlot.estimatedValueUSD)}
                  </p>
                </div>
              </div>

              {/* Historical Valuation Trend Sparkline for Selected Parcel */}
              <PropertyValuationSparkline property={activePlot} variant="card" />

              <div>
                <span className="text-slate-400 text-[11px]">GPS Coordinates</span>
                <p className="font-mono text-slate-700 text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-200">
                  Lat: {getPropertyCoordinates(activePlot).latitude.toFixed(6)}° N<br />
                  Lng: {getPropertyCoordinates(activePlot).longitude.toFixed(6)}° W
                </p>
              </div>

              <div>
                <span className="text-slate-400 text-[11px]">Registered Owner</span>
                <p className="font-semibold text-slate-800">{activePlot.currentOwner.name}</p>
                <p className="font-mono text-[10px] text-slate-400 truncate">
                  {activePlot.currentOwner.walletAddress}
                </p>
              </div>

              <div>
                <span className="text-slate-400 text-[11px]">Blockchain Deed Hash</span>
                <p className="font-mono text-[10px] text-slate-700 bg-slate-900 text-emerald-400 p-2 rounded-lg truncate">
                  {activePlot.titleDeedHash}
                </p>
              </div>
            </div>

            {/* Actions for active plot */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => onInspectDeed(activePlot)}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span>Inspect Full Title Deed</span>
              </button>

              {isOwnerOfActive ? (
                <button
                  onClick={() => onInitiateTransfer(activePlot)}
                  className="w-full py-2.5 px-3 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition flex items-center justify-center gap-1.5 shadow-sm shadow-blue-500/20"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Initiate Title Transfer</span>
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
