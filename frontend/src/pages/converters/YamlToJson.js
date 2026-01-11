import React, { useState } from 'react';
import { FiCopy, FiDownload, FiRefreshCw, FiCode, FiCheck, FiUpload, FiArrowRight } from 'react-icons/fi';
import yaml from 'js-yaml';
import '../ToolPage.css';

function YamlToJson() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const convert = () => {
    setError('');
    if (!input.trim()) {
      setError('Please enter YAML data');
      return;
    }

    try {
      const result = yaml.load(input);
      setOutput(JSON.stringify(result, null, 2));
    } catch (err) {
      setError('Failed to parse YAML: ' + err.message);
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

  const sampleYaml = `# Application Configuration
app:
  name: MyApp
  version: 1.0.0
  debug: true

database:
  host: localhost
  port: 5432

users:
  - name: John Doe
    role: admin
  - name: Jane Smith
    role: user`;

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>
          <span className="icon"><FiCode /></span>
          YAML → JSON Converter
        </h1>
        <p>Convert YAML configuration to JSON format</p>
      </div>

      {/* Top Action Bar */}
      <div className="action-bar">
        <div className="btn-group">
          <label className="btn btn-secondary">
            <FiUpload /> Upload
            <input type="file" accept=".yaml,.yml" onChange={handleFileUpload} hidden />
          </label>
          <button className="btn btn-secondary" onClick={() => setInput(sampleYaml)}>
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
            <h3>YAML Input</h3>
          </div>
          <div className="panel-body">
            <textarea
              className="code-textarea"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your YAML data here..."
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
            <h3>JSON Output</h3>
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

export default YamlToJson;
