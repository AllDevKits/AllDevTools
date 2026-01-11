import React, { useState } from 'react';
import { FiCopy, FiDownload, FiRefreshCw, FiDatabase, FiCheck } from 'react-icons/fi';
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

    // Keywords that should start on new line
    const newLineKeywords = [
      'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'ORDER BY', 'GROUP BY', 
      'HAVING', 'LIMIT', 'OFFSET', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN',
      'INNER JOIN', 'OUTER JOIN', 'CROSS JOIN', 'ON', 'SET', 'VALUES',
      'INSERT INTO', 'UPDATE', 'DELETE FROM', 'CREATE TABLE', 'ALTER TABLE',
      'DROP TABLE', 'CREATE INDEX', 'UNION', 'UNION ALL', 'EXCEPT', 'INTERSECT'
    ];

    // Replace multiple spaces with single space
    sql = sql.replace(/\s+/g, ' ').trim();

    // Add new lines before keywords
    newLineKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      sql = sql.replace(regex, `\n${options.uppercase ? keyword : keyword.toLowerCase()}`);
    });

    // Handle commas - put fields on new lines
    sql = sql.replace(/,\s*/g, ',\n' + ' '.repeat(options.indent));

    // Handle parentheses
    sql = sql.replace(/\(\s*/g, '(\n' + ' '.repeat(options.indent));
    sql = sql.replace(/\s*\)/g, '\n)');

    // Uppercase keywords if option is set
    if (options.uppercase) {
      const keywords = [
        'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'IS', 'NULL',
        'AS', 'ON', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'CROSS',
        'ORDER', 'BY', 'GROUP', 'HAVING', 'LIMIT', 'OFFSET', 'ASC', 'DESC',
        'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE',
        'TABLE', 'ALTER', 'DROP', 'INDEX', 'PRIMARY', 'KEY', 'FOREIGN',
        'REFERENCES', 'UNIQUE', 'CHECK', 'DEFAULT', 'CONSTRAINT',
        'UNION', 'ALL', 'EXCEPT', 'INTERSECT', 'BETWEEN', 'LIKE', 'EXISTS',
        'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'CAST', 'CONVERT',
        'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'DISTINCT', 'TRUE', 'FALSE'
      ];
      
      keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        sql = sql.replace(regex, keyword);
      });
    }

    // Clean up extra newlines
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
    sql = sql.trim();
    
    setOutput(sql);
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

  const sampleSql = `select users.id, users.name, users.email, orders.total from users left join orders on users.id = orders.user_id where users.active = true and orders.status = 'completed' order by orders.total desc limit 10`;

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
            <label>Indent Spaces</label>
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

      {/* Action Bar */}
      <div className="action-bar">
        <div className="btn-group">
          <button className="btn btn-primary" onClick={formatSql}>
            Beautify SQL
          </button>
          <button className="btn btn-secondary" onClick={minifySql}>
            Minify SQL
          </button>
          <button className="btn btn-secondary" onClick={() => setInput(sampleSql)}>
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

        <div className="panel">
          <div className="panel-header">
            <h3>Formatted Output</h3>
            <div className="btn-group">
              <button className="btn btn-icon" onClick={handleCopy} title="Copy to clipboard">
                {copied ? <FiCheck /> : <FiCopy />}
              </button>
              <button className="btn btn-icon" onClick={handleDownload} title="Download SQL">
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
