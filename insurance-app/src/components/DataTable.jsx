import { useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

export default function DataTable({ columns, data, pageSize = 10, searchable = true, onRowClick, selectable = true }) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [selectedIdx, setSelectedIdx] = useState(null);

  const filtered = data.filter((row) =>
    !search || columns.some((col) => {
      const val = col.accessor ? row[col.accessor] : col.render?.(row);
      return String(val ?? '').toLowerCase().includes(search.toLowerCase());
    })
  );

  const sorted = sortCol !== null
    ? [...filtered].sort((a, b) => {
        const col = columns[sortCol];
        const av = col.accessor ? a[col.accessor] : '';
        const bv = col.accessor ? b[col.accessor] : '';
        const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
        return sortDir === 'asc' ? cmp : -cmp;
      })
    : filtered;

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div className="card">
      {searchable && (
        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="search-box" style={{ width: '280px' }}>
            <Search size={14} color="#94a3b8" />
            <input placeholder="Search..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} />
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{filtered.length} records</span>
        </div>
      )}
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th
                  key={i}
                  style={{ cursor: col.accessor ? 'pointer' : 'default', whiteSpace: 'nowrap' }}
                  onClick={() => {
                    if (!col.accessor) return;
                    if (sortCol === i) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                    else { setSortCol(i); setSortDir('asc'); }
                  }}
                >
                  {col.header} {sortCol === i ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr><td colSpan={columns.length} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No records found</td></tr>
            ) : (
              paged.map((row, ri) => {
                const globalIdx = page * pageSize + ri;
                const isSelected = selectable && selectedIdx === globalIdx;
                return (
                  <tr
                    key={ri}
                    onClick={() => {
                      if (selectable) setSelectedIdx(isSelected ? null : globalIdx);
                      onRowClick?.(row);
                    }}
                    style={{
                      cursor: selectable || onRowClick ? 'pointer' : 'default',
                      background: isSelected ? '#eff6ff' : undefined,
                      boxShadow: isSelected ? 'inset 3px 0 0 #3b82f6' : undefined,
                    }}
                  >
                    {columns.map((col, ci) => (
                      <td key={ci}>{col.render ? col.render(row) : row[col.accessor]}</td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            Page {page + 1} of {totalPages}
          </span>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <button className="btn btn-secondary" style={{ padding: '0.3rem 0.5rem' }} disabled={page === 0} onClick={() => setPage(page - 1)}><ChevronLeft size={14} /></button>
            <button className="btn btn-secondary" style={{ padding: '0.3rem 0.5rem' }} disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}><ChevronRight size={14} /></button>
          </div>
        </div>
      )}
    </div>
  );
}
