import React, { useState } from 'react';
import { FiCopy, FiDownload, FiRefreshCw, FiLayout, FiCheck } from 'react-icons/fi';
import '../ToolPage.css';

function CssFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState({
    indent: 2
  });

  const formatCss = () => {
    if (!input.trim()) return;

    const indent = ' '.repeat(options.indent);
    let css = input;

    // Remove existing formatting
    css = css.replace(/\s+/g, ' ');
    
    // Add newlines after { and ;
    css = css.replace(/\{/g, ' {\n');
    css = css.replace(/;/g, ';\n');
    css = css.replace(/\}/g, '}\n\n');
    
    // Format each line
    let formatted = '';
    let indentLevel = 0;
    
    css.split('\n').forEach(line => {
      line = line.trim();
      if (!line) return;
      
      if (line.includes('}')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }
      
      formatted += indent.repeat(indentLevel) + line + '\n';
      
      if (line.includes('{')) {
        indentLevel++;
      }
    });

    // Clean up
    formatted = formatted.replace(/\n{3,}/g, '\n\n');
    formatted = formatted.trim();

    setOutput(formatted);
  };

  const minifyCss = () => {
    if (!input.trim()) return;
    
    let css = input;
    // Remove comments
    css = css.replace(/\/\*[\s\S]*?\*\//g, '');
    // Remove whitespace
    css = css.replace(/\s+/g, ' ');
    // Remove space around special chars
    css = css.replace(/\s*{\s*/g, '{');
    css = css.replace(/\s*}\s*/g, '}');
    css = css.replace(/\s*:\s*/g, ':');
    css = css.replace(/\s*;\s*/g, ';');
    css = css.replace(/\s*,\s*/g, ',');
    // Remove last semicolon before }
    css = css.replace(/;}/g, '}');
    
    setOutput(css.trim());
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.css';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
  };

  const sampleCss = `.container{max-width:1200px;margin:0 auto;padding:0 20px;}.header{display:flex;justify-content:space-between;align-items:center;padding:20px 0;border-bottom:1px solid #eee;}.nav ul{display:flex;list-style:none;gap:20px;}.nav a{color:#333;text-decoration:none;font-weight:500;transition:color 0.3s;}.nav a:hover{color:#6366f1;}@media (max-width:768px){.container{padding:0 15px;}.nav ul{flex-direction:column;gap:10px;}}`;

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>
          <span className="icon"><FiLayout /></span>
          CSS Formatter
        </h1>
        <p>Format and beautify your CSS code</p>
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
          <button className="btn btn-primary" onClick={formatCss}>
            Beautify CSS
          </button>
          <button className="btn btn-secondary" onClick={minifyCss}>
            Minify CSS
          </button>
          <button className="btn btn-secondary" onClick={() => setInput(sampleCss)}>
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
            <h3>CSS Input</h3>
          </div>
          <div className="panel-body">
            <textarea
              className="code-textarea"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your CSS code here..."
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
              <button className="btn btn-icon" onClick={handleDownload} title="Download CSS">
                <FiDownload />
              </button>
            </div>
          </div>
          <div className="panel-body">
            <textarea
              className="code-textarea"
              value={output}
              readOnly
              placeholder="Formatted CSS will appear here..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default CssFormatter;
