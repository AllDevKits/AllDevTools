import React, { useState } from 'react';
import { FiCopy, FiDownload, FiRefreshCw, FiDatabase, FiCheck, FiMaximize2, FiMinimize2 } from 'react-icons/fi';
import '../ToolPage.css';

function SqlFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState({
    uppercase: true,
    indent: 2
  });

  const formatSql = () => {
    if (!input.trim()) return;

    let sql = input;
    const newLineKeywords = [
      'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'ORDER BY', 'GROUP BY', 
      'HAVING', 'LIMIT', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN',
      'ON', 'SET', 'VALUES', 'INSERT INTO', 'UPDATE', 'DELETE FROM'
    ];

    sql = sql.replace(/\s+/g, ' ').trim();

    newLineKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      sql = sql.replace(regex, `\n${options.uppercase ? keyword : keyword.toLowerCase()}`);
    });

    sql = sql.replace(/,\s*/g, ',\n' + ' '.repeat(options.indent));
    sql = sql.replace(/\n{3,}/g, '\n\n');
    sql = sql.trim();

    setOutput(sql);
  };

  const minifySql = () => {
    if (!input.trim()) return;
    let sql = input;
    sql = sql.replace(/\s+/g, ' ');
    sql = sql.replace(/\s*,\s*/g, ',');
    sql = sql.replace(/\s*\(\s*/g, '(');
    sql = sql.replace(/\s*\)\s*/g, ')');
    setOutput(sql.trim());
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.sql';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
  };

  const sampleSql = `select users.id, users.name, orders.total from users left join orders on users.id = orders.user_id where users.active = true order by orders.total desc limit 10`;

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>
          <span className="icon"><FiDatabase /></span>
          SQL Formatter
        </h1>
        <p>Format and beautify your SQL queries</p>
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
              id="uppercase"
              checked={options.uppercase}
              onChange={(e) => setOptions({ ...options, uppercase: e.target.checked })}
            />
            <label htmlFor="uppercase">Uppercase keywords</label>
          </div>
        </div>
      </div>

      {/* Top Action Bar */}
      <div className="action-bar">
        <div className="btn-group">
          <button className="btn btn-secondary" onClick={() => setInput(sampleSql)}>
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
            <h3>SQL Input</h3>
          </div>
          <div className="panel-body">
            <textarea
              className="code-textarea"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your SQL query here..."
              spellCheck={false}
            />
          </div>
        </div>

        {/* Format Buttons in Middle */}
        <div className="convert-button-middle">
          <button className="btn-convert" onClick={formatSql}>
            <FiMaximize2 />
            Beautify
          </button>
          <button className="btn-secondary-small" onClick={minifySql}>
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
              placeholder="Formatted SQL will appear here..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SqlFormatter;
