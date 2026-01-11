import React, { useState } from 'react';
import { FiCopy, FiDownload, FiRefreshCw, FiCode, FiCheck, FiMaximize2, FiMinimize2 } from 'react-icons/fi';
import '../ToolPage.css';

function JsFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState({
    indent: 2,
    semicolons: true
  });

  const formatJs = () => {
    if (!input.trim()) return;

    const indent = ' '.repeat(options.indent);
    let js = input;

    js = js.replace(/\s+/g, ' ');
    js = js.replace(/;/g, ';\n');
    js = js.replace(/\{/g, ' {\n');
    js = js.replace(/\}/g, '\n}\n');
    
    let formatted = '';
    let indentLevel = 0;
    
    js.split('\n').forEach(line => {
      line = line.trim();
      if (!line) return;
      
      if (line.startsWith('}') || line.startsWith(']')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }
      
      formatted += indent.repeat(indentLevel) + line + '\n';
      
      if (line.endsWith('{') || line.endsWith('[')) {
        indentLevel++;
      }
    });

    formatted = formatted.replace(/\n{3,}/g, '\n\n');
    
    if (!options.semicolons) {
      formatted = formatted.replace(/;$/gm, '');
    }

    setOutput(formatted.trim());
  };

  const minifyJs = () => {
    if (!input.trim()) return;
    let js = input;
    js = js.replace(/\/\/.*$/gm, '');
    js = js.replace(/\/\*[\s\S]*?\*\//g, '');
    js = js.replace(/\s+/g, ' ');
    js = js.replace(/\s*([{}();,:])\s*/g, '$1');
    js = js.replace(/\s*=\s*/g, '=');
    setOutput(js.trim());
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.js';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
  };

  const sampleJs = `function hello(name){const msg="Hello, "+name;console.log(msg);return msg;}const result=hello("World");`;

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>
          <span className="icon"><FiCode /></span>
          JavaScript Formatter
        </h1>
        <p>Format and beautify your JavaScript code</p>
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
              id="semicolons"
              checked={options.semicolons}
              onChange={(e) => setOptions({ ...options, semicolons: e.target.checked })}
            />
            <label htmlFor="semicolons">Semicolons</label>
          </div>
        </div>
      </div>

      {/* Top Action Bar */}
      <div className="action-bar">
        <div className="btn-group">
          <button className="btn btn-secondary" onClick={() => setInput(sampleJs)}>
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
            <h3>JavaScript Input</h3>
          </div>
          <div className="panel-body">
            <textarea
              className="code-textarea"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your JavaScript code here..."
              spellCheck={false}
            />
          </div>
        </div>

        {/* Format Buttons in Middle */}
        <div className="convert-button-middle">
          <button className="btn-convert" onClick={formatJs}>
            <FiMaximize2 />
            Beautify
          </button>
          <button className="btn-secondary-small" onClick={minifyJs}>
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
              placeholder="Formatted JavaScript will appear here..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default JsFormatter;
