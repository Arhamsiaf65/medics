import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../../models/user.model.js';
import { Admin } from '../../models/admin.model.js';

export const addAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, permissions } = req.body;

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
            isVerified: true
        });

        const newAdmin = await Admin.create({
            user: newUser._id,
            permissions: permissions || [],
            isRoot: false
        });

        res.status(201).json(newAdmin);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error adding admin' });
    }
};

export const getAllAdmins = async (req: Request, res: Response): Promise<void> => {
    try {
        const admins = await Admin.find().populate('user', 'name email');
        res.json(admins);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error fetching admins' });
    }
};

export const updateAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { permissions } = req.body;

        const admin = await Admin.findById(id);
        if (!admin) {
            res.status(404).json({ message: 'Admin not found' });
            return;
        }

        admin.permissions = permissions || admin.permissions;
        await admin.save();

        res.json(admin);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error updating admin' });
    }
};

export const deleteAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const admin = await Admin.findById(id);
        if (!admin) {
            res.status(404).json({ message: 'Admin not found' });
            return;
        }

        if (admin.isRoot) {
            res.status(403).json({ message: 'Cannot delete the root admin' });
            return;
        }

        await Admin.findByIdAndDelete(id);
        res.json({ message: 'Admin deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error deleting admin' });
    }
};
