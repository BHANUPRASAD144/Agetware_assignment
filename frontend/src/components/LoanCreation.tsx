import React, { useState, useEffect } from 'react';
import { apiService, Customer, LoanRequest, LoanResponse } from '../services/api';
import './LoanCreation.css';

const LoanCreation: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [formData, setFormData] = useState<LoanRequest>({
    customer_id: '',
    loan_amount: 0,
    loan_period_years: 0,
    interest_rate_yearly: 0,
  });
  const [result, setResult] = useState<LoanResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const customerData = await apiService.getCustomers();
      setCustomers(customerData);
    } catch (err) {
      setError('Failed to load customers');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'customer_id' ? value : parseFloat(value) || 0
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await apiService.createLoan(formData);
      setResult(response);
      setFormData({
        customer_id: '',
        loan_amount: 0,
        loan_period_years: 0,
        interest_rate_yearly: 0,
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create loan');
    } finally {
      setLoading(false);
    }
  };

  const calculatePreview = () => {
    if (formData.loan_amount > 0 && formData.loan_period_years > 0 && formData.interest_rate_yearly >= 0) {
      const principal = formData.loan_amount;
      const years = formData.loan_period_years;
      const rate = formData.interest_rate_yearly;
      
      const totalInterest = principal * years * (rate / 100);
      const totalAmount = principal + totalInterest;
      const monthlyEMI = totalAmount / (years * 12);

      return { totalInterest, totalAmount, monthlyEMI };
    }
    return null;
  };

  const preview = calculatePreview();

  return (
    <div className="loan-creation">
      <h2>Create New Loan</h2>
      
      <form onSubmit={handleSubmit} className="loan-form">
        <div className="form-group">
          <label htmlFor="customer_id">Customer:</label>
          <select
            id="customer_id"
            name="customer_id"
            value={formData.customer_id}
            onChange={handleInputChange}
            required
          >
            <option value="">Select a customer</option>
            {customers.map(customer => (
              <option key={customer.customer_id} value={customer.customer_id}>
                {customer.name} ({customer.customer_id})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="loan_amount">Loan Amount ($):</label>
          <input
            type="number"
            id="loan_amount"
            name="loan_amount"
            value={formData.loan_amount || ''}
            onChange={handleInputChange}
            min="1"
            step="0.01"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="loan_period_years">Loan Period (Years):</label>
          <input
            type="number"
            id="loan_period_years"
            name="loan_period_years"
            value={formData.loan_period_years || ''}
            onChange={handleInputChange}
            min="1"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="interest_rate_yearly">Interest Rate (% per year):</label>
          <input
            type="number"
            id="interest_rate_yearly"
            name="interest_rate_yearly"
            value={formData.interest_rate_yearly || ''}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            required
          />
        </div>

        {preview && (
          <div className="loan-preview">
            <h3>Loan Preview</h3>
            <div className="preview-details">
              <p><strong>Principal Amount:</strong> ${formData.loan_amount.toFixed(2)}</p>
              <p><strong>Total Interest:</strong> ${preview.totalInterest.toFixed(2)}</p>
              <p><strong>Total Amount Payable:</strong> ${preview.totalAmount.toFixed(2)}</p>
              <p><strong>Monthly EMI:</strong> ${preview.monthlyEMI.toFixed(2)}</p>
            </div>
          </div>
        )}

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? 'Creating Loan...' : 'Create Loan'}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {result && (
        <div className="success-message">
          <h3>Loan Created Successfully!</h3>
          <div className="loan-details">
            <p><strong>Loan ID:</strong> {result.loan_id}</p>
            <p><strong>Customer ID:</strong> {result.customer_id}</p>
            <p><strong>Total Amount Payable:</strong> ${result.total_amount_payable.toFixed(2)}</p>
            <p><strong>Monthly EMI:</strong> ${result.monthly_emi.toFixed(2)}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanCreation;
