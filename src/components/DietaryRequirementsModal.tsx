import React, { useState } from 'react';
import { X, Check, Utensils, AlertCircle, Printer, ShieldAlert } from 'lucide-react';
import { DietaryBreakdown } from '../types/conference';

interface DietaryRequirementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  dietary: DietaryBreakdown;
  totalDelegates: number;
  onSaveDietaries: (updatedDietary: DietaryBreakdown) => void;
}

export const DietaryRequirementsModal: React.FC<DietaryRequirementsModalProps> = ({
  isOpen,
  onClose,
  dietary,
  totalDelegates,
  onSaveDietaries,
}) => {
  const [formData, setFormData] = useState<DietaryBreakdown>({ ...dietary });

  if (!isOpen) return null;

  const totalSpecial =
    formData.vegetarian +
    formData.vegan +
    formData.glutenFree +
    formData.halaal +
    formData.nutAllergy +
    formData.diabetic;

  const standardCalculated = Math.max(0, totalDelegates - totalSpecial);

  const handleFieldChange = (key: keyof DietaryBreakdown, value: number | string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    onSaveDietaries({
      ...formData,
      standard: standardCalculated,
    });
    onClose();
  };

  const handlePrintDietarySheet = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#1a472a] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Utensils className="w-5 h-5 text-[#d4af37]" />
            </div>
            <div>
              <h2 className="text-lg font-estate font-semibold tracking-wide text-white">7-Day Kitchen Dietary Roster & Allergens</h2>
              <p className="text-xs text-stone-200">Rawdons Executive Chef Service Pass Breakdown</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-stone-50 rounded-lg border border-stone-200">
              <span className="text-xs font-semibold text-stone-500 uppercase">Total Headcount</span>
              <div className="text-2xl font-bold font-mono text-stone-900 tabular-nums mt-1">
                {totalDelegates} Pax
              </div>
              <span className="text-[11px] text-stone-500">Confirmed delegate roll</span>
            </div>

            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <span className="text-xs font-semibold text-emerald-800 uppercase">Standard Estate Menu</span>
              <div className="text-2xl font-bold font-mono text-emerald-900 tabular-nums mt-1">
                {standardCalculated} Pax
              </div>
              <span className="text-[11px] text-emerald-700">{Math.round((standardCalculated / totalDelegates) * 100)}% of dining room</span>
            </div>

            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <span className="text-xs font-semibold text-amber-800 uppercase">Special Dietaries</span>
              <div className="text-2xl font-bold font-mono text-amber-900 tabular-nums mt-1">
                {totalSpecial} Pax
              </div>
              <span className="text-[11px] text-amber-700">Dedicated kitchen stations</span>
            </div>
          </div>

          {/* Dietary Counts Matrix */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-600 mb-3">
              Specific Dietary Categories
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'Vegetarian', key: 'vegetarian' as const, note: 'Plant-based with dairy & eggs allowed' },
                { label: 'Strict Vegan', key: 'vegan' as const, note: 'No animal products, honey, or gelatin' },
                { label: 'Gluten-Free / Celiac', key: 'glutenFree' as const, note: 'Dedicated prep surface & toaster' },
                { label: 'Halaal Certified', key: 'halaal' as const, note: 'Sealed supplier package or certificate' },
                { label: 'Nut Allergy (Critical)', key: 'nutAllergy' as const, note: 'Strict cross-contamination isolation', alert: true },
                { label: 'Diabetic / Low GI', key: 'diabetic' as const, note: 'Sugar-free desserts & balanced carbs' },
              ].map((item) => (
                <div
                  key={item.key}
                  className={`p-3 rounded-lg border ${
                    item.alert && formData[item.key] > 0
                      ? 'bg-rose-50 border-rose-300'
                      : 'bg-white border-stone-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-stone-800">{item.label}</span>
                    <input
                      type="number"
                      min="0"
                      max={totalDelegates}
                      value={formData[item.key]}
                      onChange={(e) => handleFieldChange(item.key, Math.max(0, Number(e.target.value)))}
                      className="w-16 px-2 py-1 bg-stone-50 border border-stone-300 rounded font-mono font-bold text-center text-sm focus:ring-1 focus:ring-[#1a472a] focus:outline-hidden"
                    />
                  </div>
                  <p className="text-[10px] text-stone-500 leading-tight">{item.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Allergen & Kitchen Instructions */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
              Chef's Pass Notes & Allergen Protocols
            </label>
            <textarea
              rows={3}
              value={formData.specialNotes}
              onChange={(e) => handleFieldChange('specialNotes', e.target.value)}
              placeholder="e.g. Delegate on Table 2 has severe peanut airborne allergy. Ensure separate fruit platter and clean tongs."
              className="w-full p-3 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-800 focus:ring-2 focus:ring-[#1a472a] focus:outline-hidden"
            />
          </div>

          {/* Critical Alert Warning if severe allergies */}
          {formData.nutAllergy > 0 && (
            <div className="p-3.5 bg-rose-50 rounded-lg border border-rose-200 flex items-start gap-2.5 text-xs text-rose-900">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Severe Allergen Protocol Active:</strong>
                All bakery items and sauces must be certified peanut/tree nut free. Executive Chef must sign off on the service pass plate prior to table service.
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-stone-100 border-t border-stone-200 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrintDietarySheet}
            className="px-3.5 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-stone-500" />
            Print Kitchen Pass List
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#1a472a] rounded-lg hover:bg-[#143720] shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 text-[#d4af37]" />
              Update 7-Day Dietaries
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
