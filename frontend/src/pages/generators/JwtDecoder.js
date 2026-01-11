import React, { useState, useEffect } from 'react';
import { FiCopy, FiRefreshCw, FiKey, FiCheck, FiAlertCircle, FiClock } from 'react-icons/fi';
import '../ToolPage.css';

function JwtDecoder() {
  const [input, setInput] = useState('');
  const [decoded, setDecoded] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    if (input.trim()) {
      decodeJwt();
    } else {
      setDecoded(null);
      setError('');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  const decodeJwt = () => {
    setError('');
    
    try {
      const parts = input.trim().split('.');
      
      if (parts.length !== 3) {
        setError('Invalid JWT format. JWT should have 3 parts separated by dots.');
        setDecoded(null);
        return;
      }

      const [headerB64, payloadB64, signature] = parts;

      // Decode header
      const header = JSON.parse(atob(headerB64.replace(/-/g, '+').replace(/_/g, '/')));
      
      // Decode payload
      const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));

      // Check expiration
      let isExpired = false;
      let expiresIn = null;
      if (payload.exp) {
        const expDate = new Date(payload.exp * 1000);
        isExpired = expDate < new Date();
        expiresIn = payload.exp * 1000 - Date.now();
      }

      setDecoded({
        header,
        payload,
        signature,
        isExpired,
        expiresIn,
        issuedAt: payload.iat ? new Date(payload.iat * 1000).toLocaleString() : null,
        expiresAt: payload.exp ? new Date(payload.exp * 1000).toLocaleString() : null
      });
    } catch (err) {
      setError('Failed to decode JWT: ' + err.message);
      setDecoded(null);
    }
  };

  const handleCopy = async (content, key) => {
    await navigator.clipboard.writeText(typeof content === 'object' ? JSON.stringify(content, null, 2) : content);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleClear = () => {
    setInput('');
    setDecoded(null);
    setError('');
  };

  const formatTimeRemaining = (ms) => {
    if (ms < 0) return 'Expired';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const sampleJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZW1haWwiOiJqb2huQGV4YW1wbGUuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzA0MDY3MjAwLCJleHAiOjE3MzU2ODk2MDB9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>
          <span className="icon"><FiKey /></span>
          JWT Decoder
        </h1>
        <p>Decode and inspect JSON Web Tokens</p>
      </div>

      {/* Action Bar */}
      <div className="action-bar">
        <div className="btn-group">
          <button className="btn btn-secondary" onClick={() => setInput(sampleJwt)}>
            Load Sample JWT
          </button>
        </div>
        <div className="btn-group">
          <button className="btn btn-icon" onClick={handleClear} title="Clear all">
            <FiRefreshCw />
          </button>
        </div>
      </div>

      {/* Input Panel */}
      <div className="panel">
        <div className="panel-header">
          <h3>JWT Token</h3>
        </div>
        <div className="panel-body">
          <textarea
            className="code-textarea small"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your JWT token here..."
            spellCheck={false}
          />
        </div>
      </div>

      {error && (
        <div className="status-message error" style={{ marginTop: '1rem' }}>
          <FiAlertCircle /> {error}
        </div>
      )}

      {/* Decoded Output */}
      {decoded && (
        <div className="jwt-decoded">
          {/* Status Bar */}
          <div className={`jwt-status ${decoded.isExpired ? 'expired' : 'valid'}`}>
            <FiClock />
            {decoded.isExpired ? (
              <span>Token Expired</span>
            ) : decoded.expiresIn ? (
              <span>Expires in: {formatTimeRemaining(decoded.expiresIn)}</span>
            ) : (
              <span>No expiration set</span>
            )}
          </div>

          {/* Time Info */}
          {(decoded.issuedAt || decoded.expiresAt) && (
            <div className="jwt-times">
              {decoded.issuedAt && (
                <div className="time-item">
                  <span className="time-label">Issued At:</span>
                  <span className="time-value">{decoded.issuedAt}</span>
                </div>
              )}
              {decoded.expiresAt && (
                <div className="time-item">
                  <span className="time-label">Expires At:</span>
                  <span className="time-value">{decoded.expiresAt}</span>
                </div>
              )}
            </div>
          )}

          <div className="jwt-sections">
            {/* Header */}
            <div className="jwt-section">
              <div className="jwt-section-header">
                <span className="jwt-section-title header-color">HEADER</span>
                <button 
                  className="btn btn-icon"
                  onClick={() => handleCopy(decoded.header, 'header')}
                  title="Copy header"
                >
                  {copied === 'header' ? <FiCheck /> : <FiCopy />}
                </button>
              </div>
              <pre className="jwt-section-content header-bg">
                {JSON.stringify(decoded.header, null, 2)}
              </pre>
            </div>

            {/* Payload */}
            <div className="jwt-section">
              <div className="jwt-section-header">
                <span className="jwt-section-title payload-color">PAYLOAD</span>
                <button 
                  className="btn btn-icon"
                  onClick={() => handleCopy(decoded.payload, 'payload')}
                  title="Copy payload"
                >
                  {copied === 'payload' ? <FiCheck /> : <FiCopy />}
                </button>
              </div>
              <pre className="jwt-section-content payload-bg">
                {JSON.stringify(decoded.payload, null, 2)}
              </pre>
            </div>

            {/* Signature */}
            <div className="jwt-section">
              <div className="jwt-section-header">
                <span className="jwt-section-title signature-color">SIGNATURE</span>
                <button 
                  className="btn btn-icon"
                  onClick={() => handleCopy(decoded.signature, 'signature')}
                  title="Copy signature"
                >
                  {copied === 'signature' ? <FiCheck /> : <FiCopy />}
                </button>
              </div>
              <div className="jwt-section-content signature-bg">
                <code className="signature-value">{decoded.signature}</code>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .jwt-decoded {
          margin-top: 1.5rem;
        }
        .jwt-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          font-weight: 500;
          margin-bottom: 1rem;
        }
        .jwt-status.valid {
          background: rgba(16, 185, 129, 0.1);
          color: var(--success);
          border: 1px solid var(--success);
        }
        .jwt-status.expired {
          background: rgba(239, 68, 68, 0.1);
          color: var(--error);
          border: 1px solid var(--error);
        }
        .jwt-times {
          display: flex;
          gap: 2rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }
        .time-item {
          display: flex;
          gap: 0.5rem;
        }
        .time-label {
          color: var(--text-muted);
          font-size: 0.9rem;
        }
        .time-value {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }
        .jwt-sections {
          display: grid;
          gap: 1rem;
        }
        .jwt-section {
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }
        .jwt-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          background: var(--bg-tertiary);
          border-bottom: 1px solid var(--border-primary);
        }
        .jwt-section-title {
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.1em;
        }
        .header-color { color: #ef4444; }
        .payload-color { color: #8b5cf6; }
        .signature-color { color: #06b6d4; }
        .header-bg { border-left: 3px solid #ef4444; }
        .payload-bg { border-left: 3px solid #8b5cf6; }
        .signature-bg { border-left: 3px solid #06b6d4; }
        .jwt-section-content {
          padding: 1rem;
          background: var(--bg-secondary);
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.9rem;
          line-height: 1.6;
          overflow-x: auto;
          margin: 0;
          white-space: pre-wrap;
          word-break: break-all;
        }
        .signature-value {
          color: var(--text-secondary);
          word-break: break-all;
        }
      `}</style>
    </div>
  );
}

export default JwtDecoder;
