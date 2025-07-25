const { v4: uuidv4 } = require('uuid');

class LoanService {
  constructor(database) {
    this.db = database;
  }

  // Calculate loan details using simple interest
  calculateLoanDetails(principal, years, interestRate) {
    // Simple Interest: I = P * N * R / 100
    const totalInterest = principal * years * (interestRate / 100);
    const totalAmount = principal + totalInterest;
    const monthlyEMI = totalAmount / (years * 12);

    return {
      totalInterest,
      totalAmount,
      monthlyEMI
    };
  }

  // Create a new loan
  async createLoan(customerID, loanAmount, loanPeriodYears, interestRateYearly) {
    // Validate customer exists
    const customer = await this.db.get(
      'SELECT customer_id FROM customers WHERE customer_id = ?',
      [customerID]
    );

    if (!customer) {
      throw new Error('Customer not found');
    }

    // Calculate loan details
    const { totalAmount, monthlyEMI } = this.calculateLoanDetails(
      loanAmount,
      loanPeriodYears,
      interestRateYearly
    );

    const loanID = uuidv4();

    // Insert loan into database
    await this.db.run(`
      INSERT INTO loans (
        loan_id, customer_id, principal_amount, total_amount,
        interest_rate, loan_period_years, monthly_emi
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [loanID, customerID, loanAmount, totalAmount, interestRateYearly, loanPeriodYears, monthlyEMI]);

    return {
      loan_id: loanID,
      customer_id: customerID,
      total_amount_payable: totalAmount,
      monthly_emi: monthlyEMI
    };
  }

  // Record a payment
  async recordPayment(loanID, amount, paymentType) {
    // Validate loan exists
    const loan = await this.db.get(
      'SELECT * FROM loans WHERE loan_id = ? AND status = "ACTIVE"',
      [loanID]
    );

    if (!loan) {
      throw new Error('Active loan not found');
    }

    // Calculate current balance
    const totalPaid = await this.getTotalPaidAmount(loanID);
    const remainingBalance = loan.total_amount - totalPaid;

    if (amount > remainingBalance) {
      throw new Error('Payment amount exceeds remaining balance');
    }

    const paymentID = uuidv4();

    // Record payment
    await this.db.run(`
      INSERT INTO payments (payment_id, loan_id, amount, payment_type)
      VALUES (?, ?, ?, ?)
    `, [paymentID, loanID, amount, paymentType]);

    // Calculate new remaining balance and EMIs left
    const newRemainingBalance = remainingBalance - amount;
    const emisLeft = newRemainingBalance > 0 ? Math.ceil(newRemainingBalance / loan.monthly_emi) : 0;

    // Update loan status if fully paid
    if (newRemainingBalance <= 0) {
      await this.db.run(
        'UPDATE loans SET status = "PAID_OFF" WHERE loan_id = ?',
        [loanID]
      );
    }

    return {
      payment_id: paymentID,
      loan_id: loanID,
      message: 'Payment recorded successfully.',
      remaining_balance: newRemainingBalance,
      emis_left: emisLeft
    };
  }

  // Get total paid amount for a loan
  async getTotalPaidAmount(loanID) {
    const result = await this.db.get(
      'SELECT COALESCE(SUM(amount), 0) as total_paid FROM payments WHERE loan_id = ?',
      [loanID]
    );
    return result.total_paid;
  }

  // Get loan ledger
  async getLoanLedger(loanID) {
    const loan = await this.db.get(
      'SELECT * FROM loans WHERE loan_id = ?',
      [loanID]
    );

    if (!loan) {
      throw new Error('Loan not found');
    }

    const totalPaid = await this.getTotalPaidAmount(loanID);
    const balanceAmount = loan.total_amount - totalPaid;
    const emisLeft = balanceAmount > 0 ? Math.ceil(balanceAmount / loan.monthly_emi) : 0;

    const transactions = await this.db.all(`
      SELECT payment_id as transaction_id, payment_date as date, amount, payment_type as type
      FROM payments 
      WHERE loan_id = ? 
      ORDER BY payment_date DESC
    `, [loanID]);

    return {
      loan_id: loan.loan_id,
      customer_id: loan.customer_id,
      principal: loan.principal_amount,
      total_amount: loan.total_amount,
      monthly_emi: loan.monthly_emi,
      amount_paid: totalPaid,
      balance_amount: balanceAmount,
      emis_left: emisLeft,
      transactions
    };
  }

  // Get customer overview
  async getCustomerOverview(customerID) {
    const customer = await this.db.get(
      'SELECT customer_id FROM customers WHERE customer_id = ?',
      [customerID]
    );

    if (!customer) {
      throw new Error('Customer not found');
    }

    const loans = await this.db.all(
      'SELECT * FROM loans WHERE customer_id = ?',
      [customerID]
    );

    if (loans.length === 0) {
      throw new Error('No loans found for customer');
    }

    const loansWithDetails = await Promise.all(
      loans.map(async (loan) => {
        const totalPaid = await this.getTotalPaidAmount(loan.loan_id);
        const balanceAmount = loan.total_amount - totalPaid;
        const emisLeft = balanceAmount > 0 ? Math.ceil(balanceAmount / loan.monthly_emi) : 0;
        const totalInterest = loan.total_amount - loan.principal_amount;

        return {
          loan_id: loan.loan_id,
          principal: loan.principal_amount,
          total_amount: loan.total_amount,
          total_interest: totalInterest,
          emi_amount: loan.monthly_emi,
          amount_paid: totalPaid,
          emis_left: emisLeft
        };
      })
    );

    return {
      customer_id: customerID,
      total_loans: loans.length,
      loans: loansWithDetails
    };
  }
}

module.exports = LoanService;
