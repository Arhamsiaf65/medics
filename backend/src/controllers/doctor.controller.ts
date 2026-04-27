import type { Request, Response } from 'express';
import { Doctor } from '../models/doctor.model.js';


export const getDoctorProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      res.status(404).json({ message: 'Doctor profile not found' });
      return;
    }
    res.status(200).json(doctor);
  } catch (error) {
    console.error('Error fetching doctor profile:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const updateDoctorProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { specialization, experience, fee, slotDuration, workingHours, timezone } = req.body;

    let doctor = await Doctor.findOne({ user: req.user._id });

    if (!doctor) {
      // Create new doctor profile if it doesn't exist
      doctor = new Doctor({
        user: req.user._id,
        specialization,
        experience,
        fee,
        slotDuration: slotDuration || 30,
        workingHours,
        timezone: timezone || "Asia/Karachi"
      });
    } else {
      // Update existing
      if (specialization) doctor.specialization = specialization;
      if (experience !== undefined) doctor.experience = experience;
      if (fee !== undefined) doctor.fee = fee;
      if (slotDuration) doctor.slotDuration = slotDuration;
      if (workingHours) doctor.workingHours = workingHours;
      if (timezone) doctor.timezone = timezone;
    }

    await doctor.save();
    res.status(200).json({ message: 'Doctor profile updated successfully', doctor });
  } catch (error) {
    console.error('Error updating doctor profile:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
