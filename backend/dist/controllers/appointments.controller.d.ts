import type { Request, Response } from 'express';
/** GET /available-slots?date=YYYY-MM-DD&doctorId=optional — Any logged-in user */
export declare const getAvailableSlots: (req: Request, res: Response) => Promise<void>;
/** GET /doctor/my-slots?date=YYYY-MM-DD — Doctor only (middleware enforced) */
export declare const getMySlots: (req: Request, res: Response) => Promise<void>;
/** POST /book — User books an appointment */
export declare const bookAppointment: (req: Request, res: Response) => Promise<void>;
/** PATCH /cancel/:id — User cancels their own appointment */
export declare const cancelAppointment: (req: Request, res: Response) => Promise<void>;
/** GET /my — User sees their own appointments */
export declare const getMyAppointments: (req: Request, res: Response) => Promise<void>;
/** GET /doctor/appointments — Doctor sees their appointments (middleware enforced) */
export declare const getDoctorAppointments: (req: Request, res: Response) => Promise<void>;
/** PATCH /doctor/:id/status — Doctor updates status (middleware enforced) */
export declare const doctorUpdateStatus: (req: Request, res: Response) => Promise<void>;
/** GET /admin/appointments — Admin sees all appointments (middleware enforced) */
export declare const adminGetAllAppointments: (req: Request, res: Response) => Promise<void>;
/** PATCH /admin/:id/status — Admin updates any appointment status (middleware enforced) */
export declare const adminUpdateStatus: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=appointments.controller.d.ts.map