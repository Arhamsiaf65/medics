import { Doctor } from "../../models/doctor.model.js";
import bcrypt from 'bcryptjs';
import User from "../../models/user.model.js";
import { log } from 'console';
export const addDoctor = async (req, res) => {
    try {
        const { name, email, password, specialization, experience, fee, slotDuration, workingHours, timezone } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) {
            res.status(400).json({ message: 'User with this email already exists' });
            return;
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
        });
        // Link the Doctor profile
        const doctor = await Doctor.create({
            user: newUser._id,
            specialization,
            experience,
            fee,
            slotDuration,
            workingHours,
            timezone
        });
        res.status(201).json(doctor);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
export const getAllDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find();
        res.json(doctors);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
export const updateDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id);
        const updatedDate = {};
        const allowedFields = [
            'specialization',
            'experience',
            'fee',
            'slotDuration',
            'workingHours',
            'timezone'
        ];
        allowedFields.forEach((field) => {
            console.log(field, req.body[field]);
            if (req.body[field] != undefined) {
                updatedDate[field] = req.body[field];
            }
        });
        console.log("req.body", req.body);
        console.log("updatedDate", updatedDate);
        // const doctor: IDoctor | null = await Doctor.findById(id);
        // console.log(doctor);
        const doctor = await Doctor.findByIdAndUpdate(id, { $set: updatedDate }, { new: true });
        if (!doctor) {
            res.status(404).json({ message: 'Doctor not found' });
            return;
        }
        res.json(doctor);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
export const deleteDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const doctor = await Doctor.findByIdAndDelete(id);
        res.json(doctor);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
//# sourceMappingURL=manage_doctors.admin.controller.js.map