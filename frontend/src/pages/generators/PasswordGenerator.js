import React, { useState, useEffect } from 'react';
import { FiCopy, FiRefreshCw, FiLock, FiCheck, FiEye, FiEyeOff } from 'react-icons/fi';
import '../ToolPage.css';

function PasswordGenerator() {
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(true);
  const [strength, setStrength] = useState({ score: 0, label: '', color: '' });
  const [options, setOptions] = useState({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeSimilar: false,
    excludeAmbiguous: false
  });

  useEffect(() => {
    generatePassword();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generatePassword = () => {
    let chars = '';
    
    if (options.lowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (options.uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (options.numbers) chars += '0123456789';
    if (options.symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    if (options.excludeSimilar) {
      chars = chars.replace(/[ilLI|`oO0]/g, '');
    }
    
    if (options.excludeAmbiguous) {
      chars = chars.replace(/[{}[\]()/\\'"~,;.<>]/g, '');
    }

    if (!chars) {
      setPassword('Select at least one character type');
      return;
    }

    let result = '';
    const array = new Uint32Array(options.length);
    crypto.getRandomValues(array);
    
    for (let i = 0; i < options.length; i++) {
      result += chars[array[i] % chars.length];
    }

    setPassword(result);
    calculateStrength(result);
  };

  const calculateStrength = (pwd) => {
    let score = 0;
    
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (pwd.length >= 16) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;
    if (pwd.length >= 20) score++;

    const levels = [
      { min: 0, label: 'Very Weak', color: '#ef4444' },
      { min: 2, label: 'Weak', color: '#f97316' },
      { min: 4, label: 'Fair', color: '#f59e0b' },
      { min: 6, label: 'Strong', color: '#10b981' },
      { min: 7, label: 'Very Strong', color: '#22c55e' },
    ];

    const level = levels.reverse().find(l => score >= l.min) || levels[0];
    setStrength({ score: Math.min(score, 8), label: level.label, color: level.color });
  };

  const handleCopy = async () => {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>
          <span className="icon"><FiLock /></span>
          Secure Password Generator
        </h1>
        <p>Generate cryptographically secure passwords</p>
      </div>

      {/* Password Display */}
      <div className="password-display">
        <div className="password-field">
          <span className={`password-value ${showPassword ? '' : 'hidden'}`}>
            {showPassword ? password : '•'.repeat(password.length)}
          </span>
          <div className="password-actions">
            <button 
              className="btn btn-icon" 
              onClick={() => setShowPassword(!showPassword)}
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
            <button className="btn btn-icon" onClick={handleCopy} title="Copy to clipboard">
              {copied ? <FiCheck /> : <FiCopy />}
            </button>
            <button className="btn btn-icon" onClick={generatePassword} title="Generate new">
              <FiRefreshCw />
            </button>
          </div>
        </div>
        
        {/* Strength Indicator */}
        <div className="strength-indicator">
          <div className="strength-bar">
            <div 
              className="strength-fill" 
              style={{ 
                width: `${(strength.score / 8) * 100}%`,
                backgroundColor: strength.color 
              }}
            />
          </div>
          <span className="strength-label" style={{ color: strength.color }}>
            {strength.label}
          </span>
        </div>
      </div>

      {/* Options Panel */}
      <div className="options-panel">
        <div className="options-grid" style={{ display: 'block' }}>
          {/* Length Slider */}
          <div className="range-group" style={{ marginBottom: '1.5rem' }}>
            <label>
              <span>Password Length</span>
              <span style={{ 
                background: 'var(--accent-primary)', 
                color: 'white',
                padding: '0.2rem 0.5rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                fontWeight: 600
              }}>
                {options.length}
              </span>
            </label>
            <input
              type="range"
              min="4"
              max="64"
              value={options.length}
              onChange={(e) => {
                const newOptions = { ...options, length: parseInt(e.target.value) };
                setOptions(newOptions);
              }}
              onMouseUp={generatePassword}
              onTouchEnd={generatePassword}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>4</span>
              <span>64</span>
            </div>
          </div>

          {/* Character Options */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="uppercase"
                checked={options.uppercase}
                onChange={(e) => setOptions({ ...options, uppercase: e.target.checked })}
              />
              <label htmlFor="uppercase">Uppercase (A-Z)</label>
            </div>
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="lowercase"
                checked={options.lowercase}
                onChange={(e) => setOptions({ ...options, lowercase: e.target.checked })}
              />
              <label htmlFor="lowercase">Lowercase (a-z)</label>
            </div>
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="numbers"
                checked={options.numbers}
                onChange={(e) => setOptions({ ...options, numbers: e.target.checked })}
              />
              <label htmlFor="numbers">Numbers (0-9)</label>
            </div>
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="symbols"
                checked={options.symbols}
                onChange={(e) => setOptions({ ...options, symbols: e.target.checked })}
              />
              <label htmlFor="symbols">Symbols (!@#$%...)</label>
            </div>
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="excludeSimilar"
                checked={options.excludeSimilar}
                onChange={(e) => setOptions({ ...options, excludeSimilar: e.target.checked })}
              />
              <label htmlFor="excludeSimilar">Exclude similar (i, l, 1, L, o, 0, O)</label>
            </div>
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="excludeAmbiguous"
                checked={options.excludeAmbiguous}
                onChange={(e) => setOptions({ ...options, excludeAmbiguous: e.target.checked })}
              />
              <label htmlFor="excludeAmbiguous">Exclude ambiguous ({`{ } [ ] ( ) / \\ ' " ~`})</label>
            </div>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <button className="btn btn-primary btn-lg" onClick={generatePassword} style={{ width: '100%', marginTop: '1rem' }}>
        <FiRefreshCw /> Generate New Password
      </button>

      <style>{`
        .password-display {
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .password-field {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .password-value {
          font-family: 'JetBrains Mono', monospace;
          font-size: 1.25rem;
          color: var(--text-primary);
          word-break: break-all;
          flex: 1;
        }
        .password-value.hidden {
          letter-spacing: 0.2em;
        }
        .password-actions {
          display: flex;
          gap: 0.5rem;
          flex-shrink: 0;
        }
        .strength-indicator {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .strength-bar {
          flex: 1;
          height: 8px;
          background: var(--bg-tertiary);
          border-radius: 4px;
          overflow: hidden;
        }
        .strength-fill {
          height: 100%;
          border-radius: 4px;
          transition: all 0.3s ease;
        }
        .strength-label {
          font-size: 0.85rem;
          font-weight: 600;
          min-width: 100px;
          text-align: right;
        }
        .btn-lg {
          padding: 1rem 2rem;
          font-size: 1rem;
        }
      `}</style>
    </div>
  );
}

export default PasswordGenerator;
