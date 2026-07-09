import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProducts } from '../../utils/api';
import { fmt } from '../../data/data';
import { CATEGORIES } from '../../data/data';
import Icons from '../shared/Icons';

const RESULT_LIMIT = 6;

export default function SearchBar({ onNavigate, autoFocus }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    function onClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); setLoading(false); return; }
    setLoading(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchProducts({ search: query.trim(), limit: RESULT_LIMIT })
        .then(data => { setResults(data); setActiveIdx(-1); })
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 200);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const goToResults = useCallback((q) => {
    setOpen(false);
    onNavigate && onNavigate();
    navigate(`/shop?search=${encodeURIComponent(q)}`);
  }, [navigate, onNavigate]);

  const goToProduct = useCallback((p) => {
    setOpen(false);
    onNavigate && onNavigate();
    navigate(`/product/${p.id || p._id}`);
  }, [navigate, onNavigate]);

  const onKeyDown = (e) => {
    if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, -1)); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIdx >= 0 && results[activeIdx]) goToProduct(results[activeIdx]);
      else if (query.trim()) goToResults(query.trim());
    }
  };

  const showPanel = open && query.trim().length > 0;

  return (
    <div className="search-root" ref={rootRef}>
      <div className="search-box">
        <Icons.search className="search-ico" />
        <input
          ref={inputRef}
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search products…"
          aria-label="Search products"
        />
        {query && (
          <button className="search-clear" aria-label="Clear search" onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus(); }}>
            <Icons.close style={{ width: 12, height: 12 }} />
          </button>
        )}
      </div>

      {showPanel && (
        <div className="search-panel">
          {loading ? (
            <div className="search-empty mono">Searching…</div>
          ) : results.length ? (
            <>
              {results.map((p, i) => (
                <button
                  key={p.id || p._id}
                  className={`search-item ${i === activeIdx ? 'active' : ''}`}
                  onMouseEnter={() => setActiveIdx(i)}
                  onClick={() => goToProduct(p)}
                >
                  <span className="search-item-thumb">
                    {p.thumbnail ? <img src={p.thumbnail} alt="" /> : <Icons.grid style={{ width: 16, height: 16, opacity: .4 }} />}
                  </span>
                  <span className="search-item-info">
                    <span className="search-item-name">{p.name}</span>
                    <span className="search-item-meta mono">{CATEGORIES.find(c => c.id === p.cat)?.short || p.cat} · {fmt(p.price)}</span>
                  </span>
                </button>
              ))}
              <button className="search-viewall mono" onClick={() => goToResults(query.trim())}>
                View all results for “{query.trim()}” <Icons.arrow style={{ width: 12, height: 12 }} />
              </button>
            </>
          ) : (
            <div className="search-empty mono">No products found for “{query.trim()}”</div>
          )}
        </div>
      )}
    </div>
  );
}
