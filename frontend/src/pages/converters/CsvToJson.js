import React, { useState } from 'react';
import { FiCopy, FiDownload, FiRefreshCw, FiFileText, FiCheck, FiUpload } from 'react-icons/fi';
import Papa from 'papaparse';
import '../ToolPage.css';

function CsvToJson() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState({
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true
  });

  const convert = () => {
    setError('');
    if (!input.trim()) {
      setError('Please enter CSV data');
      return;
    }

    try {
      const result = Papa.parse(input, {
        header: options.header,
        skipEmptyLines: options.skipEmptyLines,
        dynamicTyping: options.dynamicTyping
      });

      if (result.errors.length > 0) {
        setError(result.errors[0].message);
        return;
      }

      setOutput(JSON.stringify(result.data, null, 2));
    } catch (err) {
      setError('Failed to parse CSV: ' + err.message);
    }
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
    a.download = 'converted.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setInput(e.target.result);
      reader.readAsText(file);
    }
  };

  const sampleCsv = `name,age,email,active
John Doe,28,john@example.com,true
Jane Smith,34,jane@example.com,true
Bob Johnson,45,bob@example.com,false`;

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>
          <span className="icon"><FiFileText /></span>
          CSV → JSON Converter
        </h1>
        <p>Convert CSV data to JSON format instantly</p>
      </div>

      {/* Options Panel */}
      <div className="options-panel">
        <div className="options-grid">
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="header"
              checked={options.header}
              onChange={(e) => setOptions({ ...options, header: e.target.checked })}
            />
            <label htmlFor="header">First row is header</label>
          </div>
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="skipEmpty"
              checked={options.skipEmptyLines}
              onChange={(e) => setOptions({ ...options, skipEmptyLines: e.target.checked })}
            />
            <label htmlFor="skipEmpty">Skip empty lines</label>
          </div>
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="dynamicTyping"
              checked={options.dynamicTyping}
              onChange={(e) => setOptions({ ...options, dynamicTyping: e.target.checked })}
            />
            <label htmlFor="dynamicTyping">Auto-detect types</label>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="action-bar">
        <div className="btn-group">
          <button className="btn btn-primary" onClick={convert}>
            Convert to JSON
          </button>
          <label className="btn btn-secondary">
            <FiUpload /> Upload CSV
            <input type="file" accept=".csv" onChange={handleFileUpload} hidden />
          </label>
          <button className="btn btn-secondary" onClick={() => setInput(sampleCsv)}>
            Load Sample
          </button>
        </div>
        <div className="btn-group">
          <button className="btn btn-icon" onClick={handleClear} title="Clear all">
            <FiRefreshCw />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="tool-content">
        <div className="panel">
          <div className="panel-header">
            <h3>CSV Input</h3>
          </div>
          <div className="panel-body">
            <textarea
              className="code-textarea"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your CSV data here..."
              spellCheck={false}
            />
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>JSON Output</h3>
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
              placeholder="JSON output will appear here..."
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

export default CsvToJson;
