import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminLayout from './components/layout/AdminLayout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import VillageBrowser from './pages/VillageBrowser';
import ApiLogs from './pages/ApiLogs';
import Login from './pages/Login';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="villages" element={<VillageBrowser />} />
            <Route path="logs" element={<ApiLogs />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
