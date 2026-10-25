import React, { useState } from 'react';
import { X, Check, Calculator, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';

interface FoodCostCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCostPerHead: number;
  currentSellingPrice: number;
  delegates: number;
  onApplyCosting: (costPerHead: number, sellingPrice: number) => void;
}

export const FoodCostCalculatorModal: React.FC<FoodCostCalculatorModalProps> = ({
  isOpen,
  onClose,
  currentCostPerHead,
  currentSellingPrice,
  delegates,
  onApplyCosting,
}) => {
  const [sellingPrice, setSellingPrice] = useState<number>(currentSellingPrice || 680);
  const [costPerHead, setCostPerHead] = useState<number>(currentCostPerHead || 218);
  const [paxCount, setPaxCount] = useState<number>(delegates || 45);

  if (!isOpen) return null;

  const foodCostPercentage = sellingPrice > 0 ? (costPerHead / sellingPrice) * 100 : 0;
  const targetThreshold = 33.0;
  const isTargetAchieved = foodCostPercentage <= targetThreshold;
  const differenceFromTarget = foodCostPercentage - targetThreshold;

  const totalRevenue = sellingPrice * paxCount;
  const totalFoodCost = costPerHead * paxCount;
  const totalGrossProfit = totalRevenue - totalFoodCost;
  const grossProfitMargin = 100 - foodCostPercentage;

  // Max cost allowed to maintain exactly 33% at current selling price
  const maxCostFor33Percent = Math.round(sellingPrice * 0.33);
  // Min selling price needed to achieve 33% at current ingredient cost
  const minPriceFor33Percent = Math.round(costPerHead / 0.33);

  const presets = [
    {
      name: 'Standard Midlands Day Package',
      description: 'Arrival tea, mid-morning scones, 2-course buffet lunch, afternoon tea.',
      price: 680,
      cost: 215,
    },
    {
      name: 'Executive Estate Feast & Craft Pairing',
      description: 'Plated smoked trout, choice of mains, craft beer pairing flights, artisan cheese dessert.',
      price: 920,
      cost: 298,
    },
    {
      name: 'Grand Nottingham Road Gala Banquet',
      description: 'Canapés on lawn, 3-course slow-braised Karoo lamb, full dessert bar, midnight coffee station.',
      price: 1150,
      cost: 365,
    },
  ];

  const handleApply = () => {
    onApplyCosting(costPerHead, sellingPrice);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#1a472a] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Calculator className="w-5 h-5 text-[#d4af37]" />
            </div>
            <div>
              <h2 className="text-lg font-estate font-semibold tracking-wide text-white">Kitchen 33% Food Cost Target Calculator</h2>
              <p className="text-xs text-stone-200">Rawdons Culinary Governance & Executive Chef Margin Control</p>
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
          {/* Top Result Card with 33% Target Gauge */}
          <div className={`p-5 rounded-xl border transition-all ${
            isTargetAchieved
              ? 'bg-emerald-50/80 border-emerald-300'
              : 'bg-amber-50/80 border-amber-300'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Current Food Cost Percentage</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className={`text-4xl font-extrabold font-mono tabular-nums ${
                    isTargetAchieved ? 'text-emerald-700' : 'text-amber-800'
                  }`}>
                    {foodCostPercentage.toFixed(1)}%
                  </span>
                  <span className="text-xs font-semibold text-stone-500">
                    / Target: <span className="font-mono text-stone-800 font-bold">33.0%</span>
                  </span>
                </div>
              </div>

              <div className="sm:text-right">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Operational Target Status</span>
                <div className="mt-1 flex items-center sm:justify-end gap-1.5">
                  {isTargetAchieved ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      <Check className="w-4 h-4 text-emerald-600" /> 33% Target Compliant ({Math.abs(differenceFromTarget).toFixed(1)}% buffer)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
                      <AlertTriangle className="w-4 h-4 text-amber-700" /> Over Budget Target by +{differenceFromTarget.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Target Progress Bar */}
            <div className="mt-4 pt-3 border-t border-stone-200/60">
              <div className="flex justify-between text-[11px] font-mono text-stone-500 mb-1">
                <span>0%</span>
                <span className="text-[#1a472a] font-bold">Target 33.0%</span>
                <span>50%</span>
              </div>
              <div className="w-full bg-stone-200 h-3 rounded-full overflow-hidden relative">
                <div
                  className={`h-full transition-all duration-300 ${
                    isTargetAchieved ? 'bg-emerald-600' : 'bg-amber-600'
                  }`}
                  style={{ width: `${Math.min(foodCostPercentage * 2, 100)}%` }}
                />
                {/* 33% marker */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-black z-10"
                  style={{ left: '66%' }}
                  title="33% Target"
                />
              </div>
            </div>
          </div>

          {/* Input Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-stone-50 rounded-lg border border-stone-200">
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                Selling Price / Head (ZAR)
              </label>
              <div className="relative mt-2">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-stone-400">R</span>
                <input
                  type="number"
                  min="100"
                  max="5000"
                  step="10"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(Math.max(1, Number(e.target.value)))}
                  className="w-full pl-8 pr-3 py-2 bg-white border border-stone-300 rounded-lg font-mono font-bold text-stone-800 text-base focus:ring-2 focus:ring-[#1a472a] focus:outline-hidden"
                />
              </div>
              <span className="text-[11px] text-stone-500 mt-1 block">Billed to conference client</span>
            </div>

            <div className="p-4 bg-stone-50 rounded-lg border border-stone-200">
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                Ingredient Cost / Head (ZAR)
              </label>
              <div className="relative mt-2">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-stone-400">R</span>
                <input
                  type="number"
                  min="10"
                  max="2000"
                  step="5"
                  value={costPerHead}
                  onChange={(e) => setCostPerHead(Math.max(0, Number(e.target.value)))}
                  className="w-full pl-8 pr-3 py-2 bg-white border border-stone-300 rounded-lg font-mono font-bold text-stone-800 text-base focus:ring-2 focus:ring-[#1a472a] focus:outline-hidden"
                />
              </div>
              <span className="text-[11px] text-stone-500 mt-1 block">Meat, dairy, dry goods & produce</span>
            </div>

            <div className="p-4 bg-stone-50 rounded-lg border border-stone-200">
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                Delegate Count
              </label>
              <input
                type="number"
                min="5"
                max="250"
                value={paxCount}
                onChange={(e) => setPaxCount(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2 mt-2 bg-white border border-stone-300 rounded-lg font-mono font-bold text-stone-800 text-base focus:ring-2 focus:ring-[#1a472a] focus:outline-hidden"
              />
              <span className="text-[11px] text-stone-500 mt-1 block">Total catering covers</span>
            </div>
          </div>

          {/* Financial Summary Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-stone-100/70 rounded-lg border border-stone-200">
              <span className="text-[11px] font-semibold text-stone-500 uppercase">Total Food Revenue</span>
              <div className="text-xl font-bold font-mono text-stone-900 tabular-nums mt-0.5">
                R{totalRevenue.toLocaleString()}
              </div>
              <span className="text-[11px] text-stone-500">R{sellingPrice} × {paxCount} pax</span>
            </div>

            <div className="p-3.5 bg-stone-100/70 rounded-lg border border-stone-200">
              <span className="text-[11px] font-semibold text-stone-500 uppercase">Total Kitchen Spend</span>
              <div className="text-xl font-bold font-mono text-stone-900 tabular-nums mt-0.5">
                R{totalFoodCost.toLocaleString()}
              </div>
              <span className="text-[11px] text-stone-500">R{costPerHead} × {paxCount} pax</span>
            </div>

            <div className="p-3.5 bg-emerald-50 rounded-lg border border-emerald-200">
              <span className="text-[11px] font-semibold text-emerald-800 uppercase flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Gross Profit Margin
              </span>
              <div className="text-xl font-bold font-mono text-emerald-900 tabular-nums mt-0.5">
                R{totalGrossProfit.toLocaleString()} ({grossProfitMargin.toFixed(1)}%)
              </div>
              <span className="text-[11px] text-emerald-700">Contribution to estate overheads</span>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <span className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2">
              Rawdons Pre-Costed Catering Packages
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {presets.map((preset) => {
                const pct = (preset.cost / preset.price) * 100;
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      setSellingPrice(preset.price);
                      setCostPerHead(preset.cost);
                    }}
                    className="p-3 text-left bg-white border border-stone-200 rounded-lg hover:border-[#1a472a] hover:bg-stone-50 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-xs font-bold text-stone-800 block mb-1">{preset.name}</span>
                      <p className="text-[11px] text-stone-500 leading-snug line-clamp-2">{preset.description}</p>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                      <span className="font-mono font-semibold text-stone-800">R{preset.price} pp</span>
                      <span className="font-mono text-emerald-700 font-bold">{pct.toFixed(1)}% cost</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Guidance note */}
          {!isTargetAchieved && (
            <div className="p-3.5 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 space-y-1">
              <span className="font-bold flex items-center gap-1 text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                Target Adjustment Recommendations:
              </span>
              <p>
                To achieve the 33.0% target: reduce ingredient cost to at most <strong>R{maxCostFor33Percent} pp</strong> (save R{costPerHead - maxCostFor33Percent} pp), OR increase package price to <strong>R{minPriceFor33Percent} pp</strong> (+R{minPriceFor33Percent - sellingPrice} pp).
              </p>
            </div>
          )}
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
            Apply Costing to Conference (R{costPerHead} / R{sellingPrice})
          </button>
        </div>
      </div>
    </div>
  );
};
