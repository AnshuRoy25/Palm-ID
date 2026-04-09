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
  const [confirmData, setConfirmData] = useState(null); // Holds user details for confirmation

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
    setConfirmData(null);

    try {
      // Step 1: Verify user and get details
      const response = await axios.post('http://localhost:5000/api/transactions/verify', {
        merchant: formData.merchant,
        amount: parseFloat(formData.amount)
      });

      // Show confirmation screen with user details
      setConfirmData(response.data);
      setMessage({ text: '', type: '' });
    } catch (error) {
      setMessage({ 
        text: error.response?.data?.error || 'Verification failed', 
        type: 'error' 
      });
      if (error.response?.data?.balance !== undefined) {
        setNewBalance(error.response.data.balance);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    setMessage({ text: 'Processing transaction...', type: '' });

    try {
      // Step 2: Confirm and process transaction
      const response = await axios.post('http://localhost:5000/api/transactions/confirm', {
        sensor_user_id: confirmData.sensor_user_id,
        merchant: confirmData.merchant,
        amount: confirmData.amount
      });

      setMessage({ 
        text: 'Transaction successful!', 
        type: 'success' 
      });
      setNewBalance(response.data.balance);
      setFormData({ merchant: '', amount: '' });
      setConfirmData(null);
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

  const handleCancel = () => {
    setConfirmData(null);
    setMessage({ text: '', type: '' });
  };

  // Show confirmation screen
  if (confirmData) {
    return (
      <div className="card">
        <h2>Confirm Transaction</h2>
        
        <div className="result-box">
          <h3>User Details</h3>
          <p><strong>Name:</strong> {confirmData.name}</p>
          <p><strong>Mobile:</strong> {confirmData.mobile}</p>
          <p><strong>Current Balance:</strong> ₹{confirmData.balance.toFixed(2)}</p>
          
          <div style={{ borderTop: '2px solid #fff', marginTop: '20px', paddingTop: '20px' }}>
            <h3>Transaction Details</h3>
            <p><strong>Merchant:</strong> {confirmData.merchant}</p>
            <p><strong>Amount:</strong> ₹{confirmData.amount.toFixed(2)}</p>
            <p><strong>New Balance:</strong> ₹{(confirmData.balance - confirmData.amount).toFixed(2)}</p>
          </div>
        </div>

        <button 
          onClick={handleConfirm} 
          className="btn" 
          disabled={loading}
          style={{ marginTop: '20px' }}
        >
          {loading ? 'Processing...' : 'Confirm Payment'}
        </button>

        <button 
          onClick={handleCancel} 
          className="btn" 
          disabled={loading}
          style={{ 
            marginTop: '10px', 
            backgroundColor: '#000', 
            color: '#fff',
            border: '2px solid #fff'
          }}
        >
          Cancel
        </button>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}
      </div>
    );
  }

  // Show transaction form
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
          {loading ? 'Scanning Palm...' : 'Scan Palm to Pay'}
        </button>
      </form>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {newBalance !== null && (
        <div className="result-box">
          <h3>Current Balance</h3>
          <p className="balance-amount">₹{newBalance.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
};

export default Transaction;