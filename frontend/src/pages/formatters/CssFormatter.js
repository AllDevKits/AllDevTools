import React, { useState } from 'react';
import { FiCopy, FiDownload, FiRefreshCw, FiLayout, FiCheck, FiMaximize2, FiMinimize2 } from 'react-icons/fi';
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

    css = css.replace(/\s+/g, ' ');
    css = css.replace(/\{/g, ' {\n');
    css = css.replace(/;/g, ';\n');
    css = css.replace(/\}/g, '}\n\n');
    
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

    formatted = formatted.replace(/\n{3,}/g, '\n\n');
    setOutput(formatted.trim());
  };

  const minifyCss = () => {
    if (!input.trim()) return;
    let css = input;
    css = css.replace(/\/\*[\s\S]*?\*\//g, '');
    css = css.replace(/\s+/g, ' ');
    css = css.replace(/\s*{\s*/g, '{');
    css = css.replace(/\s*}\s*/g, '}');
    css = css.replace(/\s*:\s*/g, ':');
    css = css.replace(/\s*;\s*/g, ';');
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

  const sampleCss = `.container{max-width:1200px;margin:0 auto;}.header{display:flex;padding:20px;}.nav a{color:#333;text-decoration:none;}`;

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
          <button className="btn btn-secondary" onClick={() => setInput(sampleCss)}>
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

        {/* Format Buttons in Middle */}
        <div className="convert-button-middle">
          <button className="btn-convert" onClick={formatCss}>
            <FiMaximize2 />
            Beautify
          </button>
          <button className="btn-secondary-small" onClick={minifyCss}>
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
              placeholder="Formatted CSS will appear here..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default CssFormatter;
