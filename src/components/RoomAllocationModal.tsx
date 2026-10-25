import React, { useState, useMemo } from 'react';
import {
  X,
  Printer,
  Download,
  Users,
  Bed,
  BedDouble,
  Key,
  CheckCircle2,
  Circle,
  Filter,
  Search,
  Edit2,
  UserCheck,
  UserPlus,
  Trash2,
  Sparkles,
  AlertCircle,
  Building,
  RotateCcw,
  SlidersHorizontal,
  Home,
  Crown
} from 'lucide-react';
import {
  HotelRoom,
  GuestRoomAllocation,
  SleepingConfigType,
  HotelWing,
  ConferenceEvent
} from '../types/conference';

interface RoomAllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeConference: ConferenceEvent;
  rooms: HotelRoom[];
  allocations: GuestRoomAllocation[];
  onSaveAllocation: (allocation: GuestRoomAllocation) => void;
  onRemoveAllocation: (allocationId: string) => void;
  onUpdateRoomConfig: (updatedRoom: HotelRoom) => void;
  onAutoAllocate: () => void;
  onClearAllocations: () => void;
}

export const RoomAllocationModal: React.FC<RoomAllocationModalProps> = ({
  isOpen,
  onClose,
  activeConference,
  rooms,
  allocations,
  onSaveAllocation,
  onRemoveAllocation,
  onUpdateRoomConfig,
  onAutoAllocate,
  onClearAllocations
}) => {
  const [selectedWing, setSelectedWing] = useState<string>('All');
  const [selectedBedConfig, setSelectedBedConfig] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'Allocated' | 'Vacant' | 'VIP'>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals for editing guest allocation or room config
  const [assigningRoom, setAssigningRoom] = useState<HotelRoom | null>(null);
  const [editingAllocation, setEditingAllocation] = useState<GuestRoomAllocation | null>(null);
  const [editingRoomConfig, setEditingRoomConfig] = useState<HotelRoom | null>(null);

  // Form state for assigning / editing a guest
  const [formGuest1, setFormGuest1] = useState('');
  const [formGuest1Title, setFormGuest1Title] = useState('');
  const [formGuest1Phone, setFormGuest1Phone] = useState('');
  const [formGuest2, setFormGuest2] = useState('');
  const [formGuest2Title, setFormGuest2Title] = useState('');
  const [formOccupancyType, setFormOccupancyType] = useState<'Single' | 'Sharing' | 'House Use'>('Single');
  const [formVip, setFormVip] = useState(false);
  const [formKeycard, setFormKeycard] = useState(false);
  const [formCheckedIn, setFormCheckedIn] = useState(false);
  const [formRequests, setFormRequests] = useState('');

  // Form state for editing room config
  const [configBedType, setConfigBedType] = useState<SleepingConfigType>('King Bed');
  const [configRoomName, setConfigRoomName] = useState('');
  const [configSingleRate, setConfigSingleRate] = useState<number>(1650);
  const [configSharingRate, setConfigSharingRate] = useState<number>(1950);

  if (!isOpen) return null;

  // Map of allocations by roomId
  const allocationByRoomId = useMemo(() => {
    const map = new Map<string, GuestRoomAllocation>();
    allocations.forEach((alloc) => {
      map.set(alloc.roomId, alloc);
    });
    return map;
  }, [allocations]);

  // Summary Statistics
  const stats = useMemo(() => {
    const totalRooms = rooms.length; // 32
    const totalAllocated = allocations.length;
    const totalVacant = totalRooms - totalAllocated;

    let singleCount = 0;
    let sharingCount = 0;
    let totalGuestsAccommodated = 0;
    let keycardsEncoded = 0;
    let vipCount = 0;

    allocations.forEach((a) => {
      if (a.occupancyType === 'Sharing' || a.guest2Name) {
        sharingCount++;
        totalGuestsAccommodated += 2;
      } else {
        singleCount++;
        totalGuestsAccommodated += 1;
      }
      if (a.keyCardEncoded) keycardsEncoded++;
      if (a.vipStatus) vipCount++;
    });

    return {
      totalRooms,
      totalAllocated,
      totalVacant,
      singleCount,
      sharingCount,
      totalGuestsAccommodated,
      keycardsEncoded,
      vipCount,
      targetSingle: activeConference.accommodationSingle || 0,
      targetSharing: activeConference.accommodationSharing || 0,
      targetRooms: activeConference.accommodationRooms || 0,
    };
  }, [rooms, allocations, activeConference]);

  // Filtered rooms list
  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      if (selectedWing !== 'All' && r.wing !== selectedWing) return false;
      if (selectedBedConfig !== 'All' && r.bedConfig !== selectedBedConfig) return false;

      const alloc = allocationByRoomId.get(r.id);
      if (selectedStatus === 'Allocated' && !alloc) return false;
      if (selectedStatus === 'Vacant' && alloc) return false;
      if (selectedStatus === 'VIP' && (!alloc || !alloc.vipStatus)) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesRoom =
          String(r.roomNumber).includes(q) ||
          r.roomName.toLowerCase().includes(q) ||
          r.wing.toLowerCase().includes(q) ||
          r.bedConfig.toLowerCase().includes(q);

        const matchesGuest =
          alloc &&
          (alloc.guest1Name.toLowerCase().includes(q) ||
            (alloc.guest1Title && alloc.guest1Title.toLowerCase().includes(q)) ||
            (alloc.guest2Name && alloc.guest2Name.toLowerCase().includes(q)) ||
            (alloc.specialRequests && alloc.specialRequests.toLowerCase().includes(q)));

        return matchesRoom || Boolean(matchesGuest);
      }

      return true;
    });
  }, [rooms, selectedWing, selectedBedConfig, selectedStatus, searchQuery, allocationByRoomId]);

  // Open Assign / Edit Guest modal
  const handleOpenAssignModal = (room: HotelRoom, existing?: GuestRoomAllocation) => {
    setAssigningRoom(room);
    if (existing) {
      setEditingAllocation(existing);
      setFormGuest1(existing.guest1Name);
      setFormGuest1Title(existing.guest1Title || '');
      setFormGuest1Phone(existing.guest1Phone || '');
      setFormGuest2(existing.guest2Name || '');
      setFormGuest2Title(existing.guest2Title || '');
      setFormOccupancyType(existing.occupancyType === 'Vacant' ? 'Single' : existing.occupancyType);
      setFormVip(Boolean(existing.vipStatus));
      setFormKeycard(existing.keyCardEncoded);
      setFormCheckedIn(existing.checkedIn);
      setFormRequests(existing.specialRequests || '');
    } else {
      setEditingAllocation(null);
      setFormGuest1('');
      setFormGuest1Title('');
      setFormGuest1Phone('');
      setFormGuest2('');
      setFormGuest2Title('');
      const isTwin = room.bedConfig.includes('Twin') || room.bedConfig.includes('Two Double');
      setFormOccupancyType(isTwin ? 'Sharing' : 'Single');
      setFormVip(false);
      setFormKeycard(false);
      setFormCheckedIn(false);
      setFormRequests('');
    }
  };

  // Submit Guest Allocation
  const handleSaveGuestForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningRoom || !formGuest1.trim()) return;

    const newAlloc: GuestRoomAllocation = {
      id: editingAllocation?.id || `alloc-${Date.now()}`,
      roomId: assigningRoom.id,
      roomNumber: assigningRoom.roomNumber,
      conferenceId: activeConference.id,
      guest1Name: formGuest1.trim(),
      guest1Title: formGuest1Title.trim() || undefined,
      guest1Phone: formGuest1Phone.trim() || undefined,
      guest2Name: formOccupancyType === 'Sharing' && formGuest2.trim() ? formGuest2.trim() : undefined,
      guest2Title: formOccupancyType === 'Sharing' && formGuest2Title.trim() ? formGuest2Title.trim() : undefined,
      occupancyType: formOccupancyType,
      keyCardEncoded: formKeycard,
      checkedIn: formCheckedIn,
      vipStatus: formVip,
      specialRequests: formRequests.trim() || undefined,
      allocatedAt: editingAllocation?.allocatedAt || new Date().toISOString().split('T')[0]
    };

    onSaveAllocation(newAlloc);
    setAssigningRoom(null);
    setEditingAllocation(null);
  };

  // Open Room Config Editor
  const handleOpenConfigModal = (room: HotelRoom) => {
    setEditingRoomConfig(room);
    setConfigBedType(room.bedConfig);
    setConfigRoomName(room.roomName);
    setConfigSingleRate(room.baseRateSingle);
    setConfigSharingRate(room.baseRateSharing);
  };

  // Submit Room Config Edit
  const handleSaveConfigForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoomConfig) return;

    const updatedRoom: HotelRoom = {
      ...editingRoomConfig,
      bedConfig: configBedType,
      roomName: configRoomName.trim() || editingRoomConfig.roomName,
      baseRateSingle: Number(configSingleRate) || 1650,
      baseRateSharing: Number(configSharingRate) || 1950,
      maxOccupancy: configBedType.includes('Two Double') ? 3 : 2
    };

    onUpdateRoomConfig(updatedRoom);
    setEditingRoomConfig(null);
  };

  // Export Rooming List to CSV
  const handleExportCSV = () => {
    const csvRows = [
      ['RAWDONS HOTEL & BREWERY - 32 ROOMS GUEST ALLOCATION & ROOMING LIST'],
      ['Event Title', `"${activeConference.eventTitle}"`],
      ['Client', `"${activeConference.clientName}"`],
      ['Event Dates', `"${activeConference.dateRange}"`],
      ['Total Estate Capacity', '32 Rooms'],
      ['Rooms Blocked for Conference', `${stats.totalAllocated} Rooms (${stats.singleCount} Single / ${stats.sharingCount} Sharing)`],
      ['Total Guests Accommodated', `${stats.totalGuestsAccommodated} Delegates`],
      ['Keycards Ready', `${stats.keycardsEncoded} of ${stats.totalAllocated} Encoded`],
      [''],
      [
        'Room #',
        'Room Name',
        'Estate Wing',
        'Floor',
        'Sleeping Configuration',
        'Occupancy Type',
        'Primary Guest Name',
        'Primary Guest Title',
        'Sharing Guest Name',
        'Sharing Guest Title',
        'VIP Status',
        'Keycard Encoded',
        'Checked In',
        'Special Requests / Notes'
      ],
      ...rooms.map((r) => {
        const alloc = allocationByRoomId.get(r.id);
        return [
          r.roomNumber,
          `"${r.roomName}"`,
          `"${r.wing}"`,
          r.floor,
          `"${r.bedConfig}"`,
          alloc ? alloc.occupancyType : 'VACANT',
          alloc ? `"${alloc.guest1Name}"` : '—',
          alloc && alloc.guest1Title ? `"${alloc.guest1Title}"` : '—',
          alloc && alloc.guest2Name ? `"${alloc.guest2Name}"` : '—',
          alloc && alloc.guest2Title ? `"${alloc.guest2Title}"` : '—',
          alloc && alloc.vipStatus ? 'VIP' : 'Standard',
          alloc && alloc.keyCardEncoded ? 'YES' : 'NO',
          alloc && alloc.checkedIn ? 'CHECKED-IN' : 'PENDING',
          alloc && alloc.specialRequests ? `"${alloc.specialRequests.replace(/"/g, '""')}"` : '—'
        ];
      })
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Rawdons_32_Rooms_Allocation_${activeConference.id}_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const getBedConfigColor = (config: SleepingConfigType) => {
    switch (config) {
      case 'King Bed':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'Twin Beds (2x Single/Three-Quarter)':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'Queen Bed':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Two Double Beds':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'Executive Suite (King + Fireplace)':
      case 'Bridal & VIP Manor Suite':
        return 'bg-[#d4af37]/30 text-[#1a472a] border-[#d4af37] font-bold';
      default:
        return 'bg-stone-100 text-stone-800 border-stone-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/65 backdrop-blur-xs no-print-backdrop">
      <div className="relative w-full max-w-6xl bg-white rounded-xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header (hidden in print) */}
        <div className="no-print px-6 py-4 bg-[#1a472a] text-white flex items-center justify-between border-b border-[#d4af37]/40">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <BedDouble className="w-5 h-5 text-[#d4af37]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-estate font-bold text-white tracking-wide">
                  Rawdons 32 Rooms Allocation Studio
                </h2>
                <span className="text-[10px] font-mono uppercase bg-[#d4af37] text-[#1a472a] font-bold px-2 py-0.2 rounded-full">
                  Hotel Rooming Engine
                </span>
              </div>
              <p className="text-xs text-stone-200">
                Configure sleeping arrangements across all 32 rooms and assign delegates for {activeConference.eventTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 text-xs font-semibold text-[#1a472a] bg-stone-100 hover:bg-white rounded-md transition-colors flex items-center gap-1.5 shadow-2xs font-mono"
            >
              <Download className="w-3.5 h-3.5 text-[#1a472a]" />
              Export Rooming CSV
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 text-xs font-semibold text-[#1a472a] bg-[#d4af37] hover:bg-[#c59b27] rounded-md transition-colors flex items-center gap-1.5 shadow-2xs font-mono font-bold"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Reception List
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Accommodation KPI Strip & Target Tracker */}
        <div className="no-print p-4 bg-stone-50 border-b border-stone-200 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3 bg-white rounded-lg border border-stone-200 shadow-2xs">
              <span className="text-[10px] font-mono uppercase text-stone-500 block">Total Estate Inventory</span>
              <p className="text-lg font-bold font-mono text-[#1a472a] mt-0.5">32 Rooms</p>
              <span className="text-[10px] text-stone-400 font-mono">4 Estate Wings</span>
            </div>

            <div className="p-3 bg-white rounded-lg border border-stone-200 shadow-2xs">
              <span className="text-[10px] font-mono uppercase text-stone-500 block">Allocated / Blocked</span>
              <p className="text-lg font-bold font-mono text-[#1a472a] mt-0.5">
                {stats.totalAllocated} Rooms
              </p>
              <span className="text-[10px] text-stone-500 font-mono">
                Target: {stats.targetRooms} ({stats.targetSingle} Sgl / {stats.targetSharing} Shr)
              </span>
            </div>

            <div className="p-3 bg-white rounded-lg border border-stone-200 shadow-2xs">
              <span className="text-[10px] font-mono uppercase text-stone-500 block">Single Occupancy</span>
              <p className="text-lg font-bold font-mono text-emerald-800 mt-0.5">
                {stats.singleCount} Rooms
              </p>
              <span className="text-[10px] text-stone-400 font-mono">Target: {stats.targetSingle} Single</span>
            </div>

            <div className="p-3 bg-white rounded-lg border border-stone-200 shadow-2xs">
              <span className="text-[10px] font-mono uppercase text-stone-500 block">Sharing Occupancy</span>
              <p className="text-lg font-bold font-mono text-blue-800 mt-0.5">
                {stats.sharingCount} Rooms ({stats.sharingCount * 2} Pax)
              </p>
              <span className="text-[10px] text-stone-400 font-mono">Target: {stats.targetSharing} Sharing</span>
            </div>

            <div className="p-3 bg-white rounded-lg border border-stone-200 shadow-2xs">
              <span className="text-[10px] font-mono uppercase text-stone-500 block">Vacant for Walk-ins</span>
              <p className="text-lg font-bold font-mono text-stone-700 mt-0.5">
                {stats.totalVacant} Rooms
              </p>
              <span className="text-[10px] text-stone-400 font-mono">Available</span>
            </div>

            <div className="p-3 bg-white rounded-lg border border-stone-200 shadow-2xs">
              <span className="text-[10px] font-mono uppercase text-stone-500 block">Keycards Encoded</span>
              <p className="text-lg font-bold font-mono text-[#1a472a] mt-0.5">
                {stats.keycardsEncoded} / {stats.totalAllocated}
              </p>
              <span className="text-[10px] text-stone-400 font-mono">{stats.vipCount} VIP Guests</span>
            </div>
          </div>

          {/* Controls, Filters & Auto-Allocate Action */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2 border-t border-stone-200">
            {/* Wing selector tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold text-stone-500 mr-1 flex items-center gap-1">
                <Building className="w-3.5 h-3.5" /> Wing:
              </span>
              {(['All', 'Main Manor House', 'Lake Dam Wing', 'Garden Wing', 'Thatched Orchard Cottages'] as const).map(
                (w) => {
                  const label =
                    w === 'All'
                      ? 'All Wings (32)'
                      : w === 'Main Manor House'
                      ? 'Manor (8)'
                      : w === 'Lake Dam Wing'
                      ? 'Lake Dam (8)'
                      : w === 'Garden Wing'
                      ? 'Garden (8)'
                      : 'Orchard (8)';
                  return (
                    <button
                      key={w}
                      onClick={() => setSelectedWing(w)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                        selectedWing === w
                          ? 'bg-[#1a472a] text-white shadow-2xs'
                          : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {label}
                    </button>
                  );
                }
              )}
            </div>

            {/* Quick Actions & Search */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search guest, room #, VIP..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-xs pl-8 pr-3 py-1 bg-white border border-stone-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-[#1a472a]"
                />
              </div>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="text-xs px-2.5 py-1 bg-white border border-stone-200 rounded-md text-stone-700"
              >
                <option value="All">All Rooms (32)</option>
                <option value="Allocated">Allocated Only</option>
                <option value="Vacant">Vacant Rooms Only</option>
                <option value="VIP">VIP Guests Only</option>
              </select>

              <button
                onClick={onAutoAllocate}
                className="px-3 py-1 text-xs font-bold text-[#1a472a] bg-[#d4af37]/25 hover:bg-[#d4af37]/45 border border-[#d4af37] rounded-md transition-colors flex items-center gap-1.5 shadow-2xs font-mono"
                title="Automatically match conference single and sharing delegate counts into estate rooms"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Auto-Allocate
              </button>

              <button
                onClick={() => {
                  if (window.confirm('Clear all guest allocations for this conference? Room configurations will be kept.')) {
                    onClearAllocations();
                  }
                }}
                className="px-2.5 py-1 text-xs font-semibold text-stone-500 hover:text-rose-600 border border-transparent hover:border-stone-200 rounded-md transition-colors flex items-center gap-1"
                title="Clear allocations"
              >
                <RotateCcw className="w-3 h-3" />
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* 32-Rooms Responsive Visual Grid */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-stone-50/50" id="printable-rooming">
          {/* Print-Only Header */}
          <div className="print-only mb-6 border-b-2 border-[#1a472a] pb-4">
            <h1 className="text-2xl font-estate font-bold text-[#1a472a]">
              RAWDONS HOTEL & BREWERY — RECEPTION ROOMING LIST
            </h1>
            <p className="text-xs text-stone-600 font-mono mt-1">
              Conference: {activeConference.eventTitle} · Client: {activeConference.clientName} · Dates: {activeConference.dateRange} · 32 Estate Rooms
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredRooms.map((room) => {
              const alloc = allocationByRoomId.get(room.id);
              const isAllocated = Boolean(alloc);

              return (
                <div
                  key={room.id}
                  className={`rounded-xl border transition-all flex flex-col justify-between overflow-hidden shadow-2xs ${
                    isAllocated
                      ? 'bg-white border-stone-300 hover:border-[#1a472a]'
                      : 'bg-stone-50/80 border-dashed border-stone-300 hover:border-stone-400'
                  }`}
                >
                  {/* Card Header */}
                  <div className="p-3.5 border-b border-stone-100 bg-gradient-to-b from-stone-50/80 to-white">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-black text-white bg-[#1a472a] px-2 py-0.5 rounded-md shadow-2xs">
                          Room {room.roomNumber}
                        </span>
                        {alloc?.vipStatus && (
                          <span className="flex items-center gap-0.5 text-[9px] font-bold font-mono px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                            <Crown className="w-2.5 h-2.5 text-amber-600" /> VIP
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {/* Edit Room Bed Config trigger */}
                        <button
                          type="button"
                          onClick={() => handleOpenConfigModal(room)}
                          className="no-print p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded transition-colors"
                          title="Edit sleeping configuration / room settings"
                        >
                          <SlidersHorizontal className="w-3 h-3" />
                        </button>

                        <span className="text-[10px] font-mono text-stone-400">
                          {room.floor === 'Ground Floor' ? 'GF' : '1F'}
                        </span>
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-stone-900 truncate" title={room.roomName}>
                      {room.roomName}
                    </h4>
                    <p className="text-[10px] text-stone-500 truncate">{room.wing}</p>

                    {/* Sleeping Configuration Pill (Clickable to edit) */}
                    <div className="mt-2 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => handleOpenConfigModal(room)}
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full border flex items-center gap-1 truncate ${getBedConfigColor(
                          room.bedConfig
                        )}`}
                        title="Click to edit bed configuration"
                      >
                        <Bed className="w-3 h-3 shrink-0" />
                        <span className="truncate">{room.bedConfig}</span>
                      </button>

                      <span className="text-[10px] font-mono text-stone-500">
                        R{room.baseRateSingle}
                      </span>
                    </div>
                  </div>

                  {/* Card Body: Guest Assignment Details */}
                  <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between text-xs">
                    {isAllocated && alloc ? (
                      <div className="space-y-2">
                        {/* Primary Guest */}
                        <div className="bg-stone-50 p-2 rounded-lg border border-stone-200">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-mono uppercase text-stone-400 font-bold">
                              Guest 1 (Primary)
                            </span>
                            <span
                              className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                                alloc.occupancyType === 'Sharing'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {alloc.occupancyType}
                            </span>
                          </div>
                          <p className="font-bold text-stone-900 text-xs mt-0.5 truncate">{alloc.guest1Name}</p>
                          {alloc.guest1Title && (
                            <p className="text-[10px] text-stone-500 truncate">{alloc.guest1Title}</p>
                          )}
                        </div>

                        {/* Sharing Guest 2 if applicable */}
                        {alloc.occupancyType === 'Sharing' && (
                          <div className="bg-blue-50/60 p-2 rounded-lg border border-blue-200">
                            <span className="text-[9px] font-mono uppercase text-blue-700 font-bold">
                              Guest 2 (Sharing)
                            </span>
                            <p className="font-bold text-stone-900 text-xs mt-0.5 truncate">
                              {alloc.guest2Name || '— Unassigned Delegate —'}
                            </p>
                            {alloc.guest2Title && (
                              <p className="text-[10px] text-stone-500 truncate">{alloc.guest2Title}</p>
                            )}
                          </div>
                        )}

                        {/* Special Requests / Protocols */}
                        {alloc.specialRequests && (
                          <p className="text-[10px] text-stone-600 bg-amber-50 p-1.5 rounded border border-amber-200 leading-tight">
                            <strong className="text-amber-800 font-mono">Note: </strong>
                            {alloc.specialRequests}
                          </p>
                        )}

                        {/* Status badges: Keycard & Check-in */}
                        <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-stone-600">
                          <span className="flex items-center gap-1">
                            <Key className={`w-3 h-3 ${alloc.keyCardEncoded ? 'text-emerald-600' : 'text-stone-300'}`} />
                            {alloc.keyCardEncoded ? 'Keycard Encoded' : 'Keycard Due'}
                          </span>
                          <span className={alloc.checkedIn ? 'text-emerald-700 font-bold' : 'text-stone-400'}>
                            {alloc.checkedIn ? 'Checked-In' : 'Pending Arrival'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="py-4 text-center space-y-1 my-auto">
                        <span className="text-stone-400 text-xs font-medium block">Room Vacant</span>
                        <p className="text-[10px] text-stone-400">Ready for delegate allocation</p>
                      </div>
                    )}

                    {/* Card Footer Actions */}
                    <div className="no-print pt-2 border-t border-stone-100 flex items-center justify-between">
                      {isAllocated && alloc ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenAssignModal(room, alloc)}
                            className="px-2 py-1 text-xs font-semibold text-[#1a472a] hover:bg-stone-100 rounded transition-colors flex items-center gap-1"
                          >
                            <Edit2 className="w-3 h-3" /> Edit Guest
                          </button>

                          <button
                            type="button"
                            onClick={() => onRemoveAllocation(alloc.id)}
                            className="p-1 text-stone-300 hover:text-rose-600 rounded transition-colors"
                            title="Unassign room"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenAssignModal(room)}
                          className="w-full py-1.5 text-xs font-semibold text-[#1a472a] bg-stone-100 hover:bg-[#1a472a] hover:text-white rounded-md transition-all flex items-center justify-center gap-1.5"
                        >
                          <UserPlus className="w-3 h-3" /> Assign Guest(s)
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Printable Handover Sign-Off for Front Desk */}
          <div className="print-only pt-8 border-t-2 border-stone-300 text-xs mt-6">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-4">
              Front Office Reception Handover Sign-Off
            </span>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div className="border-t border-stone-400 pt-2">
                <p className="font-bold text-stone-800">Front Office Manager</p>
                <p className="text-[10px] text-stone-500">Keycards encoded & room inspection verified</p>
              </div>
              <div className="border-t border-stone-400 pt-2">
                <p className="font-bold text-stone-800">Executive Housekeeper</p>
                <p className="text-[10px] text-stone-500">32 Estate suites turn-down & amenities placed</p>
              </div>
              <div className="border-t border-stone-400 pt-2">
                <p className="font-bold text-stone-800">Conference Host / Client Lead</p>
                <p className="text-[10px] text-stone-500">Rooming list received and approved</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer (hidden in print) */}
        <div className="no-print px-6 py-3.5 bg-stone-100 border-t border-stone-200 flex items-center justify-between">
          <p className="text-xs text-stone-500 font-mono">
            Rooming list syncs to browser cache and pro-forma invoice reconciliation.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-1.5 text-xs font-semibold text-stone-700 bg-white border border-stone-300 rounded-md hover:bg-stone-50 flex items-center gap-1.5 font-mono"
            >
              <Download className="w-3.5 h-3.5 text-stone-500" />
              Download CSV
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-[#1a472a] rounded-md hover:bg-[#143720] flex items-center gap-1.5 shadow-xs font-mono font-bold"
            >
              <Printer className="w-4 h-4 text-[#d4af37]" />
              Print Rooming Sheet
            </button>
          </div>
        </div>

        {/* --- SUB-MODAL 1: Assign / Edit Guest Allocation --- */}
        {assigningRoom && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs">
            <div className="bg-white rounded-xl shadow-2xl border border-stone-200 w-full max-w-lg overflow-hidden">
              <div className="px-5 py-3.5 bg-[#1a472a] text-white flex items-center justify-between">
                <div>
                  <h3 className="font-estate font-bold text-sm">
                    Assign Guest to Room {assigningRoom.roomNumber}
                  </h3>
                  <p className="text-[11px] text-stone-200 font-mono">
                    {assigningRoom.roomName} · {assigningRoom.bedConfig}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAssigningRoom(null)}
                  className="p-1 text-stone-300 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveGuestForm} className="p-5 space-y-4 text-xs">
                {/* Occupancy Type Selector */}
                <div>
                  <label className="block text-[10px] font-mono text-stone-500 uppercase mb-1">
                    Occupancy Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormOccupancyType('Single')}
                      className={`py-1.5 px-3 rounded-lg font-semibold border text-center transition-all ${
                        formOccupancyType === 'Single'
                          ? 'bg-[#1a472a] text-white border-[#1a472a]'
                          : 'bg-stone-50 text-stone-700 border-stone-200'
                      }`}
                    >
                      Single Occupancy (1 Pax)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormOccupancyType('Sharing')}
                      className={`py-1.5 px-3 rounded-lg font-semibold border text-center transition-all ${
                        formOccupancyType === 'Sharing'
                          ? 'bg-blue-800 text-white border-blue-800'
                          : 'bg-stone-50 text-stone-700 border-stone-200'
                      }`}
                    >
                      Sharing Occupancy (2 Pax)
                    </button>
                  </div>
                </div>

                {/* Primary Guest Details */}
                <div className="space-y-2 p-3 bg-stone-50 rounded-lg border border-stone-200">
                  <span className="font-mono text-[10px] uppercase font-bold text-stone-600 block">
                    Guest 1 (Primary Delegate)
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-stone-500 mb-0.5">Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Dr. Sipho Zulu"
                        value={formGuest1}
                        onChange={(e) => setFormGuest1(e.target.value)}
                        className="w-full p-2 bg-white border border-stone-200 rounded-md font-semibold text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-stone-500 mb-0.5">Job Title / Organization</label>
                      <input
                        type="text"
                        placeholder="e.g. Keynote Speaker / Director"
                        value={formGuest1Title}
                        onChange={(e) => setFormGuest1Title(e.target.value)}
                        className="w-full p-2 bg-white border border-stone-200 rounded-md text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Sharing Guest Details (if Sharing) */}
                {formOccupancyType === 'Sharing' && (
                  <div className="space-y-2 p-3 bg-blue-50/70 rounded-lg border border-blue-200">
                    <span className="font-mono text-[10px] uppercase font-bold text-blue-900 block">
                      Guest 2 (Sharing Delegate)
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-blue-700 mb-0.5">Full Name *</label>
                        <input
                          type="text"
                          required={formOccupancyType === 'Sharing'}
                          placeholder="e.g. Andile Khumalo"
                          value={formGuest2}
                          onChange={(e) => setFormGuest2(e.target.value)}
                          className="w-full p-2 bg-white border border-blue-200 rounded-md font-semibold text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-blue-700 mb-0.5">Job Title / Role</label>
                        <input
                          type="text"
                          placeholder="e.g. Field Specialist"
                          value={formGuest2Title}
                          onChange={(e) => setFormGuest2Title(e.target.value)}
                          className="w-full p-2 bg-white border border-blue-200 rounded-md text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Special Requests */}
                <div>
                  <label className="block text-[10px] font-mono text-stone-500 mb-0.5">
                    Special Requests / Room Amenities
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Feather pillow allergy, quiet room, late check-in..."
                    value={formRequests}
                    onChange={(e) => setFormRequests(e.target.value)}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-md text-xs"
                  />
                </div>

                {/* Checkboxes: VIP, Keycard, Check-in */}
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-stone-200 text-xs">
                  <label className="flex items-center gap-2 p-2 bg-stone-50 rounded border border-stone-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formVip}
                      onChange={(e) => setFormVip(e.target.checked)}
                      className="rounded text-[#1a472a]"
                    />
                    <span className="font-semibold text-stone-800">VIP Guest</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 bg-stone-50 rounded border border-stone-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formKeycard}
                      onChange={(e) => setFormKeycard(e.target.checked)}
                      className="rounded text-[#1a472a]"
                    />
                    <span className="font-semibold text-stone-800">Keycard Ready</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 bg-stone-50 rounded border border-stone-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formCheckedIn}
                      onChange={(e) => setFormCheckedIn(e.target.checked)}
                      className="rounded text-[#1a472a]"
                    />
                    <span className="font-semibold text-stone-800">Checked-In</span>
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setAssigningRoom(null)}
                    className="px-3.5 py-1.5 text-xs text-stone-600 hover:bg-stone-100 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold text-white bg-[#1a472a] hover:bg-[#143720] rounded-md shadow-xs"
                  >
                    Save Allocation
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- SUB-MODAL 2: Edit Room Sleeping Configuration --- */}
        {editingRoomConfig && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs">
            <div className="bg-white rounded-xl shadow-2xl border border-stone-200 w-full max-w-md overflow-hidden">
              <div className="px-5 py-3.5 bg-[#1a472a] text-white flex items-center justify-between">
                <div>
                  <h3 className="font-estate font-bold text-sm">
                    Edit Room {editingRoomConfig.roomNumber} Configuration
                  </h3>
                  <p className="text-[11px] text-stone-200 font-mono">
                    {editingRoomConfig.wing} · {editingRoomConfig.floor}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingRoomConfig(null)}
                  className="p-1 text-stone-300 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveConfigForm} className="p-5 space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] font-mono text-stone-500 mb-1">
                    Sleeping Bed Arrangement *
                  </label>
                  <select
                    value={configBedType}
                    onChange={(e) => setConfigBedType(e.target.value as any)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-md font-semibold text-xs focus:ring-1 focus:ring-[#1a472a]"
                  >
                    <option value="King Bed">King Bed (Single or Couple)</option>
                    <option value="Twin Beds (2x Single/Three-Quarter)">
                      Twin Beds (2x Single/Three-Quarter) - For Delegate Sharing
                    </option>
                    <option value="Queen Bed">Queen Bed</option>
                    <option value="Two Double Beds">Two Double Beds (Up to 3 Delegates)</option>
                    <option value="Executive Suite (King + Fireplace)">
                      Executive Suite (King + Working Log Fireplace)
                    </option>
                    <option value="Bridal & VIP Manor Suite">Bridal & VIP Manor Suite</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-stone-500 mb-1">Room Display Name</label>
                  <input
                    type="text"
                    required
                    value={configRoomName}
                    onChange={(e) => setConfigRoomName(e.target.value)}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-md font-semibold text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-stone-500 mb-1">Single Rate (ZAR)</label>
                    <input
                      type="number"
                      required
                      value={configSingleRate}
                      onChange={(e) => setConfigSingleRate(Number(e.target.value))}
                      className="w-full p-2 bg-stone-50 border border-stone-200 rounded-md font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-stone-500 mb-1">Sharing Rate (ZAR)</label>
                    <input
                      type="number"
                      required
                      value={configSharingRate}
                      onChange={(e) => setConfigSharingRate(Number(e.target.value))}
                      className="w-full p-2 bg-stone-50 border border-stone-200 rounded-md font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="p-3 bg-stone-50 rounded-lg text-stone-600 text-[11px] leading-relaxed">
                  <strong className="text-stone-800 font-mono text-[10px] uppercase">Estate Note: </strong>
                  Updating bed arrangements changes the room configuration across all conference rooming sheets and financial calculations.
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingRoomConfig(null)}
                    className="px-3.5 py-1.5 text-xs text-stone-600 hover:bg-stone-100 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold text-white bg-[#1a472a] hover:bg-[#143720] rounded-md shadow-xs"
                  >
                    Update Bed Configuration
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
