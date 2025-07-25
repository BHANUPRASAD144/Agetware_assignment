import React, { useState } from 'react';
import LoanCreation from './components/LoanCreation';
import PaymentForm from './components/PaymentForm';
import './App.css';

type ActiveTab = 'create' | 'payment' | 'ledger' | 'overview';

function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('create');
  const [searchLoanId, setSearchLoanId] = useState('');
  const [searchCustomerId, setSearchCustomerId] = useState('');
  const [ledgerData, setLedgerData] = useState<any>(null);
  const [overviewData, setOverviewData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLedgerSearch = async () => {
    if (!searchLoanId.trim()) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`http://localhost:3001/api/v1/loans/${searchLoanId}/ledger`);
      if (response.ok) {
        const data = await response.json();
        setLedgerData(data);
      } else {
        setError('Loan not found');
      }
    } catch (err) {
      setError('Failed to fetch loan data');
    }
    setLoading(false);
  };

  const handleOverviewSearch = async () => {
    if (!searchCustomerId.trim()) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`http://localhost:3001/api/v1/customers/${searchCustomerId}/overview`);
      if (response.ok) {
        const data = await response.json();
        setOverviewData(data);
      } else {
        setError('Customer not found or no loans');
      }
    } catch (err) {
      setError('Failed to fetch customer data');
    }
    setLoading(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Bank Lending System</h1>
        <nav className="nav-tabs">
          <button 
            className={activeTab === 'create' ? 'active' : ''}
            onClick={() => setActiveTab('create')}
          >
            Create Loan
          </button>
          <button 
            className={activeTab === 'payment' ? 'active' : ''}
            onClick={() => setActiveTab('payment')}
          >
            Record Payment
          </button>
          <button 
            className={activeTab === 'ledger' ? 'active' : ''}
            onClick={() => setActiveTab('ledger')}
          >
            Loan Ledger
          </button>
          <button 
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => setActiveTab('overview')}
          >
            Customer Overview
          </button>
        </nav>
      </header>

      <main className="App-main">
        {activeTab === 'create' && <LoanCreation />}
        
        {activeTab === 'payment' && <PaymentForm />}
        
        {activeTab === 'ledger' && (
          <div className="ledger-section">
            <h2>Loan Ledger</h2>
            <div className="search-form">
              <input
                type="text"
                placeholder="Enter Loan ID"
                value={searchLoanId}
                onChange={(e) => setSearchLoanId(e.target.value)}
              />
              <button onClick={handleLedgerSearch} disabled={loading}>
                {loading ? 'Loading...' : 'Get Ledger'}
              </button>
            </div>
            {error && <div className="error">{error}</div>}
            {ledgerData && (
              <div className="ledger-data">
                <h3>Loan Details</h3>
                <p><strong>Loan ID:</strong> {ledgerData.loan_id}</p>
                <p><strong>Customer ID:</strong> {ledgerData.customer_id}</p>
                <p><strong>Principal:</strong> ${ledgerData.principal}</p>
                <p><strong>Total Amount:</strong> ${ledgerData.total_amount}</p>
                <p><strong>Monthly EMI:</strong> ${ledgerData.monthly_emi}</p>
                <p><strong>Amount Paid:</strong> ${ledgerData.amount_paid}</p>
                <p><strong>Balance:</strong> ${ledgerData.balance_amount}</p>
                <p><strong>EMIs Left:</strong> {ledgerData.emis_left}</p>
                <h4>Transactions</h4>
                {ledgerData.transactions.map((tx: any) => (
                  <div key={tx.transaction_id} className="transaction">
                    <span>{new Date(tx.date).toLocaleDateString()}</span>
                    <span>${tx.amount}</span>
                    <span>{tx.type}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'overview' && (
          <div className="overview-section">
            <h2>Customer Overview</h2>
            <div className="search-form">
              <input
                type="text"
                placeholder="Enter Customer ID"
                value={searchCustomerId}
                onChange={(e) => setSearchCustomerId(e.target.value)}
              />
              <button onClick={handleOverviewSearch} disabled={loading}>
                {loading ? 'Loading...' : 'Get Overview'}
              </button>
            </div>
            {error && <div className="error">{error}</div>}
            {overviewData && (
              <div className="overview-data">
                <h3>Customer: {overviewData.customer_id}</h3>
                <p><strong>Total Loans:</strong> {overviewData.total_loans}</p>
                {overviewData.loans.map((loan: any) => (
                  <div key={loan.loan_id} className="loan-summary">
                    <h4>Loan ID: {loan.loan_id}</h4>
                    <p>Principal: ${loan.principal}</p>
                    <p>Total Amount: ${loan.total_amount}</p>
                    <p>EMI: ${loan.emi_amount}</p>
                    <p>Amount Paid: ${loan.amount_paid}</p>
                    <p>EMIs Left: {loan.emis_left}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
