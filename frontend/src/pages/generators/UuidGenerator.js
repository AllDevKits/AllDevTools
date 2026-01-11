import React, { useState } from 'react';
import { FiCopy, FiRefreshCw, FiHash, FiCheck, FiTrash2, FiPlus } from 'react-icons/fi';
import { v4 as uuidv4 } from 'uuid';
import '../ToolPage.css';

function UuidGenerator() {
  const [uuids, setUuids] = useState([uuidv4()]);
  const [copied, setCopied] = useState(null);
  const [options, setOptions] = useState({
    count: 5,
    uppercase: false,
    noDashes: false
  });

  const generateUuids = () => {
    const newUuids = [];
    for (let i = 0; i < options.count; i++) {
      let uuid = uuidv4();
      if (options.uppercase) uuid = uuid.toUpperCase();
      if (options.noDashes) uuid = uuid.replace(/-/g, '');
      newUuids.push(uuid);
    }
    setUuids(newUuids);
  };

  const generateOne = () => {
    let uuid = uuidv4();
    if (options.uppercase) uuid = uuid.toUpperCase();
    if (options.noDashes) uuid = uuid.replace(/-/g, '');
    setUuids([uuid, ...uuids]);
  };

  const handleCopy = async (uuid, index) => {
    await navigator.clipboard.writeText(uuid);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleCopyAll = async () => {
    await navigator.clipboard.writeText(uuids.join('\n'));
    setCopied('all');
    setTimeout(() => setCopied(null), 2000);
  };

  const removeUuid = (index) => {
    setUuids(uuids.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setUuids([]);
  };

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>
          <span className="icon"><FiHash /></span>
          UUID / GUID Generator
        </h1>
        <p>Generate unique identifiers instantly (UUID v4)</p>
      </div>

      {/* Options Panel */}
      <div className="options-panel">
        <div className="options-grid">
          <div className="option-group">
            <label>Bulk Generate Count</label>
            <input
              type="number"
              min="1"
              max="100"
              value={options.count}
              onChange={(e) => setOptions({ ...options, count: parseInt(e.target.value) || 1 })}
            />
          </div>
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="uppercase"
              checked={options.uppercase}
              onChange={(e) => setOptions({ ...options, uppercase: e.target.checked })}
            />
            <label htmlFor="uppercase">UPPERCASE</label>
          </div>
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="noDashes"
              checked={options.noDashes}
              onChange={(e) => setOptions({ ...options, noDashes: e.target.checked })}
            />
            <label htmlFor="noDashes">Remove dashes</label>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="action-bar">
        <div className="btn-group">
          <button className="btn btn-primary" onClick={generateOne}>
            <FiPlus /> Generate One
          </button>
          <button className="btn btn-secondary" onClick={generateUuids}>
            <FiRefreshCw /> Generate {options.count}
          </button>
          <button className="btn btn-secondary" onClick={handleCopyAll} disabled={uuids.length === 0}>
            {copied === 'all' ? <FiCheck /> : <FiCopy />} Copy All
          </button>
        </div>
        <div className="btn-group">
          <button className="btn btn-icon" onClick={clearAll} title="Clear all">
            <FiTrash2 />
          </button>
        </div>
      </div>

      {/* UUIDs List */}
      <div className="panel">
        <div className="panel-header">
          <h3>Generated UUIDs ({uuids.length})</h3>
        </div>
        <div className="panel-body">
          {uuids.length === 0 ? (
            <div className="empty-state">
              <p>No UUIDs generated yet. Click "Generate One" to start!</p>
            </div>
          ) : (
            <div className="uuid-list">
              {uuids.map((uuid, index) => (
                <div key={index} className="uuid-item">
                  <span className="uuid-value">{uuid}</span>
                  <div className="uuid-actions">
                    <button 
                      className="btn btn-icon" 
                      onClick={() => handleCopy(uuid, index)}
                      title="Copy to clipboard"
                    >
                      {copied === index ? <FiCheck /> : <FiCopy />}
                    </button>
                    <button 
                      className="btn btn-icon" 
                      onClick={() => removeUuid(index)}
                      title="Remove"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="panel" style={{ marginTop: '1.5rem' }}>
        <div className="panel-header">
          <h3>About UUID v4</h3>
        </div>
        <div className="panel-body">
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            UUID (Universally Unique Identifier) v4 generates random identifiers using 
            cryptographically secure random numbers. Each UUID is 128 bits (16 bytes) and 
            is typically displayed as 32 hexadecimal characters separated by hyphens.
          </p>
          <div className="uuid-format" style={{ marginTop: '1rem' }}>
            <code style={{ 
              display: 'block',
              padding: '1rem', 
              background: 'var(--bg-secondary)', 
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-accent)'
            }}>
              xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
            </code>
            <p style={{ 
              marginTop: '0.5rem', 
              fontSize: '0.85rem', 
              color: 'var(--text-muted)' 
            }}>
              The '4' indicates UUID version 4. 'y' is 8, 9, A, or B.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .uuid-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .uuid-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
        }
        .uuid-item:hover {
          border-color: var(--accent-primary);
        }
        .uuid-value {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.95rem;
          color: var(--text-primary);
          word-break: break-all;
        }
        .uuid-actions {
          display: flex;
          gap: 0.5rem;
          margin-left: 1rem;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}

export default UuidGenerator;
