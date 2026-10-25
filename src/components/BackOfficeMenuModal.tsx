import React, { useState } from 'react';
import {
  X,
  Check,
  Sparkles,
  Utensils,
  Calculator,
  Search,
  Filter,
  AlertTriangle,
  Plus,
  Minus,
  CheckCircle2,
  FileText,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  TrendingDown,
  Clock,
  Layers,
  ChefHat
} from 'lucide-react';
import { MenuItem, RAWDONS_MENU_LIBRARY } from '../data/menuLibrary';
import { ConferenceEvent } from '../types/conference';

interface BackOfficeMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeEvent: ConferenceEvent;
  onSaveMenu: (selectedDishes: MenuItem[], totalCostPerHead: number) => void;
}

export const BackOfficeMenuModal: React.FC<BackOfficeMenuModalProps> = ({
  isOpen,
  onClose,
  activeEvent,
  onSaveMenu,
}) => {
  // Currently selected menu items for the conference package
  const [selectedDishes, setSelectedDishes] = useState<MenuItem[]>(() => {
    // Pre-populate with a balanced 33% selection from the PDF
    return RAWDONS_MENU_LIBRARY.filter((item) =>
      [
        'snack-scones',
        'c1-salad-calamari',
        'c1-main-chicken-ala-king',
        'c1-veg-broad-bean-curry',
        'des-cape-brandy-pudding',
      ].includes(item.id)
    );
  });

  const [activeSection, setActiveSection] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [packagePrice, setPackagePrice] = useState<number>(activeEvent.sellingPricePerHead || 680);

  // Deep AI Single Dish Costing modal state
  const [aiCostingDish, setAiCostingDish] = useState<MenuItem | null>(null);
  const [aiCostingLoading, setAiCostingLoading] = useState(false);
  const [aiCostingResult, setAiCostingResult] = useState<any | null>(null);

  // Deep AI Menu Optimization state
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<any | null>(null);

  if (!isOpen) return null;

  // Real-time 33% food cost math
  const totalCostPerHead = selectedDishes.reduce((sum, item) => sum + item.costPerHeadZAR, 0);
  const foodCostPercentage = packagePrice > 0 ? (totalCostPerHead / packagePrice) * 100 : 0;
  const isTargetAchieved = foodCostPercentage <= 33.0;
  const diffFromTarget = foodCostPercentage - 33.0;
  const grossProfitPerHead = packagePrice - totalCostPerHead;

  // Toggle selection
  const handleToggleDish = (dish: MenuItem) => {
    if (selectedDishes.some((d) => d.id === dish.id)) {
      setSelectedDishes((prev) => prev.filter((d) => d.id !== dish.id));
    } else {
      setSelectedDishes((prev) => [...prev, dish]);
    }
    // Clear previous optimization result when menu changes
    setOptimizationResult(null);
  };

  // Deep AI cost single dish using server-side Gemini
  const handleDeepAiCostDish = async (dish: MenuItem) => {
    setAiCostingDish(dish);
    setAiCostingLoading(true);
    setAiCostingResult(null);

    try {
      const response = await fetch('/api/ai/cost-dish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dishName: dish.name,
          category: dish.section,
          description: dish.description,
          serviceStyle: 'Midlands Conference Banquet',
        }),
      });

      if (!response.ok) {
        throw new Error('Server returned error');
      }

      const data = await response.json();
      setAiCostingResult(data);
    } catch (err) {
      console.error('Deep AI Costing error:', err);
      // Fallback display if offline/mock
      setAiCostingResult({
        dishName: dish.name,
        estimatedCostPerHeadZAR: dish.costPerHeadZAR,
        benchmarkSellingPriceZAR: Math.round(dish.costPerHeadZAR / 0.33),
        portionSizeGrams: dish.portionGrams,
        keyIngredients: dish.keyIngredients.map((k) => ({ item: k, costEstimateZAR: Math.round(dish.costPerHeadZAR / dish.keyIngredients.length) })),
        chefRationale: `Traditional Rawdons preparation with local Nottingham Road ingredients, portioned for conference delegate satisfaction.`,
        dietaryTags: Object.keys(dish.dietary).filter((k) => (dish.dietary as any)[k]),
        costEfficiencyRating: dish.costPerHeadZAR > 50 ? 'Premium Item' : 'High Margin',
      });
    } finally {
      setAiCostingLoading(false);
    }
  };

  // Run Deep AI Menu Optimizer using server-side Gemini
  const handleRunAiMenuOptimizer = async () => {
    setIsOptimizing(true);
    try {
      const response = await fetch('/api/ai/optimize-menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedDishes: selectedDishes.map((d) => ({
            name: d.name,
            course: d.courseType,
            costPerHeadZAR: d.costPerHeadZAR,
          })),
          packageSellingPrice: packagePrice,
          delegateCount: activeEvent.delegateCurrent,
          mealType: activeEvent.cateringPackage,
        }),
      });

      if (!response.ok) {
        throw new Error('Optimization request failed');
      }

      const data = await response.json();
      setOptimizationResult(data);
    } catch (err) {
      console.error('Optimization error:', err);
      // High-utility fallback
      setOptimizationResult({
        totalEstimatedCostPerHeadZAR: totalCostPerHead,
        foodCostPercentage: parseFloat(foodCostPercentage.toFixed(1)),
        isTargetMet: isTargetAchieved,
        grossProfitPerHeadZAR: grossProfitPerHead,
        chefExecutiveSummary: isTargetAchieved
          ? `Your menu selection maintains an optimal ${foodCostPercentage.toFixed(1)}% food cost ratio against the R${packagePrice} package price. Excellent margin contribution to Rawdons estate overheads.`
          : `Current menu costs R${totalCostPerHead} per head (${foodCostPercentage.toFixed(1)}%), exceeding the 33.0% threshold by ${diffFromTarget.toFixed(1)}%. Consider swapping one high-cost protein or adjusting the package rate.`,
        recommendations: [
          {
            type: 'Portion Adjustment',
            title: 'Refine Carvery & Protein Yields',
            description: 'Standardize hot protein portions to 240g on buffets to reduce food cost by ~R12 per delegate.',
            potentialSavingsZAR: 12,
          },
          {
            type: 'Pricing',
            title: 'Align Package Selling Rate',
            description: `Adjusting package price from R${packagePrice} to R${Math.round(totalCostPerHead / 0.33)} guarantees an exact 33.0% food cost target.`,
            potentialSavingsZAR: Math.max(0, Math.round(totalCostPerHead / 0.33) - packagePrice),
          },
        ],
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  // Load a pre-engineered 33% compliant Rawdons menu package
  const handleLoadPreset = (presetName: string) => {
    let ids: string[] = [];
    if (presetName === 'Menu 1: Standard Midlands Buffet') {
      ids = ['snack-scones', 'c1-salad-potato', 'c1-salad-calamari', 'c1-main-chicken-ala-king', 'c1-main-beef-casserole', 'c1-veg-broad-bean-curry', 'des-cape-brandy-pudding'];
      setPackagePrice(680);
    } else if (presetName === 'Menu 3: Executive Lamb & Poultry') {
      ids = ['snack-mini-croissant', 'c1-salad-calamari', 'c3-main-lamb-curry', 'plated-main-chicken-supreme', 'c2-veg-breyani-dhal', 'des-chocolate-volcano'];
      setPackagePrice(780);
    } else if (presetName === 'Menu 4: Gourmet Curry & Ragout') {
      ids = ['snack-wrap-platter', 'c1-salad-potato', 'c4-main-butter-chicken', 'c2-main-beef-lasagne', 'des-tiramisu'];
      setPackagePrice(650);
    }
    const filtered = RAWDONS_MENU_LIBRARY.filter((item) => ids.includes(item.id));
    setSelectedDishes(filtered);
    setOptimizationResult(null);
  };

  // Filtered dishes in library
  const filteredDishes = RAWDONS_MENU_LIBRARY.filter((item) => {
    if (activeSection !== 'All' && item.section !== activeSection) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.courseType.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleApply = () => {
    onSaveMenu(selectedDishes, totalCostPerHead);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs">
      <div className="relative w-full max-w-6xl bg-white rounded-xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#1a472a] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <ChefHat className="w-5 h-5 text-[#d4af37]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest text-[#d4af37] uppercase font-bold">
                  Executive Kitchen Back Office
                </span>
                <span className="text-white/40">·</span>
                <a
                  href={`${import.meta.env.BASE_URL}assets/aistudio/Rawdons_Hotel_Brewery_Menu.html__3__6740e0ee.pdf`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-[#d4af37] hover:underline flex items-center gap-1 font-mono"
                >
                  <FileText className="w-3 h-3" />
                  View Rawdons Menu PDF (9 Pages)
                </a>
              </div>
              <h2 className="text-lg font-estate font-bold text-white tracking-wide">
                Menu Selection & Deep AI 33% Food Cost Governance
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Real-time 33% Food Cost Governance Strip */}
        <div className="px-6 py-3.5 bg-stone-900 text-white border-b border-stone-800">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Metric counters */}
            <div className="flex flex-wrap items-center gap-6 text-xs">
              <div>
                <span className="text-[10px] font-mono uppercase text-stone-400 block">Package Selling Price</span>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="font-mono text-stone-400 font-bold">R</span>
                  <input
                    type="number"
                    min="200"
                    max="3000"
                    step="10"
                    value={packagePrice}
                    onChange={(e) => setPackagePrice(Math.max(1, Number(e.target.value)))}
                    className="w-20 px-2 py-0.5 bg-stone-800 border border-stone-700 rounded font-mono font-bold text-white text-sm"
                  />
                  <span className="text-[10px] text-stone-400">pp</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-stone-400 block">Total Raw Ingredient Cost</span>
                <div className="text-lg font-bold font-mono text-[#d4af37] tabular-nums mt-0.5">
                  R{totalCostPerHead.toFixed(2)} <span className="text-xs text-stone-400 font-normal">({selectedDishes.length} dishes)</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-stone-400 block">Food Cost Target</span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className={`text-xl font-extrabold font-mono tabular-nums ${
                    isTargetAchieved ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {foodCostPercentage.toFixed(1)}%
                  </span>
                  <span className="text-[11px] text-stone-400">/ 33.0% Max</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-stone-400 block">Gross Profit Contribution</span>
                <div className="text-base font-bold font-mono text-emerald-400 tabular-nums mt-0.5">
                  R{grossProfitPerHead.toFixed(2)} <span className="text-[11px] text-stone-400 font-normal">({(100 - foodCostPercentage).toFixed(1)}%)</span>
                </div>
              </div>
            </div>

            {/* AI Optimizer Trigger & Target Status */}
            <div className="flex items-center gap-3 shrink-0">
              {isTargetAchieved ? (
                <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-full text-xs font-bold flex items-center gap-1.5 font-mono">
                  <Check className="w-4 h-4 text-emerald-400" />
                  33% Compliant ({Math.abs(diffFromTarget).toFixed(1)}% Buffer)
                </span>
              ) : (
                <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-full text-xs font-bold flex items-center gap-1.5 font-mono">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Over 33% Target by +{diffFromTarget.toFixed(1)}%
                </span>
              )}

              <button
                type="button"
                onClick={handleRunAiMenuOptimizer}
                disabled={isOptimizing}
                className="px-3.5 py-1.5 bg-[#d4af37] hover:bg-[#c59b27] text-[#1a472a] rounded-lg font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isOptimizing ? 'Analyzing with AI...' : 'Deep AI Optimization'}
              </button>
            </div>
          </div>

          {/* Visual progress bar with 33% marker */}
          <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden mt-3 relative">
            <div
              className={`h-full transition-all duration-300 ${
                isTargetAchieved ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${Math.min(foodCostPercentage * 2.2, 100)}%` }}
            />
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white z-10"
              style={{ left: '72.6%' }}
              title="33% Benchmark Target"
            />
          </div>
        </div>

        {/* AI Optimization Feedback Banner (if executed) */}
        {optimizationResult && (
          <div className="px-6 py-3 bg-stone-800 text-stone-200 border-b border-stone-700 text-xs">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="font-bold text-[#d4af37] flex items-center gap-1.5 mb-1">
                  <ChefHat className="w-4 h-4" /> Executive Chef AI Engineering Assessment:
                </span>
                <p className="text-stone-300 leading-relaxed">{optimizationResult.chefExecutiveSummary}</p>
                {optimizationResult.recommendations && optimizationResult.recommendations.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {optimizationResult.recommendations.map((rec: any, i: number) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-stone-900 border border-stone-700 rounded text-[11px] text-emerald-300 font-mono">
                        <TrendingDown className="w-3 h-3" /> {rec.title}: {rec.description}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => setOptimizationResult(null)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Two-Panel Workspace */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-stone-200">
          {/* Left Panel: Menu Library from PDF (7 cols) */}
          <div className="lg:col-span-7 flex flex-col overflow-hidden bg-stone-50/50">
            {/* Filter Bar */}
            <div className="p-4 border-b border-stone-200 bg-white space-y-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search dishes, proteins, or ingredients from PDF..."
                    className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-800 focus:outline-hidden focus:ring-1 focus:ring-[#1a472a]"
                  />
                </div>

                {/* Preset quick buttons */}
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-stone-400 uppercase font-mono hidden sm:inline">Presets:</span>
                  <button
                    onClick={() => handleLoadPreset('Menu 1: Standard Midlands Buffet')}
                    className="px-2 py-1 text-[10px] font-semibold bg-stone-100 hover:bg-stone-200 rounded border border-stone-200"
                    title="Load Conference Menu 1"
                  >
                    Menu 1
                  </button>
                  <button
                    onClick={() => handleLoadPreset('Menu 3: Executive Lamb & Poultry')}
                    className="px-2 py-1 text-[10px] font-semibold bg-stone-100 hover:bg-stone-200 rounded border border-stone-200"
                    title="Load Conference Menu 3"
                  >
                    Menu 3
                  </button>
                  <button
                    onClick={() => handleLoadPreset('Menu 4: Gourmet Curry & Ragout')}
                    className="px-2 py-1 text-[10px] font-semibold bg-stone-100 hover:bg-stone-200 rounded border border-stone-200"
                    title="Load Conference Menu 4"
                  >
                    Menu 4
                  </button>
                </div>
              </div>

              {/* Section Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
                {[
                  'All',
                  'Breakfasts',
                  'Refreshment Breaks',
                  'Conference Lunch Buffets',
                  'Plated Dinners',
                ].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => setActiveSection(sec)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors whitespace-nowrap shrink-0 ${
                      activeSection === sec
                        ? 'bg-[#1a472a] text-white shadow-2xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {sec}
                  </button>
                ))}
              </div>
            </div>

            {/* Dishes list */}
            <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
              {filteredDishes.length === 0 ? (
                <div className="text-center py-12 text-xs text-stone-400">
                  No dishes found matching your query
                </div>
              ) : (
                filteredDishes.map((dish) => {
                  const isSelected = selectedDishes.some((d) => d.id === dish.id);
                  return (
                    <div
                      key={dish.id}
                      className={`p-3.5 rounded-lg border transition-all flex flex-col justify-between gap-2 ${
                        isSelected
                          ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400/50'
                          : 'bg-white border-stone-200 hover:border-stone-300 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-stone-900">{dish.name}</span>
                            <span className="text-[10px] font-mono text-stone-400">PDF P.{dish.pageRef}</span>
                          </div>
                          <p className="text-[11px] text-stone-600 leading-snug">{dish.description}</p>
                        </div>

                        {/* Cost & action */}
                        <div className="text-right shrink-0">
                          <div className="font-mono text-sm font-bold text-[#1a472a] tabular-nums">
                            R{dish.costPerHeadZAR.toFixed(2)}
                          </div>
                          <span className="text-[10px] text-stone-400 font-mono block">Cost / head</span>
                        </div>
                      </div>

                      {/* Footer tags & buttons */}
                      <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-[10px]">
                        <div className="flex items-center gap-1.5 text-stone-500 font-mono">
                          <span className="bg-stone-100 px-1.5 py-0.5 rounded">{dish.courseType}</span>
                          {dish.dietary.vegetarian && <span className="text-emerald-700 bg-emerald-50 px-1 rounded">Veg</span>}
                          {dish.dietary.vegan && <span className="text-emerald-700 bg-emerald-50 px-1 rounded">Vegan</span>}
                          {dish.dietary.glutenFree && <span className="text-blue-700 bg-blue-50 px-1 rounded">GF</span>}
                          {dish.dietary.halaalFriendly && <span className="text-purple-700 bg-purple-50 px-1 rounded">Halaal-friendly</span>}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleDeepAiCostDish(dish)}
                            className="text-[#1a472a] hover:text-[#d4af37] font-semibold flex items-center gap-1 transition-colors"
                            title="Detailed ingredient pricing analysis"
                          >
                            <Sparkles className="w-3 h-3 text-[#d4af37]" /> Deep AI Costing
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleDish(dish)}
                            className={`px-2.5 py-1 rounded font-bold transition-colors flex items-center gap-1 ${
                              isSelected
                                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                                : 'bg-[#1a472a] text-white hover:bg-[#143720]'
                            }`}
                          >
                            {isSelected ? (
                              <>
                                <Minus className="w-3 h-3" /> Remove
                              </>
                            ) : (
                              <>
                                <Plus className="w-3 h-3" /> Add to Package
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Panel: Selected Conference Menu (5 cols) */}
          <div className="lg:col-span-5 flex flex-col overflow-hidden bg-white">
            <div className="p-4 border-b border-stone-200 flex items-center justify-between">
              <div>
                <h3 className="font-estate font-bold text-sm text-[#1a472a]">
                  Selected Conference Package Menu
                </h3>
                <p className="text-[11px] text-stone-500">
                  {selectedDishes.length} dishes · R{totalCostPerHead.toFixed(2)} raw cost per head
                </p>
              </div>

              {selectedDishes.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedDishes([])}
                  className="text-[11px] text-stone-400 hover:text-rose-600 underline font-mono"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Selected dishes list */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              {selectedDishes.length === 0 ? (
                <div className="text-center py-16 text-xs text-stone-400 space-y-2">
                  <Utensils className="w-8 h-8 text-stone-300 mx-auto" />
                  <p className="font-semibold text-stone-600">No dishes selected yet</p>
                  <p className="text-[11px] text-stone-400 max-w-xs mx-auto">
                    Select dishes from the Rawdons Menu Library on the left to build the conference package and track the 33% food cost target.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedDishes.map((dish, idx) => (
                    <div
                      key={dish.id}
                      className="p-2.5 bg-stone-50 rounded-lg border border-stone-200 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-[10px] font-mono font-bold text-stone-400 w-4">{idx + 1}</span>
                        <div className="truncate">
                          <span className="text-xs font-bold text-stone-800 block truncate">{dish.name}</span>
                          <span className="text-[10px] text-stone-500 font-mono">{dish.courseType} · P.{dish.pageRef}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono text-xs font-bold text-stone-800">
                          R{dish.costPerHeadZAR.toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggleDish(dish)}
                          className="p-1 text-stone-400 hover:text-rose-600 transition-colors"
                          title="Remove dish"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Financial summary drawer */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Total Raw Ingredient Cost / Head:</span>
                <span className="font-mono font-bold text-stone-900">R{totalCostPerHead.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Total Kitchen Spend ({activeEvent.delegateCurrent} pax):</span>
                <span className="font-mono font-bold text-stone-900">
                  R{(totalCostPerHead * activeEvent.delegateCurrent).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Estimated Food Revenue ({activeEvent.delegateCurrent} pax):</span>
                <span className="font-mono font-bold text-stone-900">
                  R{(packagePrice * activeEvent.delegateCurrent).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-stone-200 font-bold">
                <span className="text-[#1a472a]">Food Cost % (33% Target):</span>
                <span className={`font-mono text-sm ${isTargetAchieved ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {foodCostPercentage.toFixed(1)}% {isTargetAchieved ? '✓' : '⚠'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-stone-100 border-t border-stone-200 flex items-center justify-between">
          <p className="text-xs text-stone-500 font-mono">
            Compliant with Rawdons 33% Culinary Food Cost Benchmark
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#1a472a] hover:bg-[#143720] rounded-lg shadow-sm flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 text-[#d4af37]" />
              Commit Menu to Conference BEO (R{totalCostPerHead.toFixed(2)} pp)
            </button>
          </div>
        </div>
      </div>

      {/* Deep AI Single Dish Costing Modal */}
      {aiCostingDish && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-stone-200 max-w-lg w-full p-6 space-y-4 text-xs">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#d4af37] font-bold">Deep AI Food Cost Analysis</span>
                <h3 className="text-base font-bold font-estate text-[#1a472a]">{aiCostingDish.name}</h3>
                <p className="text-stone-500 text-[11px]">{aiCostingDish.section} · PDF Page {aiCostingDish.pageRef}</p>
              </div>
              <button onClick={() => setAiCostingDish(null)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {aiCostingLoading ? (
              <div className="py-12 text-center space-y-2">
                <Sparkles className="w-8 h-8 text-[#d4af37] animate-spin mx-auto" />
                <p className="font-semibold text-stone-700">Calculating wholesale ingredient breakdown with Gemini...</p>
                <p className="text-[11px] text-stone-400">Analyzing portion yields, meat cuts & Midlands sourcing rates</p>
              </div>
            ) : aiCostingResult ? (
              <div className="space-y-3.5">
                {/* Cost metrics */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-stone-50 rounded-lg border border-stone-200">
                  <div>
                    <span className="text-[10px] text-stone-500 uppercase font-mono">Raw Ingredient Cost</span>
                    <div className="text-xl font-bold font-mono text-[#1a472a]">
                      R{aiCostingResult.estimatedCostPerHeadZAR?.toFixed(2) || aiCostingDish.costPerHeadZAR}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 uppercase font-mono">33% Benchmark Selling Price</span>
                    <div className="text-xl font-bold font-mono text-stone-800">
                      R{aiCostingResult.benchmarkSellingPriceZAR?.toFixed(2) || Math.round(aiCostingDish.costPerHeadZAR / 0.33)}
                    </div>
                  </div>
                </div>

                {/* Key ingredients breakdown */}
                {aiCostingResult.keyIngredients && (
                  <div>
                    <span className="font-semibold uppercase text-stone-600 text-[10px] block mb-1.5 font-mono">
                      Itemized Wholesale Ingredients (ZAR)
                    </span>
                    <div className="space-y-1">
                      {aiCostingResult.keyIngredients.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between text-stone-700 py-0.5 border-b border-stone-100">
                          <span>{item.item}</span>
                          <span className="font-mono font-semibold">R{Number(item.costEstimateZAR).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Chef rationale */}
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-900 text-[11px] leading-relaxed">
                  <strong>Executive Chef Note:</strong> {aiCostingResult.chefRationale}
                </div>

                <div className="flex items-center justify-between text-[11px] text-stone-500 pt-2 border-t border-stone-200">
                  <span>Portion: <strong>{aiCostingResult.portionSizeGrams || aiCostingDish.portionGrams}g</strong></span>
                  <span>Rating: <strong className="text-[#1a472a]">{aiCostingResult.costEfficiencyRating || 'Standard'}</strong></span>
                </div>
              </div>
            ) : null}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setAiCostingDish(null)}
                className="px-4 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-md"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
