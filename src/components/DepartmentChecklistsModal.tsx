import React, { useState, useMemo } from 'react';
import {
  X,
  Printer,
  Download,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Filter,
  Search,
  RotateCcw,
  ListChecks,
  Clock,
  User,
  AlertCircle
} from 'lucide-react';
import { DepartmentChecklistItem, StaffMember } from '../types/conference';

interface DepartmentChecklistsModalProps {
  isOpen: boolean;
  onClose: () => void;
  checklists: DepartmentChecklistItem[];
  onToggleItem: (id: string) => void;
  onAddItem: (item: DepartmentChecklistItem) => void;
  onDeleteItem: (id: string) => void;
  onResetDefaults: () => void;
  staffList: StaffMember[];
  eventTitle?: string;
  clientName?: string;
}

export const DepartmentChecklistsModal: React.FC<DepartmentChecklistsModalProps> = ({
  isOpen,
  onClose,
  checklists,
  onToggleItem,
  onAddItem,
  onDeleteItem,
  onResetDefaults,
  staffList,
  eventTitle = 'Rawdons Conference Operations',
  clientName = 'Rawdons Hotel & Brewery Estate'
}) => {
  const [selectedDept, setSelectedDept] = useState<'All' | 'Banqueting' | 'Kitchen' | 'Admin' | 'Technical & AV'>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);

  // New item form state
  const [newDept, setNewDept] = useState<'Banqueting' | 'Kitchen' | 'Admin' | 'Technical & AV'>('Banqueting');
  const [newCategory, setNewCategory] = useState('');
  const [newTaskText, setNewTaskText] = useState('');
  const [newTiming, setNewTiming] = useState('Day of · 07:00');
  const [newStaff, setNewStaff] = useState('');
  const [newNotes, setNewNotes] = useState('');

  if (!isOpen) return null;

  // Stats calculation
  const stats = useMemo(() => {
    const total = checklists.length;
    const completed = checklists.filter((c) => c.completed).length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    const byDept = {
      Banqueting: {
        total: checklists.filter((c) => c.department === 'Banqueting').length,
        completed: checklists.filter((c) => c.department === 'Banqueting' && c.completed).length,
      },
      Kitchen: {
        total: checklists.filter((c) => c.department === 'Kitchen').length,
        completed: checklists.filter((c) => c.department === 'Kitchen' && c.completed).length,
      },
      Admin: {
        total: checklists.filter((c) => c.department === 'Admin').length,
        completed: checklists.filter((c) => c.department === 'Admin' && c.completed).length,
      },
      'Technical & AV': {
        total: checklists.filter((c) => c.department === 'Technical & AV').length,
        completed: checklists.filter((c) => c.department === 'Technical & AV' && c.completed).length,
      },
    };

    return { total, completed, pct, byDept };
  }, [checklists]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return checklists.filter((item) => {
      if (selectedDept !== 'All' && item.department !== selectedDept) return false;
      if (statusFilter === 'pending' && item.completed) return false;
      if (statusFilter === 'completed' && !item.completed) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.task.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.responsibleStaff.toLowerCase().includes(q) ||
          (item.notes && item.notes.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [checklists, selectedDept, statusFilter, searchQuery]);

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    const newItem: DepartmentChecklistItem = {
      id: `chk-custom-${Date.now()}`,
      department: newDept,
      category: newCategory.trim() || 'General Operations',
      task: newTaskText.trim(),
      timing: newTiming.trim() || 'Day of Event',
      responsibleStaff: newStaff.trim() || 'Duty Manager',
      completed: false,
      notes: newNotes.trim() || undefined,
    };

    onAddItem(newItem);
    setNewCategory('');
    setNewTaskText('');
    setNewNotes('');
    setIsAddingNew(false);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const csvRows = [
      ['RAWDONS HOTEL & BREWERY - DEPARTMENT OPERATIONAL CHECKLISTS'],
      ['Event Title', `"${eventTitle}"`],
      ['Client', `"${clientName}"`],
      ['Generated Date', new Date().toISOString().split('T')[0]],
      ['Overall Compliance', `${stats.pct}% (${stats.completed}/${stats.total} Tasks Completed)`],
      [''],
      ['Department', 'Category', 'Task Description', 'Scheduled Timing', 'Responsible Staff', 'Status', 'Operational Remarks'],
      ...checklists.map((c) => [
        `"${c.department}"`,
        `"${c.category}"`,
        `"${c.task.replace(/"/g, '""')}"`,
        `"${c.timing}"`,
        `"${c.responsibleStaff}"`,
        c.completed ? 'COMPLETED' : 'PENDING',
        `"${(c.notes || '').replace(/"/g, '""')}"`
      ])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rawdons_Department_Checklists_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const getDeptColorBadge = (dept: string) => {
    switch (dept) {
      case 'Banqueting':
        return 'bg-[#2c3e50] text-white';
      case 'Kitchen':
        return 'bg-[#b45309] text-white';
      case 'Admin':
        return 'bg-[#6b21a8] text-white';
      case 'Technical & AV':
        return 'bg-[#047857] text-white';
      default:
        return 'bg-stone-600 text-white';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs no-print-backdrop">
      <div className="relative w-full max-w-5xl bg-white rounded-xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header (hidden in print) */}
        <div className="no-print px-6 py-4 bg-[#1a472a] text-white flex items-center justify-between border-b border-[#d4af37]/40">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <ListChecks className="w-5 h-5 text-[#d4af37]" />
            </div>
            <div>
              <h2 className="text-base font-estate font-bold text-white tracking-wide">
                Departmental Standard Operating Checklists
              </h2>
              <p className="text-xs text-stone-200">
                Operational compliance & shift line-ups across Banqueting, Kitchen, Admin & AV
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 text-xs font-semibold text-[#1a472a] bg-stone-100 hover:bg-white rounded-md transition-colors flex items-center gap-1.5 shadow-2xs font-mono"
            >
              <Download className="w-3.5 h-3.5 text-[#1a472a]" />
              Export CSV
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 text-xs font-semibold text-[#1a472a] bg-[#d4af37] hover:bg-[#c59b27] rounded-md transition-colors flex items-center gap-1.5 shadow-2xs font-mono font-bold"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Roster
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Operational Toolbar (hidden in print) */}
        <div className="no-print p-4 bg-stone-50 border-b border-stone-200 space-y-3">
          {/* Department Tabs with count chips */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {(['All', 'Banqueting', 'Kitchen', 'Admin', 'Technical & AV'] as const).map((dept) => {
                const count =
                  dept === 'All'
                    ? stats.total
                    : stats.byDept[dept]?.total || 0;
                const completed =
                  dept === 'All'
                    ? stats.completed
                    : stats.byDept[dept]?.completed || 0;
                const isSelected = selectedDept === dept;

                return (
                  <button
                    key={dept}
                    onClick={() => setSelectedDept(dept)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      isSelected
                        ? 'bg-[#1a472a] text-white shadow-xs'
                        : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <span>{dept}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {completed}/{count}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setIsAddingNew(!isAddingNew)}
              className="px-3 py-1.5 text-xs font-bold text-[#1a472a] bg-[#d4af37]/20 hover:bg-[#d4af37]/40 border border-[#d4af37] rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Checklist Item
            </button>
          </div>

          {/* Search, Filter & Reset Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search checklists, categories, staff..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-1.5 bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#1a472a]"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="text-xs px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-stone-700"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending Only</option>
                <option value="completed">Completed Only</option>
              </select>
            </div>

            <div className="flex items-center gap-3 text-xs text-stone-500">
              <span className="font-mono">
                Compliance: <strong className="text-[#1a472a]">{stats.pct}%</strong> ({stats.completed} of {stats.total} signed off)
              </span>
              <button
                onClick={onResetDefaults}
                className="text-stone-400 hover:text-stone-700 flex items-center gap-1 text-[11px]"
                title="Reset to Rawdons default checklist items"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Defaults
              </button>
            </div>
          </div>

          {/* Add New Item Form Drawer */}
          {isAddingNew && (
            <form onSubmit={handleCreateItem} className="p-4 bg-white rounded-lg border border-[#d4af37]/60 space-y-3 mt-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1a472a] uppercase font-mono tracking-wider">
                  Create New Department Checklist Item
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="text-stone-400 hover:text-stone-600 text-xs"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] font-mono text-stone-500 mb-1">Department</label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value as any)}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-md"
                  >
                    <option value="Banqueting">Banqueting</option>
                    <option value="Kitchen">Kitchen</option>
                    <option value="Admin">Admin</option>
                    <option value="Technical & AV">Technical & AV</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-stone-500 mb-1">Category / Station</label>
                  <input
                    type="text"
                    placeholder="e.g. Table Setup / Sound Check"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-stone-500 mb-1">Scheduled Timing</label>
                  <input
                    type="text"
                    placeholder="e.g. Day of · 07:00"
                    value={newTiming}
                    onChange={(e) => setNewTiming(e.target.value)}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-stone-500 mb-1">Responsible Staff</label>
                  <input
                    type="text"
                    list="staff-options"
                    placeholder="Staff name or title"
                    value={newStaff}
                    onChange={(e) => setNewStaff(e.target.value)}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-md"
                    required
                  />
                  <datalist id="staff-options">
                    {staffList.map((s) => (
                      <option key={s.id} value={s.name} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] font-mono text-stone-500 mb-1">Task Specification</label>
                  <input
                    type="text"
                    placeholder="Describe exact operational requirement..."
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-md font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-stone-500 mb-1">Operational Remarks / Protocols (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Temperature checks, special guest notes..."
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-md"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-[#1a472a] hover:bg-[#143720] rounded-md shadow-xs"
                >
                  Save Checklist Task
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Printable & Interactive Checklist Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 bg-white" id="printable-checklists">
          {/* Printable Brand Header */}
          <div className="border-b-2 border-[#1a472a] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-[#d4af37] uppercase font-bold">
                Est. 1954 · Nottingham Road, KwaZulu-Natal Midlands
              </span>
              <h1 className="text-2xl font-estate font-extrabold text-[#1a472a] tracking-tight">
                RAWDONS HOTEL & BREWERY
              </h1>
              <p className="text-xs text-stone-600 font-medium">
                Departmental Operational Readiness & Shift Line-Up Checklist · {eventTitle}
              </p>
            </div>

            <div className="text-left sm:text-right text-xs text-stone-600 font-mono space-y-0.5">
              <p>Inspection Date: {new Date().toISOString().split('T')[0]}</p>
              <p>Active Compliance: <strong className="text-[#1a472a]">{stats.pct}% Completed</strong></p>
              <p>Duty Operations: <span className="font-semibold text-stone-800">functions.rawdons@gmail.com</span></p>
            </div>
          </div>

          {/* Department Progress Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {(['Banqueting', 'Kitchen', 'Admin', 'Technical & AV'] as const).map((d) => {
              const dStat = stats.byDept[d] || { total: 0, completed: 0 };
              const dPct = dStat.total > 0 ? Math.round((dStat.completed / dStat.total) * 100) : 0;

              return (
                <div
                  key={d}
                  onClick={() => setSelectedDept(selectedDept === d ? 'All' : d)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    selectedDept === d ? 'bg-stone-100 border-[#1a472a]' : 'bg-stone-50 border-stone-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-stone-800 mb-1">
                    <span className="truncate">{d}</span>
                    <span className="font-mono text-[11px]">{dPct}%</span>
                  </div>
                  <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        d === 'Banqueting'
                          ? 'bg-[#2c3e50]'
                          : d === 'Kitchen'
                          ? 'bg-[#b45309]'
                          : d === 'Admin'
                          ? 'bg-[#6b21a8]'
                          : 'bg-[#047857]'
                      }`}
                      style={{ width: `${dPct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-stone-500 font-mono mt-1">
                    {dStat.completed} of {dStat.total} verified
                  </p>
                </div>
              );
            })}
          </div>

          {/* Checklist Items Grouped by Department */}
          <div className="space-y-4">
            {filteredItems.length === 0 ? (
              <div className="py-12 text-center text-stone-400 text-xs">
                No checklist items found for current selection.
              </div>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-lg border transition-all ${
                    item.completed
                      ? 'bg-stone-50 border-stone-200 text-stone-500'
                      : 'bg-white border-stone-300 shadow-2xs hover:border-stone-400'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <button
                        type="button"
                        onClick={() => onToggleItem(item.id)}
                        className="mt-0.5 text-stone-700 hover:text-[#1a472a] transition-colors shrink-0"
                      >
                        {item.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                        ) : (
                          <Circle className="w-5 h-5 text-stone-400" />
                        )}
                      </button>

                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full ${getDeptColorBadge(
                              item.department
                            )}`}
                          >
                            {item.department}
                          </span>
                          <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider font-semibold">
                            {item.category}
                          </span>
                          <span className="text-[10px] font-mono text-stone-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {item.timing}
                          </span>
                        </div>

                        <p
                          className={`text-xs font-semibold leading-relaxed ${
                            item.completed ? 'line-through text-stone-400' : 'text-stone-900'
                          }`}
                        >
                          {item.task}
                        </p>

                        {item.notes && (
                          <p className="text-[11px] text-stone-600 bg-stone-100/70 p-2 rounded border border-stone-200/60 leading-relaxed font-sans">
                            <strong className="font-mono text-[10px] text-stone-500 uppercase">Operational Protocol: </strong>
                            {item.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right text-[11px] font-mono text-stone-600">
                        <span className="text-[9px] uppercase text-stone-400 block">Responsible</span>
                        <span className="font-semibold text-stone-800">{item.responsibleStaff}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => onDeleteItem(item.id)}
                        className="no-print p-1.5 text-stone-300 hover:text-rose-600 rounded hover:bg-stone-100 transition-colors"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Shift Line-Up Official Signatures for physical printing */}
          <div className="pt-6 border-t-2 border-stone-200 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-4">
              Duty Manager & Department Head Shift Sign-Off
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              <div className="border-t border-stone-400 pt-2">
                <p className="font-bold text-stone-800">Banqueting Manager</p>
                <p className="text-[10px] text-stone-500">Room setup, cutlery & linen</p>
              </div>
              <div className="border-t border-stone-400 pt-2">
                <p className="font-bold text-stone-800">Executive Head Chef</p>
                <p className="text-[10px] text-stone-500">Dietaries & 33% cost sign-off</p>
              </div>
              <div className="border-t border-stone-400 pt-2">
                <p className="font-bold text-stone-800">Technical / AV Lead</p>
                <p className="text-[10px] text-stone-500">Projector, audio & generator</p>
              </div>
              <div className="border-t border-stone-400 pt-2">
                <p className="font-bold text-stone-800">Estate General Manager</p>
                <p className="text-[10px] text-stone-500">Overall operational sign-off</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer (hidden in print) */}
        <div className="no-print px-6 py-3.5 bg-stone-100 border-t border-stone-200 flex items-center justify-between">
          <p className="text-xs text-stone-500 font-mono">
            Checklist updates sync instantly to browser storage & backup bundle.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-1.5 text-xs font-semibold text-stone-700 bg-white border border-stone-300 rounded-md hover:bg-stone-50 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-stone-500" />
              Download CSV
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-[#1a472a] rounded-md hover:bg-[#143720] flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-4 h-4 text-[#d4af37]" />
              Print Shift Roster
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
