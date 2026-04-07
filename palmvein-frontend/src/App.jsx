import React, { useState } from 'react';
import './App.css';
import Register from './components/Register';
import Transaction from './components/Transaction';
import CheckBalance from './components/CheckBalance';

function App() {
  const [activeTab, setActiveTab] = useState('transaction');

  return (
    <div className="App">
      <header className="header">
        <h1>Palm Vein Payment System</h1>
      </header>

      <nav className="nav">
        <button 
          className={activeTab === 'transaction' ? 'active' : ''} 
          onClick={() => setActiveTab('transaction')}
        >
          Transaction
        </button>
        <button 
          className={activeTab === 'balance' ? 'active' : ''} 
          onClick={() => setActiveTab('balance')}
        >
          Check Balance
        </button>
        <button 
          className={activeTab === 'register' ? 'active' : ''} 
          onClick={() => setActiveTab('register')}
        >
          Register
        </button>
      </nav>

      <main className="main-content">
        {activeTab === 'transaction' && <Transaction />}
        {activeTab === 'balance' && <CheckBalance />}
        {activeTab === 'register' && <Register />}
      </main>
    </div>
  );
}

export default App;