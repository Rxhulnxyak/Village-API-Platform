/**
 * Zustand Global Store — Three Slices
 * WHY ZUSTAND over Redux: 1.5KB vs 15KB. Less boilerplate.
 * WHY NOT React Context: Context re-renders ALL consumers when any value changes.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  adminEmail: string | null;
  isAuthenticated: boolean;
  login: (token: string, email: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      adminEmail: null,
      isAuthenticated: false,
      login: (token, email) => set({ token, adminEmail: email, isAuthenticated: true }),
      logout: () => set({ token: null, adminEmail: null, isAuthenticated: false }),
    }),
    { name: 'admin-auth-storage' }
  )
);

interface UiState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));

interface NotificationState {
  toasts: Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  toasts: [],
  addToast: (message, type) => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
