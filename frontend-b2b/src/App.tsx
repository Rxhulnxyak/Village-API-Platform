import React, { useState, useEffect } from 'react';
import { b2bApi } from './api';
import { Key, Layout, LogOut, Activity, Book, Shield, Copy, Trash2, Plus, Check } from 'lucide-react';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('b2b_token'));
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [keys, setKeys] = useState<any[]>([]);
  const [newKey, setNewKey] = useState<any>(null);
  const [usage, setUsage] = useState<any>({ logs: [], stats: [] });
  
  useEffect(() => {
    if (token) {
      b2bApi.getProfile().then(res => setUser(res.data)).catch(() => logout());
      b2bApi.getKeys().then(res => setKeys(res.data));
      b2bApi.getUsage().then(res => setUsage(res.data));
    }
  }, [token]);

  const logout = () => {
    localStorage.removeItem('b2b_token');
    setToken(null);
    setUser(null);
  };

  if (!token) return <Login onLogin={(t: string) => setToken(t)} />;

  return (
    <div className="layout">
      <aside className="sidebar glass">
        <div className="logo font-display">VillageAPI <span>B2B</span></div>
        <nav>
          <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
            <Layout size={20} /> Dashboard
          </button>
          <button className={activeTab === 'keys' ? 'active' : ''} onClick={() => setActiveTab('keys')}>
            <Key size={20} /> API Keys
          </button>
          <button className={activeTab === 'docs' ? 'active' : ''} onClick={() => setActiveTab('docs')}>
            <Book size={20} /> Documentation
          </button>
        </nav>
        <button className="logout" onClick={logout}><LogOut size={20} /> Logout</button>
      </aside>

      <main className="content">
        <header>
          <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
          <div className="user-badge glass">
            <Shield size={16} /> {user?.planType} Plan
          </div>
        </header>

        {activeTab === 'dashboard' && <Dashboard user={user} keys={keys} usage={usage} />}
        {activeTab === 'keys' && (
          <KeysList 
            keys={keys} 
            newKey={newKey} 
            onDelete={async (id) => {
              await b2bApi.deleteKey(id);
              setKeys(keys.filter(k => k.id !== id));
            }}
            onCreate={async (name) => {
              const res = await b2bApi.createKey(name);
              setNewKey(res.data);
              setKeys([res.data, ...keys]);
            }}
          />
        )}
        {activeTab === 'docs' && <Docs />}
      </main>
    </div>
  );
}

function Login({ onLogin }: { onLogin: (t: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isRegister) {
        await b2bApi.register({ email, password, businessName });
        setIsRegister(false);
        alert('Registered successfully! Please login.');
      } else {
        const res = await b2bApi.login({ email, password });
        localStorage.setItem('b2b_token', res.data.token);
        onLogin(res.data.token);
      }
    } catch (err) {
      alert('Authentication failed');
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="glass">
        <h2 className="font-display">{isRegister ? 'Join VillageAPI' : 'B2B Portal Login'}</h2>
        {isRegister && (
          <input type="text" placeholder="Business Name" value={businessName} onChange={e => setBusinessName(e.target.value)} required />
        )}
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button className="btn btn-primary" type="submit">{isRegister ? 'Create Account' : 'Sign In'}</button>
        <p onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
        </p>
      </form>
    </div>
  );
}

function Dashboard({ user, keys, usage }: any) {
  const totalCalls = usage.stats?.reduce((acc: number, curr: any) => acc + curr._count._all, 0) || 0;

  return (
    <div className="dashboard-content">
      <div className="dashboard-grid">
        <div className="card glass stats">
          <Activity className="icon" />
          <div>
            <h3>Plan Status</h3>
            <p className="value">{user?.planType}</p>
          </div>
        </div>
        <div className="card glass stats">
          <Key className="icon" />
          <div>
            <h3>Active Keys</h3>
            <p className="value">{keys.length}</p>
          </div>
        </div>
        <div className="card glass stats">
          <Activity className="icon" style={{ color: '#10b981' }} />
          <div>
            <h3>Total API Calls</h3>
            <p className="value">{totalCalls.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="table-card glass" style={{ marginTop: '2rem' }}>
        <h3 style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)' }}>Recent API Activity</h3>
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Endpoint</th>
              <th>Method</th>
              <th>Status</th>
              <th>Response Time</th>
            </tr>
          </thead>
          <tbody>
            {usage.logs?.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No recent API activity found.</td></tr>
            ) : (
              usage.logs?.map((log: any) => (
                <tr key={log.id}>
                  <td>{new Date(log.createdAt).toLocaleString()}</td>
                  <td><code>{log.endpoint}</code></td>
                  <td><span className="badge method">{log.method}</span></td>
                  <td>
                    <span className={`status ${log.statusCode >= 400 ? 'error' : 'active'}`}>
                      {log.statusCode}
                    </span>
                  </td>
                  <td>{log.responseTimeMs}ms</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KeysList({ keys, newKey, onCreate, onDelete }: any) {
  const [name, setName] = useState('');
  
  return (
    <div className="keys-container">
      <div className="card glass create-key">
        <h3>Create New API Key</h3>
        <div className="input-group">
          <input type="text" placeholder="Key Name (e.g. Production)" value={name} onChange={e => setName(e.target.value)} />
          <button className="btn btn-primary" onClick={() => { onCreate(name); setName(''); }}>
            <Plus size={18} /> Generate Key
          </button>
        </div>
      </div>

      {newKey && (
        <div className="card glass new-key-alert">
          <div className="alert-header">
            <Check className="icon-success" />
            <h4>Key Generated Successfully</h4>
          </div>
          <p>Copy your secret now. It will not be shown again.</p>
          <div className="key-display">
            <div className="item">
              <label>API KEY</label>
              <div className="val"><code>{newKey.key}</code></div>
            </div>
            <div className="item">
              <label>API SECRET</label>
              <div className="val"><code>{newKey.secret}</code></div>
            </div>
          </div>
        </div>
      )}

      <div className="table-card glass">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Key ID</th>
              <th>Created</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {keys.map((k: any) => (
              <tr key={k.id}>
                <td>{k.name}</td>
                <td><code>{k.key}</code></td>
                <td>{new Date(k.createdAt).toLocaleDateString()}</td>
                <td><span className="status active">Active</span></td>
                <td>
                  <button className="btn-icon delete" onClick={() => onDelete(k.id)}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Docs() {
  return (
    <div className="docs glass">
      <h2>API Reference</h2>
      <div className="endpoint">
        <span className="method">GET</span>
        <span className="path">/v1/states</span>
        <p>Returns a list of all Indian states.</p>
      </div>
      <div className="endpoint">
        <span className="method">GET</span>
        <span className="path">/v1/search?q=search_term</span>
        <p>Fuzzy search for villages by name.</p>
      </div>
      <div className="auth-header">
        <h3>Authentication</h3>
        <p>Include the following headers in every request:</p>
        <pre>
          X-API-KEY: your_api_key{'\n'}
          X-API-SECRET: your_api_secret
        </pre>
      </div>
    </div>
  );
}
