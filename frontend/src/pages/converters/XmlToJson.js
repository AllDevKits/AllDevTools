import React, { useState } from 'react';
import { FiCopy, FiDownload, FiRefreshCw, FiCode, FiCheck, FiUpload } from 'react-icons/fi';
import '../ToolPage.css';

function XmlToJson() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const xmlToJson = (xml) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');
    
    // Check for parse errors
    const parseError = doc.querySelector('parsererror');
    if (parseError) {
      throw new Error('Invalid XML: ' + parseError.textContent);
    }

    const convertNode = (node) => {
      const obj = {};
      
      // Handle attributes
      if (node.attributes && node.attributes.length > 0) {
        obj['@attributes'] = {};
        for (let i = 0; i < node.attributes.length; i++) {
          const attr = node.attributes[i];
          obj['@attributes'][attr.name] = attr.value;
        }
      }
      
      // Handle child nodes
      if (node.childNodes && node.childNodes.length > 0) {
        for (let i = 0; i < node.childNodes.length; i++) {
          const child = node.childNodes[i];
          
          if (child.nodeType === 1) { // Element node
            const childName = child.nodeName;
            const childValue = convertNode(child);
            
            if (obj[childName]) {
              if (!Array.isArray(obj[childName])) {
                obj[childName] = [obj[childName]];
              }
              obj[childName].push(childValue);
            } else {
              obj[childName] = childValue;
            }
          } else if (child.nodeType === 3) { // Text node
            const text = child.textContent.trim();
            if (text) {
              if (Object.keys(obj).length === 0) {
                return text;
              }
              obj['#text'] = text;
            }
          }
        }
      }
      
      return Object.keys(obj).length === 0 ? '' : obj;
    };

    return convertNode(doc.documentElement);
  };

  const convert = () => {
    setError('');
    if (!input.trim()) {
      setError('Please enter XML data');
      return;
    }

    try {
      const result = xmlToJson(input);
      setOutput(JSON.stringify(result, null, 2));
    } catch (err) {
      setError(err.message);
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

  const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<users>
  <user id="1">
    <name>John Doe</name>
    <email>john@example.com</email>
    <age>28</age>
  </user>
  <user id="2">
    <name>Jane Smith</name>
    <email>jane@example.com</email>
    <age>34</age>
  </user>
</users>`;

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>
          <span className="icon"><FiCode /></span>
          XML → JSON Converter
        </h1>
        <p>Convert XML data to JSON format</p>
      </div>

      {/* Action Bar */}
      <div className="action-bar">
        <div className="btn-group">
          <button className="btn btn-primary" onClick={convert}>
            Convert to JSON
          </button>
          <label className="btn btn-secondary">
            <FiUpload /> Upload XML
            <input type="file" accept=".xml" onChange={handleFileUpload} hidden />
          </label>
          <button className="btn btn-secondary" onClick={() => setInput(sampleXml)}>
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
            <h3>XML Input</h3>
          </div>
          <div className="panel-body">
            <textarea
              className="code-textarea"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your XML data here..."
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

export default XmlToJson;
