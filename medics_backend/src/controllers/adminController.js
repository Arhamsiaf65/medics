const prisma = require('../config/database');
const bcrypt = require('bcryptjs');

/**
 * Create a new admin (Root only)
 * POST /api/admin/create-admin
 */
const createAdmin = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Name, email, and password are required.',
                code: 'MISSING_FIELDS',
            });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'User with this email already exists.',
                code: 'USER_EXISTS',
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const admin = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'ADMIN',
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });

        res.status(201).json({
            success: true,
            data: admin,
            message: 'Admin created successfully.',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete an admin (Root only)
 * DELETE /api/admin/:id
 */
const deleteAdmin = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Prevent self-deletion (though authorize should handle root role)
        if (req.user.id === id) {
            return res.status(400).json({
                success: false,
                error: 'You cannot delete yourself.',
                code: 'INVALID_OPERATION',
            });
        }

        const userToDelete = await prisma.user.findUnique({ where: { id } });
        if (!userToDelete) {
            return res.status(404).json({
                success: false,
                error: 'User not found.',
                code: 'NOT_FOUND',
            });
        }

        if (userToDelete.role === 'ROOT') {
            return res.status(403).json({
                success: false,
                error: 'Cannot delete Root Admin.',
                code: 'FORBIDDEN',
            });
        }

        await prisma.user.delete({ where: { id } });

        res.json({
            success: true,
            data: null,
            message: 'Admin deleted successfully.',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * List all admins (Root only)
 * GET /api/admin/admins
 */
const getAllAdmins = async (req, res, next) => {
    try {
        const admins = await prisma.user.findMany({
            where: {
                role: { in: ['ADMIN', 'ROOT'] }
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            data: admins,
            message: 'Admins retrieved successfully.'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createAdmin,
    deleteAdmin,
    getAllAdmins
};
