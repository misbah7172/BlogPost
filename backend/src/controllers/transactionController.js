const { body, validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

class TransactionController {
  // Validation rules
  static validateTransaction = [
    body('trxId').trim().isLength({ min: 8, max: 50 }).withMessage('Transaction ID must be 8-50 characters'),
    body('planType').isIn(['monthly', 'quarterly', 'yearly']).withMessage('Invalid plan type'),
    body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number')
  ];

  static validateSMSWebhook = [
    body('trxId').trim().isLength({ min: 8, max: 50 }).withMessage('Transaction ID required'),
    body('amount').isFloat({ min: 0 }).withMessage('Amount required'),
    body('sender').optional().trim().isLength({ min: 5, max: 20 }).withMessage('Invalid sender number')
  ];

  static async createTransaction(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { trxId, planType, amount } = req.body;
      const userId = req.user.id;

      // Check if transaction ID already exists
      const existingTransaction = await Transaction.findByTrxId(trxId);
      if (existingTransaction) {
        return res.status(409).json({ message: 'Transaction ID already exists' });
      }

      // Validate plan price
      const planPrices = Transaction.getPlanPrices();
      if (Math.abs(amount - planPrices[planType]) > 0.01) {
        return res.status(400).json({ 
          message: 'Invalid amount for selected plan',
          expectedAmount: planPrices[planType]
        });
      }

      const transactionId = await Transaction.create({
        userId,
        trxId,
        amount,
        planType
      });

      res.status(201).json({
        message: 'Transaction submitted successfully. Please wait for approval.',
        transactionId,
        status: 'pending'
      });
    } catch (error) {
      console.error('Create transaction error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async smsWebhook(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { trxId, amount, sender, message } = req.body;

      // Find pending transaction with this ID
      const transaction = await Transaction.findPendingByTrxId(trxId);
      if (!transaction) {
        return res.status(404).json({ message: 'Pending transaction not found' });
      }

      // Validate amount matches
      if (Math.abs(amount - transaction.amount) > 0.01) {
        console.log(`Amount mismatch for ${trxId}: expected ${transaction.amount}, got ${amount}`);
        return res.status(400).json({ message: 'Amount mismatch' });
      }

      // Auto-approve the transaction
      const approved = await Transaction.approve(trxId);
      if (approved) {
        console.log(`Transaction ${trxId} auto-approved via SMS webhook`);
        
        // TODO: Send confirmation email to user
        // await sendSubscriptionConfirmationEmail(transaction.user_id);

        res.json({
          message: 'Transaction approved automatically',
          transactionId: trxId
        });
      } else {
        res.status(400).json({ message: 'Failed to approve transaction' });
      }
    } catch (error) {
      console.error('SMS webhook error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async approveTransaction(req, res) {
    try {
      const { trxId } = req.params;

      const approved = await Transaction.approve(trxId);
      if (approved) {
        res.json({ message: 'Transaction approved successfully' });
      } else {
        res.status(404).json({ message: 'Pending transaction not found' });
      }
    } catch (error) {
      console.error('Approve transaction error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async rejectTransaction(req, res) {
    try {
      const { trxId } = req.params;

      const rejected = await Transaction.reject(trxId);
      if (rejected) {
        res.json({ message: 'Transaction rejected' });
      } else {
        res.status(404).json({ message: 'Pending transaction not found' });
      }
    } catch (error) {
      console.error('Reject transaction error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async getAllTransactions(req, res) {
    try {
      const { page = 1, limit = 20, status } = req.query;
      const offset = (page - 1) * limit;

      const transactions = await Transaction.findAll(parseInt(limit), parseInt(offset), status);

      res.json({
        transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          hasMore: transactions.length === parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Get transactions error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async getUserTransactions(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const [transactions] = await require('../config/database').pool.execute(`
        SELECT * FROM transactions 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `, [req.user.id, parseInt(limit), parseInt(offset)]);

      res.json({
        transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          hasMore: transactions.length === parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Get user transactions error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static getPlanPrices(req, res) {
    const prices = Transaction.getPlanPrices();
    res.json({
      plans: {
        monthly: {
          price: prices.monthly,
          duration: '1 month',
          description: 'Monthly subscription'
        },
        quarterly: {
          price: prices.quarterly,
          duration: '3 months',
          description: 'Quarterly subscription (save 17%)'
        },
        yearly: {
          price: prices.yearly,
          duration: '12 months',
          description: 'Yearly subscription (save 33%)'
        }
      },
      bkashInfo: {
        merchantNumber: process.env.BKASH_MERCHANT_NUMBER,
        qrCodeUrl: process.env.BKASH_QR_CODE_URL
      }
    });
  }

  static getPaymentInfo(req, res) {
    res.json({
      bkash: {
        merchantNumber: process.env.BKASH_MERCHANT_NUMBER,
        qrCodeUrl: process.env.BKASH_QR_CODE_URL,
        instructions: [
          '1. Open your bKash app',
          '2. Scan the QR code or send money to the merchant number',
          '3. Enter the amount for your selected plan',
          '4. Complete the payment',
          '5. Copy the transaction ID from the SMS',
          '6. Submit the transaction ID on this website'
        ]
      },
      plans: Transaction.getPlanPrices()
    });
  }
}

module.exports = TransactionController;
