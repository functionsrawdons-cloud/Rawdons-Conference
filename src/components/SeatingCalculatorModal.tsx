import React, { useState } from 'react';
import { X, Check, Users, Maximize2, LayoutGrid, Monitor, Coffee } from 'lucide-react';
import { SeatingFormat } from '../types/conference';
import { SEATING_CONFIGS } from '../data/defaultConferences';

interface SeatingCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFormat: SeatingFormat;
  currentDelegates: number;
  roomName: string;
  onApplyFormat: (format: SeatingFormat, delegates: number) => void;
}

export const SeatingCalculatorModal: React.FC<SeatingCalculatorModalProps> = ({
  isOpen,
  onClose,
  currentFormat,
  currentDelegates,
  roomName,
  onApplyFormat,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<SeatingFormat>(currentFormat);
  const [delegates, setDelegates] = useState<number>(currentDelegates);

  if (!isOpen) return null;

  const config = SEATING_CONFIGS[selectedFormat] || SEATING_CONFIGS['U-Shape'];
  const tables = config.tablesNeeded(delegates);
  const sqMeters = config.minRoomSqMeters(delegates);

  const handleApply = () => {
    onApplyFormat(selectedFormat, delegates);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#1a472a] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <LayoutGrid className="w-5 h-5 text-[#d4af37]" />
            </div>
            <div>
              <h2 className="text-lg font-estate font-semibold tracking-wide text-white">Conference Seating & Spatial Layout</h2>
              <p className="text-xs text-stone-200">Rawdons Estate Banqueting Configuration · {roomName}</p>
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
          {/* Headcount slider & quick controls */}
          <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-[#1a472a]" />
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-stone-500">Target Headcount</span>
                <div className="text-2xl font-bold font-mono text-[#1a472a] tabular-nums">{delegates} Delegates</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min="6"
                max="120"
                value={delegates}
                onChange={(e) => setDelegates(Number(e.target.value))}
                className="w-48 sm:w-64 accent-[#1a472a] cursor-pointer"
              />
              <div className="flex gap-1">
                {[16, 24, 45, 60, 80].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setDelegates(preset)}
                    className={`px-2 py-1 text-xs font-mono font-medium rounded border transition-colors ${
                      delegates === preset
                        ? 'bg-[#1a472a] text-white border-[#1a472a]'
                        : 'bg-white text-stone-700 border-stone-300 hover:border-stone-400'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Format selector buttons */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2">
              Select Seating Format
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {(Object.keys(SEATING_CONFIGS) as SeatingFormat[]).map((formatKey) => {
                const item = SEATING_CONFIGS[formatKey];
                const isSelected = selectedFormat === formatKey;
                return (
                  <button
                    key={formatKey}
                    type="button"
                    onClick={() => setSelectedFormat(formatKey)}
                    className={`p-3 text-left rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-[#1a472a]/5 border-[#1a472a] ring-1 ring-[#1a472a]'
                        : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-semibold ${isSelected ? 'text-[#1a472a]' : 'text-stone-800'}`}>
                        {item.name}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-[#1a472a]" />}
                    </div>
                    <p className="text-xs text-stone-500 line-clamp-2">{item.bestFor}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Layout Visual Diagram & Spatial Calculation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Visual floor schematic */}
            <div className="md:col-span-2 p-5 bg-stone-900 text-stone-100 rounded-lg border border-stone-800 flex flex-col justify-between min-h-[260px]">
              <div className="flex items-center justify-between pb-3 border-b border-stone-800 text-xs text-stone-400">
                <span className="flex items-center gap-1.5">
                  <Monitor className="w-4 h-4 text-[#d4af37]" /> Main Presentation Screen / AV Wall
                </span>
                <span className="font-mono text-stone-400">Stage / Focal Point</span>
              </div>

              {/* Graphic representation based on format */}
              <div className="py-6 flex items-center justify-center">
                {selectedFormat === 'U-Shape' && (
                  <div className="w-56 h-36 border-4 border-t-0 border-[#d4af37] rounded-b-md relative flex items-center justify-center">
                    <span className="text-xs font-mono text-stone-400">Center Open Aisles</span>
                    <div className="absolute -top-3 w-16 h-2 bg-emerald-500 rounded-full" />
                    {/* Dots representing seats */}
                    <div className="absolute -left-3 top-2 bottom-2 flex flex-col justify-between">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="w-2 h-2 rounded-full bg-white shadow-xs" />
                      ))}
                    </div>
                    <div className="absolute -right-3 top-2 bottom-2 flex flex-col justify-between">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="w-2 h-2 rounded-full bg-white shadow-xs" />
                      ))}
                    </div>
                    <div className="absolute -bottom-3 left-4 right-4 flex justify-between">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="w-2 h-2 rounded-full bg-white shadow-xs" />
                      ))}
                    </div>
                  </div>
                )}

                {selectedFormat === 'Schoolroom' && (
                  <div className="space-y-3 w-56">
                    {[1, 2, 3].map((row) => (
                      <div key={row} className="flex justify-between items-center gap-2">
                        <div className="flex-1 h-3 bg-[#d4af37] rounded-xs flex items-center justify-around px-1">
                          <div className="w-1.5 h-1.5 bg-stone-900 rounded-full" />
                          <div className="w-1.5 h-1.5 bg-stone-900 rounded-full" />
                        </div>
                        <div className="w-3" />
                        <div className="flex-1 h-3 bg-[#d4af37] rounded-xs flex items-center justify-around px-1">
                          <div className="w-1.5 h-1.5 bg-stone-900 rounded-full" />
                          <div className="w-1.5 h-1.5 bg-stone-900 rounded-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedFormat === 'Boardroom' && (
                  <div className="w-48 h-24 bg-[#d4af37] rounded-lg relative flex items-center justify-center shadow-lg border border-amber-300">
                    <span className="text-xs font-bold font-estate text-stone-900">Grand Mahogany Board</span>
                    {/* Top & bottom chairs */}
                    <div className="absolute -top-3 inset-x-4 flex justify-around">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="w-2.5 h-2.5 rounded-full bg-white" />
                      ))}
                    </div>
                    <div className="absolute -bottom-3 inset-x-4 flex justify-around">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="w-2.5 h-2.5 rounded-full bg-white" />
                      ))}
                    </div>
                  </div>
                )}

                {selectedFormat === 'Banquet Rounds' && (
                  <div className="grid grid-cols-3 gap-5">
                    {Array.from({ length: Math.min(tables, 6) }).map((_, i) => (
                      <div key={i} className="w-14 h-14 rounded-full border-2 border-[#d4af37] bg-white/5 relative flex items-center justify-center">
                        <span className="text-[10px] font-mono text-[#d4af37]">T{i + 1}</span>
                      </div>
                    ))}
                  </div>
                )}

                {selectedFormat === 'Cinema' && (
                  <div className="space-y-2 w-64">
                    {[1, 2, 3, 4].map((row) => (
                      <div key={row} className="flex justify-center gap-1.5">
                        {Array.from({ length: 8 }).map((_, c) => (
                          <div key={c} className="w-2.5 h-2.5 bg-emerald-400 rounded-xs" />
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {selectedFormat === 'Cabaret' && (
                  <div className="grid grid-cols-3 gap-6">
                    {Array.from({ length: Math.min(tables, 6) }).map((_, i) => (
                      <div key={i} className="w-14 h-14 rounded-full border-2 border-dashed border-[#d4af37] relative flex items-center justify-center">
                        <span className="text-[10px] font-mono text-stone-300">C{i + 1}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-stone-400 pt-2 border-t border-stone-800">
                <span>Natural Garden Light & Dam View</span>
                <span>Breakout Veranda Doors</span>
              </div>
            </div>

            {/* Metrics side card */}
            <div className="p-5 bg-stone-50 rounded-lg border border-stone-200 flex flex-col justify-between space-y-4">
              <div>
                <h4 className="text-xs uppercase tracking-wider font-semibold text-stone-500 mb-3">Room Specifications</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-1.5 border-b border-stone-200">
                    <span className="text-xs text-stone-600 flex items-center gap-1.5">
                      <LayoutGrid className="w-3.5 h-3.5 text-stone-400" /> Tables Required:
                    </span>
                    <span className="text-sm font-bold font-mono text-stone-800 tabular-nums">
                      {tables === 0 ? 'None (Theater)' : `${tables} Tables`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-stone-200">
                    <span className="text-xs text-stone-600 flex items-center gap-1.5">
                      <Maximize2 className="w-3.5 h-3.5 text-stone-400" /> Min. Floor Space:
                    </span>
                    <span className="text-sm font-bold font-mono text-stone-800 tabular-nums">
                      {sqMeters} m²
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-stone-200">
                    <span className="text-xs text-stone-600 flex items-center gap-1.5">
                      <Coffee className="w-3.5 h-3.5 text-stone-400" /> Water & Note Stations:
                    </span>
                    <span className="text-sm font-bold font-mono text-stone-800 tabular-nums">
                      {delegates} sets
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-md border border-emerald-200 text-xs text-emerald-900 leading-relaxed">
                <strong>Rawdons Banqueting Note:</strong> {config.description}
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-stone-100 border-t border-stone-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-5 py-2 text-xs font-semibold text-white bg-[#1a472a] rounded-lg hover:bg-[#143720] shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Check className="w-4 h-4 text-[#d4af37]" />
            Apply {selectedFormat} ({delegates} Pax)
          </button>
        </div>
      </div>
    </div>
  );
};
