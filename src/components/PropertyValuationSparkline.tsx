import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { TrendingUp, TrendingDown, History, DollarSign } from 'lucide-react';
import { Property, ValuationHistoryPoint } from '../types';
import { formatCurrency, getPropertyValuationHistory } from '../utils/crypto';

interface PropertyValuationSparklineProps {
  property: Property;
  variant?: 'mini' | 'card' | 'hero' | 'detailed';
  showMetrics?: boolean;
  className?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: ValuationHistoryPoint;
  }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isPositive = (data.growthYoY || 0) >= 0;

    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white px-3 py-2 rounded-xl shadow-xl border border-slate-700/80 text-xs space-y-1 z-50 pointer-events-none">
        <div className="flex items-center justify-between gap-3 text-[10px] text-slate-400 font-mono">
          <span>Year {data.year}</span>
          {data.growthYoY !== undefined && data.growthYoY !== 0 && (
            <span
              className={`font-semibold ${
                isPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isPositive ? '+' : ''}
              {data.growthYoY}% YoY
            </span>
          )}
        </div>
        <div className="font-bold text-sm text-emerald-400 font-mono">
          {formatCurrency(data.valueUSD)}
        </div>
        {data.event && (
          <div className="text-[10px] text-slate-300 max-w-[180px] leading-tight pt-0.5 border-t border-slate-800">
            {data.event}
          </div>
        )}
      </div>
    );
  }
  return null;
};

export const PropertyValuationSparkline: React.FC<PropertyValuationSparklineProps> = ({
  property,
  variant = 'mini',
  showMetrics = false,
  className = '',
}) => {
  const history = getPropertyValuationHistory(property);
  if (!history || history.length === 0) return null;

  const firstVal = history[0].valueUSD;
  const lastVal = history[history.length - 1].valueUSD;
  const totalChangeUSD = lastVal - firstVal;
  const totalChangePct = firstVal > 0 ? ((totalChangeUSD / firstVal) * 100).toFixed(1) : '0';
  const isOverallPositive = totalChangeUSD >= 0;

  const minVal = Math.min(...history.map(h => h.valueUSD));
  const maxVal = Math.max(...history.map(h => h.valueUSD));
  // Provide subtle padding to the Y axis domain so sparkline doesn't clip
  const domainMin = Math.floor(minVal * 0.96);
  const domainMax = Math.ceil(maxVal * 1.04);

  // Gradient IDs unique per property
  const gradientId = `valGrad-${property.id}-${variant}`;
  const strokeColor = isOverallPositive ? '#10b981' : '#f43f5e';
  const fillStartColor = isOverallPositive ? '#10b981' : '#f43f5e';

  if (variant === 'mini') {
    return (
      <div className={`space-y-1 ${className}`}>
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-slate-400 font-medium flex items-center gap-1">
            <History className="w-3 h-3 text-slate-400" />
            <span>Valuation Trend</span>
          </span>
          <span
            className={`font-semibold font-mono flex items-center gap-0.5 ${
              isOverallPositive ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {isOverallPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>+{totalChangePct}%</span>
          </span>
        </div>

        <div className="h-10 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 2, right: 2, left: 2, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={fillStartColor} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={fillStartColor} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <YAxis domain={[domainMin, domainMax]} hide />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="valueUSD"
                stroke={strokeColor}
                strokeWidth={1.75}
                fill={`url(#${gradientId})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`p-3 bg-slate-50/80 rounded-xl border border-slate-100 space-y-2 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-700">
            <History className="w-3.5 h-3.5 text-blue-600" />
            <span>Historical Valuation Trend</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
            <TrendingUp className="w-3 h-3 text-emerald-600" />
            <span>+{totalChangePct}% Total</span>
          </div>
        </div>

        <div className="h-16 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={fillStartColor} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={fillStartColor} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <YAxis domain={[domainMin, domainMax]} hide />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="valueUSD"
                stroke={strokeColor}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                dot={{ r: 2.5, fill: strokeColor, strokeWidth: 1, stroke: '#fff' }}
                activeDot={{ r: 4, fill: '#059669', strokeWidth: 2, stroke: '#fff' }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono px-1">
          <span>{history[0].year} ({formatCurrency(firstVal)})</span>
          <span>{history[history.length - 1].year} ({formatCurrency(lastVal)})</span>
        </div>
      </div>
    );
  }

  // Hero / Detailed Variant (used in Primary Asset Hero & Title Deed Certificate Modal)
  return (
    <div className={`p-4 sm:p-5 bg-gradient-to-br from-slate-50 via-white to-slate-50/50 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
            <History className="w-4 h-4 text-indigo-600" />
            <span>Cadastral Valuation & Appreciation History</span>
          </div>
          <p className="text-[11px] text-slate-500">
            On-chain historical records across municipal tax cycles & title events
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold font-mono flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>+{totalChangePct}% Appreciation</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            (+{formatCurrency(totalChangeUSD)})
          </span>
        </div>
      </div>

      {showMetrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-white rounded-xl border border-slate-100 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Initial Recorded</span>
            <p className="font-bold font-mono text-slate-800 mt-0.5">{formatCurrency(firstVal)}</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Current Assessed</span>
            <p className="font-bold font-mono text-emerald-700 mt-0.5">{formatCurrency(lastVal)}</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Peak Valuation</span>
            <p className="font-bold font-mono text-slate-800 mt-0.5">{formatCurrency(maxVal)}</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Assessment Period</span>
            <p className="font-bold font-mono text-indigo-700 mt-0.5">
              {history[0].year} – {history[history.length - 1].year}
            </p>
          </div>
        </div>
      )}

      {/* Main Interactive Recharts Area Chart */}
      <div className="h-28 sm:h-32 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history} margin={{ top: 6, right: 10, left: 10, bottom: 4 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="year"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
              dy={6}
            />
            <YAxis domain={[domainMin, domainMax]} hide />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="valueUSD"
              stroke="#059669"
              strokeWidth={2.2}
              fill={`url(#${gradientId})`}
              dot={{ r: 3.5, fill: '#059669', strokeWidth: 1.5, stroke: '#ffffff' }}
              activeDot={{ r: 5.5, fill: '#047857', strokeWidth: 2.5, stroke: '#ffffff' }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
        <span className="flex items-center gap-1">
          <DollarSign className="w-3 h-3 text-slate-400" />
          <span>Cadastral Ledger Reference: Immutable ECDSA Block Signatures</span>
        </span>
        <span className="font-mono text-[10px] text-slate-400">
          {history.length} Certified Revaluation Events
        </span>
      </div>
    </div>
  );
};
