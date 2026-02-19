import React, { useState } from 'react';
import './App.css';
import SubdomainForm from './components/SubdomainForm';

function App() {
  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <h1>🔗 Replit Subdomain Connector</h1>
          <p>Connect your Replit project to a sher.dev subdomain</p>
        </header>
        <SubdomainForm />
      </div>
    </div>
  );
}

export default App;
