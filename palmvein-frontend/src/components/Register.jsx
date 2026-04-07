import React, { useState } from 'react';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    balance: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

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

    try {
      const response = await axios.post('http://localhost:5000/api/users/register', {
        name: formData.name,
        mobile: formData.mobile,
        balance: parseFloat(formData.balance)
      });

      setMessage({ 
        text: `Registration successful! User ID: ${response.data.user.sensor_user_id}`, 
        type: 'success' 
      });
      setFormData({ name: '', mobile: '', balance: '' });
    } catch (error) {
      setMessage({ 
        text: error.response?.data?.error || 'Registration failed', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Register New User</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Mobile Number</label>
          <input
            type="tel"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            pattern="[6-9][0-9]{9}"
            placeholder="10 digit mobile"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Initial Balance (₹)</label>
          <input
            type="number"
            name="balance"
            value={formData.balance}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
            disabled={loading}
          />
        </div>

        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Scanning Palm...' : 'Register & Scan Palm'}
        </button>
      </form>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
    </div>
  );
};

export default Register;