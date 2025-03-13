import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  autoClose?: boolean;
  duration?: number;
}

interface UIState {
  darkMode: boolean;
  sidebarOpen: boolean;
  notifications: Notification[];
  isLoading: boolean;
  activeModule: string | null;
}

const initialState: UIState = {
  darkMode: false,
  sidebarOpen: true,
  notifications: [],
  isLoading: false,
  activeModule: null,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id'>>) => {
      const id = Date.now().toString();
      state.notifications.push({
        ...action.payload,
        id,
      });
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setActiveModule: (state, action: PayloadAction<string | null>) => {
      state.activeModule = action.payload;
    },
  },
});

export const {
  toggleDarkMode,
  toggleSidebar,
  addNotification,
  removeNotification,
  clearNotifications,
  setLoading,
  setActiveModule,
} = uiSlice.actions;

export default uiSlice.reducer; 