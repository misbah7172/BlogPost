const express = require('express');
const router = express.Router();
const TransactionController = require('../controllers/transactionController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Public routes
router.get('/plans', TransactionController.getPlanPrices);
router.get('/payment-info', TransactionController.getPaymentInfo);
router.post('/sms-webhook', TransactionController.validateSMSWebhook, TransactionController.smsWebhook);

// Protected routes
router.post('/', authenticateToken, TransactionController.validateTransaction, TransactionController.createTransaction);
router.get('/my-transactions', authenticateToken, TransactionController.getUserTransactions);

// Admin routes
router.get('/', authenticateToken, requireAdmin, TransactionController.getAllTransactions);
router.post('/:trxId/approve', authenticateToken, requireAdmin, TransactionController.approveTransaction);
router.post('/:trxId/reject', authenticateToken, requireAdmin, TransactionController.rejectTransaction);

module.exports = router;
