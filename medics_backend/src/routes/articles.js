const express = require('express');
const router = express.Router();
const {
    createArticle,
    getAllArticles,
    getArticleById,
    updateArticle,
    deleteArticle
} = require('../controllers/articleController');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes (anyone can read articles)
router.get('/', getAllArticles);
router.get('/:id', getArticleById);

// Protected routes (only doctors can create, update, delete)
router.post('/', authenticate, authorize('DOCTOR'), createArticle);
router.put('/:id', authenticate, authorize('DOCTOR'), updateArticle);
router.delete('/:id', authenticate, authorize('DOCTOR'), deleteArticle);

module.exports = router;
