import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coffee, Server, Globe, Loader2, CheckCircle2, Zap } from 'lucide-react';
import { useSchema, SCHEMA_OPTIONS } from '../context/SchemaContext';
import { useAuth } from '../context/AuthContext';

export default function SchemaSelector() {
  const { selectSchema } = useSchema();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(null);
  const [done, setDone] = useState(null);

  const handleSelect = async (key) => {
    if (loading) return;
    setLoading(key);
    // Brief pulse before navigating — clean UX
    await new Promise((r) => setTimeout(r, 700));
    setDone(key);
    await new Promise((r) => setTimeout(r, 350));
    selectSchema(key);
    navigate('/', { replace: true });
  };

  return (
    <div style={{
      width: '100%',
      flex: 1,
      minHeight: '100vh',
      background: 'linear-gradient(145deg, #060c1a 0%, #0d1b34 40%, #0a1628 70%, #050d1a 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
    }}>

      {/* Ambient background orbs */}
      <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: 700, height: 700, background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)', width: 900, height: 400, background: 'radial-gradient(ellipse, rgba(15,30,60,0.6) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '3rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
          borderRadius: '1rem', width: '3.25rem', height: '3.25rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 28px rgba(59,130,246,0.45), 0 0 0 1px rgba(99,102,241,0.3)',
        }}>
          <Coffee size={22} color="white" />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '1.5rem', color: '#f8fafc', letterSpacing: '-0.03em' }}>
            InsuranceCaffe
          </div>
          <div style={{ fontSize: '0.65rem', color: '#475569', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500 }}>
            Analytics Platform
          </div>
        </div>
      </div>

      {/* Heading */}
      <div style={{ textAlign: 'center', marginBottom: '2.75rem' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
          borderRadius: '2rem', padding: '0.35rem 1rem', marginBottom: '1.25rem',
          fontSize: '0.75rem', color: '#60a5fa', fontWeight: 600, letterSpacing: '0.05em',
        }}>
          <Zap size={12} />
          SELECT DATA REGION
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#f1f5f9', margin: 0, letterSpacing: '-0.03em', lineHeight: 1.2 }}>
          Choose your data source
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.6rem' }}>
          Welcome back,{' '}
          <span style={{ color: '#93c5fd', fontWeight: 600 }}>{currentUser?.displayName || currentUser?.username}</span>
          {' '}— which region would you like to explore?
        </p>
      </div>

      {/* Region Cards */}
      <div style={{
        display: 'flex', gap: '1.5rem', flexWrap: 'wrap',
        justifyContent: 'center', maxWidth: '960px', width: '100%',
      }}>
        {SCHEMA_OPTIONS.map((opt) => (
          <SchemaCard
            key={opt.key}
            option={opt}
            isLoading={loading === opt.key}
            isDone={done === opt.key}
            isDisabled={loading !== null && loading !== opt.key}
            onSelect={() => handleSelect(opt.key)}
          />
        ))}
      </div>

      {/* Footer note */}
      <p style={{ color: '#1e3a5f', fontSize: '0.72rem', marginTop: '3rem', textAlign: 'center' }}>
        You can switch regions anytime from the top navigation bar
      </p>
    </div>
  );
}

function SchemaCard({ option, isLoading, isDone, isDisabled, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const active = isLoading || isDone;

  return (
    <div
      onClick={isDisabled || isLoading ? undefined : onSelect}
      onMouseEnter={() => !isDisabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        width: 260,
        background: active
          ? `linear-gradient(145deg, ${option.color}18 0%, ${option.color}08 100%)`
          : hovered
            ? 'rgba(255,255,255,0.046)'
            : 'rgba(255,255,255,0.025)',
        border: `1.5px solid ${active || hovered ? option.color + '60' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: '1.25rem',
        padding: '2.25rem 1.75rem 1.75rem',
        cursor: isDisabled || isLoading ? 'default' : 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
        transform: hovered && !isDisabled ? 'translateY(-6px) scale(1.015)' : 'none',
        boxShadow: active
          ? `0 12px 40px ${option.color}28, 0 0 0 1px ${option.color}30, inset 0 1px 0 rgba(255,255,255,0.05)`
          : hovered
            ? `0 8px 32px ${option.color}20, 0 0 0 1px ${option.color}20`
            : '0 2px 12px rgba(0,0,0,0.4)',
        opacity: isDisabled ? 0.35 : 1,
        textAlign: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Top accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: active || hovered
          ? `linear-gradient(90deg, transparent 0%, ${option.color}CC 50%, transparent 100%)`
          : 'transparent',
        transition: 'all 0.3s ease',
      }} />

      {/* Flag or spinner */}
      <div style={{ fontSize: '3.25rem', marginBottom: '1.1rem', lineHeight: 1, minHeight: '3.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {isDone ? (
          <CheckCircle2 size={52} color={option.color} strokeWidth={1.5} />
        ) : isLoading ? (
          <Loader2 size={48} color={option.color} strokeWidth={1.5} style={{ animation: 'spin 1s linear infinite' }} />
        ) : (
          option.flag
        )}
      </div>

      {/* Label */}
      <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#f1f5f9', marginBottom: '0.3rem', letterSpacing: '-0.02em' }}>
        {option.label}
      </div>

      {/* Description */}
      <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '1.25rem', fontWeight: 500 }}>
        {isLoading ? 'Connecting…' : isDone ? 'Connected!' : option.description}
      </div>

      {/* Schema badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
        background: `${option.color}15`,
        border: `1px solid ${option.color}35`,
        borderRadius: '2rem', padding: '0.28rem 0.8rem',
        marginBottom: '0.85rem', fontSize: '0.7rem',
        color: option.color, fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        fontWeight: 700, letterSpacing: '0.02em',
      }}>
        <Server size={10} />
        {option.schema}
      </div>

      {/* Connection details */}
      <div style={{ color: '#334155', fontSize: '0.72rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
        <Globe size={10} style={{ color: '#475569' }} />
        <span>{option.host}</span>
        <span style={{ color: '#1e3a5f' }}>·</span>
        <span style={{ color: '#334155' }}>{option.database}</span>
      </div>
    </div>
  );
}
