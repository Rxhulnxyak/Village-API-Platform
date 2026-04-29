import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Search, MapPin, Building2, Fingerprint, Moon, Sun, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const DEMO_KEY = 'ak_demo0000000000000000000000000000';
const DEMO_SECRET = 'demo_secret';
const headers = { 'X-API-KEY': DEMO_KEY, 'X-API-SECRET': DEMO_SECRET };

interface Village {
  id: string;
  name: string;
  subDistrict?: string;
  district?: string;
  state?: string;
  mddsPlcn?: string;
}

export default function App() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Village[]>([]);
  const [results, setResults] = useState<Village[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDrop, setShowDrop] = useState(false);

  const [isDark, setIsDark] = useState(false);
  const debounceRef = useRef<any>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 3) { 
      setSuggestions([]); 
      setShowDrop(false); 
      return; 
    }
    
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await axios.get(`${API_URL}/v1/search?q=${encodeURIComponent(query)}&limit=6`, { headers });
        const data = Array.isArray(res.data) ? res.data : res.data.results || [];
        setSuggestions(data);
        setShowDrop(true);
      } catch {
        setSuggestions([]);
      }
    }, 400);
    
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const search = async (term: string) => {
    setQuery(term);
    setShowDrop(false);
    setLoading(true);

    try {
      const res = await axios.get(`${API_URL}/v1/search?q=${encodeURIComponent(term)}&limit=20`, { headers });
      setResults(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`app ${isDark ? 'dark' : ''}`}>
      <button className="theme-toggle" onClick={() => setIsDark(!isDark)}>
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <section className="hero">
        <div className="hero-bg-glow" />
        <div className="badge">🇮🇳 600,000+ Villages • MDDS Certified</div>
        <h1 className="hero-title">
          India's Villages,<br />
          <span className="gradient-text">Instantly Searchable.</span>
        </h1>
        <p className="hero-sub">
          The most accurate village-level geography API for logistics, fintech & rural-tech applications.
        </p>

        <div className="search-wrap">
          <div className="search-box">
            <Search className="search-ico" size={20} />
            <input
              className="search-input"
              type="text"
              placeholder="Search any village — Rampur, Kothari, Manibeli…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && query && search(query)}
              onFocus={() => query.length >= 3 && setShowDrop(true)}
              onBlur={() => setTimeout(() => setShowDrop(false), 200)}
              autoComplete="off"
            />
            <button className="search-btn" onClick={() => query && search(query)}>Search</button>
          </div>

          {showDrop && suggestions.length > 0 && (
            <div className="dropdown">
              {suggestions.map(s => (
                <div key={s.id} className="suggestion-item" onMouseDown={() => search(s.name)}>
                  <div className="sug-icon"><MapPin size={16} /></div>
                  <div>
                    <div className="sug-name">{s.name}</div>
                    <div className="sug-meta">{[s.subDistrict, s.district, s.state].filter(Boolean).join(', ')}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="stats-strip">
          {[ ['600K+', 'Villages'], ['30', 'States'], ['<100ms', 'Latency'], ['99.9%', 'Uptime'] ].map(([val, label]) => (
            <div key={label} className="stat">
              <span className="stat-val">{val}</span>
              <span className="stat-lbl">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="results-section">
        {loading && (
          <div className="spinner-wrap">
            <Loader2 className="spinner" size={40} />
            <p>Querying MDDS Database…</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div>
            <div className="results-header">
              <p className="results-count">Showing <strong>{results.length}</strong> villages for "<strong>{query}</strong>"</p>
            </div>
            <div className="results-grid">
              {results.map(v => (
                <div key={v.id} className="village-card">
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div className="vc-icon"><Building2 size={24} /></div>
                    <div className="vc-content">
                      <div className="vc-name">{v.name}</div>
                      <div className="vc-path">{v.state} › {v.district} › {v.subDistrict}</div>
                    </div>
                  </div>
                  {v.mddsPlcn && <div className="vc-code"><Fingerprint size={12} style={{marginRight:6}}/>{v.mddsPlcn}</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <footer className="footer">
        <div className="footer-content">
          <span className="footer-logo">Village<span className="gradient-text">API</span></span>
          <p>© 2026 VillageAPI Platform.</p>
        </div>
      </footer>
    </div>
  );
}
