import React, { useState } from 'react';
import { useRegistry } from '../context/RegistryContext';
import { X, PlusCircle, Building2, MapPin, DollarSign, ShieldCheck, Key } from 'lucide-react';
import { generateSha256Hash, encryptSensitivePII } from '../utils/crypto';

interface NewTitleModalProps {
  onClose: () => void;
}

export const NewTitleModal: React.FC<NewTitleModalProps> = ({ onClose }) => {
  const { createNewPropertyTitle, isMining, showToast } = useRegistry();

  const [parcelId, setParcelId] = useState('CAD-SEC5-LT44');
  const [titleNumber, setTitleNumber] = useState('DEED-2026-08892');
  const [address, setAddress] = useState('88 Ocean Crest Way, Harbor District');
  const [district, setDistrict] = useState('West District - Sector 5');
  const [areaSqMeters, setAreaSqMeters] = useState(1250);
  const [zoning, setZoning] = useState<'Residential' | 'Commercial' | 'Agricultural' | 'Mixed-Use'>('Residential');
  const [estimatedValue, setEstimatedValue] = useState(980000);
  const [ownerName, setOwnerName] = useState('Alexander Wright');
  const [ownerWallet, setOwnerWallet] = useState('0x9a8B739b8C6B6fD1C08304E63B66D60C92d30800');
  const [ownerNationalId, setOwnerNationalId] = useState('883-91-4402');
  const [legalNotes, setLegalNotes] = useState('Surveyed by State Cadastral Unit. Free of encumbrances.');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parcelId || !address || !ownerName || !ownerWallet) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    const encNationalId = await encryptSensitivePII(ownerNationalId);
    const titleDeedHash = await generateSha256Hash(
      `GENESIS_DEED:${parcelId}:${titleNumber}:${ownerWallet}:${areaSqMeters}:${Date.now()}`
    );

    // Default polygon coordinates for new plot
    const geoPolygon = [
      { x: 380, y: 180, lat: 37.779, lng: -122.418 },
      { x: 480, y: 180, lat: 37.779, lng: -122.416 },
      { x: 480, y: 260, lat: 37.777, lng: -122.416 },
      { x: 380, y: 260, lat: 37.777, lng: -122.418 },
    ];

    await createNewPropertyTitle({
      parcelId,
      titleNumber,
      address,
      cadastralDistrict: district,
      areaSqMeters,
      zoning,
      status: 'Verified',
      estimatedValueUSD: estimatedValue,
      annualTaxUSD: Math.round(estimatedValue * 0.006),
      taxStatus: 'Cleared',
      currentOwner: {
        name: ownerName,
        walletAddress: ownerWallet,
        nationalIdEncrypted: encNationalId,
        ownershipType: 'Freehold',
        ownershipPercentage: 100,
        registeredSince: new Date().toISOString().split('T')[0],
      },
      encumbrances: [],
      chainOfCustody: [
        {
          fromOwner: 'State Land Administration (Genesis)',
          fromWallet: '0x0000000000000000000000000000000000000000',
          toOwner: ownerName,
          toWallet: ownerWallet,
          transferDate: new Date().toISOString().split('T')[0],
          deedType: 'Original State Crown Land Grant',
          priceUSD: estimatedValue,
          notarizedBy: 'Cadastral Surveyor Unit #4',
          digitalSignatureHex: titleDeedHash,
          txHash: titleDeedHash,
          blockHeight: 3,
        },
      ],
      geoPolygon,
      coordinates: { latitude: 37.779, longitude: -122.418 },
      polygonCoords: [
        { x: 380, y: 180 },
        { x: 480, y: 180 },
        { x: 480, y: 260 },
        { x: 380, y: 260 },
      ],
      titleDeedHash,
      ipfsDeedCid: `QmNewLand${parcelId.replace(/[^a-zA-Z0-9]/g, '')}`,
      registrationDate: new Date().toISOString().split('T')[0],
      lastVerifiedDate: new Date().toISOString().split('T')[0],
      verifiedBy: 'Marcus Sterling (Chief Land Registrar)',
      smartContractAddress: `0x${titleDeedHash.slice(2, 42)}`,
      legalNotes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Issue New Sovereign Land Title Deed</h2>
              <p className="text-xs text-slate-400">
                Register a newly surveyed cadastral parcel and mint title onto the blockchain
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5 text-xs text-slate-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cadastral Plot Parcel ID *
              </label>
              <input
                type="text"
                value={parcelId}
                onChange={e => setParcelId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-xs font-bold"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Title Deed Number *
              </label>
              <input
                type="text"
                value={titleNumber}
                onChange={e => setTitleNumber(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-xs"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Physical Street Address *
            </label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cadastral District
              </label>
              <input
                type="text"
                value={district}
                onChange={e => setDistrict(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Surveyed Area (m²)
              </label>
              <input
                type="number"
                value={areaSqMeters}
                onChange={e => setAreaSqMeters(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Zoning Classification
              </label>
              <select
                value={zoning}
                onChange={e => setZoning(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
              >
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Agricultural">Agricultural</option>
                <option value="Mixed-Use">Mixed-Use</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estimated Cadastral Valuation (USD)
              </label>
              <input
                type="number"
                value={estimatedValue}
                onChange={e => setEstimatedValue(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-emerald-700 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Owner Legal Name *
              </label>
              <input
                type="text"
                value={ownerName}
                onChange={e => setOwnerName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Owner Cryptographic Wallet Address *
              </label>
              <input
                type="text"
                value={ownerWallet}
                onChange={e => setOwnerWallet(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-[11px]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Citizen National ID (E2E Encrypted)
              </label>
              <input
                type="text"
                value={ownerNationalId}
                onChange={e => setOwnerNationalId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Cadastral Surveyor Official Legal Notes
            </label>
            <textarea
              value={legalNotes}
              onChange={e => setLegalNotes(e.target.value)}
              rows={2}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isMining}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition flex items-center gap-2 shadow-md shadow-indigo-200"
            >
              <Building2 className="w-4 h-4" />
              <span>{isMining ? 'Minting Genesis Block...' : 'Mint Sovereign Title Deed'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
