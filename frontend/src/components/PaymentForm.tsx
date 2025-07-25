import React, { useState } from 'react';
import { apiService, PaymentRequest, PaymentResponse } from '../services/api';
import './PaymentForm.css';

interface PaymentFormProps {
  loanId?: string;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ loanId: initialLoanId }) => {
  const [loanId, setLoanId] = useState(initialLoanId || '');
  const [formData, setFormData] = useState<PaymentRequest>({
    amount: 0,
    payment_type: 'EMI',
  });
  const [result, setResult] = useState<PaymentResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'amount') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value as 'EMI' | 'LUMP_SUM' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loanId.trim()) {
      setError('Please enter a loan ID');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await apiService.recordPayment(loanId, formData);
      setResult(response);
      setFormData({ amount: 0, payment_type: 'EMI' });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-form">
      <h2>Record Payment</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="loanId">Loan ID:</label>
          <input
            type="text"
            id="loanId"
            value={loanId}
            onChange={(e) => setLoanId(e.target.value)}
            placeholder="Enter loan ID"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="amount">Payment Amount ($):</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount || ''}
            onChange={handleInputChange}
            min="0.01"
            step="0.01"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="payment_type">Payment Type:</label>
          <select
            id="payment_type"
            name="payment_type"
            value={formData.payment_type}
            onChange={handleInputChange}
          >
            <option value="EMI">EMI</option>
            <option value="LUMP_SUM">Lump Sum</option>
          </select>
        </div>

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? 'Recording Payment...' : 'Record Payment'}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {result && (
        <div className="success-message">
          <h3>Payment Recorded Successfully!</h3>
          <div className="payment-details">
            <p><strong>Payment ID:</strong> {result.payment_id}</p>
            <p><strong>Remaining Balance:</strong> ${result.remaining_balance.toFixed(2)}</p>
            <p><strong>EMIs Left:</strong> {result.emis_left}</p>
            <p>{result.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentForm;
