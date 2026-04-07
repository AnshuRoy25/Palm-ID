import React, { useState } from 'react';
import axios from 'axios';

const CheckBalance = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [balanceData, setBalanceData] = useState(null);

  const handleCheckBalance = async () => {
    setLoading(true);
    setMessage({ text: 'Please scan your palm...', type: '' });
    setBalanceData(null);

    try {
      const response = await axios.get('http://localhost:5000/api/users/balance');

      setBalanceData({
        name: response.data.name,
        balance: response.data.balance
      });
      setMessage({ text: '', type: '' });
    } catch (error) {
      setMessage({ 
        text: error.response?.data?.error || 'Failed to fetch balance', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Check Balance</h2>
      
      <button 
        onClick={handleCheckBalance} 
        className="btn" 
        disabled={loading}
      >
        {loading ? 'Scanning Palm...' : 'Scan Palm to Check Balance'}
      </button>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {balanceData && (
        <div className="result-box">
          <h3>Account Details</h3>
          <p><strong>Name:</strong> {balanceData.name}</p>
          <p><strong>Current Balance:</strong></p>
          <p className="balance-amount">₹{balanceData.balance.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
};

export default CheckBalance;