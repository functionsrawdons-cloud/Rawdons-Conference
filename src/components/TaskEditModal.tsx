import React, { useState } from 'react';
import { X, Check, Trash2, Calendar, User, FileText, Briefcase, UserPlus } from 'lucide-react';
import { DepartmentRole, TaskItem, StaffMember } from '../types/conference';

interface TaskEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: TaskItem | null;
  phaseId: string;
  phaseName: string;
  staffList?: StaffMember[];
  onOpenAddStaff?: () => void;
  onSaveTask: (phaseId: string, task: TaskItem, isNew: boolean) => void;
  onDeleteTask?: (phaseId: string, taskId: string) => void;
}

export const TaskEditModal: React.FC<TaskEditModalProps> = ({
  isOpen,
  onClose,
  task,
  phaseId,
  phaseName,
  staffList = [],
  onOpenAddStaff,
  onSaveTask,
  onDeleteTask,
}) => {
  const isNew = !task;
  const [name, setName] = useState(task?.name || '');
  const [role, setRole] = useState<DepartmentRole>(task?.role || 'Banqueting');
  const [dueDateDesc, setDueDateDesc] = useState(task?.dueDateDesc || '7 days prior to event');
  const [assignee, setAssignee] = useState(task?.assignee || '');
  const [notes, setNotes] = useState(task?.notes || '');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const updatedTask: TaskItem = {
      id: task?.id || `task-${Date.now()}`,
      name: name.trim(),
      role,
      completed: task?.completed || false,
      dueDateDesc: dueDateDesc.trim(),
      assignee: assignee.trim(),
      notes: notes.trim(),
      actionKey: task?.actionKey || 'general',
    };

    onSaveTask(phaseId, updatedTask, isNew);
    onClose();
  };

  const handleDelete = () => {
    if (task && onDeleteTask) {
      onDeleteTask(phaseId, task.id);
      onClose();
    }
  };

  const matchingStaff = staffList.filter((s) => s.role === role);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-[#1a472a] text-white flex items-center justify-between">
          <div>
            <h2 className="text-base font-estate font-semibold text-white">
              {isNew ? 'Add Operational Task' : 'Edit Operational Task'}
            </h2>
            <p className="text-xs text-stone-200 truncate">{phaseName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Task Description
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Confirm audio-visual technician on-site"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium text-stone-900 focus:ring-2 focus:ring-[#1a472a] focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-stone-500" /> Responsible Role
              </label>
              <select
                value={role}
                onChange={(e) => {
                  const newRole = e.target.value as DepartmentRole;
                  setRole(newRole);
                  // If current assignee isn't in new role, suggest first matching
                  const firstOfRole = staffList.find((s) => s.role === newRole);
                  if (firstOfRole) setAssignee(firstOfRole.name);
                }}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold text-stone-900 focus:ring-2 focus:ring-[#1a472a] focus:outline-hidden"
              >
                <option value="Banqueting">Banqueting (Front of House)</option>
                <option value="Kitchen">Kitchen (Culinary)</option>
                <option value="Admin">Admin (Sales & Accounts)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-stone-500" /> Target Timeline
              </label>
              <input
                type="text"
                value={dueDateDesc}
                onChange={(e) => setDueDateDesc(e.target.value)}
                placeholder="e.g. 7 days prior"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:ring-2 focus:ring-[#1a472a] focus:outline-hidden"
              />
            </div>
          </div>

          {/* Assignee selection */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-stone-700 uppercase tracking-wider flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-stone-500" /> Assignee / Staff Member
              </label>
              {onOpenAddStaff && (
                <button
                  type="button"
                  onClick={onOpenAddStaff}
                  className="text-[11px] font-semibold text-[#1a472a] hover:text-[#d4af37] flex items-center gap-1"
                >
                  <UserPlus className="w-3 h-3" /> + Add Staff
                </button>
              )}
            </div>

            {matchingStaff.length > 0 ? (
              <div className="space-y-2">
                <select
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium text-stone-900 focus:ring-2 focus:ring-[#1a472a] focus:outline-hidden"
                >
                  <option value="">-- Select from {role} Staff Roster --</option>
                  {matchingStaff.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.title})
                    </option>
                  ))}
                  {/* Also include all other staff */}
                  <optgroup label="Other Estate Staff">
                    {staffList
                      .filter((s) => s.role !== role)
                      .map((s) => (
                        <option key={s.id} value={s.name}>
                          {s.name} ({s.role} · {s.title})
                        </option>
                      ))}
                  </optgroup>
                </select>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-stone-400">or type custom:</span>
                  <input
                    type="text"
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    placeholder="Custom assignee name..."
                    className="flex-1 px-2.5 py-1 bg-stone-50 border border-stone-200 rounded text-xs text-stone-800 focus:outline-hidden"
                  />
                </div>
              </div>
            ) : (
              <input
                type="text"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                placeholder="e.g. Sarah Mthembu or Chef Thabo"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:ring-2 focus:ring-[#1a472a] focus:outline-hidden"
              />
            )}
          </div>

          <div>
            <label className="block font-semibold text-stone-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-stone-500" /> Operational Remarks & Protocol
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add key notes, equipment requirements, or client instructions..."
              className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:ring-2 focus:ring-[#1a472a] focus:outline-hidden"
            />
          </div>

          {/* Footer actions */}
          <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
            {!isNew && onDeleteTask ? (
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-1.5 text-rose-700 hover:bg-rose-50 rounded-md transition-colors flex items-center gap-1 font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Task
              </button>
            ) : (
              <div />
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-stone-700 bg-white border border-stone-300 rounded-md hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-white bg-[#1a472a] hover:bg-[#143720] rounded-md font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <Check className="w-4 h-4 text-[#d4af37]" />
                {isNew ? 'Create Task' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
