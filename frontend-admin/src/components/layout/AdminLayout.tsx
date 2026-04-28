import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, MapPin, Activity, Menu, Bell, LogOut } from 'lucide-react';
import { useAuthStore, useUiStore } from '../../store';

export default function AdminLayout() {
  const { isAuthenticated, logout } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar } = useUiStore();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/users', label: 'Users', icon: <Users size={20} /> },
    { path: '/villages', label: 'Village Browser', icon: <MapPin size={20} /> },
    { path: '/logs', label: 'API Logs', icon: <Activity size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className={`bg-slate-900 text-white transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
        <div className="h-16 flex items-center justify-center border-b border-slate-800">
          {!sidebarCollapsed
            ? <span className="font-bold text-xl">VillageAPI Admin</span>
            : <span className="font-bold">VA</span>}
        </div>
        <nav className="p-4 space-y-2">
          {navItems.map(item => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center w-full p-3 rounded-lg transition-colors ${
                location.pathname === item.path ? 'bg-blue-600' : 'hover:bg-slate-800'
              }`}
            >
              {item.icon}
              {!sidebarCollapsed && <span className="ml-3">{item.label}</span>}
            </button>
          ))}
        </nav>
      </aside>
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center justify-between px-6">
          <button onClick={toggleSidebar} className="p-2 rounded hover:bg-gray-100">
            <Menu size={20} />
          </button>
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded hover:bg-gray-100 text-gray-600"><Bell size={20}/></button>
            <button onClick={logout} className="p-2 rounded hover:bg-gray-100 text-gray-600 flex items-center">
              <LogOut size={20} className="mr-2"/> Logout
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
