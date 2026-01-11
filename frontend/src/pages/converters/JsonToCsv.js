import React, { useState } from 'react';
import { FiCopy, FiDownload, FiRefreshCw, FiFileText, FiCheck, FiUpload, FiArrowRight } from 'react-icons/fi';
import Papa from 'papaparse';
import '../ToolPage.css';

function JsonToCsv() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState({
    header: true,
    delimiter: ','
  });

  const convert = () => {
    setError('');
    if (!input.trim()) {
      setError('Please enter JSON data');
      return;
    }

    try {
      const data = JSON.parse(input);
      
      if (!Array.isArray(data)) {
        setError('JSON must be an array of objects');
        return;
      }

      const csv = Papa.unparse(data, {
        header: options.header,
        delimiter: options.delimiter
      });

      setOutput(csv);
    } catch (err) {
      setError('Failed to parse JSON: ' + err.message);
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
    const blob = new Blob([output], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted.csv';
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

  const sampleJson = `[
  { "name": "John Doe", "age": 28, "email": "john@example.com" },
  { "name": "Jane Smith", "age": 34, "email": "jane@example.com" },
  { "name": "Bob Johnson", "age": 45, "email": "bob@example.com" }
]`;

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>
          <span className="icon"><FiFileText /></span>
          JSON → CSV Converter
        </h1>
        <p>Convert JSON array data to CSV format</p>
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
            <label htmlFor="header">Include header row</label>
          </div>
          <div className="option-group">
            <label htmlFor="delimiter">Delimiter</label>
            <select
              id="delimiter"
              value={options.delimiter}
              onChange={(e) => setOptions({ ...options, delimiter: e.target.value })}
            >
              <option value=",">Comma (,)</option>
              <option value=";">Semicolon (;)</option>
              <option value="\t">Tab</option>
              <option value="|">Pipe (|)</option>
            </select>
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
              placeholder="Paste your JSON array here..."
              spellCheck={false}
            />
          </div>
        </div>

        {/* Convert Button in Middle */}
        <div className="convert-button-middle">
          <button className="btn-convert" onClick={convert}>
            <FiArrowRight />
            Convert
          </button>
        </div>

        {/* Output Panel */}
        <div className="panel">
          <div className="panel-header">
            <h3>CSV Output</h3>
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
              placeholder="CSV output will appear here..."
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

export default JsonToCsv;
