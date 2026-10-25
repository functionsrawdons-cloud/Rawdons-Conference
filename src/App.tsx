/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckCircle2,
  Circle,
  Plus,
  Users,
  Calendar,
  MapPin,
  Clock,
  Printer,
  Calculator,
  Utensils,
  ChevronDown,
  LayoutGrid,
  Search,
  Filter,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Edit2,
  FileText,
  UserPlus,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Building2
} from 'lucide-react';

import {
  ConferenceEvent,
  DepartmentRole,
  SeatingFormat,
  TaskItem,
  DietaryBreakdown,
  StaffMember,
  DepartmentChecklistItem,
  SystemBackupBundle,
  HotelRoom,
  GuestRoomAllocation,
  HotelVenue
} from './types/conference';
import { initialConferences, initialStaffMembers } from './data/defaultConferences';
import { createStandardChecklists } from './data/defaultChecklists';
import { initial32HotelRooms, initialGuestAllocations } from './data/hotelRooms';
import { initial5Venues } from './data/venues';
import { SeatingCalculatorModal } from './components/SeatingCalculatorModal';
import { FoodCostCalculatorModal } from './components/FoodCostCalculatorModal';
import { DietaryRequirementsModal } from './components/DietaryRequirementsModal';
import { BeoPrintModal } from './components/BeoPrintModal';
import { TaskEditModal } from './components/TaskEditModal';
import { NewEventModal } from './components/NewEventModal';
import { StaffModal } from './components/StaffModal';
import { BackOfficeMenuModal } from './components/BackOfficeMenuModal';
import { FinancialExportModal } from './components/FinancialExportModal';
import { DepartmentChecklistsModal } from './components/DepartmentChecklistsModal';
import { StorageCacheModal } from './components/StorageCacheModal';
import { ConferenceInsightsModal } from './components/ConferenceInsightsModal';
import { RoomAllocationModal } from './components/RoomAllocationModal';
import { VenueManagementModal } from './components/VenueManagementModal';
import { MenuItem } from './data/menuLibrary';
import { ChefHat, ListChecks, Database, ShieldCheck, BedDouble } from 'lucide-react';
import estateGroundsImg from './assets/images/rawdons_estate_grounds_1792861790559.jpg';

const STORAGE_KEY_CONFERENCES = 'rawdons_conference_tracker_events_v3';
const STORAGE_KEY_STAFF = 'rawdons_conference_tracker_staff_v1';
const STORAGE_KEY_CHECKLISTS = 'rawdons_conference_tracker_checklists_v1';
const STORAGE_KEY_ROOMS = 'rawdons_hotel_rooms_32_v1';
const STORAGE_KEY_ALLOCATIONS = 'rawdons_hotel_allocations_v1';
const STORAGE_KEY_VENUES = 'rawdons_hotel_venues_v1';

export default function App() {
  // Persistence state for conferences
  const [conferences, setConferences] = useState<ConferenceEvent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONFERENCES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return initialConferences;
  });

  // Persistence state for staff members
  const [staffList, setStaffList] = useState<StaffMember[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STAFF);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return initialStaffMembers;
  });

  // Persistence state for department operational checklists
  const [checklists, setChecklists] = useState<DepartmentChecklistItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CHECKLISTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return createStandardChecklists();
  });

  // Persistence state for 32 hotel estate rooms
  const [rooms, setRooms] = useState<HotelRoom[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ROOMS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 32) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return initial32HotelRooms;
  });

  // Persistence state for guest room allocations per conference
  const [roomAllocations, setRoomAllocations] = useState<Record<string, GuestRoomAllocation[]>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ALLOCATIONS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return initialGuestAllocations;
  });

  // Persistence state for 5 hotel conference & event venues
  const [venues, setVenues] = useState<HotelVenue[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_VENUES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 5) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return initial5Venues;
  });

  const [activeEventId, setActiveEventId] = useState<string>(() => {
    return conferences[0]?.id || 'conf-agritech-2026';
  });

  // Filters
  const [roleFilter, setRoleFilter] = useState<'All' | DepartmentRole>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isSeatingModalOpen, setIsSeatingModalOpen] = useState(false);
  const [isFoodCostModalOpen, setIsFoodCostModalOpen] = useState(false);
  const [isDietaryModalOpen, setIsDietaryModalOpen] = useState(false);
  const [isBeoModalOpen, setIsBeoModalOpen] = useState(false);
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isMenuSelectionModalOpen, setIsMenuSelectionModalOpen] = useState(false);
  const [isFinancialModalOpen, setIsFinancialModalOpen] = useState(false);
  const [isChecklistsModalOpen, setIsChecklistsModalOpen] = useState(false);
  const [isStorageModalOpen, setIsStorageModalOpen] = useState(false);
  const [isInsightsModalOpen, setIsInsightsModalOpen] = useState(false);
  const [isRoomAllocationModalOpen, setIsRoomAllocationModalOpen] = useState(false);
  const [isVenueModalOpen, setIsVenueModalOpen] = useState(false);

  // Task edit modal
  const [editingTask, setEditingTask] = useState<{
    task: TaskItem | null;
    phaseId: string;
    phaseName: string;
  } | null>(null);

  // Sync conferences to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CONFERENCES, JSON.stringify(conferences));
    } catch (e) {
      console.error('Failed to save conferences to localStorage', e);
    }
  }, [conferences]);

  // Sync staff list to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_STAFF, JSON.stringify(staffList));
    } catch (e) {
      console.error('Failed to save staff to localStorage', e);
    }
  }, [staffList]);

  // Sync department checklists to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CHECKLISTS, JSON.stringify(checklists));
    } catch (e) {
      console.error('Failed to save checklists to localStorage', e);
    }
  }, [checklists]);

  // Sync 32 rooms to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ROOMS, JSON.stringify(rooms));
    } catch (e) {
      console.error('Failed to save rooms to localStorage', e);
    }
  }, [rooms]);

  // Sync room allocations to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ALLOCATIONS, JSON.stringify(roomAllocations));
    } catch (e) {
      console.error('Failed to save room allocations to localStorage', e);
    }
  }, [roomAllocations]);

  // Sync 5 venues to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_VENUES, JSON.stringify(venues));
    } catch (e) {
      console.error('Failed to save venues to localStorage', e);
    }
  }, [venues]);

  const activeEvent = useMemo(() => {
    return conferences.find((c) => c.id === activeEventId) || conferences[0];
  }, [conferences, activeEventId]);

  // Overall readiness calculation
  const stats = useMemo(() => {
    if (!activeEvent) {
      return { total: 0, completed: 0, percentage: 0, byRole: { Banqueting: 0, Kitchen: 0, Admin: 0 } };
    }

    let total = 0;
    let completed = 0;
    const roleStats: Record<DepartmentRole, { total: number; completed: number }> = {
      Banqueting: { total: 0, completed: 0 },
      Kitchen: { total: 0, completed: 0 },
      Admin: { total: 0, completed: 0 },
    };

    activeEvent.workflow.forEach((phase) => {
      phase.tasks.forEach((t) => {
        total++;
        roleStats[t.role].total++;
        if (t.completed) {
          completed++;
          roleStats[t.role].completed++;
        }
      });
    });

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      percentage,
      roleStats,
    };
  }, [activeEvent]);

  // Count assigned tasks per staff member for the active conference
  const assignedTasksMap = useMemo(() => {
    const map: Record<string, number> = {};
    if (!activeEvent) return map;

    activeEvent.workflow.forEach((phase) => {
      phase.tasks.forEach((task) => {
        if (task.assignee) {
          map[task.assignee] = (map[task.assignee] || 0) + 1;
        }
      });
    });
    return map;
  }, [activeEvent]);

  // Toggle single task completion
  const handleToggleTask = (phaseId: string, taskId: string) => {
    setConferences((prev) =>
      prev.map((conf) => {
        if (conf.id !== activeEventId) return conf;
        return {
          ...conf,
          workflow: conf.workflow.map((phase) => {
            if (phase.id !== phaseId) return phase;
            return {
              ...phase,
              tasks: phase.tasks.map((task) => {
                if (task.id !== taskId) return task;
                return { ...task, completed: !task.completed };
              }),
            };
          }),
        };
      })
    );
  };

  // Save task edit or add
  const handleSaveTask = (phaseId: string, updatedTask: TaskItem, isNew: boolean) => {
    setConferences((prev) =>
      prev.map((conf) => {
        if (conf.id !== activeEventId) return conf;
        return {
          ...conf,
          workflow: conf.workflow.map((phase) => {
            if (phase.id !== phaseId) return phase;
            if (isNew) {
              return {
                ...phase,
                tasks: [...phase.tasks, updatedTask],
              };
            }
            return {
              ...phase,
              tasks: phase.tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)),
            };
          }),
        };
      })
    );
  };

  // Delete task
  const handleDeleteTask = (phaseId: string, taskId: string) => {
    setConferences((prev) =>
      prev.map((conf) => {
        if (conf.id !== activeEventId) return conf;
        return {
          ...conf,
          workflow: conf.workflow.map((phase) => {
            if (phase.id !== phaseId) return phase;
            return {
              ...phase,
              tasks: phase.tasks.filter((t) => t.id !== taskId),
            };
          }),
        };
      })
    );
  };

  // Staff management methods
  const handleAddStaff = (newStaff: StaffMember) => {
    setStaffList((prev) => [...prev, newStaff]);
  };

  const handleDeleteStaff = (staffId: string) => {
    setStaffList((prev) => prev.filter((s) => s.id !== staffId));
  };

  // Seating format apply
  const handleApplySeatingFormat = (format: SeatingFormat, delegates: number) => {
    setConferences((prev) =>
      prev.map((conf) => {
        if (conf.id !== activeEventId) return conf;
        return {
          ...conf,
          seatingFormat: format,
          delegateCurrent: delegates,
        };
      })
    );
  };

  // Food cost apply
  const handleApplyFoodCost = (costPerHead: number, sellingPrice: number) => {
    setConferences((prev) =>
      prev.map((conf) => {
        if (conf.id !== activeEventId) return conf;
        return {
          ...conf,
          costPerHead,
          sellingPricePerHead: sellingPrice,
        };
      })
    );
  };

  // Dietaries save
  const handleSaveDietaries = (updatedDietary: DietaryBreakdown) => {
    setConferences((prev) =>
      prev.map((conf) => {
        if (conf.id !== activeEventId) return conf;
        return {
          ...conf,
          dietary: updatedDietary,
        };
      })
    );
  };

  // Back Office Menu save
  const handleSaveMenuSelection = (selectedDishes: MenuItem[], totalCostPerHead: number) => {
    setConferences((prev) =>
      prev.map((conf) => {
        if (conf.id !== activeEventId) return conf;
        const dishNames = selectedDishes.map((d) => d.name).join(', ');
        return {
          ...conf,
          costPerHead: totalCostPerHead,
          cateringPackage: `Custom Selection (${selectedDishes.length} dishes): ${dishNames.slice(0, 75)}...`,
        };
      })
    );
  };

  // Create new event
  const handleCreateEvent = (newEvent: ConferenceEvent) => {
    setConferences((prev) => [newEvent, ...prev]);
    setActiveEventId(newEvent.id);
  };

  // Checklist handlers
  const handleToggleChecklistItem = (id: string) => {
    setChecklists((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const handleAddChecklistItem = (newItem: DepartmentChecklistItem) => {
    setChecklists((prev) => [newItem, ...prev]);
  };

  const handleDeleteChecklistItem = (id: string) => {
    setChecklists((prev) => prev.filter((item) => item.id !== id));
  };

  const handleResetChecklists = () => {
    setChecklists(createStandardChecklists());
  };

  // Save or update guest allocation for the active conference
  const handleSaveAllocation = (allocation: GuestRoomAllocation) => {
    setRoomAllocations((prev) => {
      const currentList = prev[activeEventId] || [];
      const index = currentList.findIndex((a) => a.id === allocation.id || a.roomId === allocation.roomId);
      let updatedList: GuestRoomAllocation[];
      if (index >= 0) {
        updatedList = [...currentList];
        updatedList[index] = allocation;
      } else {
        updatedList = [...currentList, allocation];
      }
      return {
        ...prev,
        [activeEventId]: updatedList
      };
    });
  };

  // Remove guest allocation
  const handleRemoveAllocation = (allocationId: string) => {
    setRoomAllocations((prev) => {
      const currentList = prev[activeEventId] || [];
      return {
        ...prev,
        [activeEventId]: currentList.filter((a) => a.id !== allocationId)
      };
    });
  };

  // Update room sleeping configuration & details
  const handleUpdateRoomConfig = (updatedRoom: HotelRoom) => {
    setRooms((prev) => prev.map((r) => (r.id === updatedRoom.id ? updatedRoom : r)));
  };

  // Smart Auto-Allocate delegates into available 32 estate rooms
  const handleAutoAllocate = () => {
    const singleNeeded = activeEvent.accommodationSingle || 0;
    const sharingNeeded = activeEvent.accommodationSharing || 0;

    const allocatedRoomIds = new Set((roomAllocations[activeEventId] || []).map((a) => a.roomId));
    const availableRooms = rooms.filter((r) => !allocatedRoomIds.has(r.id));

    const twinRooms = availableRooms.filter(
      (r) => r.bedConfig.includes('Twin') || r.bedConfig.includes('Two Double')
    );
    const kingRooms = availableRooms.filter(
      (r) => !r.bedConfig.includes('Twin') && !r.bedConfig.includes('Two Double')
    );

    const newAllocations: GuestRoomAllocation[] = [...(roomAllocations[activeEventId] || [])];
    const currentSingles = newAllocations.filter((a) => a.occupancyType === 'Single').length;
    const currentSharings = newAllocations.filter((a) => a.occupancyType === 'Sharing').length;

    let singleRemaining = Math.max(0, singleNeeded - currentSingles);
    let sharingRemaining = Math.max(0, sharingNeeded - currentSharings);

    const sampleNames = [
      'Michael Thwala', 'Dr. Sarah Nel', 'Graham Smith', 'Nomsa Dube',
      'Warren Pillay', 'Lerato Moloi', 'Andre Van Vuuren', 'Francois Pienaar',
      'Zanele Sithole', 'Bradley Evans', 'Kobus Steyn', 'Nolwazi Khanyile',
      'Pieter Van Zyl', 'Derrick Naidoo', 'Lungile Buthelezi', 'David Cooper'
    ];
    let nameIdx = 0;

    // Allocate Single rooms first from King/Queen rooms
    for (const r of kingRooms) {
      if (singleRemaining <= 0) break;
      const guestName = sampleNames[nameIdx++ % sampleNames.length];
      newAllocations.push({
        id: `alloc-auto-${Date.now()}-${r.roomNumber}`,
        roomId: r.id,
        roomNumber: r.roomNumber,
        conferenceId: activeEventId,
        guest1Name: guestName,
        guest1Title: 'Conference Delegate',
        occupancyType: 'Single',
        keyCardEncoded: true,
        checkedIn: false,
        allocatedAt: new Date().toISOString().split('T')[0]
      });
      singleRemaining--;
    }

    // Allocate Sharing rooms from Twin/Double rooms
    for (const r of twinRooms) {
      if (sharingRemaining <= 0) break;
      const g1 = sampleNames[nameIdx++ % sampleNames.length];
      const g2 = sampleNames[nameIdx++ % sampleNames.length];
      newAllocations.push({
        id: `alloc-auto-${Date.now()}-${r.roomNumber}`,
        roomId: r.id,
        roomNumber: r.roomNumber,
        conferenceId: activeEventId,
        guest1Name: g1,
        guest1Title: 'Delegate (Sharing A)',
        guest2Name: g2,
        guest2Title: 'Delegate (Sharing B)',
        occupancyType: 'Sharing',
        keyCardEncoded: true,
        checkedIn: false,
        allocatedAt: new Date().toISOString().split('T')[0]
      });
      sharingRemaining--;
    }

    setRoomAllocations((prev) => ({
      ...prev,
      [activeEventId]: newAllocations
    }));
  };

  // Clear allocations for current conference
  const handleClearAllocations = () => {
    setRoomAllocations((prev) => ({
      ...prev,
      [activeEventId]: []
    }));
  };

  // Venue update and assignment handlers
  const handleUpdateVenues = (updatedVenues: HotelVenue[]) => {
    setVenues(updatedVenues);
  };

  const handleResetVenues = () => {
    setVenues(initial5Venues);
    localStorage.removeItem(STORAGE_KEY_VENUES);
  };

  const handleAssignVenueToConference = (
    conferenceId: string,
    assignment: {
      venueId: string;
      venueRoom: string;
      venueSeason: string;
      venueDuration: 'Full-Day' | 'Half-Day';
      venuePricingModel: 'seasonal' | 'attendee-tier';
      venueHireFee: number;
    }
  ) => {
    setConferences((prev) =>
      prev.map((c) => {
        if (c.id !== conferenceId) return c;
        const currentVenueFee = c.venueHireFee || 0;
        const currentTotal = c.totalInvoiceEstimate || 85000;
        return {
          ...c,
          venueId: assignment.venueId,
          venueRoom: assignment.venueRoom,
          venueSeason: assignment.venueSeason,
          venueDuration: assignment.venueDuration,
          venuePricingModel: assignment.venuePricingModel,
          venueHireFee: assignment.venueHireFee,
          totalInvoiceEstimate: currentTotal - currentVenueFee + assignment.venueHireFee,
        };
      })
    );
  };

  // Full System Restore from Backup bundle (.json)
  const handleRestoreSystem = (bundle: SystemBackupBundle) => {
    if (bundle.conferences && bundle.conferences.length > 0) {
      setConferences(bundle.conferences);
      setActiveEventId(bundle.conferences[0].id);
    }
    if (bundle.staff && bundle.staff.length > 0) {
      setStaffList(bundle.staff);
    }
    if (bundle.checklists && bundle.checklists.length > 0) {
      setChecklists(bundle.checklists);
    }
    if (bundle.hotelRooms && bundle.hotelRooms.length === 32) {
      setRooms(bundle.hotelRooms);
    }
    if (bundle.roomAllocations) {
      setRoomAllocations(bundle.roomAllocations);
    }
    if (bundle.venues && bundle.venues.length >= 5) {
      setVenues(bundle.venues);
    }
  };

  // Reset to default
  const handleResetDefaults = () => {
    if (window.confirm('Reset all conferences, tasks, 32 hotel rooms, 5 venues, room allocations, and checklists to default Rawdons templates?')) {
      setConferences(initialConferences);
      setStaffList(initialStaffMembers);
      setChecklists(createStandardChecklists());
      setRooms(initial32HotelRooms);
      setVenues(initial5Venues);
      setRoomAllocations(initialGuestAllocations);
      setActiveEventId(initialConferences[0].id);
      localStorage.removeItem(STORAGE_KEY_CONFERENCES);
      localStorage.removeItem(STORAGE_KEY_STAFF);
      localStorage.removeItem(STORAGE_KEY_CHECKLISTS);
      localStorage.removeItem(STORAGE_KEY_ROOMS);
      localStorage.removeItem(STORAGE_KEY_VENUES);
      localStorage.removeItem(STORAGE_KEY_ALLOCATIONS);
    }
  };

  // Quick Action key click handler
  const handleActionClick = (actionKey?: string) => {
    if (actionKey === 'seating') setIsSeatingModalOpen(true);
    else if (actionKey === 'food-cost') setIsMenuSelectionModalOpen(true);
    else if (actionKey === 'dietary') setIsDietaryModalOpen(true);
    else if (actionKey === 'proposal' || actionKey === 'contract') setIsBeoModalOpen(true);
  };

  // Role badge style
  const getRoleBadgeStyle = (role: DepartmentRole) => {
    switch (role) {
      case 'Banqueting':
        return 'bg-[#2c3e50] text-white';
      case 'Kitchen':
        return 'bg-[#b45309] text-white';
      case 'Admin':
        return 'bg-[#6b21a8] text-white';
      default:
        return 'bg-stone-700 text-white';
    }
  };

  const foodCostPercent =
    activeEvent && activeEvent.sellingPricePerHead > 0
      ? (activeEvent.costPerHead / activeEvent.sellingPricePerHead) * 100
      : 33;

  return (
    <div className="min-h-screen bg-[#f7f6f0] text-stone-800 flex flex-col">
      {/* 1. Top Bar Contract: Brand zone - 4 Nav Links - 1 Primary Action */}
      <header className="bg-[#1a472a] text-white border-b border-[#d4af37]/40 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand wordmark */}
          <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
            <div className="w-8 h-8 rounded-full bg-[#d4af37] text-[#1a472a] flex items-center justify-center font-estate font-black text-base shadow-inner">
              R
            </div>
            <div>
              <span className="font-estate text-lg tracking-wider font-extrabold text-white">
                RAW<span className="text-[#d4af37]">DONS</span>
              </span>
              <span className="hidden sm:inline text-xs font-mono text-stone-300 ml-2 tracking-widest uppercase">
                Conference Tracker
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-4 text-xs font-medium text-stone-200">
            <button
              onClick={() => setIsVenueModalOpen(true)}
              className="hover:text-[#d4af37] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 font-bold text-amber-200"
              title="Configure 5 Venues, Seating Capacities, Seasonal Tariffs & Attendee Tiers"
            >
              <Building2 className="w-3.5 h-3.5 text-[#d4af37]" /> Venues & Hire (5)
            </button>
            <button
              onClick={() => setIsRoomAllocationModalOpen(true)}
              className="hover:text-[#d4af37] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 font-bold text-[#d4af37]"
              title="Allocate 32 Hotel Rooms & Configure Bed Configurations"
            >
              <BedDouble className="w-3.5 h-3.5 text-[#d4af37]" /> 32 Rooms ({(roomAllocations[activeEventId] || []).length}/32)
            </button>
            <button
              onClick={() => setIsInsightsModalOpen(true)}
              className="hover:text-[#d4af37] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 font-medium text-stone-200"
              title="Conference Insights & D3.js Revenue Visualization"
            >
              <TrendingUp className="w-3.5 h-3.5" /> Insights (D3)
            </button>
            <button
              onClick={() => setIsFinancialModalOpen(true)}
              className="hover:text-[#d4af37] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 font-bold text-amber-300"
              title="Official Financial Statement & Revenue Reconciliation"
            >
              <DollarSign className="w-3.5 h-3.5" /> Financials & Invoices
            </button>
            <button
              onClick={() => setIsChecklistsModalOpen(true)}
              className="hover:text-[#d4af37] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 font-medium text-emerald-300"
              title="Departmental Standard Operating Checklists & Shift Line-Ups"
            >
              <ListChecks className="w-3.5 h-3.5" /> Checklists ({checklists.filter((c) => c.completed).length}/{checklists.length})
            </button>
            <button
              onClick={() => setIsMenuSelectionModalOpen(true)}
              className="hover:text-[#d4af37] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 font-medium text-stone-200"
              title="Back Office Menu Selection & 33% AI Costing"
            >
              <ChefHat className="w-3.5 h-3.5" /> Menus (AI Costing)
            </button>
            <button
              onClick={() => setIsBeoModalOpen(true)}
              className="hover:text-[#d4af37] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" /> BEO Sheet
            </button>
            <button
              onClick={() => setIsStaffModalOpen(true)}
              className="hover:text-[#d4af37] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5" /> Staff ({staffList.length})
            </button>
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsStorageModalOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold text-emerald-200 bg-white/10 hover:bg-white/20 border border-emerald-400/40 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5"
              title="Storage Cache, GitHub Zero-Loss Backup & Restore"
            >
              <Database className="w-3.5 h-3.5 text-emerald-300" />
              <span className="hidden sm:inline">Storage</span> Cache
            </button>

            <button
              onClick={() => setIsNewEventModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-bold text-[#1a472a] bg-[#d4af37] hover:bg-[#c59b27] rounded-lg shadow-sm transition-colors whitespace-nowrap flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              New Conference
            </button>
          </div>
        </div>
      </header>

      {/* Hero Estate Header Banner with High-Fidelity Asset */}
      <div className="relative bg-stone-900 border-b border-stone-200 text-white overflow-hidden">
        <img
          src={estateGroundsImg}
          alt="Rawdons Estate Manor and Trout Lake Grounds"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-25 filter blur-[0.5px]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a472a]/95 via-[#1a472a]/85 to-black/75" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#d4af37] tracking-widest uppercase mb-1">
                <span>Nottingham Road · KwaZulu-Natal Midlands</span>
                <span>·</span>
                <span>Operational Readiness & Event Flow Management</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-estate font-extrabold text-white tracking-wide">
                RAW<span className="text-[#d4af37]">DONS</span> CONFERENCE TRACKER
              </h1>
              <p className="text-xs sm:text-sm text-stone-200 mt-1 max-w-2xl leading-relaxed">
                Seamless operational coordination between Banqueting, Kitchen brigade, and Admin for flawless Midlands estate conferences.
              </p>
            </div>

            {/* Conference Selector Dropdown */}
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20 sm:min-w-[320px]">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-[#d4af37] font-semibold mb-1">
                Active Conference Booking
              </label>
              <div className="relative">
                <select
                  value={activeEventId}
                  onChange={(e) => setActiveEventId(e.target.value)}
                  className="w-full bg-[#1a472a] text-white text-xs font-semibold px-3 py-2 pr-8 rounded-lg border border-[#d4af37]/60 focus:outline-hidden focus:ring-2 focus:ring-[#d4af37] cursor-pointer"
                >
                  {conferences.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.eventTitle} ({c.delegateCurrent} pax)
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#d4af37] absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Active Event Metadata Strip (Aligned with PDF response) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 border-t border-white/15 text-xs">
            <div>
              <span className="text-[10px] uppercase font-mono text-stone-300">Client / Contact</span>
              <p className="font-bold text-white truncate">{activeEvent.clientName}</p>
              <p className="text-[10px] text-stone-300 truncate">{activeEvent.contactPerson}</p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-mono text-stone-300">Dates & Flexibility</span>
              <p className="font-bold text-white truncate">{activeEvent.dateRange}</p>
              <p className="text-[10px] text-stone-300 truncate">{activeEvent.dateFlexibility || 'Preferred dates'}</p>
            </div>

            <div
              onClick={() => setIsVenueModalOpen(true)}
              className="cursor-pointer hover:bg-white/10 p-1.5 rounded-lg transition-colors border border-transparent hover:border-white/20"
              title="Click to manage 5 Venues, Capacities & Seasonal Hire Rates"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono text-[#d4af37] font-bold">Venue & Tariffs (5)</span>
                <span className="text-[9px] font-mono text-amber-300">Manage →</span>
              </div>
              <p className="font-bold text-white truncate">{activeEvent.venueRoom}</p>
              <p className="text-[10px] text-stone-200 truncate font-mono">
                {activeEvent.venueSeason || 'Mid Season'} {activeEvent.venueHireFee ? `· R${activeEvent.venueHireFee.toLocaleString()}` : ''}
              </p>
            </div>

            <div
              onClick={() => setIsRoomAllocationModalOpen(true)}
              className="cursor-pointer hover:bg-white/10 p-1.5 rounded-lg transition-colors border border-transparent hover:border-white/20"
              title="Click to open 32 Rooms Allocation & Bed Configurations Studio"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono text-[#d4af37] font-bold">Delegates & 32 Rooms</span>
                <span className="text-[9px] font-mono text-emerald-300">Open Studio →</span>
              </div>
              <p className="font-bold text-white font-mono tabular-nums">
                {activeEvent.delegateCurrent} Pax ({activeEvent.delegateMin}–{activeEvent.delegateMax})
              </p>
              <p className="text-[10px] text-stone-200 truncate font-mono">
                {activeEvent.accommodationRooms} Rooms Blocked ({(roomAllocations[activeEventId] || []).length}/32 Allocated)
              </p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-mono text-stone-300">Catering & Food Cost</span>
              <p className={`font-bold font-mono tabular-nums ${
                foodCostPercent <= 33 ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                {foodCostPercent.toFixed(1)}% ({foodCostPercent <= 33 ? 'Target Met' : 'Over'})
              </p>
              <p className="text-[10px] text-stone-300 truncate">{activeEvent.packageType || 'Full-Day'}</p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-mono text-stone-300">Deposit & Hold</span>
              <p className="font-bold text-white">
                {activeEvent.depositPaid ? (
                  <span className="text-emerald-400 flex items-center gap-1">50% Received</span>
                ) : (
                  <span className="text-amber-300">Deposit Due</span>
                )}
              </p>
              <p className="text-[10px] text-stone-300 truncate">
                {activeEvent.siteInspectionRequested ? 'Site Inspection Req.' : 'Walkthrough Optional'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 flex-1 w-full">
        {/* Core Progress Bar Section (as requested in prompt) */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-estate font-bold text-[#1a472a]">
                Overall Operational Readiness & Milestone Compliance
              </h2>
              <p className="text-xs text-stone-500">
                {stats.completed} of {stats.total} operational tasks completed across all estate departments
              </p>
            </div>

            <div className="text-right">
              <span className="text-2xl font-extrabold font-mono text-[#1a472a] tabular-nums">
                {stats.percentage}%
              </span>
              <span className="text-xs font-semibold text-stone-500 ml-1">Readiness</span>
            </div>
          </div>

          {/* Elevated Progress Bar */}
          <div className="w-full bg-stone-200 rounded-full h-6 overflow-hidden relative shadow-inner">
            <div
              id="overall-progress"
              className="bg-[#d4af37] h-full transition-all duration-500 ease-out flex items-center justify-center text-xs font-bold font-mono text-[#1a472a] tracking-wider"
              style={{ width: `${stats.percentage}%` }}
            >
              {stats.percentage >= 12 && `${stats.percentage}% Readiness`}
            </div>
          </div>

          {/* Department Breakdown Mini-Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {(['Banqueting', 'Kitchen', 'Admin'] as DepartmentRole[]).map((role) => {
              const rStat = stats.roleStats?.[role] || { total: 0, completed: 0 };
              const rPct = rStat.total > 0 ? Math.round((rStat.completed / rStat.total) * 100) : 0;
              return (
                <div
                  key={role}
                  onClick={() => setRoleFilter(roleFilter === role ? 'All' : role)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    roleFilter === role
                      ? 'bg-stone-100 border-[#1a472a] shadow-xs'
                      : 'bg-stone-50 border-stone-200 hover:bg-stone-100/70'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-stone-800 flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        role === 'Banqueting' ? 'bg-[#2c3e50]' : role === 'Kitchen' ? 'bg-[#b45309]' : 'bg-[#6b21a8]'
                      }`} />
                      {role} Dept
                    </span>
                    <span className="font-mono font-bold text-stone-700 tabular-nums">
                      {rPct}% ({rStat.completed}/{rStat.total})
                    </span>
                  </div>
                  <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        role === 'Banqueting' ? 'bg-[#2c3e50]' : role === 'Kitchen' ? 'bg-[#b45309]' : 'bg-[#6b21a8]'
                      }`}
                      style={{ width: `${rPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Operational Toolbar: Role Filters & Quick Action Tools */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-3.5 rounded-xl border border-stone-200 shadow-xs">
          {/* Role Segmented Filter */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-stone-500 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Department:
            </span>
            {(['All', 'Banqueting', 'Kitchen', 'Admin'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  roleFilter === r
                    ? 'bg-[#1a472a] text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {r === 'All' ? 'All Roles' : r}
              </button>
            ))}

            <div className="h-4 w-px bg-stone-200 mx-1 hidden sm:block" />

            {/* Status toggle */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs bg-stone-100 border border-stone-200 rounded-lg font-medium text-stone-700 focus:outline-hidden"
            >
              <option value="all">All Tasks</option>
              <option value="pending">Pending Only</option>
              <option value="completed">Completed Only</option>
            </select>
          </div>

          {/* Quick Department Operational Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsVenueModalOpen(true)}
              className="px-3 py-1.5 text-xs font-bold text-[#1a472a] bg-[#d4af37]/25 hover:bg-[#d4af37]/45 border border-[#d4af37] rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs font-mono"
              title="5 Venues Studio: Capacities, Seasonal Tariffs & Attendee Tiers"
            >
              <Building2 className="w-3.5 h-3.5 text-[#1a472a]" />
              5 Venues & Rates
            </button>

            <button
              onClick={() => setIsRoomAllocationModalOpen(true)}
              className="px-3 py-1.5 text-xs font-bold text-[#1a472a] bg-[#d4af37]/25 hover:bg-[#d4af37]/45 border border-[#d4af37] rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs font-mono"
              title="Open 32 Rooms Guest Allocation and Sleeping Configuration Studio"
            >
              <BedDouble className="w-3.5 h-3.5 text-[#1a472a]" />
              32 Rooms ({(roomAllocations[activeEventId] || []).length}/32)
            </button>

            <button
              onClick={() => setIsInsightsModalOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold text-[#1a472a] bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
              title="D3.js Conference Revenue Distribution across Months and Event Packages"
            >
              <TrendingUp className="w-3.5 h-3.5 text-[#1a472a]" />
              Insights (D3)
            </button>

            <button
              onClick={() => setIsFinancialModalOpen(true)}
              className="px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs font-mono"
              title="Exportable Financial Reconciliation & Pro-Forma Invoice"
            >
              <DollarSign className="w-3.5 h-3.5 text-amber-700" />
              Financials (P&L / Invoice)
            </button>

            <button
              onClick={() => setIsChecklistsModalOpen(true)}
              className="px-3 py-1.5 text-xs font-bold text-[#1a472a] bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
              title="Departmental Standard Operating Checklists & Shift Line-Up Roster"
            >
              <ListChecks className="w-3.5 h-3.5 text-[#1a472a]" />
              Checklists ({checklists.filter((c) => c.completed).length}/{checklists.length})
            </button>

            <button
              onClick={() => setIsMenuSelectionModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-bold text-[#1a472a] bg-[#d4af37]/20 hover:bg-[#d4af37]/35 border border-[#d4af37] rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
              title="Back Office Menu Selection & 33% Food Cost Governance"
            >
              <ChefHat className="w-3.5 h-3.5 text-[#1a472a]" />
              Menu & 33% Costing
            </button>

            <button
              onClick={() => setIsStaffModalOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold text-stone-700 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg transition-colors flex items-center gap-1.5"
              title="Add or Manage Staff Roster"
            >
              <UserPlus className="w-3.5 h-3.5 text-[#1a472a]" />
              Staff ({staffList.length})
            </button>

            <button
              onClick={() => setIsSeatingModalOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold text-stone-700 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg transition-colors flex items-center gap-1"
              title="Seating Format & Layout Calculator"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-[#2c3e50]" />
              Seating ({activeEvent.seatingFormat})
            </button>

            <button
              onClick={() => setIsDietaryModalOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold text-stone-700 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg transition-colors flex items-center gap-1"
              title="7-Day Dietary Roster"
            >
              <Utensils className="w-3.5 h-3.5 text-stone-700" />
              Dietaries ({activeEvent.dietary.vegetarian + activeEvent.dietary.vegan + activeEvent.dietary.glutenFree + activeEvent.dietary.halaal + activeEvent.dietary.nutAllergy})
            </button>

            <button
              onClick={() => setIsBeoModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#1a472a] hover:bg-[#143720] rounded-lg transition-colors flex items-center gap-1 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-[#d4af37]" />
              BEO Sheet
            </button>

            <button
              onClick={() => setIsStorageModalOpen(true)}
              className="px-2.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors flex items-center gap-1"
              title="Offline Cache, JSON Backup & Restore"
            >
              <Database className="w-3.5 h-3.5 text-emerald-700" />
              Cache
            </button>
          </div>
        </div>

        {/* 3-Column Workflow Dashboard Grid (exact user architecture elevated) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-grid">
          {activeEvent.workflow.map((section) => {
            // Apply filtering to tasks in this section
            const visibleTasks = section.tasks.filter((t) => {
              if (roleFilter !== 'All' && t.role !== roleFilter) return false;
              if (statusFilter === 'pending' && t.completed) return false;
              if (statusFilter === 'completed' && !t.completed) return false;
              if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                return (
                  t.name.toLowerCase().includes(q) ||
                  t.role.toLowerCase().includes(q) ||
                  (t.assignee && t.assignee.toLowerCase().includes(q)) ||
                  (t.notes && t.notes.toLowerCase().includes(q))
                );
              }
              return true;
            });

            const completedInSection = section.tasks.filter((t) => t.completed).length;
            const totalInSection = section.tasks.length;
            const sectionPercent = totalInSection > 0 ? Math.round((completedInSection / totalInSection) * 100) : 0;

            return (
              <div
                key={section.id}
                className="bg-white rounded-xl border border-stone-200 shadow-sm flex flex-col justify-between overflow-hidden"
              >
                {/* Card Header with Forest Green Accent */}
                <div className="p-5 border-b border-stone-100 bg-gradient-to-b from-stone-50/70 to-white">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono tracking-wider uppercase font-bold text-[#1a472a]">
                      Stage · {sectionPercent}% Ready
                    </span>
                    <span className="text-xs font-mono font-bold text-stone-600 tabular-nums">
                      {completedInSection}/{totalInSection} Completed
                    </span>
                  </div>

                  <h3 className="text-base font-estate font-bold text-[#1a472a] tracking-tight">
                    {section.phase}
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">{section.subtitle}</p>

                  {/* Section progress mini bar */}
                  <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden mt-3">
                    <div
                      className="bg-[#d4af37] h-full transition-all duration-300"
                      style={{ width: `${sectionPercent}%` }}
                    />
                  </div>
                </div>

                {/* Tasks List */}
                <div className="p-5 space-y-3 flex-1 overflow-y-auto max-h-[460px]">
                  {visibleTasks.length === 0 ? (
                    <div className="py-8 text-center text-xs text-stone-400">
                      No tasks matching current filter
                    </div>
                  ) : (
                    visibleTasks.map((task) => {
                      return (
                        <div
                          key={task.id}
                          className={`group p-3 rounded-lg border transition-all ${
                            task.completed
                              ? 'bg-stone-50/80 border-stone-200/80'
                              : 'bg-white border-stone-200 hover:border-stone-300 shadow-2xs'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            {/* Checkbox & Task Name */}
                            <label className="flex items-start gap-2.5 cursor-pointer flex-1 select-none">
                              <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => handleToggleTask(section.id, task.id)}
                                className="mt-0.5 w-4 h-4 rounded border-stone-300 text-[#1a472a] accent-[#1a472a] cursor-pointer focus:ring-0"
                              />
                              <div className="space-y-0.5">
                                <span
                                  className={`text-xs font-semibold block leading-tight transition-colors ${
                                    task.completed ? 'line-through text-stone-400' : 'text-stone-900'
                                  }`}
                                >
                                  {task.name}
                                </span>

                                {task.dueDateDesc && (
                                  <span className="text-[10px] text-stone-500 font-mono block">
                                    {task.dueDateDesc} {task.assignee ? `· ${task.assignee}` : ''}
                                  </span>
                                )}
                              </div>
                            </label>

                            {/* Role Badge */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide uppercase font-mono ${getRoleBadgeStyle(
                                  task.role
                                )}`}
                              >
                                {task.role}
                              </span>

                              {/* Edit Task Trigger */}
                              <button
                                type="button"
                                onClick={() =>
                                  setEditingTask({
                                    task,
                                    phaseId: section.id,
                                    phaseName: section.phase,
                                  })
                                }
                                className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-stone-700 transition-opacity rounded hover:bg-stone-100"
                                title="Edit task details"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Task Remarks & Operational Shortcut */}
                          {task.notes && (
                            <p className="text-[11px] text-stone-600 mt-2 pl-6 pt-1.5 border-t border-stone-100/70 leading-relaxed font-sans">
                              {task.notes}
                            </p>
                          )}

                          {/* Interactive shortcut chip if task corresponds to a core tool */}
                          {task.actionKey && (
                            <div className="mt-2 pl-6 flex items-center justify-between">
                              <button
                                type="button"
                                onClick={() => handleActionClick(task.actionKey)}
                                className="text-[10px] font-semibold text-[#1a472a] hover:text-[#d4af37] transition-colors flex items-center gap-1 underline underline-offset-2"
                              >
                                {task.actionKey === 'seating' && 'Open Seating Visualizer →'}
                                {task.actionKey === 'food-cost' && 'Open 33% Cost Calculator →'}
                                {task.actionKey === 'dietary' && 'Open 7-Day Dietary Roster →'}
                                {(task.actionKey === 'proposal' || task.actionKey === 'contract') && 'View BEO Summary Sheet →'}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Card Footer: Add Task Trigger */}
                <div className="p-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-[11px] text-stone-500 font-mono">
                    {section.tasks.filter((t) => t.completed).length} of {section.tasks.length} Done
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setEditingTask({
                        task: null,
                        phaseId: section.id,
                        phaseName: section.phase,
                      })
                    }
                    className="px-2.5 py-1 text-xs font-semibold text-[#1a472a] hover:bg-white rounded border border-transparent hover:border-stone-200 transition-all flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Task
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Operational Guidelines & Rawdons Estate Quick Reference */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-[#2c3e50] font-estate font-bold text-sm">
              <Users className="w-4 h-4 text-[#2c3e50]" />
              Banqueting Standard Operating Procedure
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Lock final seating layout 10 days prior. U-shape requires min 3.2m² per delegate. Ensure dedicated presentation podium, roving condenser mics, and chilled Rawdons spring water carafes at each table.
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-[#b45309] font-estate font-bold text-sm">
              <Utensils className="w-4 h-4 text-[#b45309]" />
              Kitchen 33% Food Cost Protocol
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              All conference banquet recipes must maintain maximum 33.0% food cost ratio. Chef Thabo must cross-check ingredient pricing against Nottingham Road suppliers and sign off dietary runs 7 days prior.
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-[#6b21a8] font-estate font-bold text-sm">
              <Calendar className="w-4 h-4 text-[#6b21a8]" />
              Admin Booking Timeline & Terms
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Dispatches 24-hour proposals with estate brochure. 50% deposit required 14 days prior to lock in lodge accommodation and the Mill Room suite. Full balance due upon 7-day final review.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto bg-stone-900 text-stone-400 border-t border-stone-800 py-6 text-xs no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-estate font-bold text-white tracking-wide">
              RAWDONS ESTATE & HOTEL
            </span>
            <span>·</span>
            <span>Est. 1954 · Nottingham Road, KwaZulu-Natal</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span>Direct Functions: <strong className="text-stone-300">functions.rawdons@gmail.com</strong></span>
            <span>·</span>
            <button
              onClick={() => setIsStaffModalOpen(true)}
              className="text-[#d4af37] hover:underline transition-colors"
            >
              Manage Staff Roster
            </button>
            <span>·</span>
            <button
              onClick={handleResetDefaults}
              className="text-stone-400 hover:text-stone-200 underline transition-colors"
            >
              Reset Workflow
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <StaffModal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        staffList={staffList}
        onAddStaff={handleAddStaff}
        onDeleteStaff={handleDeleteStaff}
        assignedTasksMap={assignedTasksMap}
      />

      <SeatingCalculatorModal
        isOpen={isSeatingModalOpen}
        onClose={() => setIsSeatingModalOpen(false)}
        currentFormat={activeEvent.seatingFormat}
        currentDelegates={activeEvent.delegateCurrent}
        roomName={activeEvent.venueRoom}
        onApplyFormat={handleApplySeatingFormat}
      />

      <FoodCostCalculatorModal
        isOpen={isFoodCostModalOpen}
        onClose={() => setIsFoodCostModalOpen(false)}
        currentCostPerHead={activeEvent.costPerHead}
        currentSellingPrice={activeEvent.sellingPricePerHead}
        delegates={activeEvent.delegateCurrent}
        onApplyCosting={handleApplyFoodCost}
      />

      <DietaryRequirementsModal
        isOpen={isDietaryModalOpen}
        onClose={() => setIsDietaryModalOpen(false)}
        dietary={activeEvent.dietary}
        totalDelegates={activeEvent.delegateCurrent}
        onSaveDietaries={handleSaveDietaries}
      />

      <BeoPrintModal
        isOpen={isBeoModalOpen}
        onClose={() => setIsBeoModalOpen(false)}
        event={activeEvent}
      />

      {editingTask && (
        <TaskEditModal
          isOpen={true}
          onClose={() => setEditingTask(null)}
          task={editingTask.task}
          phaseId={editingTask.phaseId}
          phaseName={editingTask.phaseName}
          staffList={staffList}
          onOpenAddStaff={() => {
            setEditingTask(null);
            setIsStaffModalOpen(true);
          }}
          onSaveTask={handleSaveTask}
          onDeleteTask={handleDeleteTask}
        />
      )}

      <NewEventModal
        isOpen={isNewEventModalOpen}
        onClose={() => setIsNewEventModalOpen(false)}
        onCreateEvent={handleCreateEvent}
      />

      <BackOfficeMenuModal
        isOpen={isMenuSelectionModalOpen}
        onClose={() => setIsMenuSelectionModalOpen(false)}
        activeEvent={activeEvent}
        onSaveMenu={handleSaveMenuSelection}
      />

      <FinancialExportModal
        isOpen={isFinancialModalOpen}
        onClose={() => setIsFinancialModalOpen(false)}
        event={activeEvent}
      />

      <DepartmentChecklistsModal
        isOpen={isChecklistsModalOpen}
        onClose={() => setIsChecklistsModalOpen(false)}
        checklists={checklists}
        onToggleItem={handleToggleChecklistItem}
        onAddItem={handleAddChecklistItem}
        onDeleteItem={handleDeleteChecklistItem}
        onResetDefaults={handleResetChecklists}
        staffList={staffList}
        eventTitle={activeEvent.eventTitle}
        clientName={activeEvent.clientName}
      />

      <StorageCacheModal
        isOpen={isStorageModalOpen}
        onClose={() => setIsStorageModalOpen(false)}
        conferences={conferences}
        staffList={staffList}
        checklists={checklists}
        rooms={rooms}
        roomAllocations={roomAllocations}
        venues={venues}
        onRestoreSystem={handleRestoreSystem}
        onResetFactoryDefaults={handleResetDefaults}
      />

      <ConferenceInsightsModal
        isOpen={isInsightsModalOpen}
        onClose={() => setIsInsightsModalOpen(false)}
        conferences={conferences}
      />

      <RoomAllocationModal
        isOpen={isRoomAllocationModalOpen}
        onClose={() => setIsRoomAllocationModalOpen(false)}
        activeConference={activeEvent}
        rooms={rooms}
        allocations={roomAllocations[activeEventId] || []}
        onSaveAllocation={handleSaveAllocation}
        onRemoveAllocation={handleRemoveAllocation}
        onUpdateRoomConfig={handleUpdateRoomConfig}
        onAutoAllocate={handleAutoAllocate}
        onClearAllocations={handleClearAllocations}
      />

      <VenueManagementModal
        isOpen={isVenueModalOpen}
        onClose={() => setIsVenueModalOpen(false)}
        venues={venues}
        onUpdateVenues={handleUpdateVenues}
        onResetVenues={handleResetVenues}
        activeConference={activeEvent}
        onAssignVenueToConference={handleAssignVenueToConference}
      />
    </div>
  );
}
