import React, { useState } from 'react';
import { FiCopy, FiDownload, FiRefreshCw, FiCode, FiCheck, FiUpload, FiMaximize2, FiMinimize2 } from 'react-icons/fi';
import '../ToolPage.css';

function JsonFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState(null);
  const [options, setOptions] = useState({
    indent: 2,
    sortKeys: false
  });

  const formatJson = (minify = false) => {
    setError('');
    setStats(null);
    
    if (!input.trim()) {
      setError('Please enter JSON data');
      return;
    }

    try {
      const parsed = JSON.parse(input);
      
      const keyCount = countKeys(parsed);
      setStats({
        keys: keyCount,
        size: new Blob([input]).size,
        type: Array.isArray(parsed) ? 'Array' : 'Object'
      });

      let result;
      if (minify) {
        result = JSON.stringify(parsed);
      } else {
        if (options.sortKeys) {
          result = JSON.stringify(sortObjectKeys(parsed), null, options.indent);
        } else {
          result = JSON.stringify(parsed, null, options.indent);
        }
      }
      setOutput(result);
    } catch (err) {
      setError('Invalid JSON: ' + err.message);
    }
  };

  const countKeys = (obj) => {
    if (typeof obj !== 'object' || obj === null) return 0;
    let count = 0;
    if (Array.isArray(obj)) {
      obj.forEach(item => count += countKeys(item));
    } else {
      count = Object.keys(obj).length;
      Object.values(obj).forEach(val => count += countKeys(val));
    }
    return count;
  };

  const sortObjectKeys = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;
    if (Array.isArray(obj)) return obj.map(sortObjectKeys);
    return Object.keys(obj).sort().reduce((acc, key) => {
      acc[key] = sortObjectKeys(obj[key]);
      return acc;
    }, {});
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
    setStats(null);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setInput(e.target.result);
      reader.readAsText(file);
    }
  };

  const sampleJson = `{"users":[{"id":1,"name":"John Doe","email":"john@example.com"},{"id":2,"name":"Jane Smith","email":"jane@example.com"}],"total":2}`;

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>
          <span className="icon"><FiCode /></span>
          JSON Formatter & Validator
        </h1>
        <p>Format, validate, and beautify your JSON data with advanced features</p>
      </div>

      {/* Tool Description */}
      <div className="tool-description">
        <div className="description-content">
          <h3>Key Features:</h3>
          <ul>
            <li><strong>Validation:</strong> Instantly check if your JSON is syntactically correct</li>
            <li><strong>Beautification:</strong> Format compressed JSON with proper indentation and spacing</li>
            <li><strong>Minification:</strong> Compress JSON to reduce file size</li>
            <li><strong>Key Sorting:</strong> Alphabetically sort object keys for consistency</li>
            <li><strong>Statistics:</strong> Get insights about your JSON structure and size</li>
            <li><strong>File Support:</strong> Upload JSON files directly or paste content</li>
          </ul>
        </div>
      </div>

      {/* Options Panel */}
      <div className="options-panel">
        <div className="options-grid">
          <div className="option-group">
            <label>Indent</label>
            <select value={options.indent} onChange={(e) => setOptions({ ...options, indent: parseInt(e.target.value) })}>
              <option value="2">2 spaces</option>
              <option value="4">4 spaces</option>
            </select>
          </div>
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="sortKeys"
              checked={options.sortKeys}
              onChange={(e) => setOptions({ ...options, sortKeys: e.target.checked })}
            />
            <label htmlFor="sortKeys">Sort keys</label>
          </div>
        </div>
      </div>

      {/* Top Action Bar */}
      <div className="action-bar">
        <div className="btn-group">
          <label className="btn btn-secondary">
            <FiUpload /> Upload
            <input type="file" accept=".json" onChange={handleFileUpload} hidden />
          </label>
          <button className="btn btn-secondary" onClick={() => setInput(sampleJson)}>
            Sample
          </button>
        </div>
        <div className="btn-group">
          <button className="btn btn-icon" onClick={handleClear} title="Clear all">
            <FiRefreshCw />
          </button>
        </div>
      </div>

      {stats && (
        <div className="status-message info" style={{ marginBottom: '0.75rem', marginTop: 0 }}>
          ✓ Valid JSON | {stats.type} | {stats.keys} keys | {stats.size} bytes
        </div>
      )}

      {/* Side by Side Layout */}
      <div className="tool-content-horizontal">
        {/* Input Panel */}
        <div className="panel">
          <div className="panel-header">
            <h3>JSON Input</h3>
          </div>
          <div className="panel-body">
            <textarea
              className="code-textarea"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your JSON here..."
              spellCheck={false}
            />
          </div>
        </div>

        {/* Format Buttons in Middle */}
        <div className="convert-button-middle">
          <button className="btn-convert" onClick={() => formatJson(false)}>
            <FiMaximize2 />
            Beautify
          </button>
          <button className="btn-secondary-small" onClick={() => formatJson(true)}>
            <FiMinimize2 /> Minify
          </button>
        </div>

        {/* Output Panel */}
        <div className="panel">
          <div className="panel-header">
            <h3>Output</h3>
            <div className="btn-group">
              <button className="btn btn-icon" onClick={handleCopy} title="Copy">
                {copied ? <FiCheck /> : <FiCopy />}
              </button>
              <button className="btn btn-icon" onClick={handleDownload} title="Download">
                <FiDownload />
              </button>
            </div>
          </div>
          <div className="panel-body">
            <textarea
              className="code-textarea"
              value={output}
              readOnly
              placeholder="Formatted JSON will appear here..."
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="status-message error">
          {error}
        </div>
      )}
    </div>
  );
}

export default JsonFormatter;
