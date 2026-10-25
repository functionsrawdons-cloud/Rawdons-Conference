import React, { useState } from 'react';
import {
  X,
  Check,
  Calendar,
  Users,
  Building,
  Plus,
  FileText,
  Clock,
  Utensils,
  Monitor,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  BedDouble,
  Layers,
  HelpCircle
} from 'lucide-react';
import {
  ConferenceEvent,
  SeatingFormat,
  PackageType,
  AvRequirementType,
} from '../types/conference';
import { createStandardWorkflow } from '../data/defaultConferences';

interface NewEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateEvent: (newEvent: ConferenceEvent) => void;
}

export const NewEventModal: React.FC<NewEventModalProps> = ({ isOpen, onClose, onCreateEvent }) => {
  // Client & Organization Details
  const [clientName, setClientName] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // PDF Section 1: Initial Requirements
  const [dateRange, setDateRange] = useState('');
  const [dateFlexibility, setDateFlexibility] = useState('Flexible (+/- 1-2 days)');
  const [delegateMin, setDelegateMin] = useState<number>(30);
  const [delegateMax, setDelegateMax] = useState<number>(40);
  const [delegateCurrent, setDelegateCurrent] = useState<number>(35);
  const [accommodationSingle, setAccommodationSingle] = useState<number>(10);
  const [accommodationSharing, setAccommodationSharing] = useState<number>(4);
  const [seatingFormat, setSeatingFormat] = useState<SeatingFormat>('U-Shape');
  const [breakawayRoomsNeeded, setBreakawayRoomsNeeded] = useState(false);
  const [breakawayRoomsCount, setBreakawayRoomsCount] = useState<number>(1);
  const [dailyStartTime, setDailyStartTime] = useState('08:30');
  const [dailyEndTime, setDailyEndTime] = useState('17:00');
  const [eveningEvents, setEveningEvents] = useState('Informal arrival dinner on night 1; Gala banquet on night 2');

  // PDF Section 2: Culinary & Beverage Excellence
  const [packageType, setPackageType] = useState<PackageType>('Full-Day Package');
  const [dietaryPreliminaryNotes, setDietaryPreliminaryNotes] = useState('Estimate 3 Vegetarian, 1 Gluten-Free, 1 Halaal (final 7-day list to follow)');
  const [customDiningNotes, setCustomDiningNotes] = useState('3-Course evening banquet in the main estate dining room');
  const [packageRate, setPackageRate] = useState<number>(680);

  // PDF Section 3: Venue & Technical Inclusions
  const [venueRoom, setVenueRoom] = useState('The Mill Room & Lake Lawn');
  const [avRequirements, setAvRequirements] = useState<AvRequirementType>('Standard (Projector, Screen, Wi-Fi, Flipcharts)');
  const [avSpecialNotes, setAvSpecialNotes] = useState('Podium mic and HDMI display link needed.');

  // PDF Section 4: The Booking Timeline & Process
  const [siteInspectionRequested, setSiteInspectionRequested] = useState(true);
  const [provisionalHoldRequested, setProvisionalHoldRequested] = useState(true);
  const [clientSpecialRequests, setClientSpecialRequests] = useState('Require early luggage storage for morning arrivals before check-in.');

  if (!isOpen) return null;

  // Pre-fill helper to simulate client reply to PDF
  const handlePreFillSample = () => {
    setClientName('Midlands Timber & Forestry Co.');
    setEventTitle('Annual Operations & Safety Conference 2026');
    setContactPerson('Mark Botha (HR & Operations Director)');
    setContactEmail('mark.botha@midlandstimber.co.za');
    setContactPhone('+27 82 914 4301');
    setDateRange('18 – 20 November 2026');
    setDateFlexibility('Preferred 18-20 Nov, can shift to 25-27 Nov if needed');
    setDelegateMin(28);
    setDelegateMax(36);
    setDelegateCurrent(32);
    setAccommodationSingle(14);
    setAccommodationSharing(6);
    setSeatingFormat('U-Shape');
    setBreakawayRoomsNeeded(true);
    setBreakawayRoomsCount(1);
    setDailyStartTime('08:00');
    setDailyEndTime('16:30');
    setEveningEvents('Day 1: Informal BBQ / Braai on Lake Veranda; Day 2: 3-course Plated Awards Banquet');
    setPackageType('Full-Day Package');
    setDietaryPreliminaryNotes('2 Strict Vegetarians, 2 Halaal-certified, 1 Shellfish allergy');
    setCustomDiningNotes('Midlands grass-fed beef fillet and Karoo lamb options for gala dinner');
    setPackageRate(750);
    setVenueRoom('The Mill Room & Lake Lawn');
    setAvRequirements('Standard (Projector, Screen, Wi-Fi, Flipcharts)');
    setAvSpecialNotes('Dual presentation clickers and roving condenser mic for Q&A sessions.');
    setSiteInspectionRequested(true);
    setProvisionalHoldRequested(true);
    setClientSpecialRequests('Need lawn access for outdoor group photo and coffee truck setup.');
  };

  const totalRooms = accommodationSingle + accommodationSharing;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || !clientName.trim()) return;

    const newId = `conf-${Date.now().toString(36)}`;
    const effectiveCostPerHead = Math.round(packageRate * 0.32); // targeting 32% food cost
    const totalEstimate = Math.round(packageRate * delegateCurrent * 1.25);
    const depositAmount = Math.round(totalEstimate * 0.5);

    const newEvent: ConferenceEvent = {
      id: newId,
      clientName: clientName.trim(),
      eventTitle: eventTitle.trim(),
      contactPerson: contactPerson.trim() || 'Event Organizer',
      contactEmail: contactEmail.trim() || 'functions.rawdons@gmail.com',
      contactPhone: contactPhone.trim() || '+27 33 266 6044',

      // Section 1: Initial Requirements
      dateRange: dateRange.trim() || '18 – 20 November 2026',
      startDate: '2026-11-18',
      endDate: '2026-11-20',
      dateFlexibility: dateFlexibility.trim(),
      delegateMin: Math.max(1, delegateMin),
      delegateMax: Math.max(delegateMin, delegateMax),
      delegateCurrent: delegateCurrent,
      accommodationSingle,
      accommodationSharing,
      accommodationRooms: totalRooms,
      seatingFormat,
      breakawayRoomsNeeded,
      breakawayRoomsCount: breakawayRoomsNeeded ? breakawayRoomsCount : 0,
      dailyStartTime,
      dailyEndTime,
      eveningEvents,

      // Section 2: Culinary & Beverage Excellence
      packageType,
      cateringPackage: `${packageType} with Evening Dinner Service`,
      costPerHead: effectiveCostPerHead,
      sellingPricePerHead: packageRate,
      dietary: {
        standard: Math.max(0, delegateCurrent - 4),
        vegetarian: 2,
        vegan: 1,
        glutenFree: 1,
        halaal: 0,
        nutAllergy: 0,
        diabetic: 0,
        specialNotes: dietaryPreliminaryNotes,
      },

      // Section 3: Venue & Technical Inclusions
      venueRoom,
      avRequirements,
      avSpecialNotes,

      // Section 4: Booking Timeline & Process
      siteInspectionRequested,
      provisionalHoldUntil: provisionalHoldRequested ? 'Held for 14 days from inquiry' : undefined,
      contractSigned: false,
      depositPaid: false,
      depositAmount,
      totalInvoiceEstimate: totalEstimate,
      status: 'Inquiry',
      clientSpecialRequests,

      workflow: createStandardWorkflow(),
      createdAt: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    onCreateEvent(newEvent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header aligned with Rawdons PDF branding */}
        <div className="px-6 py-4 bg-[#1a472a] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#d4af37] text-[#1a472a] flex items-center justify-center font-estate font-black text-base shadow-inner">
              R
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest text-[#d4af37] uppercase font-bold">
                  Client Response Entry
                </span>
                <span className="text-white/40">·</span>
                <a
                  href={`${import.meta.env.BASE_URL}assets/aistudio/Rawdons_Conference_Guidelines__1__53dec1c6.pdf`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-[#d4af37] hover:underline flex items-center gap-1"
                  title="View original Guidelines PDF"
                >
                  <FileText className="w-3 h-3" />
                  View Guidelines PDF
                </a>
              </div>
              <h2 className="text-lg font-estate font-bold text-white tracking-wide">
                New Conference Booking · Planning Guidelines Response
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePreFillSample}
              className="px-2.5 py-1 text-xs font-semibold text-[#1a472a] bg-[#d4af37] hover:bg-[#c59b27] rounded-md transition-colors flex items-center gap-1 shadow-2xs"
              title="Populate fields with a realistic client response to the PDF"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Pre-fill Sample Reply
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Body organized exactly by PDF sections */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 text-xs text-stone-800">
          {/* Client & Organization Overview */}
          <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
              Client & Organization Information
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Client / Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. KZN AgriTech Holdings"
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs font-semibold text-stone-900 focus:ring-2 focus:ring-[#1a472a] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Conference Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="e.g. Annual Strategic Executive Offsite 2026"
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs font-semibold text-stone-900 focus:ring-2 focus:ring-[#1a472a] focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Contact Person / Planner
                </label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="e.g. Elize Van Der Merwe"
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:ring-2 focus:ring-[#1a472a] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Client Email Address
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="client@company.co.za"
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:ring-2 focus:ring-[#1a472a] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Client Phone / Mobile
                </label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+27 82 ..."
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:ring-2 focus:ring-[#1a472a] focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 1: Initial Requirements (Aligned with PDF Section 1) */}
          <div className="border border-stone-200 rounded-lg p-4 space-y-4">
            <div className="border-b border-stone-200 pb-2 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-estate font-bold text-[#1a472a] flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#1a472a] text-white flex items-center justify-center text-[10px] font-mono">1</span>
                  1. Initial Requirements: Tailoring Your Experience
                </h3>
                <p className="text-[11px] text-stone-500">
                  Dates & flexibility, delegate headcount bounds, room allocations, format & schedule outline
                </p>
              </div>
              <span className="text-[10px] font-mono uppercase bg-stone-100 text-stone-600 px-2 py-0.5 rounded font-semibold">
                PDF Page 1
              </span>
            </div>

            {/* 1A: Proposed Dates & Flexibility */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#1a472a]" /> Proposed Dates (Preferred)
                </label>
                <input
                  type="text"
                  required
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  placeholder="e.g. 28 – 30 October 2026"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold text-stone-900 focus:ring-2 focus:ring-[#1a472a] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Dates Flexibility Notes
                </label>
                <input
                  type="text"
                  value={dateFlexibility}
                  onChange={(e) => setDateFlexibility(e.target.value)}
                  placeholder="e.g. Strictly fixed, or flexible by +/- 2 days"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:ring-2 focus:ring-[#1a472a] focus:outline-hidden"
                />
              </div>
            </div>

            {/* 1B: Delegate Numbers (Min/Max/Current) */}
            <div className="grid grid-cols-3 gap-3 p-3 bg-stone-50/80 rounded-lg border border-stone-200">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Min Delegates
                </label>
                <input
                  type="number"
                  min="1"
                  max="200"
                  value={delegateMin}
                  onChange={(e) => setDelegateMin(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded font-mono font-bold text-center text-xs text-stone-900 focus:outline-hidden"
                />
                <span className="text-[10px] text-stone-400 block mt-0.5 text-center">Contract Minimum</span>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Expected Attendees
                </label>
                <input
                  type="number"
                  min="1"
                  max="200"
                  value={delegateCurrent}
                  onChange={(e) => setDelegateCurrent(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-white border border-[#1a472a] rounded font-mono font-bold text-center text-xs text-[#1a472a] focus:outline-hidden ring-1 ring-[#1a472a]"
                />
                <span className="text-[10px] text-stone-500 block mt-0.5 text-center font-semibold">Active Headcount</span>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Max Delegates Cap
                </label>
                <input
                  type="number"
                  min="1"
                  max="200"
                  value={delegateMax}
                  onChange={(e) => setDelegateMax(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded font-mono font-bold text-center text-xs text-stone-900 focus:outline-hidden"
                />
                <span className="text-[10px] text-stone-400 block mt-0.5 text-center">Room Capacity Cap</span>
              </div>
            </div>

            {/* 1C: Accommodation - Single vs Sharing */}
            <div className="p-3 bg-stone-50/80 rounded-lg border border-stone-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-stone-700 flex items-center gap-1.5">
                  <BedDouble className="w-3.5 h-3.5 text-[#1a472a]" />
                  Accommodation: Overnight Delegate Rooms
                </span>
                <span className="font-mono text-xs font-bold text-[#1a472a] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Total {totalRooms} Lodge Rooms Blocked
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-1">
                    Single Rooms Required
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={accommodationSingle}
                    onChange={(e) => setAccommodationSingle(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded font-mono font-bold text-center text-xs text-stone-900 focus:outline-hidden"
                  />
                  <span className="text-[10px] text-stone-400 block mt-0.5 text-center">Solo executive rooms</span>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-1">
                    Sharing / Twin Rooms Required
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={accommodationSharing}
                    onChange={(e) => setAccommodationSharing(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded font-mono font-bold text-center text-xs text-stone-900 focus:outline-hidden"
                  />
                  <span className="text-[10px] text-stone-400 block mt-0.5 text-center">Twin beds per room</span>
                </div>
              </div>
            </div>

            {/* 1D: Conference Format & Breakaway Rooms */}
            <div className="space-y-2">
              <label className="block font-semibold text-stone-700">
                Conference Seating Arrangement (as highlighted in PDF)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['U-Shape', 'Schoolroom', 'Cinema', 'Boardroom'] as SeatingFormat[]).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setSeatingFormat(fmt)}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                      seatingFormat === fmt
                        ? 'bg-[#1a472a] text-white border-[#1a472a] shadow-xs'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>

              {/* Breakaway Rooms Requirement */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-stone-50 rounded-lg border border-stone-200">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-stone-800">
                  <input
                    type="checkbox"
                    checked={breakawayRoomsNeeded}
                    onChange={(e) => setBreakawayRoomsNeeded(e.target.checked)}
                    className="w-4 h-4 rounded text-[#1a472a] accent-[#1a472a]"
                  />
                  <span>Requirements for Breakaway Rooms</span>
                </label>

                {breakawayRoomsNeeded && (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-stone-500">Breakaway Rooms Count:</span>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={breakawayRoomsCount}
                      onChange={(e) => setBreakawayRoomsCount(Number(e.target.value))}
                      className="w-16 px-2 py-1 bg-white border border-stone-300 rounded text-center font-mono font-bold text-xs"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 1E: Event Schedule Outline */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#1a472a]" /> Daily Start Time
                </label>
                <input
                  type="time"
                  value={dailyStartTime}
                  onChange={(e) => setDailyStartTime(e.target.value)}
                  className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-mono font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#1a472a]" /> Daily End Time
                </label>
                <input
                  type="time"
                  value={dailyEndTime}
                  onChange={(e) => setDailyEndTime(e.target.value)}
                  className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-mono font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Evening Events / Dinners
                </label>
                <input
                  type="text"
                  value={eveningEvents}
                  onChange={(e) => setEveningEvents(e.target.value)}
                  placeholder="e.g. Gala dinner, casual pub mixer"
                  className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-800"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Culinary & Beverage Excellence (Aligned with PDF Section 2) */}
          <div className="border border-stone-200 rounded-lg p-4 space-y-4">
            <div className="border-b border-stone-200 pb-2 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-estate font-bold text-[#1a472a] flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#1a472a] text-white flex items-center justify-center text-[10px] font-mono">2</span>
                  2. Culinary & Beverage Excellence
                </h3>
                <p className="text-[11px] text-stone-500">
                  Standard Full-Day vs Half-Day packages, dietary requirements, and custom evening dining
                </p>
              </div>
              <span className="text-[10px] font-mono uppercase bg-stone-100 text-stone-600 px-2 py-0.5 rounded font-semibold">
                PDF Page 1
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Catering Package Type
                </label>
                <select
                  value={packageType}
                  onChange={(e) => {
                    const pt = e.target.value as PackageType;
                    setPackageType(pt);
                    if (pt === 'Half-Day Package') setPackageRate(520);
                    else if (pt === 'Full-Day Package') setPackageRate(680);
                    else setPackageRate(890);
                  }}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold text-stone-900 focus:ring-2 focus:ring-[#1a472a] focus:outline-hidden"
                >
                  <option value="Full-Day Package">Full-Day Package (Arrival, Tea, Lunch, PM Tea)</option>
                  <option value="Half-Day Package">Half-Day Package (Arrival, Morning Break, Lunch)</option>
                  <option value="Custom Executive Package">Custom Executive Package (Tailored Set Menu)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Package Selling Rate (pp)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-stone-400">R</span>
                  <input
                    type="number"
                    min="200"
                    max="3000"
                    step="20"
                    value={packageRate}
                    onChange={(e) => setPackageRate(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-mono font-bold text-stone-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Venue / Conference Suite
                </label>
                <select
                  value={venueRoom}
                  onChange={(e) => setVenueRoom(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold text-stone-900 focus:ring-2 focus:ring-[#1a472a] focus:outline-hidden"
                >
                  <option value="Main Conference Room (The Mill Room & Lake Lawn)">1. Main Conference Room (The Mill Room & Lake Lawn)</option>
                  <option value="Breakfast Dining Room / Patio">2. Breakfast Dining Room / Patio</option>
                  <option value="Stirrup Cup (Historic Fireside Pub)">3. Stirrup Cup (Historic Fireside Pub)</option>
                  <option value="Bar Garden / Brewery Taproom">4. Bar Garden / Brewery Taproom</option>
                  <option value="Full Hotel and All Venues (Exclusive Buyout)">5. Full Hotel and All Venues (Exclusive Buyout)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Dietary Requirements (Preliminary estimate)
                </label>
                <input
                  type="text"
                  value={dietaryPreliminaryNotes}
                  onChange={(e) => setDietaryPreliminaryNotes(e.target.value)}
                  placeholder="e.g. 2 Vegan, 3 Vegetarian, 1 Halaal, 1 Peanut allergy"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-800"
                />
                <span className="text-[10px] text-stone-400 block mt-0.5">
                  Confirmed 7-day dietary list due 7 days prior to arrival.
                </span>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Custom Dining & Evening Banquet Notes
                </label>
                <input
                  type="text"
                  value={customDiningNotes}
                  onChange={(e) => setCustomDiningNotes(e.target.value)}
                  placeholder="e.g. Plated 3-course gala dinner on evening 2"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-800"
                />
              </div>
            </div>
          </div>

          {/* Section 3 & 4: Technical Inclusions & Booking Timeline (Aligned with PDF Pages 1-2) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Section 3: Technical Inclusions */}
            <div className="border border-stone-200 rounded-lg p-4 space-y-3">
              <h3 className="text-xs font-estate font-bold text-[#1a472a] border-b border-stone-200 pb-1.5 flex items-center gap-1.5">
                <Monitor className="w-3.5 h-3.5 text-[#d4af37]" />
                3. Venue & Technical Inclusions
              </h3>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  AV Equipment Setup
                </label>
                <select
                  value={avRequirements}
                  onChange={(e) => setAvRequirements(e.target.value as AvRequirementType)}
                  className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-md text-xs font-medium text-stone-900"
                >
                  <option value="Standard (Projector, Screen, Wi-Fi, Flipcharts)">
                    Standard (Projector, Screen, Wi-Fi, Flipcharts) - Included
                  </option>
                  <option value="Advanced AV & Staging">
                    Advanced AV & Staging (Local Partner Staging)
                  </option>
                  <option value="Specialized Technical Support">
                    Specialized Technical Support / Dedicated Sound Tech
                  </option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Technical Specifications & AV Notes
                </label>
                <input
                  type="text"
                  value={avSpecialNotes}
                  onChange={(e) => setAvSpecialNotes(e.target.value)}
                  placeholder="e.g. Lapel mic, HDMI switcher, dual screens"
                  className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-md text-xs text-stone-800"
                />
              </div>
            </div>

            {/* Section 4: Booking Timeline & Site Inspection */}
            <div className="border border-stone-200 rounded-lg p-4 space-y-3">
              <h3 className="text-xs font-estate font-bold text-[#1a472a] border-b border-stone-200 pb-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#d4af37]" />
                4. The Booking Timeline & Process
              </h3>

              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-800">
                  <input
                    type="checkbox"
                    checked={siteInspectionRequested}
                    onChange={(e) => setSiteInspectionRequested(e.target.checked)}
                    className="w-4 h-4 rounded text-[#1a472a] accent-[#1a472a]"
                  />
                  <span>Step 2: Client Requests Site Inspection Walkthrough</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-800">
                  <input
                    type="checkbox"
                    checked={provisionalHoldRequested}
                    onChange={(e) => setProvisionalHoldRequested(e.target.checked)}
                    className="w-4 h-4 rounded text-[#1a472a] accent-[#1a472a]"
                  />
                  <span>Step 3: Issue 14-Day Provisional Date Hold</span>
                </label>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Client Special Requests / Next Steps Remarks
                </label>
                <input
                  type="text"
                  value={clientSpecialRequests}
                  onChange={(e) => setClientSpecialRequests(e.target.value)}
                  placeholder="Any bespoke requests from client reply..."
                  className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-md text-xs text-stone-800"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-[11px] text-stone-500 font-mono">
              Captures all 4 sections from Rawdons Conference Guidelines PDF
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-[#1a472a] hover:bg-[#143720] rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 text-[#d4af37]" />
                Create Conference & Generate Tasks
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
