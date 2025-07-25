import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
  // Force HTTP/1.1 to avoid HTTP/2 stream errors
  httpAgent: false,
  httpsAgent: false,
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNREFUSED') {
      console.error('Backend server is not running. Please start the backend server.');
      throw new Error('Backend server is not available. Please ensure the server is running on port 3001.');
    }
    if (error.message.includes('stream')) {
      console.error('Stream error detected, retrying with different configuration...');
      // You can implement retry logic here if needed
    }
    return Promise.reject(error);
  }
);

export interface Customer {
  customer_id: string;
  name: string;
}

export interface LoanRequest {
  customer_id: string;
  loan_amount: number;
  loan_period_years: number;
  interest_rate_yearly: number;
}

export interface LoanResponse {
  loan_id: string;
  customer_id: string;
  total_amount_payable: number;
  monthly_emi: number;
}

export interface PaymentRequest {
  amount: number;
  payment_type: 'EMI' | 'LUMP_SUM';
}

export interface PaymentResponse {
  payment_id: string;
  loan_id: string;
  message: string;
  remaining_balance: number;
  emis_left: number;
}

export interface Transaction {
  transaction_id: string;
  date: string;
  amount: number;
  type: string;
}

export interface LoanLedger {
  loan_id: string;
  customer_id: string;
  principal: number;
  total_amount: number;
  monthly_emi: number;
  amount_paid: number;
  balance_amount: number;
  emis_left: number;
  transactions: Transaction[];
}

export interface CustomerLoan {
  loan_id: string;
  principal: number;
  total_amount: number;
  total_interest: number;
  emi_amount: number;
  amount_paid: number;
  emis_left: number;
}

export interface CustomerOverview {
  customer_id: string;
  total_loans: number;
  loans: CustomerLoan[];
}

class ApiService {
  // Get all customers
  async getCustomers(): Promise<Customer[]> {
    const response = await api.get('/customers');
    return response.data;
  }

  // Create a new loan
  async createLoan(loanData: LoanRequest): Promise<LoanResponse> {
    const response = await api.post('/loans', loanData);
    return response.data;
  }

  // Record a payment
  async recordPayment(loanId: string, paymentData: PaymentRequest): Promise<PaymentResponse> {
    const response = await api.post(`/loans/${loanId}/payments`, paymentData);
    return response.data;
  }

  // Get loan ledger
  async getLoanLedger(loanId: string): Promise<LoanLedger> {
    const response = await api.get(`/loans/${loanId}/ledger`);
    return response.data;
  }

  // Get customer overview
  async getCustomerOverview(customerId: string): Promise<CustomerOverview> {
    const response = await api.get(`/customers/${customerId}/overview`);
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
