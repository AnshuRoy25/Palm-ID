import React, { useState } from 'react';
import axios from 'axios';

const Transaction = () => {
  const [formData, setFormData] = useState({
    merchant: '',
    amount: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [newBalance, setNewBalance] = useState(null);

  const merchants = [
    'Coffee Shop',
    'Grocery Store',
    'Restaurant',
    'Gas Station',
    'Pharmacy',
    'Bookstore',
    'Other'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: 'Please scan your palm...', type: '' });
    setNewBalance(null);

    try {
      const response = await axios.post('http://localhost:5000/api/transactions', {
        merchant: formData.merchant,
        amount: parseFloat(formData.amount)
      });

      setMessage({ 
        text: 'Transaction successful!', 
        type: 'success' 
      });
      setNewBalance(response.data.balance);
      setFormData({ merchant: '', amount: '' });
    } catch (error) {
      setMessage({ 
        text: error.response?.data?.error || 'Transaction failed', 
        type: 'error' 
      });
      if (error.response?.data?.balance !== undefined) {
        setNewBalance(error.response.data.balance);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Make Transaction</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Merchant</label>
          <select
            name="merchant"
            value={formData.merchant}
            onChange={handleChange}
            required
            disabled={loading}
          >
            <option value="">Select merchant</option>
            {merchants.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Amount (₹)</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            min="0.01"
            step="0.01"
            required
            disabled={loading}
          />
        </div>

        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Scanning Palm...' : 'Pay & Scan Palm'}
        </button>
      </form>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {newBalance !== null && (
        <div className="result-box">
          <h3>New Balance</h3>
          <p className="balance-amount">₹{newBalance.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
};

export default Transaction;