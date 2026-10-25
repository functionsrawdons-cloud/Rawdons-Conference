import React from 'react';
import {
  X,
  Printer,
  Download,
  DollarSign,
  TrendingUp,
  CreditCard,
  FileText,
  CheckCircle2,
  AlertCircle,
  Building,
  Calendar,
  Users
} from 'lucide-react';
import { ConferenceEvent } from '../types/conference';

interface FinancialExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: ConferenceEvent;
}

export const FinancialExportModal: React.FC<FinancialExportModalProps> = ({ isOpen, onClose, event }) => {
  if (!isOpen) return null;

  // Financial calculations
  const delegateCount = event.delegateCurrent || 45;
  const packagePrice = event.sellingPricePerHead || 680;
  const packageCost = event.costPerHead || 218;

  // Day delegate revenue
  const totalCateringRevenue = packagePrice * delegateCount;
  const totalCateringCost = packageCost * delegateCount;
  const cateringGrossProfit = totalCateringRevenue - totalCateringCost;
  const cateringMarginPct = totalCateringRevenue > 0 ? (cateringGrossProfit / totalCateringRevenue) * 100 : 0;
  const foodCostPct = totalCateringRevenue > 0 ? (totalCateringCost / totalCateringRevenue) * 100 : 0;

  // Venue Hire revenue (dynamic from assigned venue and season/attendee tier)
  const venueHireRevenue = event.venueHireFee ?? 11500;
  const venueHireTitle = event.venueRoom || 'Main Conference Room';
  const venueSeasonTitle = `${event.venueSeason || 'Mid Season'} (${event.venueDuration || 'Full-Day'})`;
  const venueCleaningMaintenanceCost = 1500;
  const venueNetProfit = Math.max(0, venueHireRevenue - venueCleaningMaintenanceCost);

  // Accommodation revenue estimation (assuming 2 nights at R1,650 per single room / R1,950 per sharing room)
  const roomNights = 2;
  const singleRoomRate = 1650;
  const sharingRoomRate = 1950;
  const singleRooms = event.accommodationSingle || Math.round(event.accommodationRooms * 0.7);
  const sharingRooms = event.accommodationSharing || Math.max(0, event.accommodationRooms - singleRooms);

  const totalAccommodationRevenue =
    (singleRooms * singleRoomRate + sharingRooms * sharingRoomRate) * roomNights;
  const accommodationCleaningCost = (singleRooms + sharingRooms) * 220 * roomNights;
  const accommodationProfit = totalAccommodationRevenue - accommodationCleaningCost;

  // Total Event Value
  const grossEventTotal = totalCateringRevenue + totalAccommodationRevenue + venueHireRevenue;
  const vatRate = 0.15; // 15% South African VAT
  const vatAmount = grossEventTotal * vatRate;
  const grandTotalWithVat = grossEventTotal + vatAmount;

  // Deposit tracking
  const depositRequired = Math.round(grandTotalWithVat * 0.5);
  const depositPaidAmount = event.depositPaid ? event.depositAmount || depositRequired : 0;
  const balanceOutstanding = grandTotalWithVat - depositPaidAmount;

  // Total Estate Operating Contribution
  const totalEstateProfit = cateringGrossProfit + accommodationProfit + venueNetProfit;
  const estateProfitMarginPct = grossEventTotal > 0 ? (totalEstateProfit / grossEventTotal) * 100 : 0;

  // Export to CSV
  const handleExportCSV = () => {
    const csvRows = [
      ['RAWDONS HOTEL & BREWERY - FINANCIAL RECONCILIATION & PRO-FORMA INVOICE'],
      ['Reference', `RAW-FIN-${event.id.toUpperCase()}`],
      ['Date Issued', new Date().toISOString().split('T')[0]],
      ['Client / Company', `"${event.clientName}"`],
      ['Event Title', `"${event.eventTitle}"`],
      ['Contact Person', `"${event.contactPerson}"`],
      ['Billing Email', event.contactEmail],
      ['Event Dates', `"${event.dateRange}"`],
      ['Venue Suite', `"${event.venueRoom}"`],
      ['Guaranteed Attendance', `${delegateCount} Delegates`],
      [''],
      ['SECTION 1: CONFERENCE CATERING & DAY PACKAGES (EXCL. VAT)'],
      ['Item Description', 'Unit Rate (ZAR)', 'Quantity', 'Total Revenue (ZAR)', 'Raw Cost / Head (ZAR)', 'Total Cost (ZAR)', 'Gross Profit (ZAR)', 'Margin %'],
      [
        `"${event.cateringPackage || 'Full-Day Conference Package'}"`,
        packagePrice.toFixed(2),
        delegateCount,
        totalCateringRevenue.toFixed(2),
        packageCost.toFixed(2),
        totalCateringCost.toFixed(2),
        cateringGrossProfit.toFixed(2),
        `${cateringMarginPct.toFixed(1)}%`
      ],
      [''],
      ['SECTION 2: ESTATE VENUE & PLENARY HIRE (EXCL. VAT)'],
      ['Venue Specification', 'Tariff Model & Season', 'Duration', 'Venue Hire (ZAR)', 'Operating Costs (ZAR)', 'Net Venue Margin (ZAR)'],
      [
        `"${venueHireTitle}"`,
        `"${venueSeasonTitle}"`,
        `"${event.venueDuration || 'Full-Day'}"`,
        venueHireRevenue.toFixed(2),
        venueCleaningMaintenanceCost.toFixed(2),
        venueNetProfit.toFixed(2)
      ],
      [''],
      ['SECTION 3: ESTATE LODGE ACCOMMODATION (EXCL. VAT)'],
      ['Suite Type', 'Nightly Rate (ZAR)', 'Rooms Blocked', 'Nights', 'Total Revenue (ZAR)', 'Turnaround Cost (ZAR)', 'Net Room Profit (ZAR)'],
      ['Deluxe Single Manor Rooms', singleRoomRate.toFixed(2), singleRooms, roomNights, (singleRooms * singleRoomRate * roomNights).toFixed(2), (singleRooms * 220 * roomNights).toFixed(2), (singleRooms * (singleRoomRate - 220) * roomNights).toFixed(2)],
      ['Executive Sharing / Twin Rooms', sharingRoomRate.toFixed(2), sharingRooms, roomNights, (sharingRooms * sharingRoomRate * roomNights).toFixed(2), (sharingRooms * 220 * roomNights).toFixed(2), (sharingRooms * (sharingRoomRate - 220) * roomNights).toFixed(2)],
      ['Total Accommodation', '', event.accommodationRooms, roomNights, totalAccommodationRevenue.toFixed(2), accommodationCleaningCost.toFixed(2), accommodationProfit.toFixed(2)],
      [''],
      ['SECTION 4: FINANCIAL REVENUE & TAX RECONCILIATION'],
      ['Subtotal (Excl. VAT)', grossEventTotal.toFixed(2)],
      ['Value Added Tax (VAT @ 15%)', vatAmount.toFixed(2)],
      ['GRAND TOTAL INVOICE (INCL. VAT)', grandTotalWithVat.toFixed(2)],
      ['50% Confirmation Deposit Required', depositRequired.toFixed(2)],
      ['Deposit Status', event.depositPaid ? 'PAID / SECURED' : 'PENDING PAYMENT'],
      ['Deposit Amount Received', depositPaidAmount.toFixed(2)],
      ['Outstanding Balance Due (7 Days Prior)', balanceOutstanding.toFixed(2)],
      [''],
      ['SECTION 5: ESTATE MARGIN GOVERNANCE'],
      ['Kitchen 33% Food Cost Target Status', foodCostPct <= 33.0 ? 'COMPLIANT (<=33%)' : 'EXCEEDED (>33%)'],
      ['Actual Food Cost Percentage', `${foodCostPct.toFixed(1)}%`],
      ['Total Estate Gross Operating Contribution', totalEstateProfit.toFixed(2)],
      ['Overall Estate Margin', `${estateProfitMarginPct.toFixed(1)}%`]
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rawdons_Financial_Statement_${event.id}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs no-print-backdrop">
      <div className="relative w-full max-w-5xl bg-white rounded-xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header (hidden in print) */}
        <div className="no-print px-6 py-4 bg-[#1a472a] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <DollarSign className="w-5 h-5 text-[#d4af37]" />
            </div>
            <div>
              <h2 className="text-base font-estate font-bold text-white tracking-wide">
                Professional Financial Statement & Pro-Forma Revenue Reconciliation
              </h2>
              <p className="text-xs text-stone-200">
                Official Rawdons Hotel & Brewery Estate Conference Account Ledger
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 text-xs font-semibold text-[#1a472a] bg-stone-100 hover:bg-white rounded-md transition-colors flex items-center gap-1.5 shadow-2xs font-mono"
            >
              <Download className="w-3.5 h-3.5 text-[#1a472a]" />
              Export CSV / Excel
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 text-xs font-semibold text-[#1a472a] bg-[#d4af37] hover:bg-[#c59b27] rounded-md transition-colors flex items-center gap-1.5 shadow-2xs font-mono font-bold"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Pro-Forma Invoice
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable & Scrollable Statement Body */}
        <div className="p-8 overflow-y-auto space-y-6 text-stone-900 bg-white" id="printable-financial">
          {/* Estate Brand Header */}
          <div className="border-b-2 border-[#1a472a] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-[#d4af37] uppercase font-bold">
                Est. 1954 · Nottingham Road · KwaZulu-Natal Midlands
              </span>
              <h1 className="text-2xl sm:text-3xl font-estate font-extrabold text-[#1a472a] tracking-tight mt-0.5">
                RAWDONS HOTEL & BREWERY
              </h1>
              <p className="text-xs text-stone-600 font-medium">
                Conference Financial Pro-Forma & Operating Revenue Reconciliation · Ref: RAW-FIN-{event.id.toUpperCase()}
              </p>
            </div>

            <div className="text-left sm:text-right text-xs text-stone-600 font-mono space-y-0.5">
              <p>Statement Date: {new Date().toISOString().split('T')[0]}</p>
              <p>VAT Reg No: 4890112456</p>
              <p>Direct Accounts: <strong className="text-[#1a472a]">functions.rawdons@gmail.com</strong></p>
            </div>
          </div>

          {/* Client & Booking Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-stone-50 rounded-lg border border-stone-200 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-500 block">Client Organization</span>
              <p className="font-bold text-stone-900 text-sm mt-0.5 truncate">{event.clientName}</p>
              <p className="text-stone-600 truncate">{event.contactPerson}</p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-stone-500 block">Event Title & Venue</span>
              <p className="font-bold text-stone-900 text-sm mt-0.5 truncate">{event.eventTitle}</p>
              <p className="text-stone-600 truncate">{event.venueRoom}</p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-stone-500 block">Attendance & Schedule</span>
              <p className="font-bold text-stone-900 text-sm mt-0.5 font-mono tabular-nums">{delegateCount} Delegates</p>
              <p className="text-stone-600 truncate">{event.dateRange}</p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-stone-500 block">Deposit Standing</span>
              <p className="mt-0.5 font-bold font-mono">
                {event.depositPaid ? (
                  <span className="text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    50% Paid (R{depositPaidAmount.toLocaleString()})
                  </span>
                ) : (
                  <span className="text-amber-800 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    R{depositRequired.toLocaleString()} Due
                  </span>
                )}
              </p>
              <p className="text-[10px] text-stone-500 font-mono">Invoice Status: {event.status}</p>
            </div>
          </div>

          {/* Section 1: Conference Catering Breakdown */}
          <div className="border border-stone-200 rounded-lg overflow-hidden">
            <div className="px-4 py-2.5 bg-stone-100/80 border-b border-stone-200 flex items-center justify-between">
              <span className="font-estate font-bold text-xs uppercase text-[#1a472a] tracking-wider">
                1. Conference Catering & Day Packages (Excl. VAT)
              </span>
              <span className="text-[11px] font-mono text-stone-500">
                Food Cost Target: <strong className={foodCostPct <= 33 ? 'text-emerald-700' : 'text-amber-700'}>{foodCostPct.toFixed(1)}% (Target: 33.0%)</strong>
              </span>
            </div>

            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-stone-500 font-mono text-[10px] uppercase">
                  <th className="py-2 px-3">Itemized Package</th>
                  <th className="py-2 px-3 text-right">Delegates</th>
                  <th className="py-2 px-3 text-right">Unit Rate</th>
                  <th className="py-2 px-3 text-right">Total Revenue</th>
                  <th className="py-2 px-3 text-right">Raw Food Cost</th>
                  <th className="py-2 px-3 text-right">Gross Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-800">
                <tr>
                  <td className="py-2.5 px-3">
                    <span className="font-bold text-stone-900 block">{event.cateringPackage || 'Standard Day Delegate Package'}</span>
                    <span className="text-[10px] text-stone-500">Arrival tea/scones, mid-morning break, 2-course lunch, afternoon tea, evening dinner</span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold">{delegateCount}</td>
                  <td className="py-2.5 px-3 text-right font-mono">R{packagePrice.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-stone-900">R{totalCateringRevenue.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-stone-600">R{totalCateringCost.toLocaleString()} ({foodCostPct.toFixed(1)}%)</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">R{cateringGrossProfit.toLocaleString()} ({cateringMarginPct.toFixed(1)}%)</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 2: Estate Venue & Plenary Hire */}
          <div className="border border-stone-200 rounded-lg overflow-hidden">
            <div className="px-4 py-2.5 bg-stone-100/80 border-b border-stone-200 flex items-center justify-between">
              <span className="font-estate font-bold text-xs uppercase text-[#1a472a] tracking-wider">
                2. Estate Venue & Plenary Hire (Excl. VAT)
              </span>
              <span className="text-[11px] font-mono text-stone-500">
                Tariff Basis: <strong>{venueSeasonTitle}</strong>
              </span>
            </div>

            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-stone-500 font-mono text-[10px] uppercase">
                  <th className="py-2 px-3">Selected Venue</th>
                  <th className="py-2 px-3 text-right">Duration</th>
                  <th className="py-2 px-3 text-right">Season / Tier</th>
                  <th className="py-2 px-3 text-right">Venue Hire Fee</th>
                  <th className="py-2 px-3 text-right">Cleaning / Setup</th>
                  <th className="py-2 px-3 text-right">Net Contribution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-800">
                <tr>
                  <td className="py-2.5 px-3">
                    <span className="font-bold text-stone-900 block">{venueHireTitle}</span>
                    <span className="text-[10px] text-stone-500">Includes audio-visual, uncapped fibre, climate control & generator backup</span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono">{event.venueDuration || 'Full-Day'}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-stone-700">{event.venueSeason || 'Mid Season'}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-stone-900">R{venueHireRevenue.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-stone-600">R{venueCleaningMaintenanceCost.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">R{venueNetProfit.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 3: Estate Lodge Accommodation */}
          <div className="border border-stone-200 rounded-lg overflow-hidden">
            <div className="px-4 py-2.5 bg-stone-100/80 border-b border-stone-200 flex items-center justify-between">
              <span className="font-estate font-bold text-xs uppercase text-[#1a472a] tracking-wider">
                3. Estate Lodge Overnight Accommodation (Excl. VAT)
              </span>
              <span className="text-[11px] font-mono text-stone-500">
                Total Rooms Blocked: <strong>{event.accommodationRooms} Rooms ({roomNights} Nights)</strong>
              </span>
            </div>

            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-stone-500 font-mono text-[10px] uppercase">
                  <th className="py-2 px-3">Room Allocation</th>
                  <th className="py-2 px-3 text-right">Rooms</th>
                  <th className="py-2 px-3 text-right">Nights</th>
                  <th className="py-2 px-3 text-right">Nightly Rate</th>
                  <th className="py-2 px-3 text-right">Total Revenue</th>
                  <th className="py-2 px-3 text-right">Net Room Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-800">
                <tr>
                  <td className="py-2 px-3">
                    <span className="font-bold text-stone-900 block">Deluxe Single Manor Rooms</span>
                    <span className="text-[10px] text-stone-500">Includes country estate breakfast and dam views</span>
                  </td>
                  <td className="py-2 px-3 text-right font-mono">{singleRooms}</td>
                  <td className="py-2 px-3 text-right font-mono">{roomNights}</td>
                  <td className="py-2 px-3 text-right font-mono">R{singleRoomRate.toLocaleString()}</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-stone-900">R{(singleRooms * singleRoomRate * roomNights).toLocaleString()}</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700">R{(singleRooms * (singleRoomRate - 220) * roomNights).toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="py-2 px-3">
                    <span className="font-bold text-stone-900 block">Executive Sharing / Twin Rooms</span>
                    <span className="text-[10px] text-stone-500">Twin double beds for sharing delegates</span>
                  </td>
                  <td className="py-2 px-3 text-right font-mono">{sharingRooms}</td>
                  <td className="py-2 px-3 text-right font-mono">{roomNights}</td>
                  <td className="py-2 px-3 text-right font-mono">R{sharingRoomRate.toLocaleString()}</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-stone-900">R{(sharingRooms * sharingRoomRate * roomNights).toLocaleString()}</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700">R{(sharingRooms * (sharingRoomRate - 220) * roomNights).toLocaleString()}</td>
                </tr>
                <tr className="bg-stone-50/60 font-semibold">
                  <td className="py-2 px-3">Total Accommodation Block</td>
                  <td className="py-2 px-3 text-right font-mono">{event.accommodationRooms}</td>
                  <td className="py-2 px-3 text-right font-mono">{roomNights}</td>
                  <td className="py-2 px-3 text-right font-mono">—</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-[#1a472a]">R{totalAccommodationRevenue.toLocaleString()}</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700">R{accommodationProfit.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 3: Master Account Settlement & Banking Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Estate Bank Payment Instructions */}
            <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 text-xs space-y-2">
              <span className="font-bold uppercase text-[10px] tracking-wider text-stone-500 block font-mono">
                Official Estate Banking Details for EFT
              </span>
              <div className="space-y-1 font-mono text-stone-800">
                <p><strong>Bank:</strong> First National Bank (FNB)</p>
                <p><strong>Account Name:</strong> Rawdons Hotel & Estate (Pty) Ltd</p>
                <p><strong>Account Number:</strong> 620 441 992 01</p>
                <p><strong>Branch Code:</strong> 220 425 (Nottingham Road)</p>
                <p><strong>Swift Code:</strong> FIRNZAJJ</p>
                <p><strong>Payment Reference:</strong> <span className="text-[#1a472a] font-bold">RAW-{event.id.toUpperCase().slice(0, 10)}</span></p>
              </div>
              <p className="text-[11px] text-stone-500 pt-1">
                Please email proof of payment to: <strong className="text-stone-800">functions.rawdons@gmail.com</strong>
              </p>
            </div>

            {/* Financial Ledger Summary Card */}
            <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-stone-200 text-stone-600">
                <span>Total Catering (Excl. VAT):</span>
                <span className="font-mono font-semibold">R{totalCateringRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-200 text-stone-600">
                <span>Total Accommodation (Excl. VAT):</span>
                <span className="font-mono font-semibold">R{totalAccommodationRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-200 font-bold text-stone-800">
                <span>Subtotal (Excl. VAT):</span>
                <span className="font-mono">R{grossEventTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-200 text-stone-600">
                <span>Value Added Tax (15% VAT):</span>
                <span className="font-mono">R{Math.round(vatAmount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b-2 border-stone-800 text-base font-extrabold text-[#1a472a]">
                <span>Grand Total (Incl. VAT):</span>
                <span className="font-mono">R{Math.round(grandTotalWithVat).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 text-xs font-semibold text-stone-700">
                <span>50% Deposit Required:</span>
                <span className="font-mono">R{depositRequired.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 text-xs font-semibold">
                <span>Deposit Received to Date:</span>
                <span className="font-mono text-emerald-700">R{depositPaidAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 bg-amber-50 px-2 rounded border border-amber-200 text-xs font-bold text-amber-900">
                <span>Outstanding Balance Due (7 Days Prior):</span>
                <span className="font-mono">R{Math.round(balanceOutstanding).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Sign-off signatures */}
          <div className="pt-4 border-t-2 border-stone-200 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-4">
              Authorized Financial Sign-Off
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-center">
              <div className="border-t border-stone-400 pt-2">
                <p className="font-bold text-stone-800">Claire Pillay</p>
                <p className="text-[11px] text-stone-500">Sales & Conference Accounts</p>
              </div>
              <div className="border-t border-stone-400 pt-2">
                <p className="font-bold text-stone-800">Chef Thabo Khanye</p>
                <p className="text-[11px] text-stone-500">Executive Head Chef (33% Cost Sign-Off)</p>
              </div>
              <div className="border-t border-stone-400 pt-2">
                <p className="font-bold text-stone-800">Financial Controller</p>
                <p className="text-[11px] text-stone-500">Rawdons Estate Operations</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer (hidden in print) */}
        <div className="no-print px-6 py-3.5 bg-stone-100 border-t border-stone-200 flex items-center justify-between">
          <p className="text-xs text-stone-500 font-mono">
            Direct finance inquiries: <span className="font-bold">functions.rawdons@gmail.com</span>
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
              Print / Save PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
