const express = require('express');
const router = express.Router();

function createLoanRoutes(loanService) {
  // LEND: Create a new loan
  router.post('/loans', async (req, res) => {
    try {
      const { customer_id, loan_amount, loan_period_years, interest_rate_yearly } = req.body;

      // Validate input
      if (!customer_id || !loan_amount || !loan_period_years || !interest_rate_yearly) {
        return res.status(400).json({
          error: 'Missing required fields: customer_id, loan_amount, loan_period_years, interest_rate_yearly'
        });
      }

      if (loan_amount <= 0 || loan_period_years <= 0 || interest_rate_yearly < 0) {
        return res.status(400).json({
          error: 'Invalid values: amounts and periods must be positive'
        });
      }

      const result = await loanService.createLoan(
        customer_id,
        loan_amount,
        loan_period_years,
        interest_rate_yearly
      );

      res.status(201).json(result);
    } catch (error) {
      if (error.message === 'Customer not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  // PAYMENT: Record a payment for a loan
  router.post('/loans/:loan_id/payments', async (req, res) => {
    try {
      const { loan_id } = req.params;
      const { amount, payment_type } = req.body;

      // Validate input
      if (!amount || !payment_type) {
        return res.status(400).json({
          error: 'Missing required fields: amount, payment_type'
        });
      }

      if (amount <= 0) {
        return res.status(400).json({
          error: 'Payment amount must be positive'
        });
      }

      if (!['EMI', 'LUMP_SUM'].includes(payment_type)) {
        return res.status(400).json({
          error: 'payment_type must be either EMI or LUMP_SUM'
        });
      }

      const result = await loanService.recordPayment(loan_id, amount, payment_type);
      res.status(200).json(result);
    } catch (error) {
      if (error.message === 'Active loan not found') {
        res.status(404).json({ error: error.message });
      } else if (error.message === 'Payment amount exceeds remaining balance') {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  // LEDGER: View loan details and transaction history
  router.get('/loans/:loan_id/ledger', async (req, res) => {
    try {
      const { loan_id } = req.params;
      const result = await loanService.getLoanLedger(loan_id);
      res.status(200).json(result);
    } catch (error) {
      if (error.message === 'Loan not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  // ACCOUNT OVERVIEW: View all loans for a customer
  router.get('/customers/:customer_id/overview', async (req, res) => {
    try {
      const { customer_id } = req.params;
      const result = await loanService.getCustomerOverview(customer_id);
      res.status(200).json(result);
    } catch (error) {
      if (error.message === 'Customer not found' || error.message === 'No loans found for customer') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  // Additional endpoint to get all customers (for frontend convenience)
  router.get('/customers', async (req, res) => {
    try {
      const customers = await loanService.db.all('SELECT customer_id, name FROM customers');
      res.status(200).json(customers);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}

module.exports = createLoanRoutes;
