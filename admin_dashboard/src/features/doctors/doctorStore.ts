import { create } from 'zustand';
import axiosClient from '../../api/axiosClient';
import type { Doctor } from '../../types';

interface DoctorState {
    doctors: Doctor[];
    loading: boolean;
    error: string | null;
    fetchDoctors: () => Promise<void>;
    addDoctor: (doctor: Partial<Doctor>) => Promise<void>;
    updateDoctor: (id: string, doctor: Partial<Doctor>) => Promise<void>;
    deleteDoctor: (id: string) => Promise<void>;
    updateDefaultSlots: (id: string, slots: string[]) => Promise<void>;
    updateDateSchedule: (id: string, date: string, slots: string[]) => Promise<void>;
    deleteDateSchedule: (id: string, date: string) => Promise<void>;
}

export const useDoctorStore = create<DoctorState>((set) => ({
    doctors: [],
    loading: false,
    error: null,
    fetchDoctors: async () => {
        set({ loading: true, error: null });
        try {
            const response = await axiosClient.get('/doctors');
            set({ doctors: response.data.data, loading: false });
        } catch (error: any) {
            set({ error: error.message, loading: false });
        }
    },
    addDoctor: async (doctorData) => {
        set({ loading: true, error: null });
        try {
            console.log("doctor data", doctorData)

            const response = await axiosClient.post('/doctors/create', doctorData);
            set((state) => ({
                doctors: [response.data.data, ...state.doctors],
                loading: false
            }));
        } catch (error: any) {
            set({ error: error.response?.data?.error || error.message, loading: false });
            throw error;
        }
    },
    updateDoctor: async (id, doctorData) => {
        set({ loading: true, error: null });
        try {
            const response = await axiosClient.put(`/doctors/${id}`, doctorData);
            set((state) => ({
                doctors: state.doctors.map(d => d.id === response.data.data.id ? response.data.data : d),
                loading: false
            }));
        } catch (error: any) {
            set({ error: error.response?.data?.error || error.message, loading: false });
            throw error;
        }
    },
    deleteDoctor: async (id) => {
        set({ loading: true, error: null });
        try {
            await axiosClient.delete(`/doctors/${id}`);
            set((state) => ({
                doctors: state.doctors.filter(d => d.id !== id),
                loading: false
            }));
        } catch (error: any) {
            set({ error: error.response?.data?.error || error.message, loading: false });
            throw error;
        }
    },
    updateDefaultSlots: async (id, slots) => {
        set({ loading: true, error: null });
        try {
            await axiosClient.put(`/doctors/${id}/schedule/default`, { defaultTimeSlots: slots });
            // Update the doctor in local state
            set((state) => ({
                doctors: state.doctors.map(d => d.id === id ? { ...d, defaultTimeSlots: slots } : d),
                loading: false
            }));
        } catch (error: any) {
            set({ error: error.response?.data?.error || error.message, loading: false });
            throw error;
        }
    },
    updateDateSchedule: async (id, date, slots) => {
        set({ loading: true, error: null });
        try {
            await axiosClient.post(`/doctors/${id}/schedule/date`, { date, timeSlots: slots });
            set({ loading: false });
        } catch (error: any) {
            set({ error: error.response?.data?.error || error.message, loading: false });
            throw error;
        }
    },
    deleteDateSchedule: async (id, date) => {
        set({ loading: true, error: null });
        try {
            await axiosClient.delete(`/doctors/${id}/schedule/date`, { data: { date } });
            set({ loading: false });
        } catch (error: any) {
            set({ error: error.response?.data?.error || error.message, loading: false });
            throw error;
        }
    }
}));
