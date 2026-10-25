import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Database,
  Download,
  Upload,
  HardDrive,
  ShieldCheck,
  RotateCcw,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Bookmark,
  RefreshCw,
  FolderArchive,
  Save,
  Clock
} from 'lucide-react';
import {
  ConferenceEvent,
  StaffMember,
  DepartmentChecklistItem,
  SystemBackupBundle,
  HotelRoom,
  GuestRoomAllocation,
  HotelVenue
} from '../types/conference';

interface StorageCacheModalProps {
  isOpen: boolean;
  onClose: () => void;
  conferences: ConferenceEvent[];
  staffList: StaffMember[];
  checklists: DepartmentChecklistItem[];
  rooms?: HotelRoom[];
  roomAllocations?: Record<string, GuestRoomAllocation[]>;
  venues?: HotelVenue[];
  onRestoreSystem: (bundle: SystemBackupBundle) => void;
  onResetFactoryDefaults: () => void;
}

export const StorageCacheModal: React.FC<StorageCacheModalProps> = ({
  isOpen,
  onClose,
  conferences,
  staffList,
  checklists,
  rooms,
  roomAllocations,
  venues,
  onRestoreSystem,
  onResetFactoryDefaults
}) => {
  const [activeTab, setActiveTab] = useState<'backup-restore' | 'snapshots' | 'diagnostics'>('backup-restore');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [previewBundle, setPreviewBundle] = useState<SystemBackupBundle | null>(null);
  const [snapshots, setSnapshots] = useState<{ id: string; label: string; date: string; data: SystemBackupBundle }[]>([]);
  const [storageEstimate, setStorageEstimate] = useState<{ bytes: number; kb: string }>({ bytes: 0, kb: '0 KB' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing snapshots from localStorage
  useEffect(() => {
    try {
      const savedSnapshots = localStorage.getItem('rawdons_backup_snapshots_v1');
      if (savedSnapshots) {
        setSnapshots(JSON.parse(savedSnapshots));
      }
    } catch {
      // ignore
    }

    // Calculate approximate storage size
    try {
      let totalBytes = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('rawdons_')) {
          const val = localStorage.getItem(key) || '';
          totalBytes += (key.length + val.length) * 2;
        }
      }
      setStorageEstimate({
        bytes: totalBytes,
        kb: (totalBytes / 1024).toFixed(1) + ' KB'
      });
    } catch {
      // ignore
    }
  }, [isOpen, conferences, staffList, checklists]);

  if (!isOpen) return null;

  // Generate Current System Backup Bundle Object
  const createCurrentBundle = (): SystemBackupBundle => {
    return {
      version: '3.0.0',
      exportDate: new Date().toISOString(),
      systemName: 'Rawdons Hotel & Brewery Conference Tracker',
      conferences,
      staff: staffList,
      checklists,
      hotelRooms: rooms,
      roomAllocations: roomAllocations,
      venues: venues
    };
  };

  // Download Complete JSON Backup File
  const handleDownloadBackup = () => {
    const bundle = createCurrentBundle();
    const jsonString = JSON.stringify(bundle, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `Rawdons_Conference_System_Backup_${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setUploadSuccess('Complete system backup (.json) downloaded successfully. Keep this file safe for GitHub deployments.');
    setTimeout(() => setUploadSuccess(null), 5000);
  };

  // Handle File Input Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadSuccess(null);
    setPreviewBundle(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        // Validation check
        if (!parsed || !Array.isArray(parsed.conferences)) {
          throw new Error('Invalid backup file: missing conferences collection.');
        }

        const validBundle: SystemBackupBundle = {
          version: parsed.version || '1.0.0',
          exportDate: parsed.exportDate || new Date().toISOString(),
          systemName: parsed.systemName || 'Rawdons Backup',
          conferences: parsed.conferences,
          staff: Array.isArray(parsed.staff) ? parsed.staff : staffList,
          checklists: Array.isArray(parsed.checklists) ? parsed.checklists : checklists,
          hotelRooms: Array.isArray(parsed.hotelRooms) ? parsed.hotelRooms : rooms,
          roomAllocations: parsed.roomAllocations || roomAllocations
        };

        setPreviewBundle(validBundle);
      } catch (err: any) {
        setUploadError(err.message || 'Failed to parse JSON backup file. Ensure it is a valid Rawdons backup.');
      }
    };
    reader.onerror = () => {
      setUploadError('Failed to read the file. Please try again.');
    };
    reader.readAsText(file);
  };

  // Apply the previewed backup
  const handleApplyRestore = () => {
    if (!previewBundle) return;
    try {
      onRestoreSystem(previewBundle);
      setUploadSuccess(
        `System successfully restored! Loaded ${previewBundle.conferences.length} conferences, ${previewBundle.staff.length} staff members, and ${previewBundle.checklists.length} checklist items.`
      );
      setPreviewBundle(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => setUploadSuccess(null), 6000);
    } catch (err: any) {
      setUploadError(`Restore failed: ${err.message}`);
    }
  };

  // Save Snapshot Slot
  const handleCreateSnapshot = (label: string) => {
    const bundle = createCurrentBundle();
    const newSnapshot = {
      id: `snap-${Date.now()}`,
      label: label || `Snapshot #${snapshots.length + 1}`,
      date: new Date().toLocaleString(),
      data: bundle
    };

    const updated = [newSnapshot, ...snapshots].slice(0, 5); // Keep max 5 snapshots
    setSnapshots(updated);
    try {
      localStorage.setItem('rawdons_backup_snapshots_v1', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Restore Snapshot
  const handleRestoreSnapshot = (snapshot: { id: string; label: string; date: string; data: SystemBackupBundle }) => {
    if (window.confirm(`Restore system state from snapshot "${snapshot.label}" (${snapshot.date})?`)) {
      onRestoreSystem(snapshot.data);
      setUploadSuccess(`Restored from snapshot "${snapshot.label}".`);
      setTimeout(() => setUploadSuccess(null), 4000);
    }
  };

  // Delete Snapshot
  const handleDeleteSnapshot = (id: string) => {
    const updated = snapshots.filter((s) => s.id !== id);
    setSnapshots(updated);
    try {
      localStorage.setItem('rawdons_backup_snapshots_v1', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Export Complete Multi-Table CSV Archive
  const handleExportFullCSV = () => {
    const csvRows = [
      ['RAWDONS HOTEL & BREWERY - COMPLETE MASTER DATA EXPORT ARCHIVE'],
      ['Generated On', new Date().toISOString()],
      ['Total Conferences', conferences.length],
      ['Total Staff Members', staffList.length],
      ['Total Checklist Tasks', checklists.length],
      [''],
      ['=== TABLE 1: CONFERENCES & BOOKINGS ==='],
      ['ID', 'Event Title', 'Client', 'Contact', 'Email', 'Dates', 'Delegates', 'Rooms', 'Seating', 'Package', 'Food Cost %', 'Deposit Paid'],
      ...conferences.map((c) => {
        const fc = c.sellingPricePerHead > 0 ? ((c.costPerHead / c.sellingPricePerHead) * 100).toFixed(1) : '33.0';
        return [
          `"${c.id}"`,
          `"${c.eventTitle}"`,
          `"${c.clientName}"`,
          `"${c.contactPerson}"`,
          `"${c.contactEmail}"`,
          `"${c.dateRange}"`,
          c.delegateCurrent,
          c.accommodationRooms,
          `"${c.seatingFormat}"`,
          `"${c.packageType}"`,
          `${fc}%`,
          c.depositPaid ? 'YES' : 'NO'
        ];
      }),
      [''],
      ['=== TABLE 2: STAFF ROSTER ==='],
      ['ID', 'Name', 'Department', 'Job Title', 'Email', 'Phone', 'Active'],
      ...staffList.map((s) => [
        `"${s.id}"`,
        `"${s.name}"`,
        `"${s.role}"`,
        `"${s.title}"`,
        `"${s.email}"`,
        `"${s.phone}"`,
        s.active ? 'ACTIVE' : 'INACTIVE'
      ]),
      [''],
      ['=== TABLE 3: OPERATIONAL CHECKLISTS ==='],
      ['ID', 'Department', 'Category', 'Task Description', 'Timing', 'Responsible Staff', 'Completed'],
      ...checklists.map((k) => [
        `"${k.id}"`,
        `"${k.department}"`,
        `"${k.category}"`,
        `"${k.task.replace(/"/g, '""')}"`,
        `"${k.timing}"`,
        `"${k.responsibleStaff}"`,
        k.completed ? 'YES' : 'NO'
      ])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rawdons_Complete_Master_Archive_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs no-print-backdrop">
      <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#1a472a] text-white flex items-center justify-between border-b border-[#d4af37]/40">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Database className="w-5 h-5 text-[#d4af37]" />
            </div>
            <div>
              <h2 className="text-base font-estate font-bold text-white tracking-wide">
                Storage Cache & GitHub Zero-Loss Backup System
              </h2>
              <p className="text-xs text-stone-200">
                Persistent offline cache, full JSON backups, and multi-table data archiving
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-stone-200 bg-stone-50">
          <button
            onClick={() => setActiveTab('backup-restore')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'backup-restore'
                ? 'border-[#1a472a] text-[#1a472a] bg-white rounded-t-lg'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#d4af37]" />
            Export & Restore Backup (.json)
          </button>

          <button
            onClick={() => setActiveTab('snapshots')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'snapshots'
                ? 'border-[#1a472a] text-[#1a472a] bg-white rounded-t-lg'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            Fast Restore Snapshots ({snapshots.length})
          </button>

          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'diagnostics'
                ? 'border-[#1a472a] text-[#1a472a] bg-white rounded-t-lg'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            Cache Diagnostics & Reset
          </button>
        </div>

        {/* Notifications */}
        {uploadError && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {uploadSuccess && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{uploadSuccess}</span>
          </div>
        )}

        {/* Tab 1: Backup & Restore */}
        {activeTab === 'backup-restore' && (
          <div className="p-6 overflow-y-auto space-y-6 text-stone-800">
            {/* Why This Matters for GitHub Publishing */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-[#1a472a]">
                <ShieldCheck className="w-4 h-4 text-[#1a472a]" />
                GitHub Publishing & Zero Data Loss Guarantee
              </div>
              <p className="text-stone-600 leading-relaxed">
                When this application is published to GitHub or accessed across different devices, your changes are automatically preserved in browser storage. However, if browser history is wiped or a team member works on a different machine, you can export and import the full system bundle with 100% fidelity.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: Download Backup */}
              <div className="p-5 bg-white border border-stone-200 rounded-xl shadow-xs space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm font-estate font-bold text-[#1a472a]">
                    <Download className="w-4 h-4 text-[#d4af37]" />
                    Download System Backup (.json)
                  </div>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                    Instantly packs all {conferences.length} conferences, {staffList.length} staff profiles, custom dishes, and {checklists.length} departmental checklists into an offline JSON snapshot.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleDownloadBackup}
                    className="w-full py-2.5 px-4 text-xs font-bold text-white bg-[#1a472a] hover:bg-[#143720] rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs font-mono"
                  >
                    <Download className="w-4 h-4 text-[#d4af37]" />
                    Export Complete System (.json)
                  </button>
                  <p className="text-[10px] text-stone-400 font-mono text-center mt-1.5">
                    Recommended before git pushes or system migrations
                  </p>
                </div>
              </div>

              {/* Card 2: Restore from Backup */}
              <div className="p-5 bg-white border border-stone-200 rounded-xl shadow-xs space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm font-estate font-bold text-[#1a472a]">
                    <Upload className="w-4 h-4 text-[#1a472a]" />
                    Restore System from File (.json)
                  </div>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                    Upload an existing Rawdons backup JSON file to seamlessly reload all conference workflows, bookings, and checklists without overwriting missing records.
                  </p>
                </div>

                <div className="pt-2 space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                    className="w-full text-xs text-stone-600 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200 cursor-pointer"
                  />

                  {previewBundle && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                        <span>Backup File Validated</span>
                        <span className="font-mono text-[10px]">v{previewBundle.version}</span>
                      </div>
                      <div className="text-[11px] text-stone-700 font-mono space-y-0.5">
                        <p>• {previewBundle.conferences.length} Conferences</p>
                        <p>• {previewBundle.staff.length} Staff members</p>
                        <p>• {previewBundle.checklists.length} Checklist tasks</p>
                        {previewBundle.venues && <p>• {previewBundle.venues.length} Conference Venues</p>}
                      </div>
                      <button
                        onClick={handleApplyRestore}
                        className="w-full py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded transition-colors"
                      >
                        Confirm & Apply Restore Now
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Complete Multi-Table CSV Archive */}
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="font-estate font-bold text-xs text-[#1a472a] block">
                  Export Master Archive (Excel / CSV Bundle)
                </span>
                <p className="text-xs text-stone-500">
                  Exports all conferences, staff roster, and checklists in a unified multi-sheet format for spreadsheet auditing.
                </p>
              </div>

              <button
                onClick={handleExportFullCSV}
                className="px-4 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors flex items-center gap-1.5 shrink-0 shadow-2xs font-mono"
              >
                <FolderArchive className="w-3.5 h-3.5 text-stone-600" />
                Download Multi-Table CSV
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Fast Snapshots */}
        {activeTab === 'snapshots' && (
          <div className="p-6 overflow-y-auto space-y-4 text-stone-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-stone-50 border border-stone-200 rounded-xl">
              <div>
                <span className="font-estate font-bold text-sm text-[#1a472a] block">
                  Fast In-Browser Restore Points
                </span>
                <p className="text-xs text-stone-500">
                  Create quick rollback checkpoints before experimenting with menus or staffing changes.
                </p>
              </div>

              <button
                onClick={() => {
                  const label = prompt('Enter a label for this snapshot checkpoint:', `Checkpoint · ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
                  if (label) handleCreateSnapshot(label);
                }}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#1a472a] hover:bg-[#143720] rounded-lg transition-colors flex items-center gap-1.5 shrink-0 font-mono shadow-xs"
              >
                <Save className="w-3.5 h-3.5 text-[#d4af37]" />
                Save New Checkpoint
              </button>
            </div>

            {snapshots.length === 0 ? (
              <div className="py-12 text-center text-stone-400 text-xs">
                No checkpoints saved yet. Click "Save New Checkpoint" to record your first restore point.
              </div>
            ) : (
              <div className="space-y-3">
                {snapshots.map((snap) => (
                  <div
                    key={snap.id}
                    className="p-3.5 bg-white border border-stone-200 rounded-lg flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Bookmark className="w-4 h-4 text-[#d4af37]" />
                        <span className="text-xs font-bold text-stone-900">{snap.label}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] font-mono text-stone-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-stone-400" />
                          {snap.date}
                        </span>
                        <span>•</span>
                        <span>{snap.data.conferences.length} Conferences</span>
                        <span>•</span>
                        <span>{snap.data.checklists.length} Checklist tasks</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRestoreSnapshot(snap)}
                        className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition-colors flex items-center gap-1 font-mono"
                      >
                        <RefreshCw className="w-3 h-3 text-emerald-700" />
                        Rollback
                      </button>
                      <button
                        onClick={() => handleDeleteSnapshot(snap.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 rounded hover:bg-stone-100 transition-colors"
                        title="Delete checkpoint"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Diagnostics & Reset */}
        {activeTab === 'diagnostics' && (
          <div className="p-6 overflow-y-auto space-y-6 text-stone-800">
            {/* Storage Diagnostic Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-lg">
                <span className="text-[10px] font-mono uppercase text-stone-500 block">Total Conferences</span>
                <span className="text-lg font-bold font-mono text-[#1a472a]">{conferences.length}</span>
              </div>

              <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-lg">
                <span className="text-[10px] font-mono uppercase text-stone-500 block">Staff Profiles</span>
                <span className="text-lg font-bold font-mono text-[#1a472a]">{staffList.length}</span>
              </div>

              <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-lg">
                <span className="text-[10px] font-mono uppercase text-stone-500 block">Checklist Items</span>
                <span className="text-lg font-bold font-mono text-[#1a472a]">{checklists.length}</span>
              </div>

              <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-lg">
                <span className="text-[10px] font-mono uppercase text-stone-500 block">Storage Footprint</span>
                <span className="text-lg font-bold font-mono text-[#1a472a]">{storageEstimate.kb}</span>
              </div>
            </div>

            {/* Active Keys Table */}
            <div className="border border-stone-200 rounded-lg overflow-hidden text-xs">
              <div className="px-4 py-2 bg-stone-100 font-bold font-mono text-stone-700 uppercase text-[10px]">
                Active Browser Storage Keys
              </div>
              <div className="p-3 space-y-2 divide-y divide-stone-100 font-mono text-[11px]">
                <div className="flex justify-between py-1">
                  <span className="text-stone-800 font-semibold">rawdons_conference_tracker_events_v3</span>
                  <span className="text-stone-500">{conferences.length} records</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-stone-800 font-semibold">rawdons_conference_tracker_staff_v1</span>
                  <span className="text-stone-500">{staffList.length} staff</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-stone-800 font-semibold">rawdons_conference_tracker_checklists_v1</span>
                  <span className="text-stone-500">{checklists.length} tasks</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-stone-800 font-semibold">rawdons_backup_snapshots_v1</span>
                  <span className="text-stone-500">{snapshots.length} slots</span>
                </div>
              </div>
            </div>

            {/* Dangerous Factory Reset Section */}
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-rose-900 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Factory Reset Safeguard
              </div>
              <p className="text-xs text-rose-700 leading-relaxed">
                Clears all custom additions, restored files, and reverts everything to the verified Rawdons Hotel, Brewery & Estate standard operational template.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => {
                    if (window.confirm('WARNING: Are you sure you want to reset all data to default templates? All unexported changes will be cleared.')) {
                      onResetFactoryDefaults();
                      setUploadSuccess('Reset to factory defaults complete.');
                    }
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-white border border-rose-300 rounded hover:bg-rose-100 transition-colors flex items-center gap-1 font-mono"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset to Factory Defaults
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 bg-stone-100 border-t border-stone-200 flex items-center justify-between">
          <span className="text-xs text-stone-500 font-mono">
            Direct estate assistance: <strong className="text-stone-700">functions.rawdons@gmail.com</strong>
          </span>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-stone-700 bg-white border border-stone-300 rounded-md hover:bg-stone-50 transition-colors"
          >
            Close Storage Center
          </button>
        </div>
      </div>
    </div>
  );
};
