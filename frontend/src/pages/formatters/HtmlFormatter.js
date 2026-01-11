import React, { useState } from 'react';
import { FiCopy, FiDownload, FiRefreshCw, FiCode, FiCheck, FiMaximize2, FiMinimize2 } from 'react-icons/fi';
import '../ToolPage.css';

function HtmlFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState({
    indent: 2
  });

  const formatHtml = () => {
    if (!input.trim()) return;

    const indent = ' '.repeat(options.indent);
    let formatted = '';
    let indentLevel = 0;
    
    const selfClosing = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];

    let html = input.replace(/>\s+</g, '><').trim();
    html = html.replace(/</g, '\n<');
    
    const lines = html.split('\n').filter(line => line.trim());
    
    lines.forEach((line) => {
      line = line.trim();
      if (!line) return;
      
      const closingMatch = line.match(/^<\/(\w+)/);
      const openingMatch = line.match(/^<(\w+)/);
      const selfClosingMatch = line.match(/\/>$/);
      
      if (closingMatch) {
        indentLevel = Math.max(0, indentLevel - 1);
        formatted += indent.repeat(indentLevel) + line + '\n';
      } else if (openingMatch) {
        const tagName = openingMatch[1].toLowerCase();
        formatted += indent.repeat(indentLevel) + line + '\n';
        
        if (!selfClosing.includes(tagName) && !selfClosingMatch && !line.includes(`</${tagName}>`)) {
          indentLevel++;
        }
      } else {
        formatted += indent.repeat(indentLevel) + line + '\n';
      }
    });

    formatted = formatted.replace(/\n{3,}/g, '\n\n');
    setOutput(formatted.trim());
  };

  const minifyHtml = () => {
    if (!input.trim()) return;
    let html = input;
    html = html.replace(/<!--[\s\S]*?-->/g, '');
    html = html.replace(/>\s+</g, '><');
    html = html.replace(/^\s+|\s+$/gm, '');
    html = html.replace(/\s{2,}/g, ' ');
    setOutput(html.trim());
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
  };

  const sampleHtml = `<!DOCTYPE html><html><head><title>Test</title></head><body><div><h1>Hello</h1><p>World</p></div></body></html>`;

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>
          <span className="icon"><FiCode /></span>
          HTML Formatter
        </h1>
        <p>Format and beautify your HTML code</p>
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
        </div>
      </div>

      {/* Top Action Bar */}
      <div className="action-bar">
        <div className="btn-group">
          <button className="btn btn-secondary" onClick={() => setInput(sampleHtml)}>
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
            <h3>HTML Input</h3>
          </div>
          <div className="panel-body">
            <textarea
              className="code-textarea"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your HTML code here..."
              spellCheck={false}
            />
          </div>
        </div>

        {/* Format Buttons in Middle */}
        <div className="convert-button-middle">
          <button className="btn-convert" onClick={formatHtml}>
            <FiMaximize2 />
            Beautify
          </button>
          <button className="btn-secondary-small" onClick={minifyHtml}>
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
              placeholder="Formatted HTML will appear here..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default HtmlFormatter;
