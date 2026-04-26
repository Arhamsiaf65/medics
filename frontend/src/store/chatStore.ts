import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import api from '../api/axios';

export interface ChatMessage {
  senderId: string;
  message: string;
  createdAt: string;
}

interface ChatState {
  socket: Socket | null;
  messages: ChatMessage[];
  isConnected: boolean;
  activeRoomId: string | null;
  isDrawerOpen: boolean;
  activePatientId: string | null;
  activeDoctorId: string | null;

  connect: (userId: string) => void;
  disconnect: () => void;
  joinChat: (doctorId: string, patientId: string) => void;
  sendMessage: (doctorId: string, patientId: string, senderId: string, message: string) => void;
  openDrawer: (doctorId: string, patientId: string) => Promise<void>;
  closeDrawer: () => void;
}

const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';

export const useChatStore = create<ChatState>((set, get) => ({
  socket: null,
  messages: [],
  isConnected: false,
  activeRoomId: null,
  isDrawerOpen: false,
  activePatientId: null,
  activeDoctorId: null,

  connect: (userId: string) => {
    if (get().socket?.connected) return;

    const socket = io(SOCKET_URL, {
      auth: { userId },
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      set({ isConnected: true });
    });

    socket.on('disconnect', () => {
      set({ isConnected: false });
    });

    socket.on('chat:message', (data: ChatMessage) => {
      set((state) => ({ messages: [...state.messages, data] }));
    });

    set({ socket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false, messages: [], activeRoomId: null });
    }
  },

  joinChat: (doctorId: string, patientId: string) => {
    const { socket } = get();
    if (!socket) return;
    socket.emit('join:chat', { doctorId, patientId });
  },

  sendMessage: (doctorId, patientId, senderId, message) => {
    const { socket } = get();
    if (!socket) return;
    socket.emit('chat:message', { doctorId, patientId, senderId, message });
  },

  openDrawer: async (doctorId: string, patientId: string) => {
    set({ isDrawerOpen: true, activeDoctorId: doctorId, activePatientId: patientId, messages: [] });
    // Join chat when opening drawer
    get().joinChat(doctorId, patientId);
    
    try {
      const response = await api.get(`/chat/${doctorId}/${patientId}`);
      set({ messages: response.data });
    } catch (error) {
      console.error("Failed to load chat history:", error);
    }
  },

  closeDrawer: () => {
    set({ isDrawerOpen: false, activeDoctorId: null, activePatientId: null, messages: [] });
  }
}));
