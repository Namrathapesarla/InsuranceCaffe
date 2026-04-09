import { TrendingUp, TrendingDown, IndianRupee, DollarSign } from 'lucide-react';
import { useSchema } from '../context/SchemaContext';

export default function StatCard({ icon: Icon, label, value, change, color = '#3b82f6', prefix = '', suffix = '', locale = 'en-IN' }) {
  const { currentOption } = useSchema();
  const isUS = currentOption?.key === 'us';
  const ResolvedIcon = isUS && Icon === IndianRupee ? DollarSign : Icon;
  const isPositive = change >= 0;
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: `${color}15` }}>
        <ResolvedIcon size={20} color={color} />
      </div>
      <div>
        <div className="stat-value">{prefix}{typeof value === 'number' && value >= 10000 ? value.toLocaleString(locale) : value}{suffix}</div>
        <div className="stat-label">{label}</div>
        {change !== undefined && (
          <div className="stat-change" style={{ color: isPositive ? '#22c55e' : '#ef4444', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {isPositive ? '+' : ''}{change}% vs last month
          </div>
        )}
      </div>
    </div>
  );
}
