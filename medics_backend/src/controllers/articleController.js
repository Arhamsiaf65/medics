const prisma = require('../config/database');

/**
 * Create a new article
 * POST /api/articles
 */
const createArticle = async (req, res, next) => {
    try {
        const { title, source, readTime, imageUrl, content, category } = req.body;

        if (!title || !source || !readTime || !imageUrl) {
            return res.status(400).json({
                success: false,
                error: 'Title, source, readTime, and imageUrl are required.',
                code: 'MISSING_FIELDS',
            });
        }

        // Find the Doctor profile associated with the logged-in User
        const doctor = await prisma.doctor.findUnique({
            where: { userId: req.user.id }
        });

        // if (!doctor) {
        //     return res.status(403).json({ success: false, error: 'Only doctors can create articles.' });
        // }

        const article = await prisma.article.create({
            data: {
                title,
                source,
                readTime,
                imageUrl,
                content,
                category,
                authorId: doctor ? doctor.id : null, // Link to doctor if found
            },
        });

        res.status(201).json({
            success: true,
            data: article,
            message: 'Article created successfully.',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all articles
 * GET /api/articles
 */
const getAllArticles = async (req, res, next) => {
    try {
        const articles = await prisma.article.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        imageUrl: true,
                        specialty: true
                    }
                }
            }
        });


        res.json({
            success: true,
            data: articles,
            message: 'Articles retrieved successfully.',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get article by ID
 * GET /api/articles/:id
 */
const getArticleById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const article = await prisma.article.findUnique({
            where: { id },
        });

        if (!article) {
            return res.status(404).json({
                success: false,
                error: 'Article not found.',
                code: 'NOT_FOUND',
            });
        }

        res.json({
            success: true,
            data: article,
            message: 'Article retrieved successfully.',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update an article
 * PUT /api/articles/:id
 */
const updateArticle = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, source, readTime, imageUrl, content, category } = req.body;

        // Check if article exists
        const existingArticle = await prisma.article.findUnique({
            where: { id },
        });

        if (!existingArticle) {
            return res.status(404).json({
                success: false,
                error: 'Article not found.',
                code: 'NOT_FOUND',
            });
        }

        const updatedArticle = await prisma.article.update({
            where: { id },
            data: {
                title,
                source,
                readTime,
                imageUrl,
                content,
                category,
            },
        });

        res.json({
            success: true,
            data: updatedArticle,
            message: 'Article updated successfully.',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete an article
 * DELETE /api/articles/:id
 */
const deleteArticle = async (req, res, next) => {
    try {
        const { id } = req.params;

        const existingArticle = await prisma.article.findUnique({
            where: { id },
        });

        if (!existingArticle) {
            return res.status(404).json({
                success: false,
                error: 'Article not found.',
                code: 'NOT_FOUND',
            });
        }

        await prisma.article.delete({
            where: { id },
        });

        res.json({
            success: true,
            data: null,
            message: 'Article deleted successfully.',
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createArticle,
    getAllArticles,
    getArticleById,
    updateArticle,
    deleteArticle,
};
