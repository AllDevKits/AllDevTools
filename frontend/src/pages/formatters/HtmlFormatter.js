import React, { useState } from 'react';
import { FiCopy, FiDownload, FiRefreshCw, FiCode, FiCheck } from 'react-icons/fi';
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
    
    // Self-closing tags
    const selfClosing = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
    
    // Inline tags
    const inlineTags = ['a', 'abbr', 'b', 'bdo', 'br', 'button', 'cite', 'code', 'dfn', 'em', 'i', 'img', 'input', 'kbd', 'label', 'map', 'object', 'output', 'q', 'samp', 'script', 'select', 'small', 'span', 'strong', 'sub', 'sup', 'textarea', 'time', 'var'];

    // Remove existing formatting
    let html = input.replace(/>\s+</g, '><').trim();
    
    // Add markers for processing
    html = html.replace(/</g, '\n<');
    
    const lines = html.split('\n').filter(line => line.trim());
    
    lines.forEach((line) => {
      line = line.trim();
      if (!line) return;
      
      // Check if it's a closing tag
      const closingMatch = line.match(/^<\/(\w+)/);
      const openingMatch = line.match(/^<(\w+)/);
      const selfClosingMatch = line.match(/\/>$/);
      
      if (closingMatch) {
        indentLevel = Math.max(0, indentLevel - 1);
        formatted += indent.repeat(indentLevel) + line + '\n';
      } else if (openingMatch) {
        const tagName = openingMatch[1].toLowerCase();
        formatted += indent.repeat(indentLevel) + line + '\n';
        
        // Only increase indent if not self-closing and not inline
        if (!selfClosing.includes(tagName) && !selfClosingMatch && !line.includes(`</${tagName}>`)) {
          indentLevel++;
        }
      } else {
        formatted += indent.repeat(indentLevel) + line + '\n';
      }
    });

    setOutput(formatted.trim());
  };

  const minifyHtml = () => {
    if (!input.trim()) return;
    
    let html = input;
    // Remove comments
    html = html.replace(/<!--[\s\S]*?-->/g, '');
    // Remove whitespace between tags
    html = html.replace(/>\s+</g, '><');
    // Remove leading/trailing whitespace
    html = html.replace(/^\s+|\s+$/gm, '');
    // Collapse multiple spaces
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

  const sampleHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Document</title></head><body><header><nav><ul><li><a href="#">Home</a></li><li><a href="#">About</a></li></ul></nav></header><main><article><h1>Hello World</h1><p>This is a <strong>sample</strong> HTML document.</p></article></main><footer><p>&copy; 2024</p></footer></body></html>`;

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
            <label>Indent Spaces</label>
            <select value={options.indent} onChange={(e) => setOptions({ ...options, indent: parseInt(e.target.value) })}>
              <option value="2">2 spaces</option>
              <option value="4">4 spaces</option>
            </select>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="action-bar">
        <div className="btn-group">
          <button className="btn btn-primary" onClick={formatHtml}>
            Beautify HTML
          </button>
          <button className="btn btn-secondary" onClick={minifyHtml}>
            Minify HTML
          </button>
          <button className="btn btn-secondary" onClick={() => setInput(sampleHtml)}>
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

        <div className="panel">
          <div className="panel-header">
            <h3>Formatted Output</h3>
            <div className="btn-group">
              <button className="btn btn-icon" onClick={handleCopy} title="Copy to clipboard">
                {copied ? <FiCheck /> : <FiCopy />}
              </button>
              <button className="btn btn-icon" onClick={handleDownload} title="Download HTML">
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
