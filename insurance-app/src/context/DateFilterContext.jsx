import { createContext, useContext, useState } from 'react';

const DateFilterContext = createContext(null);

// Preset quick-select ranges
const PRESETS = [
  { label: 'All Time', key: 'all' },
  { label: 'This Month', key: 'this_month' },
  { label: 'Last 3 Months', key: 'last_3m' },
  { label: 'Last 6 Months', key: 'last_6m' },
  { label: 'This Year', key: 'this_year' },
  { label: 'Last Year', key: 'last_year' },
  { label: 'Custom', key: 'custom' },
];

function getPresetDates(key) {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  switch (key) {
    case 'this_month':
      return { from: fmt(new Date(y, m, 1)), to: fmt(now) };
    case 'last_3m':
      return { from: fmt(new Date(y, m - 3, 1)), to: fmt(now) };
    case 'last_6m':
      return { from: fmt(new Date(y, m - 6, 1)), to: fmt(now) };
    case 'this_year':
      return { from: `${y}-01-01`, to: fmt(now) };
    case 'last_year':
      return { from: `${y - 1}-01-01`, to: `${y - 1}-12-31` };
    case 'all':
    default:
      return { from: '', to: '' };
  }
}

function fmt(d) {
  return d.toISOString().slice(0, 10);
}

export function DateFilterProvider({ children }) {
  const [preset, setPreset] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const applyPreset = (key) => {
    setPreset(key);
    if (key !== 'custom') {
      const d = getPresetDates(key);
      setFrom(d.from);
      setTo(d.to);
    }
  };

  const setCustomRange = (newFrom, newTo) => {
    setPreset('custom');
    setFrom(newFrom);
    setTo(newTo);
  };

  const clearFilter = () => {
    setPreset('all');
    setFrom('');
    setTo('');
  };

  const isActive = preset !== 'all';

  return (
    <DateFilterContext.Provider value={{ preset, from, to, isActive, applyPreset, setCustomRange, setFrom, setTo, clearFilter, PRESETS }}>
      {children}
    </DateFilterContext.Provider>
  );
}

export function useDateFilter() {
  const ctx = useContext(DateFilterContext);
  if (!ctx) throw new Error('useDateFilter must be used within DateFilterProvider');
  return ctx;
}

/**
 * Filter an array by a date field within the active date range.
 * Usage: filterByDate(policies, 'effectiveDate', from, to)
 */
export function filterByDate(data, dateField, from, to) {
  if (!from && !to) return data;
  return data.filter((row) => {
    const val = row[dateField];
    if (!val || val === '-') return true; // keep rows without dates
    if (from && val < from) return false;
    if (to && val > to) return false;
    return true;
  });
}

/**
 * Filter monthlyPremium chart data (has 'month' like 'Jan', 'Feb') by month index range.
 */
export function filterMonthlyData(data, from, to) {
  if (!from && !to) return data;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fromMonth = from ? new Date(from).getMonth() : 0;
  const toMonth = to ? new Date(to).getMonth() : 11;
  return data.filter((d) => {
    const idx = months.indexOf(d.month);
    return idx >= fromMonth && idx <= toMonth;
  });
}
