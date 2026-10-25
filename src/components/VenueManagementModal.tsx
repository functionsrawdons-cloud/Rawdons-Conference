import React, { useState, useMemo } from 'react';
import {
  X,
  Building2,
  Calendar,
  Users,
  Maximize2,
  CheckCircle2,
  Edit3,
  RotateCcw,
  Printer,
  Download,
  DollarSign,
  Plus,
  Trash2,
  Save,
  Clock,
  Sparkles,
  Layers,
  ArrowRight,
  Shield,
  HelpCircle
} from 'lucide-react';
import {
  HotelVenue,
  ConferenceEvent,
  VenueCapacities,
  AttendeeTierRate,
  SeasonalRate
} from '../types/conference';
import { calculateVenueHireQuote } from '../data/venues';

interface VenueManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  venues: HotelVenue[];
  onUpdateVenues: (updatedVenues: HotelVenue[]) => void;
  onResetVenues: () => void;
  activeConference?: ConferenceEvent;
  onAssignVenueToConference?: (
    conferenceId: string,
    assignment: {
      venueId: string;
      venueRoom: string;
      venueSeason: string;
      venueDuration: 'Full-Day' | 'Half-Day';
      venuePricingModel: 'seasonal' | 'attendee-tier';
      venueHireFee: number;
    }
  ) => void;
}

export const VenueManagementModal: React.FC<VenueManagementModalProps> = ({
  isOpen,
  onClose,
  venues,
  onUpdateVenues,
  onResetVenues,
  activeConference,
  onAssignVenueToConference,
}) => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'calculator' | 'matrix'>('catalog');
  const [selectedVenueId, setSelectedVenueId] = useState<string>(venues[0]?.id || 'main-conference');
  const [editingVenue, setEditingVenue] = useState<HotelVenue | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Calculator State
  const [calcVenueId, setCalcVenueId] = useState<string>(
    activeConference?.venueId || venues[0]?.id || 'main-conference'
  );
  const [calcModel, setCalcModel] = useState<'seasonal' | 'attendee-tier'>('seasonal');
  const [calcSeason, setCalcSeason] = useState<'low' | 'mid' | 'peak'>('mid');
  const [calcDuration, setCalcDuration] = useState<'Full-Day' | 'Half-Day'>('Full-Day');
  const [calcAttendees, setCalcAttendees] = useState<number>(activeConference?.delegateCurrent || 45);

  // Tag inputs for editor
  const [newInclusionText, setNewInclusionText] = useState('');
  const [newFeatureText, setNewFeatureText] = useState('');

  const filteredVenues = useMemo(() => {
    if (!searchQuery.trim()) return venues;
    const q = searchQuery.toLowerCase();
    return venues.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.subtitle.toLowerCase().includes(q) ||
        v.code.toLowerCase().includes(q) ||
        v.recommendedFor.toLowerCase().includes(q)
    );
  }, [venues, searchQuery]);

  const selectedCalcVenue = useMemo(() => {
    return venues.find((v) => v.id === calcVenueId) || venues[0];
  }, [venues, calcVenueId]);

  const liveCalculation = useMemo(() => {
    if (!selectedCalcVenue) return null;
    return calculateVenueHireQuote(selectedCalcVenue, {
      model: calcModel,
      season: calcSeason,
      duration: calcDuration,
      attendees: calcAttendees,
    });
  }, [selectedCalcVenue, calcModel, calcSeason, calcDuration, calcAttendees]);

  if (!isOpen) return null;

  // Open edit modal for a venue
  const handleStartEdit = (venue: HotelVenue) => {
    // Deep clone to avoid mutating parent state directly
    setEditingVenue(JSON.parse(JSON.stringify(venue)));
    setSaveSuccessMsg(null);
  };

  // Save edited venue
  const handleSaveVenueEdit = () => {
    if (!editingVenue) return;
    const updated = venues.map((v) => (v.id === editingVenue.id ? editingVenue : v));
    onUpdateVenues(updated);
    setSaveSuccessMsg(`Venue "${editingVenue.name}" successfully updated!`);
    setTimeout(() => {
      setSaveSuccessMsg(null);
      setEditingVenue(null);
    }, 1200);
  };

  // Assign calculated venue hire to active conference
  const handleAssignToActiveConference = () => {
    if (!activeConference || !onAssignVenueToConference || !liveCalculation || !selectedCalcVenue) return;

    onAssignVenueToConference(activeConference.id, {
      venueId: selectedCalcVenue.id,
      venueRoom: `${selectedCalcVenue.name} (${selectedCalcVenue.subtitle})`,
      venueSeason: calcSeason === 'low' ? 'Low Season' : calcSeason === 'mid' ? 'Mid Season' : 'Peak Season',
      venueDuration: calcDuration,
      venuePricingModel: calcModel,
      venueHireFee: liveCalculation.totalHire,
    });

    setSaveSuccessMsg(
      `Assigned "${selectedCalcVenue.name}" (R${liveCalculation.totalHire.toLocaleString()}) to ${activeConference.clientName}!`
    );
    setTimeout(() => setSaveSuccessMsg(null), 2500);
  };

  // Export CSV of all venues and rate cards
  const handleExportCSV = () => {
    const csvRows: string[][] = [
      ['RAWDONS HOTEL & BREWERY - 5 CONFERENCES & EVENTS VENUES DIRECTORY'],
      ['Export Date', new Date().toISOString().split('T')[0]],
      [''],
      [
        'Code',
        'Venue Name',
        'Subtitle',
        'Floor Area (m²)',
        'Dimensions',
        'Cinema Cap',
        'Schoolroom Cap',
        'Banquet Cap',
        'U-Shape Cap',
        'Boardroom Cap',
        'Cocktail Cap',
        'Cabaret Cap',
        'Low Season Full Day (ZAR)',
        'Low Season Half Day (ZAR)',
        'Mid Season Full Day (ZAR)',
        'Mid Season Half Day (ZAR)',
        'Peak Season Full Day (ZAR)',
        'Peak Season Half Day (ZAR)',
        'Tier 1 (1-30 pax) Flat (ZAR)',
        'Tier 2 (31-60 pax) Flat (ZAR)',
        'Tier 3 (61-100 pax) Flat (ZAR)',
        'Tier 4 (101+ pax) Flat (ZAR)',
        'Recommended For'
      ]
    ];

    venues.forEach((v) => {
      csvRows.push([
        v.code,
        `"${v.name}"`,
        `"${v.subtitle}"`,
        v.sqMeters.toString(),
        `"${v.dimensions}"`,
        v.capacities.cinema.toString(),
        v.capacities.schoolroom.toString(),
        v.capacities.banquet.toString(),
        v.capacities.uShape.toString(),
        v.capacities.boardroom.toString(),
        v.capacities.cocktail.toString(),
        v.capacities.cabaret.toString(),
        v.seasonalPricing.low.fullDayRate.toFixed(2),
        v.seasonalPricing.low.halfDayRate.toFixed(2),
        v.seasonalPricing.mid.fullDayRate.toFixed(2),
        v.seasonalPricing.mid.halfDayRate.toFixed(2),
        v.seasonalPricing.peak.fullDayRate.toFixed(2),
        v.seasonalPricing.peak.halfDayRate.toFixed(2),
        (v.attendeeTiers[0]?.flatHire || 0).toFixed(2),
        (v.attendeeTiers[1]?.flatHire || 0).toFixed(2),
        (v.attendeeTiers[2]?.flatHire || 0).toFixed(2),
        (v.attendeeTiers[3]?.flatHire || 0).toFixed(2),
        `"${v.recommendedFor}"`
      ]);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rawdons_Venues_Rate_Card_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs no-print-backdrop">
      <div className="relative w-full max-w-6xl bg-white rounded-xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header (No print) */}
        <div className="no-print px-5 py-4 bg-[#1a472a] text-white flex items-center justify-between border-b border-[#d4af37]/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-estate font-bold text-white tracking-wide">
                  5 Conference & Event Venues Studio
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-[#d4af37] text-[#1a472a] font-bold rounded">
                  FULLY EDITABLE
                </span>
              </div>
              <p className="text-xs text-stone-300">
                Capacities, Seasonal Rates (Low / Mid / Peak) & Delegate Tier Hire Rates
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-colors flex items-center gap-1.5"
              title="Export all venue specifications & pricing to CSV"
            >
              <Download className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">Export</span> CSV
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-colors flex items-center gap-1.5"
              title="Print Venue Rate Card & Comparison Matrix"
            >
              <Printer className="w-3.5 h-3.5 text-[#d4af37]" />
              <span className="hidden sm:inline">Print</span> Rate Card
            </button>
            <button
              onClick={() => {
                if (window.confirm('Reset all 5 venues to official Rawdons Estate capacity and pricing standards?')) {
                  onResetVenues();
                  setSaveSuccessMsg('Venues reset to Rawdons Estate defaults.');
                  setTimeout(() => setSaveSuccessMsg(null), 2000);
                }
              }}
              className="px-2.5 py-1.5 text-xs text-stone-300 hover:text-red-300 transition-colors flex items-center gap-1"
              title="Reset to Factory Defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success toast notification */}
        {saveSuccessMsg && (
          <div className="no-print bg-emerald-600 text-white px-4 py-2 text-xs font-medium flex items-center justify-between shadow-inner">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {saveSuccessMsg}
            </span>
          </div>
        )}

        {/* Sub-navigation tabs (No print) */}
        <div className="no-print px-6 py-2.5 bg-stone-100 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveTab('catalog');
                setEditingVenue(null);
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'catalog'
                  ? 'bg-[#1a472a] text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-200'
              }`}
            >
              1. Venues Catalog & Cards (5)
            </button>
            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'calculator'
                  ? 'bg-[#1a472a] text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-200'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5 text-amber-500" />
              2. Hire Calculator & Booking Assign
            </button>
            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'matrix'
                  ? 'bg-[#1a472a] text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              3. Rate Card & Comparison Matrix
            </button>
          </div>

          {activeTab === 'catalog' && (
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search venue, capacity, features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-2.5 py-1 text-xs border border-stone-300 rounded-md bg-white focus:outline-hidden focus:border-[#1a472a] w-52"
              />
            </div>
          )}
        </div>

        {/* Tab 1: Venues Catalog & Cards */}
        {activeTab === 'catalog' && !editingVenue && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-50 space-y-6">
            {/* Top Info Banner */}
            <div className="bg-[#1a472a]/5 border border-[#1a472a]/20 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-estate font-bold text-sm text-[#1a472a]">
                  5 Distinctive Conference & Banquet Venues
                </h3>
                <p className="text-xs text-stone-600 mt-0.5">
                  Click <span className="font-semibold text-[#1a472a]">"Edit Venue"</span> on any card to customize seating capacities, Low/Mid/Peak seasonal rates, attendee tiers, inclusions, or notes.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs shrink-0">
                <span className="px-2.5 py-1 bg-white border border-stone-200 rounded-md shadow-2xs font-mono font-medium text-stone-700">
                  Total Estate Venues: <strong className="text-[#1a472a]">{venues.length}</strong>
                </span>
                {activeConference && (
                  <span className="px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-md shadow-2xs text-amber-900 font-medium">
                    Active Booking: <strong>{activeConference.delegateCurrent} pax</strong>
                  </span>
                )}
              </div>
            </div>

            {/* Grid of 5 Venues */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {filteredVenues.map((venue, idx) => {
                const isSelected = selectedVenueId === venue.id;
                const isAssignedToActive = activeConference?.venueId === venue.id;

                return (
                  <div
                    key={venue.id}
                    className={`bg-white rounded-xl border transition-all overflow-hidden flex flex-col shadow-xs hover:shadow-md ${
                      isSelected ? 'border-[#1a472a] ring-2 ring-[#1a472a]/20' : 'border-stone-200'
                    }`}
                    onClick={() => setSelectedVenueId(venue.id)}
                  >
                    {/* Venue Header */}
                    <div className="p-4 bg-gradient-to-r from-stone-900 to-stone-800 text-white relative">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#d4af37] text-[#1a472a] rounded">
                              {venue.code}
                            </span>
                            <span className="text-xs text-stone-300 font-medium">Venue {idx + 1} of 5</span>
                            {isAssignedToActive && (
                              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500 text-white rounded-full flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Assigned
                              </span>
                            )}
                          </div>
                          <h4 className="text-base font-estate font-bold text-white mt-1">
                            {venue.name}
                          </h4>
                          <p className="text-xs text-[#d4af37] font-medium">{venue.subtitle}</p>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-mono font-semibold text-emerald-400 block">
                            {venue.sqMeters.toLocaleString()} m²
                          </span>
                          <span className="text-[10px] text-stone-400">{venue.dimensions}</span>
                        </div>
                      </div>

                      <p className="text-xs text-stone-300 mt-2 line-clamp-2 leading-relaxed">
                        {venue.description}
                      </p>
                    </div>

                    {/* Venue Body */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                      {/* 1. Capacities Section */}
                      <div>
                        <div className="flex items-center justify-between text-xs font-semibold text-stone-700 mb-1.5">
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-[#1a472a]" /> Seating Capacities
                          </span>
                          <span className="text-[11px] text-stone-400 font-mono">
                            Max: {Math.max(...Object.values(venue.capacities))} pax
                          </span>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-center">
                          <div className="p-1.5 bg-stone-50 rounded border border-stone-200">
                            <span className="block text-[10px] text-stone-500 uppercase">Cinema</span>
                            <span className="font-mono font-bold text-xs text-stone-800">{venue.capacities.cinema}</span>
                          </div>
                          <div className="p-1.5 bg-stone-50 rounded border border-stone-200">
                            <span className="block text-[10px] text-stone-500 uppercase">School</span>
                            <span className="font-mono font-bold text-xs text-stone-800">{venue.capacities.schoolroom}</span>
                          </div>
                          <div className="p-1.5 bg-stone-50 rounded border border-stone-200">
                            <span className="block text-[10px] text-stone-500 uppercase">Banquet</span>
                            <span className="font-mono font-bold text-xs text-stone-800">{venue.capacities.banquet}</span>
                          </div>
                          <div className="p-1.5 bg-stone-50 rounded border border-stone-200">
                            <span className="block text-[10px] text-stone-500 uppercase">U-Shape</span>
                            <span className="font-mono font-bold text-xs text-stone-800">{venue.capacities.uShape}</span>
                          </div>
                          <div className="p-1.5 bg-stone-50 rounded border border-stone-200">
                            <span className="block text-[10px] text-stone-500 uppercase">Board</span>
                            <span className="font-mono font-bold text-xs text-stone-800">{venue.capacities.boardroom}</span>
                          </div>
                          <div className="p-1.5 bg-stone-50 rounded border border-stone-200">
                            <span className="block text-[10px] text-stone-500 uppercase">Cocktail</span>
                            <span className="font-mono font-bold text-xs text-stone-800">{venue.capacities.cocktail}</span>
                          </div>
                        </div>
                      </div>

                      {/* 2. Seasonal Hire Pricing Summary */}
                      <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 space-y-2">
                        <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-amber-600" /> Seasonal Full-Day Hire (Excl. VAT)
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="p-2 bg-white rounded border border-stone-200 text-center">
                            <span className="block text-[10px] font-semibold text-sky-700 uppercase">Low (May-Jul)</span>
                            <span className="font-mono font-bold text-stone-800">
                              R{venue.seasonalPricing.low.fullDayRate.toLocaleString()}
                            </span>
                            <span className="block text-[9px] text-stone-400 mt-0.5">
                              Half: R{venue.seasonalPricing.low.halfDayRate.toLocaleString()}
                            </span>
                          </div>
                          <div className="p-2 bg-white rounded border border-emerald-200 text-center ring-1 ring-emerald-500/10">
                            <span className="block text-[10px] font-semibold text-emerald-700 uppercase">Mid (Feb-Apr, Aug-Oct)</span>
                            <span className="font-mono font-bold text-stone-800">
                              R{venue.seasonalPricing.mid.fullDayRate.toLocaleString()}
                            </span>
                            <span className="block text-[9px] text-stone-400 mt-0.5">
                              Half: R{venue.seasonalPricing.mid.halfDayRate.toLocaleString()}
                            </span>
                          </div>
                          <div className="p-2 bg-white rounded border border-amber-200 text-center">
                            <span className="block text-[10px] font-semibold text-amber-700 uppercase">Peak (Nov-Jan)</span>
                            <span className="font-mono font-bold text-stone-800">
                              R{venue.seasonalPricing.peak.fullDayRate.toLocaleString()}
                            </span>
                            <span className="block text-[9px] text-stone-400 mt-0.5">
                              Half: R{venue.seasonalPricing.peak.halfDayRate.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 3. Attendee Tiers Overview */}
                      <div>
                        <span className="text-[11px] font-semibold text-stone-600 block mb-1">
                          Attendee Tier Flat Hire (1-30 / 31-60 / 61-100 / 101+ pax)
                        </span>
                        <div className="grid grid-cols-4 gap-1 text-[11px] font-mono">
                          {venue.attendeeTiers.map((tier) => (
                            <div key={tier.id} className="p-1 bg-stone-100 rounded text-center">
                              <span className="block text-[9px] text-stone-500">{tier.minPax}-{tier.maxPax}p</span>
                              <span className="font-bold text-stone-700">R{(tier.flatHire / 1000).toFixed(1)}k</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 4. Inclusions snippets */}
                      <div>
                        <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider block mb-1">
                          Standard Inclusions ({venue.inclusions.length})
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {venue.inclusions.slice(0, 3).map((inc, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 text-[10px] bg-stone-100 text-stone-600 rounded border border-stone-200"
                            >
                              {inc}
                            </span>
                          ))}
                          {venue.inclusions.length > 3 && (
                            <span className="px-1.5 py-0.5 text-[10px] text-stone-400 font-mono">
                              +{venue.inclusions.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-2 border-t border-stone-200 flex items-center justify-between gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEdit(venue);
                          }}
                          className="px-3 py-1.5 text-xs font-semibold text-[#1a472a] bg-[#1a472a]/10 hover:bg-[#1a472a]/20 rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Edit Venue Details
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCalcVenueId(venue.id);
                            setActiveTab('calculator');
                          }}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-[#1a472a] hover:bg-[#153821] rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                        >
                          <DollarSign className="w-3.5 h-3.5 text-[#d4af37]" />
                          Calculate / Book
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Full Venue Edit Mode */}
        {editingVenue && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-50 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setEditingVenue(null)}
                  className="px-2.5 py-1 text-xs font-semibold bg-stone-200 hover:bg-stone-300 rounded text-stone-700"
                >
                  ← Back to Venues List
                </button>
                <h3 className="font-estate font-bold text-base text-[#1a472a]">
                  Editing Venue: <span className="text-stone-800">{editingVenue.name}</span> ({editingVenue.code})
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingVenue(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveVenueEdit}
                  className="px-4 py-1.5 text-xs font-bold text-[#1a472a] bg-[#d4af37] hover:bg-[#c59b27] rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  Save Venue Changes
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Basic Details & Seating Capacities */}
              <div className="space-y-5">
                {/* Basic Details Box */}
                <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-3">
                  <h4 className="text-xs font-estate font-bold text-[#1a472a] uppercase tracking-wider">
                    Basic Identity & Physical Dimensions
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-1">Venue Name</label>
                      <input
                        type="text"
                        value={editingVenue.name}
                        onChange={(e) => setEditingVenue({ ...editingVenue, name: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-md focus:border-[#1a472a] focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-1">Venue Code</label>
                      <input
                        type="text"
                        value={editingVenue.code}
                        onChange={(e) => setEditingVenue({ ...editingVenue, code: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-md focus:border-[#1a472a] focus:outline-hidden font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">Subtitle / Setting</label>
                    <input
                      type="text"
                      value={editingVenue.subtitle}
                      onChange={(e) => setEditingVenue({ ...editingVenue, subtitle: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-md focus:border-[#1a472a] focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-1">Floor Area (m²)</label>
                      <input
                        type="number"
                        value={editingVenue.sqMeters}
                        onChange={(e) =>
                          setEditingVenue({ ...editingVenue, sqMeters: parseInt(e.target.value) || 0 })
                        }
                        className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-md focus:border-[#1a472a] focus:outline-hidden font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-1">Dimensions</label>
                      <input
                        type="text"
                        value={editingVenue.dimensions}
                        onChange={(e) => setEditingVenue({ ...editingVenue, dimensions: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-md focus:border-[#1a472a] focus:outline-hidden font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">Description</label>
                    <textarea
                      rows={3}
                      value={editingVenue.description}
                      onChange={(e) => setEditingVenue({ ...editingVenue, description: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-md focus:border-[#1a472a] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">Recommended For</label>
                    <input
                      type="text"
                      value={editingVenue.recommendedFor}
                      onChange={(e) => setEditingVenue({ ...editingVenue, recommendedFor: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-md focus:border-[#1a472a] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">Setup Restrictions / Curfews</label>
                    <input
                      type="text"
                      value={editingVenue.restrictions || ''}
                      onChange={(e) => setEditingVenue({ ...editingVenue, restrictions: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-md focus:border-[#1a472a] focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Seating Capacities Editor */}
                <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-3">
                  <h4 className="text-xs font-estate font-bold text-[#1a472a] uppercase tracking-wider flex items-center justify-between">
                    <span>Layout Seating Capacities (Pax)</span>
                    <span className="text-[11px] font-mono text-stone-400 font-normal">
                      Max: {Math.max(...Object.values(editingVenue.capacities))}
                    </span>
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {(Object.keys(editingVenue.capacities) as (keyof VenueCapacities)[]).map((format) => (
                      <div key={format}>
                        <label className="block text-[10px] font-semibold text-stone-600 uppercase mb-1">
                          {format}
                        </label>
                        <input
                          type="number"
                          value={editingVenue.capacities[format]}
                          onChange={(e) =>
                            setEditingVenue({
                              ...editingVenue,
                              capacities: {
                                ...editingVenue.capacities,
                                [format]: parseInt(e.target.value) || 0,
                              },
                            })
                          }
                          className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-md focus:border-[#1a472a] focus:outline-hidden font-mono text-center font-bold"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Seasonal Pricing & Attendee Tiers */}
              <div className="space-y-5">
                {/* Seasonal Rates Box */}
                <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-4">
                  <h4 className="text-xs font-estate font-bold text-[#1a472a] uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    Seasonal Venue Hire Rates (Excl. VAT)
                  </h4>

                  {/* Low Season */}
                  <div className="p-3 bg-sky-50/60 rounded-lg border border-sky-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-sky-900">
                        Low Season (Winter / Off-Peak: May – July)
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-semibold text-sky-800 uppercase mb-0.5">
                          Full-Day Hire (ZAR)
                        </label>
                        <input
                          type="number"
                          value={editingVenue.seasonalPricing.low.fullDayRate}
                          onChange={(e) =>
                            setEditingVenue({
                              ...editingVenue,
                              seasonalPricing: {
                                ...editingVenue.seasonalPricing,
                                low: {
                                  ...editingVenue.seasonalPricing.low,
                                  fullDayRate: parseFloat(e.target.value) || 0,
                                },
                              },
                            })
                          }
                          className="w-full px-2.5 py-1 text-xs border border-sky-300 rounded bg-white font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-sky-800 uppercase mb-0.5">
                          Half-Day Hire (ZAR)
                        </label>
                        <input
                          type="number"
                          value={editingVenue.seasonalPricing.low.halfDayRate}
                          onChange={(e) =>
                            setEditingVenue({
                              ...editingVenue,
                              seasonalPricing: {
                                ...editingVenue.seasonalPricing,
                                low: {
                                  ...editingVenue.seasonalPricing.low,
                                  halfDayRate: parseFloat(e.target.value) || 0,
                                },
                              },
                            })
                          }
                          className="w-full px-2.5 py-1 text-xs border border-sky-300 rounded bg-white font-mono font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Mid Season */}
                  <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-900">
                        Mid Season (Autumn & Spring: Feb–Apr, Aug–Oct)
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-semibold text-emerald-800 uppercase mb-0.5">
                          Full-Day Hire (ZAR)
                        </label>
                        <input
                          type="number"
                          value={editingVenue.seasonalPricing.mid.fullDayRate}
                          onChange={(e) =>
                            setEditingVenue({
                              ...editingVenue,
                              seasonalPricing: {
                                ...editingVenue.seasonalPricing,
                                mid: {
                                  ...editingVenue.seasonalPricing.mid,
                                  fullDayRate: parseFloat(e.target.value) || 0,
                                },
                              },
                            })
                          }
                          className="w-full px-2.5 py-1 text-xs border border-emerald-300 rounded bg-white font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-emerald-800 uppercase mb-0.5">
                          Half-Day Hire (ZAR)
                        </label>
                        <input
                          type="number"
                          value={editingVenue.seasonalPricing.mid.halfDayRate}
                          onChange={(e) =>
                            setEditingVenue({
                              ...editingVenue,
                              seasonalPricing: {
                                ...editingVenue.seasonalPricing,
                                mid: {
                                  ...editingVenue.seasonalPricing.mid,
                                  halfDayRate: parseFloat(e.target.value) || 0,
                                },
                              },
                            })
                          }
                          className="w-full px-2.5 py-1 text-xs border border-emerald-300 rounded bg-white font-mono font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Peak Season */}
                  <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-900">
                        Peak Season (Summer & Year-End: Nov – Jan)
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-semibold text-amber-800 uppercase mb-0.5">
                          Full-Day Hire (ZAR)
                        </label>
                        <input
                          type="number"
                          value={editingVenue.seasonalPricing.peak.fullDayRate}
                          onChange={(e) =>
                            setEditingVenue({
                              ...editingVenue,
                              seasonalPricing: {
                                ...editingVenue.seasonalPricing,
                                peak: {
                                  ...editingVenue.seasonalPricing.peak,
                                  fullDayRate: parseFloat(e.target.value) || 0,
                                },
                              },
                            })
                          }
                          className="w-full px-2.5 py-1 text-xs border border-amber-300 rounded bg-white font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-amber-800 uppercase mb-0.5">
                          Half-Day Hire (ZAR)
                        </label>
                        <input
                          type="number"
                          value={editingVenue.seasonalPricing.peak.halfDayRate}
                          onChange={(e) =>
                            setEditingVenue({
                              ...editingVenue,
                              seasonalPricing: {
                                ...editingVenue.seasonalPricing,
                                peak: {
                                  ...editingVenue.seasonalPricing.peak,
                                  halfDayRate: parseFloat(e.target.value) || 0,
                                },
                              },
                            })
                          }
                          className="w-full px-2.5 py-1 text-xs border border-amber-300 rounded bg-white font-mono font-bold"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Attendee Tiers Box */}
                <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-3">
                  <h4 className="text-xs font-estate font-bold text-[#1a472a] uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#1a472a]" />
                    Attendee Tier Pricing Tiers (1–4)
                  </h4>

                  <div className="space-y-2.5">
                    {editingVenue.attendeeTiers.map((tier, tIdx) => (
                      <div key={tier.id} className="p-2.5 bg-stone-50 rounded-lg border border-stone-200 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
                          <span>{tier.name}</span>
                          <span className="text-[10px] font-mono text-stone-500">
                            {tier.minPax} - {tier.maxPax} delegates
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <label className="block text-[10px] text-stone-500">Flat Hire (ZAR)</label>
                            <input
                              type="number"
                              value={tier.flatHire}
                              onChange={(e) => {
                                const newTiers = [...editingVenue.attendeeTiers];
                                newTiers[tIdx] = { ...tier, flatHire: parseFloat(e.target.value) || 0 };
                                setEditingVenue({ ...editingVenue, attendeeTiers: newTiers });
                              }}
                              className="w-full px-2 py-1 text-xs border border-stone-300 rounded bg-white font-mono font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-stone-500">Surcharge / Extra Pax (ZAR)</label>
                            <input
                              type="number"
                              value={tier.perExtraPaxRate}
                              onChange={(e) => {
                                const newTiers = [...editingVenue.attendeeTiers];
                                newTiers[tIdx] = { ...tier, perExtraPaxRate: parseFloat(e.target.value) || 0 };
                                setEditingVenue({ ...editingVenue, attendeeTiers: newTiers });
                              }}
                              className="w-full px-2 py-1 text-xs border border-stone-300 rounded bg-white font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Inclusions & Features Editor */}
                <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-3">
                  <h4 className="text-xs font-estate font-bold text-[#1a472a] uppercase tracking-wider">
                    Inclusions & Technical Features
                  </h4>

                  {/* Inclusions */}
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">Standard Inclusions</label>
                    <div className="space-y-1 max-h-32 overflow-y-auto mb-2">
                      {editingVenue.inclusions.map((inc, iIdx) => (
                        <div
                          key={iIdx}
                          className="flex items-center justify-between px-2.5 py-1 text-xs bg-stone-50 rounded border border-stone-200"
                        >
                          <span className="text-stone-700">{inc}</span>
                          <button
                            onClick={() => {
                              const updatedInc = editingVenue.inclusions.filter((_, idx) => idx !== iIdx);
                              setEditingVenue({ ...editingVenue, inclusions: updatedInc });
                            }}
                            className="text-stone-400 hover:text-red-600 p-0.5"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add new inclusion..."
                        value={newInclusionText}
                        onChange={(e) => setNewInclusionText(e.target.value)}
                        className="flex-1 px-2.5 py-1 text-xs border border-stone-300 rounded"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newInclusionText.trim()) {
                            e.preventDefault();
                            setEditingVenue({
                              ...editingVenue,
                              inclusions: [...editingVenue.inclusions, newInclusionText.trim()],
                            });
                            setNewInclusionText('');
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          if (newInclusionText.trim()) {
                            setEditingVenue({
                              ...editingVenue,
                              inclusions: [...editingVenue.inclusions, newInclusionText.trim()],
                            });
                            setNewInclusionText('');
                          }
                        }}
                        className="px-2.5 py-1 text-xs font-semibold bg-[#1a472a] text-white rounded"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Calculator & Booking Assignment */}
        {activeTab === 'calculator' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-50 space-y-6">
            <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
                <div>
                  <h3 className="font-estate font-bold text-base text-[#1a472a] flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-amber-500" />
                    Venue Hire Quotation & Dynamic Pricing Calculator
                  </h3>
                  <p className="text-xs text-stone-600 mt-0.5">
                    Simulate hire rates across seasons and delegate tiers, and link the chosen venue directly to the active conference.
                  </p>
                </div>

                {activeConference && (
                  <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 font-medium">
                    Active Booking: <strong>{activeConference.clientName}</strong> ({activeConference.delegateCurrent} pax)
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5">
                {/* 1. Venue Select */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">1. Select Venue (1 to 5)</label>
                  <select
                    value={calcVenueId}
                    onChange={(e) => setCalcVenueId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white font-medium focus:border-[#1a472a] focus:outline-hidden"
                  >
                    {venues.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.code}: {v.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Pricing Model */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">2. Pricing Structure</label>
                  <div className="grid grid-cols-2 gap-1 p-1 bg-stone-100 rounded-lg border border-stone-200">
                    <button
                      onClick={() => setCalcModel('seasonal')}
                      className={`py-1 text-xs font-semibold rounded ${
                        calcModel === 'seasonal' ? 'bg-[#1a472a] text-white shadow-2xs' : 'text-stone-600'
                      }`}
                    >
                      Time of Year
                    </button>
                    <button
                      onClick={() => setCalcModel('attendee-tier')}
                      className={`py-1 text-xs font-semibold rounded ${
                        calcModel === 'attendee-tier' ? 'bg-[#1a472a] text-white shadow-2xs' : 'text-stone-600'
                      }`}
                    >
                      Attendee Tier
                    </button>
                  </div>
                </div>

                {/* 3. Season / Tier Options */}
                {calcModel === 'seasonal' ? (
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">3. Season & Duration</label>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={calcSeason}
                        onChange={(e) => setCalcSeason(e.target.value as any)}
                        className="px-2 py-1.5 text-xs border border-stone-300 rounded-lg bg-white"
                      >
                        <option value="low">Low (May-Jul)</option>
                        <option value="mid">Mid (Feb-Apr, Aug-Oct)</option>
                        <option value="peak">Peak (Nov-Jan)</option>
                      </select>
                      <select
                        value={calcDuration}
                        onChange={(e) => setCalcDuration(e.target.value as any)}
                        className="px-2 py-1.5 text-xs border border-stone-300 rounded-lg bg-white"
                      >
                        <option value="Full-Day">Full-Day</option>
                        <option value="Half-Day">Half-Day</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">3. Tier Matrix Model</label>
                    <div className="p-2 bg-stone-100 rounded-lg text-xs text-stone-600 font-medium">
                      Auto-matched to attendee count
                    </div>
                  </div>
                )}

                {/* 4. Delegates Input */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">4. Expected Delegates</label>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={calcAttendees}
                    onChange={(e) => setCalcAttendees(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg bg-white font-mono font-bold text-center"
                  />
                </div>
              </div>

              {/* Calculation Result Display */}
              {liveCalculation && selectedCalcVenue && (
                <div className="mt-6 p-5 bg-gradient-to-r from-stone-900 to-[#1a472a] text-white rounded-xl shadow-md space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[#d4af37] font-semibold">
                        {selectedCalcVenue.code} • {selectedCalcVenue.name}
                      </span>
                      <h4 className="text-xl font-estate font-bold text-white mt-0.5">
                        Venue Hire: R{liveCalculation.totalHire.toLocaleString()}{' '}
                        <span className="text-xs font-sans text-stone-300 font-normal">(Excl. VAT)</span>
                      </h4>
                      <p className="text-xs text-stone-300 mt-1 font-mono">{liveCalculation.breakdownText}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs text-stone-300">
                        Incl. 15% VAT: <strong className="text-emerald-400 font-mono">R{(liveCalculation.totalHire * 1.15).toLocaleString()}</strong>
                      </div>
                      <span className="text-[10px] text-stone-400 block mt-0.5">
                        Capacity: {Math.max(...Object.values(selectedCalcVenue.capacities))} pax max ({selectedCalcVenue.sqMeters} m²)
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="text-stone-300 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-[#d4af37]" />
                      <span>
                        Includes generator backup, uncapped estate fibre, climate control, and setup.
                      </span>
                    </div>

                    {activeConference && onAssignVenueToConference && (
                      <button
                        onClick={handleAssignToActiveConference}
                        className="px-4 py-2 text-xs font-bold text-[#1a472a] bg-[#d4af37] hover:bg-[#c59b27] rounded-lg shadow-sm transition-colors flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Assign to Active Conference ({activeConference.clientName})
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Venue Comparison Cards */}
            <div>
              <h4 className="text-xs font-estate font-bold text-[#1a472a] uppercase tracking-wider mb-3">
                Quick Rates Comparison for {calcAttendees} Delegates ({calcDuration}, {calcSeason.toUpperCase()} Season)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {venues.map((v) => {
                  const quote = calculateVenueHireQuote(v, {
                    model: calcModel,
                    season: calcSeason,
                    duration: calcDuration,
                    attendees: calcAttendees,
                  });
                  const isCurrent = v.id === calcVenueId;

                  return (
                    <div
                      key={v.id}
                      onClick={() => setCalcVenueId(v.id)}
                      className={`p-3 bg-white rounded-lg border cursor-pointer transition-all ${
                        isCurrent
                          ? 'border-[#1a472a] ring-2 ring-[#1a472a]/20 bg-[#1a472a]/5'
                          : 'border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <span className="text-[10px] font-mono font-bold text-stone-500 uppercase">{v.code}</span>
                      <h5 className="font-estate font-bold text-xs text-stone-800 line-clamp-1">{v.name}</h5>
                      <span className="text-base font-bold font-mono text-[#1a472a] block mt-1">
                        R{quote.totalHire.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-stone-400 block mt-0.5">
                        Max: {Math.max(...Object.values(v.capacities))} pax
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Official Rate Card & Comparison Matrix (Formatted for Print) */}
        {activeTab === 'matrix' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white space-y-6 printable-rate-card">
            {/* Printable Rate Card Header */}
            <div className="text-center pb-4 border-b-2 border-[#1a472a]">
              <div className="inline-block px-3 py-1 bg-[#1a472a] text-white font-estate font-bold text-xs tracking-widest uppercase mb-1">
                Rawdons Hotel & Brewery • Nottingham Road, KZN
              </div>
              <h3 className="text-xl font-estate font-bold text-stone-900">
                Official Conference & Event Venues Directory
              </h3>
              <p className="text-xs text-stone-600 mt-1">
                Comprehensive Capacity Specifications & Seasonal Venue Hire Tariffs (2026/2027)
              </p>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto border border-stone-200 rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#1a472a] text-white text-[11px] font-estate uppercase tracking-wider">
                    <th className="p-2.5 border-r border-[#1a472a]/40">Venue</th>
                    <th className="p-2.5 border-r border-[#1a472a]/40 text-center">Area (m²)</th>
                    <th className="p-2.5 border-r border-[#1a472a]/40 text-center">Cinema</th>
                    <th className="p-2.5 border-r border-[#1a472a]/40 text-center">School</th>
                    <th className="p-2.5 border-r border-[#1a472a]/40 text-center">Banquet</th>
                    <th className="p-2.5 border-r border-[#1a472a]/40 text-center">U-Shape</th>
                    <th className="p-2.5 border-r border-[#1a472a]/40 text-center">Board</th>
                    <th className="p-2.5 border-r border-[#1a472a]/40 text-center">Cocktail</th>
                    <th className="p-2.5 border-r border-[#1a472a]/40 text-right">Low Season (Full/Half)</th>
                    <th className="p-2.5 border-r border-[#1a472a]/40 text-right">Mid Season (Full/Half)</th>
                    <th className="p-2.5 text-right">Peak Season (Full/Half)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {venues.map((venue) => (
                    <tr key={venue.id} className="hover:bg-stone-50">
                      <td className="p-2.5 border-r border-stone-200">
                        <span className="font-bold text-stone-900 block font-estate">{venue.name}</span>
                        <span className="text-[10px] text-stone-500 font-mono">{venue.subtitle}</span>
                      </td>
                      <td className="p-2.5 border-r border-stone-200 text-center font-mono font-bold text-stone-700">
                        {venue.sqMeters}
                      </td>
                      <td className="p-2.5 border-r border-stone-200 text-center font-mono">{venue.capacities.cinema}</td>
                      <td className="p-2.5 border-r border-stone-200 text-center font-mono">{venue.capacities.schoolroom}</td>
                      <td className="p-2.5 border-r border-stone-200 text-center font-mono">{venue.capacities.banquet}</td>
                      <td className="p-2.5 border-r border-stone-200 text-center font-mono">{venue.capacities.uShape}</td>
                      <td className="p-2.5 border-r border-stone-200 text-center font-mono">{venue.capacities.boardroom}</td>
                      <td className="p-2.5 border-r border-stone-200 text-center font-mono font-bold text-[#1a472a]">{venue.capacities.cocktail}</td>
                      <td className="p-2.5 border-r border-stone-200 text-right font-mono text-stone-800">
                        R{venue.seasonalPricing.low.fullDayRate.toLocaleString()} <span className="text-stone-400">/ R{venue.seasonalPricing.low.halfDayRate.toLocaleString()}</span>
                      </td>
                      <td className="p-2.5 border-r border-stone-200 text-right font-mono font-bold text-[#1a472a]">
                        R{venue.seasonalPricing.mid.fullDayRate.toLocaleString()} <span className="text-stone-400 font-normal">/ R{venue.seasonalPricing.mid.halfDayRate.toLocaleString()}</span>
                      </td>
                      <td className="p-2.5 text-right font-mono text-amber-900 font-bold">
                        R{venue.seasonalPricing.peak.fullDayRate.toLocaleString()} <span className="text-stone-400 font-normal">/ R{venue.seasonalPricing.peak.halfDayRate.toLocaleString()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Inclusions & General Terms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-stone-600 pt-2">
              <div className="p-3 bg-stone-50 rounded border border-stone-200">
                <h5 className="font-bold text-stone-800 mb-1">Standard Conference Inclusions</h5>
                <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                  <li>Laser presentation projection, motorized screens, and audio sound system</li>
                  <li>Uncapped high-speed estate fibre Wi-Fi connectivity throughout</li>
                  <li>Dual split climate control heating/cooling & fireplace in select venues</li>
                  <li>Uninterrupted power via automatic on-site estate backup generator</li>
                </ul>
              </div>

              <div className="p-3 bg-stone-50 rounded border border-stone-200">
                <h5 className="font-bold text-stone-800 mb-1">Seasonality & Terms</h5>
                <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                  <li><strong>Low Season:</strong> May – July (Winter special rates)</li>
                  <li><strong>Mid Season:</strong> Feb – Apr, Aug – Oct (Standard corporate rates)</li>
                  <li><strong>Peak Season:</strong> Nov – Jan (Summer and year-end celebrations)</li>
                  <li>All tariffs quoted in South African Rand (ZAR) exclusive of 15% VAT</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Footer (No print) */}
        <div className="no-print px-6 py-3 bg-stone-100 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Rawdons Estate Venues Manager • All 5 Venues Synchronized & Persisted</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
