import React, { useState } from 'react';
import { X, UserPlus, Users, Trash2, Mail, Phone, Briefcase, Check, Building, ShieldCheck } from 'lucide-react';
import { StaffMember, DepartmentRole } from '../types/conference';

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffList: StaffMember[];
  onAddStaff: (newStaff: StaffMember) => void;
  onDeleteStaff: (staffId: string) => void;
  assignedTasksMap: Record<string, number>;
}

export const StaffModal: React.FC<StaffModalProps> = ({
  isOpen,
  onClose,
  staffList,
  onAddStaff,
  onDeleteStaff,
  assignedTasksMap,
}) => {
  const [activeTab, setActiveTab] = useState<'roster' | 'add'>('roster');
  const [filterRole, setFilterRole] = useState<'All' | DepartmentRole>('All');

  // Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState<DepartmentRole>('Banqueting');
  const [title, setTitle] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newStaff: StaffMember = {
      id: `staff-${Date.now()}`,
      name: name.trim(),
      role,
      title: title.trim() || `${role} Staff`,
      email: email.trim() || 'functions.rawdons@gmail.com',
      phone: phone.trim() || '+27 33 266 6044',
      active: true,
    };

    onAddStaff(newStaff);
    // Reset
    setName('');
    setTitle('');
    setEmail('');
    setPhone('');
    setActiveTab('roster');
  };

  const filteredStaff = staffList.filter((s) => {
    if (filterRole !== 'All' && s.role !== filterRole) return false;
    return true;
  });

  const getRoleBadgeStyle = (r: DepartmentRole) => {
    switch (r) {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#1a472a] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Users className="w-5 h-5 text-[#d4af37]" />
            </div>
            <div>
              <h2 className="text-lg font-estate font-semibold tracking-wide text-white">
                Rawdons Estate Staff Roster
              </h2>
              <p className="text-xs text-stone-200">
                Operational Team & Assignee Directory · Banqueting, Kitchen & Admin
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-6 pt-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('roster')}
              className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'roster'
                  ? 'border-[#1a472a] text-[#1a472a]'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Staff Directory ({staffList.length})
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'add'
                  ? 'border-[#1a472a] text-[#1a472a]'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5 text-[#d4af37]" />
              + Add New Staff
            </button>
          </div>

          {activeTab === 'roster' && (
            <div className="flex items-center gap-1 pb-2">
              {(['All', 'Banqueting', 'Kitchen', 'Admin'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setFilterRole(r)}
                  className={`px-2 py-0.5 text-[11px] font-medium rounded transition-colors ${
                    filterRole === r
                      ? 'bg-[#1a472a] text-white'
                      : 'text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {activeTab === 'add' ? (
            /* Add Staff Form */
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">Add Operational Staff Member:</strong>
                  Newly added team members become immediately selectable as task assignees across all conference phases.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sipho Cele or Lauren Van Zyl"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold text-stone-900 focus:ring-2 focus:ring-[#1a472a] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Department / Department Role *
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as DepartmentRole)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold text-stone-900 focus:ring-2 focus:ring-[#1a472a] focus:outline-hidden"
                  >
                    <option value="Banqueting">Banqueting (Front of House)</option>
                    <option value="Kitchen">Kitchen (Culinary Brigade)</option>
                    <option value="Admin">Admin (Sales, Accounts & Front Office)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Job Title / Specialization
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Sous Chef, Banqueting Floor Captain, AV Technician"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:ring-2 focus:ring-[#1a472a] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@rawdons.co.za"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:ring-2 focus:ring-[#1a472a] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Mobile / Radio Contact
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+27 82 ..."
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:ring-2 focus:ring-[#1a472a] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('roster')}
                  className="px-4 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#1a472a] hover:bg-[#143720] rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-[#d4af37]" />
                  Save Staff Member
                </button>
              </div>
            </form>
          ) : (
            /* Roster View */
            <div className="space-y-3">
              {filteredStaff.length === 0 ? (
                <div className="text-center py-8 text-xs text-stone-400">
                  No staff found for this department.
                </div>
              ) : (
                filteredStaff.map((staff) => {
                  const taskCount = assignedTasksMap[staff.name] || 0;
                  return (
                    <div
                      key={staff.id}
                      className="p-3.5 bg-stone-50 rounded-lg border border-stone-200 hover:border-stone-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-stone-200 text-[#1a472a] font-bold flex items-center justify-center shrink-0 text-xs">
                          {staff.name
                            .split(' ')
                            .map((p) => p[0])
                            .slice(0, 2)
                            .join('')}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-stone-900 text-xs">{staff.name}</span>
                            <span
                              className={`text-[9px] font-bold uppercase font-mono px-1.5 py-0.5 rounded-full ${getRoleBadgeStyle(
                                staff.role
                              )}`}
                            >
                              {staff.role}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500 font-medium">{staff.title}</p>
                          <div className="flex flex-wrap items-center gap-3 text-[10px] text-stone-400 mt-1">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-stone-400" /> {staff.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-stone-400" /> {staff.phone}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-200/60">
                        <div className="text-left sm:text-right">
                          <span className="text-[10px] uppercase font-mono text-stone-400 block">Assigned Tasks</span>
                          <span className="font-mono text-xs font-bold text-[#1a472a]">
                            {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Remove ${staff.name} from staff directory?`)) {
                              onDeleteStaff(staff.id);
                            }
                          }}
                          className="p-1.5 text-stone-400 hover:text-rose-600 rounded transition-colors"
                          title="Remove staff member"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-stone-100 border-t border-stone-200 flex items-center justify-between">
          <p className="text-xs text-stone-500 font-mono">
            Direct operational staff contact: <span className="font-bold">functions.rawdons@gmail.com</span>
          </p>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-stone-700 bg-white border border-stone-300 rounded-md hover:bg-stone-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
