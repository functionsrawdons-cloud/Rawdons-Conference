import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import {
  X,
  TrendingUp,
  Download,
  Printer,
  Calendar,
  DollarSign,
  PieChart as PieChartIcon,
  BarChart3,
  Users,
  Building,
  Filter,
  CheckCircle2,
  Clock,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { ConferenceEvent } from '../types/conference';

interface ConferenceInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  conferences: ConferenceEvent[];
}

interface MonthlyData {
  monthKey: string; // e.g. "2026-10"
  monthLabel: string; // e.g. "Oct 2026"
  year: number;
  monthNum: number;
  cateringRevenue: number;
  accommodationRevenue: number;
  totalRevenue: number;
  delegateCount: number;
  eventCount: number;
  conferences: ConferenceEvent[];
}

interface PackageData {
  packageType: string;
  revenue: number;
  percentage: number;
  count: number;
  delegates: number;
  color: string;
}

interface SeatingData {
  format: string;
  revenue: number;
  count: number;
  avgRevenuePerPax: number;
}

export const ConferenceInsightsModal: React.FC<ConferenceInsightsModalProps> = ({
  isOpen,
  onClose,
  conferences,
}) => {
  const [revenueMetric, setRevenueMetric] = useState<'all' | 'catering' | 'accommodation'>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'trends' | 'breakdowns' | 'formats'>('trends');

  // Chart SVG references
  const monthlyChartRef = useRef<SVGSVGElement | null>(null);
  const donutChartRef = useRef<SVGSVGElement | null>(null);
  const seatingChartRef = useRef<SVGSVGElement | null>(null);

  // Hover Tooltip state
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    title: string;
    details: { label: string; value: string; color?: string }[];
  }>({
    visible: false,
    x: 0,
    y: 0,
    title: '',
    details: [],
  });

  // Calculate detailed financial items for each conference
  const calculatedEvents = useMemo(() => {
    return conferences.map((c) => {
      const pax = c.delegateCurrent || 40;
      const packageRate = c.sellingPricePerHead || 650;
      const cateringRev = pax * packageRate;

      // Accommodation: Single R1650/night, Sharing R1950/night, standard 2 nights
      const singleRooms = c.accommodationSingle || Math.round(c.accommodationRooms * 0.7);
      const sharingRooms = c.accommodationSharing || Math.max(0, c.accommodationRooms - singleRooms);
      const accomRev = (singleRooms * 1650 + sharingRooms * 1950) * 2;

      const subtotal = cateringRev + accomRev;
      const vat = subtotal * 0.15;
      const grandTotal = subtotal + vat;

      // Extract Year and Month from startDate or createdAt
      let eventDate = new Date();
      if (c.startDate) {
        eventDate = new Date(c.startDate);
      } else if (c.createdAt) {
        eventDate = new Date(c.createdAt);
      }

      const year = eventDate.getFullYear() || 2026;
      const monthNum = eventDate.getMonth(); // 0-11
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthLabel = `${monthNames[monthNum]} ${year}`;
      const monthKey = `${year}-${String(monthNum + 1).padStart(2, '0')}`;

      return {
        ...c,
        cateringRev,
        accomRev,
        subtotal,
        grandTotal,
        year,
        monthNum,
        monthLabel,
        monthKey,
      };
    });
  }, [conferences]);

  // Filtered dataset
  const filteredEvents = useMemo(() => {
    return calculatedEvents.filter((item) => {
      if (selectedYear !== 'all' && String(item.year) !== selectedYear) return false;
      if (selectedStatus === 'confirmed' && !['Confirmed', 'Ready for Arrival', 'Operational Review'].includes(item.status)) return false;
      if (selectedStatus === 'pipeline' && item.status !== 'Proposal Issued' && item.status !== 'Inquiry') return false;
      return true;
    });
  }, [calculatedEvents, selectedYear, selectedStatus]);

  // Aggregate monthly data
  const monthlyData: MonthlyData[] = useMemo(() => {
    const map = new Map<string, MonthlyData>();

    filteredEvents.forEach((item) => {
      const existing = map.get(item.monthKey);
      if (existing) {
        existing.cateringRevenue += item.cateringRev;
        existing.accommodationRevenue += item.accomRev;
        existing.totalRevenue += item.grandTotal;
        existing.delegateCount += item.delegateCurrent;
        existing.eventCount += 1;
        existing.conferences.push(item);
      } else {
        map.set(item.monthKey, {
          monthKey: item.monthKey,
          monthLabel: item.monthLabel,
          year: item.year,
          monthNum: item.monthNum,
          cateringRevenue: item.cateringRev,
          accommodationRevenue: item.accomRev,
          totalRevenue: item.grandTotal,
          delegateCount: item.delegateCurrent,
          eventCount: 1,
          conferences: [item],
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => a.monthKey.localeCompare(b.monthKey));
  }, [filteredEvents]);

  // Aggregate package / event type data
  const packageData: PackageData[] = useMemo(() => {
    const map = new Map<string, { revenue: number; count: number; delegates: number }>();
    let totalRev = 0;

    filteredEvents.forEach((item) => {
      const pkg = item.packageType || 'Full-Day Package';
      const rev =
        revenueMetric === 'catering'
          ? item.cateringRev
          : revenueMetric === 'accommodation'
          ? item.accomRev
          : item.grandTotal;

      totalRev += rev;
      const curr = map.get(pkg) || { revenue: 0, count: 0, delegates: 0 };
      curr.revenue += rev;
      curr.count += 1;
      curr.delegates += item.delegateCurrent;
      map.set(pkg, curr);
    });

    const colors: Record<string, string> = {
      'Full-Day Package': '#1a472a', // Forest green
      'Custom Executive Package': '#d4af37', // Heritage gold
      'Half-Day Package': '#2c3e50', // Slate navy
    };

    return Array.from(map.entries()).map(([packageType, data]) => ({
      packageType,
      revenue: data.revenue,
      count: data.count,
      delegates: data.delegates,
      percentage: totalRev > 0 ? (data.revenue / totalRev) * 100 : 0,
      color: colors[packageType] || '#6b21a8',
    }));
  }, [filteredEvents, revenueMetric]);

  // Aggregate seating layout data
  const seatingData: SeatingData[] = useMemo(() => {
    const map = new Map<string, { revenue: number; count: number; delegates: number }>();

    filteredEvents.forEach((item) => {
      const format = item.seatingFormat || 'U-Shape';
      const rev =
        revenueMetric === 'catering'
          ? item.cateringRev
          : revenueMetric === 'accommodation'
          ? item.accomRev
          : item.grandTotal;

      const curr = map.get(format) || { revenue: 0, count: 0, delegates: 0 };
      curr.revenue += rev;
      curr.count += 1;
      curr.delegates += item.delegateCurrent;
      map.set(format, curr);
    });

    return Array.from(map.entries())
      .map(([format, data]) => ({
        format,
        revenue: data.revenue,
        count: data.count,
        avgRevenuePerPax: data.delegates > 0 ? Math.round(data.revenue / data.delegates) : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [filteredEvents, revenueMetric]);

  // Overall totals
  const summaryMetrics = useMemo(() => {
    const totalGrand = filteredEvents.reduce((acc, curr) => acc + curr.grandTotal, 0);
    const totalCatering = filteredEvents.reduce((acc, curr) => acc + curr.cateringRev, 0);
    const totalAccom = filteredEvents.reduce((acc, curr) => acc + curr.accomRev, 0);
    const totalDelegates = filteredEvents.reduce((acc, curr) => acc + curr.delegateCurrent, 0);
    const avgPerEvent = filteredEvents.length > 0 ? Math.round(totalGrand / filteredEvents.length) : 0;
    const avgPerPax = totalDelegates > 0 ? Math.round(totalGrand / totalDelegates) : 0;

    // Best month
    let topMonth = 'N/A';
    let maxMonthRev = 0;
    monthlyData.forEach((m) => {
      if (m.totalRevenue > maxMonthRev) {
        maxMonthRev = m.totalRevenue;
        topMonth = m.monthLabel;
      }
    });

    return {
      totalGrand,
      totalCatering,
      totalAccom,
      totalDelegates,
      avgPerEvent,
      avgPerPax,
      topMonth,
      eventCount: filteredEvents.length,
    };
  }, [filteredEvents, monthlyData]);

  // ==========================================
  // D3 RENDERING 1: Monthly Stacked Bar Chart
  // ==========================================
  useEffect(() => {
    if (!isOpen || !monthlyChartRef.current || monthlyData.length === 0) return;

    const svg = d3.select(monthlyChartRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 30, right: 30, bottom: 50, left: 75 };
    const width = 760 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X Scale
    const x = d3
      .scaleBand()
      .domain(monthlyData.map((d) => d.monthLabel))
      .range([0, width])
      .padding(0.35);

    // Y Scale
    const maxY = d3.max(monthlyData, (d) => {
      if (revenueMetric === 'catering') return d.cateringRevenue * 1.15;
      if (revenueMetric === 'accommodation') return d.accommodationRevenue * 1.15;
      return d.totalRevenue * 1.15;
    }) || 100000;

    const y = d3.scaleLinear().domain([0, maxY]).nice().range([height, 0]);

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .call(
        d3
          .axisLeft(y)
          .tickSize(-width)
          .tickFormat(() => '')
      )
      .selectAll('line')
      .attr('stroke', '#e5e7eb')
      .attr('stroke-dasharray', '3,3');

    // Axes
    const xAxis = g
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x));

    xAxis.selectAll('text')
      .attr('fill', '#4b5563')
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .attr('font-family', 'var(--font-mono, monospace)');

    xAxis.selectAll('path, line').attr('stroke', '#9ca3af');

    const yAxis = g.append('g').call(
      d3
        .axisLeft(y)
        .ticks(5)
        .tickFormat((d) => `R${(Number(d) / 1000).toFixed(0)}k`)
    );

    yAxis.selectAll('text')
      .attr('fill', '#4b5563')
      .attr('font-size', '11px')
      .attr('font-family', 'var(--font-mono, monospace)');

    yAxis.selectAll('path, line').attr('stroke', '#9ca3af');

    // Render Bars
    if (revenueMetric === 'all') {
      // Stacked Bar (Catering on bottom, Accommodation on top)
      const barGroups = g
        .selectAll('.bar-group')
        .data(monthlyData)
        .enter()
        .append('g')
        .attr('class', 'bar-group')
        .attr('transform', (d) => `translate(${x(d.monthLabel)},0)`);

      // Catering Bar (bottom)
      barGroups
        .append('rect')
        .attr('x', 0)
        .attr('y', (d) => y(d.cateringRevenue))
        .attr('width', x.bandwidth())
        .attr('height', (d) => height - y(d.cateringRevenue))
        .attr('fill', '#1a472a') // Forest Green
        .attr('rx', 3)
        .attr('cursor', 'pointer')
        .on('mouseenter', (event: MouseEvent, d) => {
          const target = event.currentTarget as SVGElement;
          const rect = target.getBoundingClientRect();
          setTooltip({
            visible: true,
            x: rect.x + rect.width / 2,
            y: rect.y - 10,
            title: `${d.monthLabel} Revenue`,
            details: [
              { label: 'Catering Revenue', value: `R ${d.cateringRevenue.toLocaleString()}`, color: '#1a472a' },
              { label: 'Accommodation', value: `R ${d.accommodationRevenue.toLocaleString()}`, color: '#d4af37' },
              { label: 'Total Revenue (Incl. VAT)', value: `R ${Math.round(d.totalRevenue).toLocaleString()}`, color: '#111827' },
              { label: 'Conferences Scheduled', value: `${d.eventCount} booking(s)` },
              { label: 'Delegates Accommodated', value: `${d.delegateCount} pax` },
            ],
          });
        })
        .on('mouseleave', () => setTooltip((prev) => ({ ...prev, visible: false })));

      // Accommodation Bar (stacked on top)
      barGroups
        .append('rect')
        .attr('x', 0)
        .attr('y', (d) => y(d.cateringRevenue + d.accommodationRevenue))
        .attr('width', x.bandwidth())
        .attr('height', (d) => height - y(d.accommodationRevenue))
        .attr('fill', '#d4af37') // Warm Gold
        .attr('rx', 3)
        .attr('cursor', 'pointer')
        .on('mouseenter', (event: MouseEvent, d) => {
          const target = event.currentTarget as SVGElement;
          const rect = target.getBoundingClientRect();
          setTooltip({
            visible: true,
            x: rect.x + rect.width / 2,
            y: rect.y - 10,
            title: `${d.monthLabel} Revenue`,
            details: [
              { label: 'Catering Revenue', value: `R ${d.cateringRevenue.toLocaleString()}`, color: '#1a472a' },
              { label: 'Accommodation', value: `R ${d.accommodationRevenue.toLocaleString()}`, color: '#d4af37' },
              { label: 'Total Revenue (Incl. VAT)', value: `R ${Math.round(d.totalRevenue).toLocaleString()}`, color: '#111827' },
              { label: 'Conferences Scheduled', value: `${d.eventCount} booking(s)` },
              { label: 'Delegates Accommodated', value: `${d.delegateCount} pax` },
            ],
          });
        })
        .on('mouseleave', () => setTooltip((prev) => ({ ...prev, visible: false })));

      // Value label on top of each bar
      barGroups
        .append('text')
        .attr('x', x.bandwidth() / 2)
        .attr('y', (d) => y(d.cateringRevenue + d.accommodationRevenue) - 6)
        .attr('text-anchor', 'middle')
        .attr('fill', '#1a472a')
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .attr('font-family', 'var(--font-mono, monospace)')
        .text((d) => `R${Math.round((d.cateringRevenue + d.accommodationRevenue) / 1000)}k`);
    } else {
      // Single metric bars (catering or accommodation only)
      const fillColor = revenueMetric === 'catering' ? '#1a472a' : '#d4af37';

      g.selectAll('.single-bar')
        .data(monthlyData)
        .enter()
        .append('rect')
        .attr('class', 'single-bar')
        .attr('x', (d) => x(d.monthLabel) || 0)
        .attr('y', (d) => {
          const val = revenueMetric === 'catering' ? d.cateringRevenue : d.accommodationRevenue;
          return y(val);
        })
        .attr('width', x.bandwidth())
        .attr('height', (d) => {
          const val = revenueMetric === 'catering' ? d.cateringRevenue : d.accommodationRevenue;
          return height - y(val);
        })
        .attr('fill', fillColor)
        .attr('rx', 4)
        .attr('cursor', 'pointer')
        .on('mouseenter', (event: MouseEvent, d) => {
          const target = event.currentTarget as SVGElement;
          const rect = target.getBoundingClientRect();
          const val = revenueMetric === 'catering' ? d.cateringRevenue : d.accommodationRevenue;
          setTooltip({
            visible: true,
            x: rect.x + rect.width / 2,
            y: rect.y - 10,
            title: `${d.monthLabel} (${revenueMetric.toUpperCase()})`,
            details: [
              { label: `${revenueMetric === 'catering' ? 'Catering' : 'Accommodation'} Revenue`, value: `R ${val.toLocaleString()}`, color: fillColor },
              { label: 'Events in Month', value: `${d.eventCount} booking(s)` },
              { label: 'Total Delegates', value: `${d.delegateCount} pax` },
            ],
          });
        })
        .on('mouseleave', () => setTooltip((prev) => ({ ...prev, visible: false })));

      // Value label
      g.selectAll('.bar-label')
        .data(monthlyData)
        .enter()
        .append('text')
        .attr('class', 'bar-label')
        .attr('x', (d) => (x(d.monthLabel) || 0) + x.bandwidth() / 2)
        .attr('y', (d) => {
          const val = revenueMetric === 'catering' ? d.cateringRevenue : d.accommodationRevenue;
          return y(val) - 6;
        })
        .attr('text-anchor', 'middle')
        .attr('fill', '#1a472a')
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .attr('font-family', 'var(--font-mono, monospace)')
        .text((d) => {
          const val = revenueMetric === 'catering' ? d.cateringRevenue : d.accommodationRevenue;
          return `R${Math.round(val / 1000)}k`;
        });
    }
  }, [monthlyData, revenueMetric, isOpen]);

  // ==========================================
  // D3 RENDERING 2: Event Type Donut Chart
  // ==========================================
  useEffect(() => {
    if (!isOpen || !donutChartRef.current || packageData.length === 0) return;

    const svg = d3.select(donutChartRef.current);
    svg.selectAll('*').remove();

    const width = 360;
    const height = 280;
    const radius = Math.min(width, height) / 2 - 20;

    const g = svg
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const pie = d3
      .pie<PackageData>()
      .value((d) => d.revenue)
      .sort(null);

    const arc = d3
      .arc<d3.PieArcDatum<PackageData>>()
      .innerRadius(radius * 0.55)
      .outerRadius(radius * 0.9);

    const arcHover = d3
      .arc<d3.PieArcDatum<PackageData>>()
      .innerRadius(radius * 0.52)
      .outerRadius(radius * 0.96);

    const arcs = g
      .selectAll('.arc')
      .data(pie(packageData))
      .enter()
      .append('g')
      .attr('class', 'arc')
      .attr('cursor', 'pointer');

    arcs
      .append('path')
      .attr('d', arc)
      .attr('fill', (d) => d.data.color)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .style('transition', 'all 0.2s ease')
      .on('mouseenter', function (event: MouseEvent, d) {
        d3.select(this).transition().duration(150).attr('d', arcHover as any);
        const target = event.currentTarget as SVGElement;
        const rect = target.getBoundingClientRect();
        setTooltip({
          visible: true,
          x: rect.x + rect.width / 2,
          y: rect.y - 10,
          title: d.data.packageType,
          details: [
            { label: 'Total Revenue', value: `R ${d.data.revenue.toLocaleString()}`, color: d.data.color },
            { label: 'Share of Portfolio', value: `${d.data.percentage.toFixed(1)}%` },
            { label: 'Conferences', value: `${d.data.count} bookings` },
            { label: 'Total Attendance', value: `${d.data.delegates} delegates` },
          ],
        });
      })
      .on('mouseleave', function () {
        d3.select(this).transition().duration(150).attr('d', arc as any);
        setTooltip((prev) => ({ ...prev, visible: false }));
      });

    // Center Label in Donut
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.4em')
      .attr('fill', '#1a472a')
      .attr('font-size', '13px')
      .attr('font-weight', 'bold')
      .attr('font-family', 'var(--font-estate, serif)')
      .text('BY PACKAGE');

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1em')
      .attr('fill', '#4b5563')
      .attr('font-size', '11px')
      .attr('font-family', 'var(--font-mono, monospace)')
      .attr('font-weight', '600')
      .text(`${packageData.length} Types`);
  }, [packageData, isOpen]);

  // ==========================================
  // D3 RENDERING 3: Seating Format Horizontal Bar Chart
  // ==========================================
  useEffect(() => {
    if (!isOpen || !seatingChartRef.current || seatingData.length === 0) return;

    const svg = d3.select(seatingChartRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 80, bottom: 30, left: 110 };
    const width = 420 - margin.left - margin.right;
    const height = 280 - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const y = d3
      .scaleBand()
      .domain(seatingData.map((d) => d.format))
      .range([0, height])
      .padding(0.28);

    const maxX = d3.max(seatingData, (d) => d.revenue) || 100000;
    const x = d3.scaleLinear().domain([0, maxX]).nice().range([0, width]);

    // Y Axis
    const yAxis = g.append('g').call(d3.axisLeft(y));
    yAxis.selectAll('text')
      .attr('fill', '#1f2937')
      .attr('font-size', '11px')
      .attr('font-weight', '600');
    yAxis.selectAll('path, line').attr('stroke', '#d1d5db');

    // Bars
    g.selectAll('.h-bar')
      .data(seatingData)
      .enter()
      .append('rect')
      .attr('class', 'h-bar')
      .attr('y', (d) => y(d.format) || 0)
      .attr('x', 0)
      .attr('height', y.bandwidth())
      .attr('width', (d) => x(d.revenue))
      .attr('fill', '#1a472a')
      .attr('rx', 3)
      .attr('cursor', 'pointer')
      .on('mouseenter', (event: MouseEvent, d) => {
        const target = event.currentTarget as SVGElement;
        const rect = target.getBoundingClientRect();
        setTooltip({
          visible: true,
          x: rect.x + rect.width / 2,
          y: rect.y - 10,
          title: `${d.format} Seating Format`,
          details: [
            { label: 'Revenue Generated', value: `R ${d.revenue.toLocaleString()}`, color: '#1a472a' },
            { label: 'Average Rev / Delegate', value: `R ${d.avgRevenuePerPax.toLocaleString()}` },
            { label: 'Bookings Configured', value: `${d.count} event(s)` },
          ],
        });
      })
      .on('mouseleave', () => setTooltip((prev) => ({ ...prev, visible: false })));

    // Value Labels on End of Bars
    g.selectAll('.h-label')
      .data(seatingData)
      .enter()
      .append('text')
      .attr('class', 'h-label')
      .attr('y', (d) => (y(d.format) || 0) + y.bandwidth() / 2 + 4)
      .attr('x', (d) => x(d.revenue) + 6)
      .attr('fill', '#1a472a')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('font-family', 'var(--font-mono, monospace)')
      .text((d) => `R${(d.revenue / 1000).toFixed(0)}k`);
  }, [seatingData, isOpen]);

  if (!isOpen) return null;

  // Export Analytics Summary CSV
  const handleExportCSV = () => {
    const csvRows = [
      ['RAWDONS HOTEL & BREWERY - CONFERENCES & REVENUE INSIGHTS REPORT'],
      ['Generated On', new Date().toISOString().split('T')[0]],
      ['Active Filters', `Year: ${selectedYear} | Status: ${selectedStatus} | Revenue Metric: ${revenueMetric}`],
      ['Total Portfolio Revenue', `R ${summaryMetrics.totalGrand.toFixed(2)}`],
      ['Total Catering Revenue', `R ${summaryMetrics.totalCatering.toFixed(2)}`],
      ['Total Accommodation Revenue', `R ${summaryMetrics.totalAccom.toFixed(2)}`],
      ['Total Delegates Served', summaryMetrics.totalDelegates],
      ['Average Revenue per Delegate', `R ${summaryMetrics.avgPerPax.toFixed(2)}`],
      ['Top Revenue Month', summaryMetrics.topMonth],
      [''],
      ['=== SECTION 1: MONTHLY REVENUE DISTRIBUTION ==='],
      ['Month Label', 'Event Count', 'Total Delegates', 'Catering Revenue (ZAR)', 'Accommodation Revenue (ZAR)', 'Total Revenue (ZAR)'],
      ...monthlyData.map((m) => [
        `"${m.monthLabel}"`,
        m.eventCount,
        m.delegateCount,
        m.cateringRevenue.toFixed(2),
        m.accommodationRevenue.toFixed(2),
        m.totalRevenue.toFixed(2),
      ]),
      [''],
      ['=== SECTION 2: EVENT PACKAGE BREAKDOWN ==='],
      ['Package Type', 'Bookings Count', 'Total Delegates', 'Total Revenue (ZAR)', 'Portfolio Share %'],
      ...packageData.map((p) => [
        `"${p.packageType}"`,
        p.count,
        p.delegates,
        p.revenue.toFixed(2),
        `${p.percentage.toFixed(1)}%`,
      ]),
      [''],
      ['=== SECTION 3: SEATING FORMAT PERFORMANCE ==='],
      ['Seating Format', 'Bookings Count', 'Revenue Generated (ZAR)', 'Avg Revenue Per Delegate (ZAR)'],
      ...seatingData.map((s) => [
        `"${s.format}"`,
        s.count,
        s.revenue.toFixed(2),
        s.avgRevenuePerPax.toFixed(2),
      ]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rawdons_Conference_Insights_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs no-print-backdrop">
      <div className="relative w-full max-w-6xl bg-white rounded-xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="no-print px-6 py-4 bg-[#1a472a] text-white flex items-center justify-between border-b border-[#d4af37]/40">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-[#d4af37]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-estate font-bold text-white tracking-wide">
                  Conference Insights & Revenue Distribution
                </h2>
                <span className="text-[10px] font-mono uppercase bg-[#d4af37] text-[#1a472a] font-bold px-2 py-0.2 rounded-full">
                  D3.js Visualizer
                </span>
              </div>
              <p className="text-xs text-stone-200">
                Cross-sectional revenue intelligence across event packages, seating formats, and seasonal months
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 text-xs font-semibold text-[#1a472a] bg-stone-100 hover:bg-white rounded-md transition-colors flex items-center gap-1.5 shadow-2xs font-mono"
            >
              <Download className="w-3.5 h-3.5 text-[#1a472a]" />
              Export Insights CSV
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 text-xs font-semibold text-[#1a472a] bg-[#d4af37] hover:bg-[#c59b27] rounded-md transition-colors flex items-center gap-1.5 shadow-2xs font-mono font-bold"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Report
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Executive Metric Cards Strip */}
        <div className="no-print p-4 bg-stone-50 border-b border-stone-200">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            <div className="p-3 bg-white rounded-lg border border-stone-200 shadow-2xs">
              <span className="text-[10px] font-mono uppercase text-stone-500 block">Total Pipeline</span>
              <p className="text-base font-bold font-mono text-[#1a472a] mt-0.5">
                R {(summaryMetrics.totalGrand / 1000).toFixed(0)}k
              </p>
              <span className="text-[10px] text-stone-400 font-mono">{summaryMetrics.eventCount} Conferences</span>
            </div>

            <div className="p-3 bg-white rounded-lg border border-stone-200 shadow-2xs">
              <span className="text-[10px] font-mono uppercase text-stone-500 block">Catering Rev</span>
              <p className="text-base font-bold font-mono text-[#1a472a] mt-0.5">
                R {(summaryMetrics.totalCatering / 1000).toFixed(0)}k
              </p>
              <span className="text-[10px] text-emerald-700 font-mono">33.0% Food Cost Target</span>
            </div>

            <div className="p-3 bg-white rounded-lg border border-stone-200 shadow-2xs">
              <span className="text-[10px] font-mono uppercase text-stone-500 block">Accommodation</span>
              <p className="text-base font-bold font-mono text-[#b45309] mt-0.5">
                R {(summaryMetrics.totalAccom / 1000).toFixed(0)}k
              </p>
              <span className="text-[10px] text-stone-400 font-mono">Manor Lodging</span>
            </div>

            <div className="p-3 bg-white rounded-lg border border-stone-200 shadow-2xs">
              <span className="text-[10px] font-mono uppercase text-stone-500 block">Avg / Delegate</span>
              <p className="text-base font-bold font-mono text-stone-800 mt-0.5">
                R {summaryMetrics.avgPerPax.toLocaleString()}
              </p>
              <span className="text-[10px] text-stone-400 font-mono">{summaryMetrics.totalDelegates} Total Pax</span>
            </div>

            <div className="p-3 bg-white rounded-lg border border-stone-200 shadow-2xs">
              <span className="text-[10px] font-mono uppercase text-stone-500 block">Avg / Conference</span>
              <p className="text-base font-bold font-mono text-stone-800 mt-0.5">
                R {(summaryMetrics.avgPerEvent / 1000).toFixed(0)}k
              </p>
              <span className="text-[10px] text-stone-400 font-mono">Per Event Value</span>
            </div>

            <div className="p-3 bg-white rounded-lg border border-stone-200 shadow-2xs">
              <span className="text-[10px] font-mono uppercase text-stone-500 block">Peak Month</span>
              <p className="text-base font-bold font-mono text-[#1a472a] mt-0.5 truncate">
                {summaryMetrics.topMonth}
              </p>
              <span className="text-[10px] text-stone-400 font-mono">Highest Volume</span>
            </div>
          </div>

          {/* Interactive Filters Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-3 border-t border-stone-200">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-stone-500 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Revenue Metric:
              </span>
              <button
                onClick={() => setRevenueMetric('all')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  revenueMetric === 'all'
                    ? 'bg-[#1a472a] text-white shadow-2xs'
                    : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                }`}
              >
                Combined (Catering + Rooms + VAT)
              </button>
              <button
                onClick={() => setRevenueMetric('catering')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  revenueMetric === 'catering'
                    ? 'bg-[#1a472a] text-white shadow-2xs'
                    : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                }`}
              >
                Catering Only
              </button>
              <button
                onClick={() => setRevenueMetric('accommodation')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  revenueMetric === 'accommodation'
                    ? 'bg-[#b45309] text-white shadow-2xs'
                    : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                }`}
              >
                Accommodation Only
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-2.5 py-1 bg-white border border-stone-200 rounded-md font-medium text-stone-700"
              >
                <option value="all">All Calendar Years</option>
                <option value="2026">2026 Season</option>
                <option value="2027">2027 Season</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-2.5 py-1 bg-white border border-stone-200 rounded-md font-medium text-stone-700"
              >
                <option value="all">All Booking Statuses</option>
                <option value="confirmed">Confirmed & Reviews</option>
                <option value="pipeline">Proposals & Inquiries</option>
              </select>
            </div>
          </div>
        </div>

        {/* Scrollable Visualizations Canvas */}
        <div className="p-6 overflow-y-auto space-y-6 bg-stone-50/50 flex-1" id="printable-insights">
          {/* Section 1: Monthly Distribution Stacked D3 Chart */}
          <div className="p-5 bg-white rounded-xl border border-stone-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#1a472a]" />
                  <h3 className="font-estate font-bold text-sm text-[#1a472a]">
                    Monthly Conference Revenue Trajectory (ZAR)
                  </h3>
                </div>
                <p className="text-xs text-stone-500">
                  D3.js visualization mapping month-by-month conference revenue and delegate attendance
                </p>
              </div>

              {/* Chart Legend */}
              <div className="flex items-center gap-4 text-xs font-medium">
                {revenueMetric === 'all' && (
                  <>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-xs bg-[#1a472a]" />
                      <span className="text-stone-700 text-[11px]">Catering Revenue</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-xs bg-[#d4af37]" />
                      <span className="text-stone-700 text-[11px]">Accommodation Revenue</span>
                    </div>
                  </>
                )}
                {revenueMetric === 'catering' && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-[#1a472a]" />
                    <span className="text-stone-700 text-[11px]">Catering Revenue Only</span>
                  </div>
                )}
                {revenueMetric === 'accommodation' && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-[#d4af37]" />
                    <span className="text-stone-700 text-[11px]">Accommodation Revenue Only</span>
                  </div>
                )}
              </div>
            </div>

            {/* SVG Canvas Container */}
            <div className="w-full overflow-x-auto bg-stone-50/40 p-2 rounded-lg border border-stone-100 flex justify-center">
              <svg
                ref={monthlyChartRef}
                viewBox="0 0 760 300"
                className="w-full max-w-[760px] h-[300px]"
              />
            </div>
          </div>

          {/* Section 2: Two-Column Breakdown (Package Donut & Seating Bar) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Event / Package Type Donut */}
            <div className="p-5 bg-white rounded-xl border border-stone-200 shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PieChartIcon className="w-4 h-4 text-[#d4af37]" />
                    <h3 className="font-estate font-bold text-sm text-[#1a472a]">
                      Revenue by Package & Event Type
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-stone-500 uppercase">
                    Portfolio Share
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  Proportionate share generated by Full-Day, Half-Day, and Executive packages
                </p>
              </div>

              {/* D3 Donut Chart SVG */}
              <div className="flex justify-center items-center py-2">
                <svg
                  ref={donutChartRef}
                  viewBox="0 0 360 280"
                  className="w-[340px] h-[260px]"
                />
              </div>

              {/* Package Details Legend Table */}
              <div className="space-y-1.5 border-t border-stone-100 pt-3">
                {packageData.map((pkg) => (
                  <div
                    key={pkg.packageType}
                    className="flex items-center justify-between text-xs py-1 px-2 rounded hover:bg-stone-50"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: pkg.color }}
                      />
                      <span className="font-medium text-stone-800">{pkg.packageType}</span>
                    </div>

                    <div className="flex items-center gap-3 font-mono">
                      <span className="text-stone-500 text-[11px]">{pkg.count} events</span>
                      <span className="font-bold text-stone-900">R {(pkg.revenue / 1000).toFixed(0)}k</span>
                      <span className="text-[#1a472a] font-semibold w-12 text-right">
                        {pkg.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Seating Format & Venue Performance */}
            <div className="p-5 bg-white rounded-xl border border-stone-200 shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-[#2c3e50]" />
                    <h3 className="font-estate font-bold text-sm text-[#1a472a]">
                      Seating Format Revenue Output
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-stone-500 uppercase">
                    Format Efficiency
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  Total revenue achieved per conference seating configuration
                </p>
              </div>

              {/* D3 Horizontal Bar Chart SVG */}
              <div className="flex justify-center items-center py-2">
                <svg
                  ref={seatingChartRef}
                  viewBox="0 0 420 280"
                  className="w-full max-w-[420px] h-[260px]"
                />
              </div>

              {/* Seating Table Summary */}
              <div className="space-y-1.5 border-t border-stone-100 pt-3">
                {seatingData.slice(0, 3).map((st) => (
                  <div
                    key={st.format}
                    className="flex items-center justify-between text-xs py-1 px-2 rounded hover:bg-stone-50"
                  >
                    <span className="font-medium text-stone-800">{st.format}</span>
                    <div className="flex items-center gap-3 font-mono">
                      <span className="text-stone-500 text-[11px]">{st.count} bookings</span>
                      <span className="text-emerald-700 text-[11px]">R{st.avgRevenuePerPax}/pax</span>
                      <span className="font-bold text-stone-900">R {(st.revenue / 1000).toFixed(0)}k</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Monthly Breakdown Tabular Audit */}
          <div className="p-5 bg-white rounded-xl border border-stone-200 shadow-xs space-y-3">
            <h3 className="font-estate font-bold text-sm text-[#1a472a]">
              Monthly Financial Ledger & Delegate Count
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50 text-stone-500 font-mono text-[10px] uppercase">
                    <th className="py-2 px-3">Calendar Month</th>
                    <th className="py-2 px-3 text-right">Events</th>
                    <th className="py-2 px-3 text-right">Delegates</th>
                    <th className="py-2 px-3 text-right">Catering Rev</th>
                    <th className="py-2 px-3 text-right">Lodging Rev</th>
                    <th className="py-2 px-3 text-right">Total (Incl. VAT)</th>
                    <th className="py-2 px-3 text-right">Avg / Event</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-mono text-stone-800">
                  {monthlyData.map((m) => (
                    <tr key={m.monthKey} className="hover:bg-stone-50/70">
                      <td className="py-2 px-3 font-semibold text-stone-900">{m.monthLabel}</td>
                      <td className="py-2 px-3 text-right">{m.eventCount}</td>
                      <td className="py-2 px-3 text-right">{m.delegateCount}</td>
                      <td className="py-2 px-3 text-right">R {m.cateringRevenue.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right">R {m.accommodationRevenue.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right font-bold text-[#1a472a]">
                        R {Math.round(m.totalRevenue).toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-right text-stone-500">
                        R {Math.round(m.totalRevenue / m.eventCount).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-stone-100/70 font-bold text-stone-900 border-t-2 border-stone-300">
                    <td className="py-2 px-3">TOTAL PORTFOLIO</td>
                    <td className="py-2 px-3 text-right">{summaryMetrics.eventCount}</td>
                    <td className="py-2 px-3 text-right">{summaryMetrics.totalDelegates}</td>
                    <td className="py-2 px-3 text-right">R {summaryMetrics.totalCatering.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right">R {summaryMetrics.totalAccom.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right text-[#1a472a]">
                      R {Math.round(summaryMetrics.totalGrand).toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right">
                      R {summaryMetrics.avgPerEvent.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Floating Tooltip Component */}
        {tooltip.visible && (
          <div
            className="fixed pointer-events-none z-60 bg-stone-900/95 backdrop-blur-xs text-white p-3 rounded-lg shadow-xl border border-stone-700 text-xs transform -translate-x-1/2 -translate-y-full transition-opacity duration-150"
            style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}
          >
            <div className="font-bold text-[#d4af37] border-b border-stone-700 pb-1 mb-1 font-mono text-[11px]">
              {tooltip.title}
            </div>
            <div className="space-y-0.5">
              {tooltip.details.map((item, idx) => (
                <div key={idx} className="flex justify-between gap-4 font-mono text-[10px]">
                  <span className="text-stone-300">{item.label}:</span>
                  <span className="font-bold text-white" style={item.color ? { color: item.color } : {}}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="no-print px-6 py-3.5 bg-stone-100 border-t border-stone-200 flex items-center justify-between">
          <p className="text-xs text-stone-500 font-mono">
            Direct analytics assistance: <span className="font-bold">functions.rawdons@gmail.com</span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-1.5 text-xs font-semibold text-stone-700 bg-white border border-stone-300 rounded-md hover:bg-stone-50 flex items-center gap-1.5 font-mono"
            >
              <Download className="w-3.5 h-3.5 text-stone-500" />
              Download CSV
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-[#1a472a] rounded-md hover:bg-[#143720] flex items-center gap-1.5 shadow-xs font-mono font-bold"
            >
              <Printer className="w-4 h-4 text-[#d4af37]" />
              Print Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
