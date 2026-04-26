import User from '../models/user.model.js';
import { Admin } from '../models/admin.model.js';
import bcrypt from 'bcryptjs';

export const initializeRootAdmin = async (): Promise<void> => {
    try {
        const rootAdminExists = await Admin.findOne({ isRoot: true });
        if (!rootAdminExists) {
            console.log('No root admin found. Creating default root admin...');
            
            const rootEmail = process.env.ROOT_ADMIN_EMAIL || 'admin@admin.com';
            const rootPassword = process.env.ROOT_ADMIN_PASSWORD || 'admin123';
            
            let rootUser = await User.findOne({ email: rootEmail });
            
            if (!rootUser) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(rootPassword, salt);
                
                rootUser = await User.create({
                    name: 'System Root Admin',
                    email: rootEmail,
                    password: hashedPassword,
                    isVerified: true
                });
            }
            
            await Admin.create({
                user: rootUser._id,
                permissions: ['ALL'],
                isRoot: true
            });
            console.log(`Root admin created! Email: ${rootEmail} | Password: ${rootPassword}`);
        }
    } catch (error) {
        console.error('Error initializing root admin:', error);
    }
};
