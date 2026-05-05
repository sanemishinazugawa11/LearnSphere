import { create } from 'zustand';
import { User } from '../types';

interface AppState {
  darkMode: boolean;
  toggleDarkMode: () => void;
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useStore = create<AppState>((set) => ({
  darkMode: true, 
  toggleDarkMode: () => set((state) => {
    const isDark = !state.darkMode;
    document.documentElement.classList.toggle('dark', isDark);
    return { darkMode: isDark };
  }),

  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  
  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, token });
  },

  logout: () => {
    localStorage.clear();
    set({ user: null, token: null });
  }
}));