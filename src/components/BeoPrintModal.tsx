import React from 'react';
import { X, Printer, CheckCircle2, Clock, MapPin, Users, Calendar, Phone, Mail, Utensils } from 'lucide-react';
import { ConferenceEvent } from '../types/conference';

interface BeoPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: ConferenceEvent;
}

export const BeoPrintModal: React.FC<BeoPrintModalProps> = ({ isOpen, onClose, event }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const totalDietaries =
    event.dietary.vegetarian +
    event.dietary.vegan +
    event.dietary.glutenFree +
    event.dietary.halaal +
    event.dietary.nutAllergy +
    event.dietary.diabetic;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs no-print-backdrop">
      <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Controls Bar (hidden during print) */}
        <div className="no-print px-6 py-3.5 bg-[#1a472a] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-estate font-bold tracking-wide text-sm">Official Banquet Event Order (BEO)</span>
            <span className="text-xs text-[#d4af37]">· Rawdons Estate Function Sheet</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 text-xs font-semibold text-[#1a472a] bg-[#d4af37] hover:bg-[#c59b27] rounded-md transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-4 h-4" />
              Print Function Sheet
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable BEO Sheet */}
        <div className="p-8 overflow-y-auto space-y-6 text-stone-900 bg-white" id="printable-beo">
          {/* Header */}
          <div className="border-b-2 border-[#1a472a] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono tracking-widest text-[#d4af37] uppercase font-bold">Est. 1954 · Nottingham Road · KZN Midlands</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-estate font-extrabold text-[#1a472a] tracking-tight mt-0.5">
                RAWDONS ESTATE & HOTEL
              </h1>
              <p className="text-xs text-stone-600 font-medium">
                Banquet Event Order (BEO) & Operational Function Sheet · Ref: RAW-BEO-{event.id.toUpperCase()}
              </p>
            </div>

            <div className="text-left sm:text-right text-xs text-stone-600 space-y-0.5 font-mono">
              <p>Issued: 24 October 2026</p>
              <p>Email: <span className="font-bold text-[#1a472a]">functions.rawdons@gmail.com</span></p>
              <p>Tel: +27 33 266 6044</p>
            </div>
          </div>

          {/* Quick Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-stone-50 rounded-lg border border-stone-200 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-500">Event / Client</span>
              <p className="font-bold text-stone-900 text-sm mt-0.5 truncate">{event.eventTitle}</p>
              <p className="text-stone-600 truncate">{event.clientName}</p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-stone-500">Date & Venue</span>
              <p className="font-bold text-stone-900 text-sm mt-0.5">{event.dateRange}</p>
              <p className="text-stone-600">{event.venueRoom}</p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-stone-500">Guaranteed Attendance</span>
              <p className="font-bold text-stone-900 text-sm mt-0.5 font-mono tabular-nums">
                {event.delegateCurrent} Pax
              </p>
              <p className="text-stone-600 font-mono text-[11px]">Min {event.delegateMin} / Max {event.delegateMax}</p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-stone-500">Contract & Deposit</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                {event.depositPaid ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 50% Secured (R{event.depositAmount.toLocaleString()})
                  </span>
                ) : (
                  <span className="text-amber-800 font-semibold">
                    Deposit Pending (R{event.depositAmount.toLocaleString()})
                  </span>
                )}
              </div>
              <p className="text-stone-600 font-mono text-[11px]">{event.accommodationRooms} Lodge Rooms Blocked</p>
            </div>
          </div>

          {/* Section 1: Room Setup & Spatial Configuration */}
          <div className="border border-stone-200 rounded-lg p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1a472a] border-b border-stone-200 pb-1.5 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#d4af37]" />
              1. Spatial Setup & AV Specifications (Banqueting Department)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="font-semibold text-stone-600 block">Seating Format:</span>
                <span className="font-bold text-stone-900">{event.seatingFormat} Layout</span>
              </div>
              <div>
                <span className="font-semibold text-stone-600 block">Stationery & Water:</span>
                <span className="text-stone-800">Rawdons embossed notepads, pens, chilled still & sparkling spring water bottles.</span>
              </div>
              <div>
                <span className="font-semibold text-stone-600 block">AV & Power:</span>
                <span className="text-stone-800">HDMI 75" display screen, presenter clicker, podium roving mic, high-speed estate Wi-Fi.</span>
              </div>
            </div>
          </div>

          {/* Section 2: Culinary & Beverage Run-Sheet */}
          <div className="border border-stone-200 rounded-lg p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1a472a] border-b border-stone-200 pb-1.5 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#d4af37]" />
              2. Event Flow & Culinary Service Schedule
            </h3>
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 font-mono uppercase text-[10px]">
                  <th className="py-1.5 w-24">Time</th>
                  <th className="py-1.5 w-36">Location</th>
                  <th className="py-1.5">Service Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-800">
                <tr>
                  <td className="py-2 font-mono font-bold text-[#1a472a]">07:30 – 08:30</td>
                  <td className="py-2 font-medium">Veranda Lawn</td>
                  <td className="py-2">Arrival estate filter coffee, artisanal teas, freshly baked scones & farm butter.</td>
                </tr>
                <tr>
                  <td className="py-2 font-mono font-bold text-[#1a472a]">10:30 – 11:00</td>
                  <td className="py-2 font-medium">Foyer Breakout</td>
                  <td className="py-2">Mid-morning tea, artisan biltong quiches, fresh seasonal fruit skewers.</td>
                </tr>
                <tr>
                  <td className="py-2 font-mono font-bold text-[#1a472a]">13:00 – 14:00</td>
                  <td className="py-2 font-medium">Dining Room</td>
                  <td className="py-2">
                    Executive 2-Course Lunch. Food cost target 33% (Current: {((event.costPerHead / event.sellingPricePerHead) * 100).toFixed(1)}%).
                  </td>
                </tr>
                <tr>
                  <td className="py-2 font-mono font-bold text-[#1a472a]">15:30 – 16:00</td>
                  <td className="py-2 font-medium">Lake Terrace</td>
                  <td className="py-2">Afternoon tea, dark chocolate brownies, assorted iced infusions.</td>
                </tr>
                <tr>
                  <td className="py-2 font-mono font-bold text-[#1a472a]">18:00 – 21:30</td>
                  <td className="py-2 font-medium">Main Estate Dining Room</td>
                  <td className="py-2">Rawdons 3-Course Plated Evening Banquet & Dessert Service.</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 3: Kitchen Dietaries & Allergen Pass */}
          <div className="border border-stone-200 rounded-lg p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1a472a] border-b border-stone-200 pb-1.5 flex items-center gap-1.5">
              <Utensils className="w-4 h-4 text-[#d4af37]" />
              3. Kitchen Dietary Pass & Allergen Breakdown (Strict 7-Day Matrix)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
              <div className="p-2 bg-stone-100 rounded">
                <span className="block text-[10px] text-stone-500 uppercase font-semibold">Standard</span>
                <span className="text-base font-bold font-mono text-stone-900">{event.dietary.standard}</span>
              </div>
              <div className="p-2 bg-stone-100 rounded">
                <span className="block text-[10px] text-stone-500 uppercase font-semibold">Vegetarian</span>
                <span className="text-base font-bold font-mono text-stone-900">{event.dietary.vegetarian}</span>
              </div>
              <div className="p-2 bg-stone-100 rounded">
                <span className="block text-[10px] text-stone-500 uppercase font-semibold">Vegan</span>
                <span className="text-base font-bold font-mono text-stone-900">{event.dietary.vegan}</span>
              </div>
              <div className="p-2 bg-stone-100 rounded">
                <span className="block text-[10px] text-stone-500 uppercase font-semibold">Gluten-Free</span>
                <span className="text-base font-bold font-mono text-stone-900">{event.dietary.glutenFree}</span>
              </div>
              <div className="p-2 bg-stone-100 rounded">
                <span className="block text-[10px] text-stone-500 uppercase font-semibold">Halaal</span>
                <span className="text-base font-bold font-mono text-stone-900">{event.dietary.halaal}</span>
              </div>
              <div className="p-2 bg-rose-50 border border-rose-200 rounded">
                <span className="block text-[10px] text-rose-700 uppercase font-bold">Nut Allergy</span>
                <span className="text-base font-bold font-mono text-rose-800">{event.dietary.nutAllergy}</span>
              </div>
            </div>
            {event.dietary.specialNotes && (
              <p className="text-xs text-rose-800 bg-rose-50/70 p-2.5 rounded border border-rose-200">
                <strong>Kitchen Pass Alert:</strong> {event.dietary.specialNotes}
              </p>
            )}
          </div>

          {/* Department Sign-Off Signatures */}
          <div className="pt-4 border-t-2 border-stone-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-4">
              Operational Department Authorization Signatures
            </span>
            <div className="grid grid-cols-3 gap-6 text-center text-xs">
              <div className="border-t border-stone-400 pt-2">
                <p className="font-bold text-stone-800">Sarah Mthembu</p>
                <p className="text-[11px] text-stone-500">Banqueting & Event Manager</p>
                <p className="font-mono text-[10px] text-stone-400 mt-1">Status: Confirmed & Roster Set</p>
              </div>

              <div className="border-t border-stone-400 pt-2">
                <p className="font-bold text-stone-800">Chef Thabo Khanye</p>
                <p className="text-[11px] text-stone-500">Executive Head Chef</p>
                <p className="font-mono text-[10px] text-stone-400 mt-1">Status: 33% Target Compliant</p>
              </div>

              <div className="border-t border-stone-400 pt-2">
                <p className="font-bold text-stone-800">General Manager</p>
                <p className="text-[11px] text-stone-500">Rawdons Estate Operations</p>
                <p className="font-mono text-[10px] text-stone-400 mt-1">Status: Estate Readiness Approved</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer (hidden in print) */}
        <div className="no-print px-6 py-3.5 bg-stone-100 border-t border-stone-200 flex items-center justify-between">
          <p className="text-xs text-stone-500">
            For operational enquiries contact: <span className="font-mono text-stone-700">functions.rawdons@gmail.com</span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-stone-700 bg-white border border-stone-300 rounded-md hover:bg-stone-50"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-[#1a472a] rounded-md hover:bg-[#143720] flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4 text-[#d4af37]" />
              Print / Save PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
