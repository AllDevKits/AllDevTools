import React, { useState } from 'react';
import { FiCopy, FiDownload, FiRefreshCw, FiCode, FiCheck } from 'react-icons/fi';
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

    // Remove existing formatting
    js = js.replace(/\s+/g, ' ');
    
    // Add newlines
    js = js.replace(/;/g, ';\n');
    js = js.replace(/\{/g, ' {\n');
    js = js.replace(/\}/g, '\n}\n');
    
    // Format each line with proper indentation
    let formatted = '';
    let indentLevel = 0;
    
    js.split('\n').forEach(line => {
      line = line.trim();
      if (!line) return;
      
      // Decrease indent before closing brace
      if (line.startsWith('}') || line.startsWith(']')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }
      
      formatted += indent.repeat(indentLevel) + line + '\n';
      
      // Increase indent after opening brace
      if (line.endsWith('{') || line.endsWith('[')) {
        indentLevel++;
      }
    });

    // Clean up
    formatted = formatted.replace(/\n{3,}/g, '\n\n');
    
    // Handle semicolons option
    if (!options.semicolons) {
      formatted = formatted.replace(/;$/gm, '');
    }

    setOutput(formatted.trim());
  };

  const minifyJs = () => {
    if (!input.trim()) return;
    
    let js = input;
    // Remove comments
    js = js.replace(/\/\/.*$/gm, '');
    js = js.replace(/\/\*[\s\S]*?\*\//g, '');
    // Remove whitespace
    js = js.replace(/\s+/g, ' ');
    // Remove space around operators
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

  const sampleJs = `function calculateTotal(items){let total=0;items.forEach(item=>{if(item.price&&item.quantity){total+=item.price*item.quantity;}});return total;}const cart=[{name:"Apple",price:1.5,quantity:3},{name:"Banana",price:0.75,quantity:5}];console.log("Total:",calculateTotal(cart));`;

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
            <label>Indent Spaces</label>
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
            <label htmlFor="semicolons">Use semicolons</label>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="action-bar">
        <div className="btn-group">
          <button className="btn btn-primary" onClick={formatJs}>
            Beautify JS
          </button>
          <button className="btn btn-secondary" onClick={minifyJs}>
            Minify JS
          </button>
          <button className="btn btn-secondary" onClick={() => setInput(sampleJs)}>
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

        <div className="panel">
          <div className="panel-header">
            <h3>Formatted Output</h3>
            <div className="btn-group">
              <button className="btn btn-icon" onClick={handleCopy} title="Copy to clipboard">
                {copied ? <FiCheck /> : <FiCopy />}
              </button>
              <button className="btn btn-icon" onClick={handleDownload} title="Download JS">
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
