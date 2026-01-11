import React, { useState } from 'react';
import { FiCopy, FiDownload, FiRefreshCw, FiCode, FiCheck, FiUpload, FiMinimize2, FiMaximize2 } from 'react-icons/fi';
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
      
      // Calculate stats
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

  const sampleJson = `{"users":[{"id":1,"name":"John Doe","email":"john@example.com","address":{"city":"New York","country":"USA"}},{"id":2,"name":"Jane Smith","email":"jane@example.com","address":{"city":"London","country":"UK"}}],"metadata":{"total":2,"page":1}}`;

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>
          <span className="icon"><FiCode /></span>
          JSON Formatter & Validator
        </h1>
        <p>Format, validate, and beautify your JSON data</p>
      </div>

      {/* Options Panel */}
      <div className="options-panel">
        <div className="options-grid">
          <div className="option-group">
            <label>Indent Spaces</label>
            <select value={options.indent} onChange={(e) => setOptions({ ...options, indent: parseInt(e.target.value) })}>
              <option value="2">2 spaces</option>
              <option value="4">4 spaces</option>
              <option value="8">8 spaces</option>
            </select>
          </div>
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="sortKeys"
              checked={options.sortKeys}
              onChange={(e) => setOptions({ ...options, sortKeys: e.target.checked })}
            />
            <label htmlFor="sortKeys">Sort keys alphabetically</label>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="action-bar">
        <div className="btn-group">
          <button className="btn btn-primary" onClick={() => formatJson(false)}>
            <FiMaximize2 /> Beautify
          </button>
          <button className="btn btn-secondary" onClick={() => formatJson(true)}>
            <FiMinimize2 /> Minify
          </button>
          <label className="btn btn-secondary">
            <FiUpload /> Upload JSON
            <input type="file" accept=".json" onChange={handleFileUpload} hidden />
          </label>
          <button className="btn btn-secondary" onClick={() => setInput(sampleJson)}>
            Load Sample
          </button>
        </div>
        <div className="btn-group">
          <button className="btn btn-icon" onClick={handleClear} title="Clear all">
            <FiRefreshCw />
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      {stats && (
        <div className="status-message info" style={{ marginBottom: '1rem', marginTop: 0 }}>
          ✓ Valid JSON | Type: {stats.type} | Keys: {stats.keys} | Size: {stats.size} bytes
        </div>
      )}

      {/* Content Area */}
      <div className="tool-content">
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

        <div className="panel">
          <div className="panel-header">
            <h3>Formatted Output</h3>
            <div className="btn-group">
              <button className="btn btn-icon" onClick={handleCopy} title="Copy to clipboard">
                {copied ? <FiCheck /> : <FiCopy />}
              </button>
              <button className="btn btn-icon" onClick={handleDownload} title="Download JSON">
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
