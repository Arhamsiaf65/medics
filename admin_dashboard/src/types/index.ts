export interface Doctor {
    id: string;
    name: string;
    specialty: string;
    hospital: string;
    experience?: string;
    imageUrl: string;
    consultationFee?: number;
    about?: string;
    isTopDoctor?: boolean;
    email?: string;
    password?: string;
    defaultTimeSlots?: string[];
}

export type Role = 'USER' | 'ADMIN' | 'ROOT' | 'DOCTOR';

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    avatarUrl?: string;
    phone?: string;
    createdAt?: string;
}

