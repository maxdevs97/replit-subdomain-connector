import React, { useState } from 'react';
import axios from 'axios';
import './SubdomainForm.css';

const API_URL = process.env.REACT_APP_API_URL || '';

function SubdomainForm() {
  const [step, setStep] = useState(1);
  const [subdomain, setSubdomain] = useState('');
  const [txtValue, setTxtValue] = useState('');
  const [aValue, setAValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const resetForm = () => {
    setStep(1);
    setSubdomain('');
    setTxtValue('');
    setAValue('');
    setError('');
    setSuccess(null);
  };

  const checkAvailability = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/check-availability`, {
        subdomain: subdomain.toLowerCase().trim()
      });

      if (response.data.available) {
        setStep(2);
      } else {
        setError(`Subdomain "${subdomain}" is already taken. Please choose another.`);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to check availability. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const createRecords = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/create-records`, {
        subdomain: subdomain.toLowerCase().trim(),
        txtValue: txtValue.trim(),
        aValue: aValue.trim()
      });

      setSuccess(response.data);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create DNS records. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="step-indicator">
        <div className={`step ${step >= 1 ? 'active' : ''}`}>
          <div className="step-number">1</div>
          <div className="step-label">Check Availability</div>
        </div>
        <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
        <div className={`step ${step >= 2 ? 'active' : ''}`}>
          <div className="step-number">2</div>
          <div className="step-label">Replit Records</div>
        </div>
        <div className={`step-line ${step >= 3 ? 'active' : ''}`}></div>
        <div className={`step ${step >= 3 ? 'active' : ''}`}>
          <div className="step-number">3</div>
          <div className="step-label">Confirmation</div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {step === 1 && (
        <form onSubmit={checkAvailability} className="form-step">
          <h2>Step 1: Check Subdomain Availability</h2>
          <p className="step-description">
            Enter your desired subdomain. It will be available at <strong>{subdomain || 'yourname'}.sher.dev</strong>
          </p>
          
          <div className="form-group">
            <label htmlFor="subdomain">Subdomain Name</label>
            <div className="input-with-suffix">
              <input
                type="text"
                id="subdomain"
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value)}
                placeholder="myapp"
                pattern="[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?"
                title="Use only lowercase letters, numbers, and hyphens"
                required
                disabled={loading}
              />
              <span className="suffix">.sher.dev</span>
            </div>
            <small>Use only lowercase letters, numbers, and hyphens</small>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading || !subdomain}>
            {loading ? 'Checking...' : 'Check Availability →'}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={createRecords} className="form-step">
          <h2>Step 2: Enter Replit DNS Records</h2>
          <p className="step-description">
            Subdomain: <strong>{subdomain}.sher.dev</strong> ✓ Available
          </p>
          <p className="step-hint">
            In Replit, go to your project's custom domain settings. Copy the TXT and A record values that Replit provides.
          </p>

          <div className="form-group">
            <label htmlFor="txtValue">TXT Record Value</label>
            <textarea
              id="txtValue"
              value={txtValue}
              onChange={(e) => setTxtValue(e.target.value)}
              placeholder="replit-verify=abc123..."
              rows="3"
              required
              disabled={loading}
            />
            <small>Paste the verification TXT record from Replit</small>
          </div>

          <div className="form-group">
            <label htmlFor="aValue">A Record Value (IP Address)</label>
            <input
              type="text"
              id="aValue"
              value={aValue}
              onChange={(e) => setAValue(e.target.value)}
              placeholder="35.123.45.67"
              pattern="(\d{1,3}\.){3}\d{1,3}"
              title="Enter a valid IP address"
              required
              disabled={loading}
            />
            <small>Paste the A record IP address from Replit</small>
          </div>

          <div className="button-group">
            <button type="button" className="btn btn-secondary" onClick={resetForm} disabled={loading}>
              ← Back
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading || !txtValue || !aValue}>
              {loading ? 'Creating...' : 'Create DNS Records →'}
            </button>
          </div>
        </form>
      )}

      {step === 3 && success && (
        <div className="form-step success-step">
          <div className="success-icon">✓</div>
          <h2>DNS Records Created Successfully!</h2>
          <p className="step-description">
            Your subdomain is now configured and should be live shortly.
          </p>

          <div className="success-details">
            <div className="detail-item">
              <label>Your Subdomain:</label>
              <a href={success.url} target="_blank" rel="noopener noreferrer" className="subdomain-link">
                {success.subdomain}
              </a>
            </div>
            <div className="detail-item">
              <label>TXT Record:</label>
              <code>{txtValue}</code>
            </div>
            <div className="detail-item">
              <label>A Record:</label>
              <code>{aValue}</code>
            </div>
          </div>

          <div className="info-box">
            <strong>Next Steps:</strong>
            <ol>
              <li>DNS propagation can take a few minutes (usually instant)</li>
              <li>Return to Replit and verify your custom domain</li>
              <li>Your project will be live at <strong>{success.subdomain}</strong></li>
            </ol>
          </div>

          <button type="button" className="btn btn-primary" onClick={resetForm}>
            Connect Another Subdomain
          </button>
        </div>
      )}
    </div>
  );
}

export default SubdomainForm;
