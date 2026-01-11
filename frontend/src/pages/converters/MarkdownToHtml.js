import React, { useState, useEffect } from 'react';
import { FiCopy, FiDownload, FiRefreshCw, FiFileText, FiCheck, FiUpload, FiEye } from 'react-icons/fi';
import { marked } from 'marked';
import '../ToolPage.css';

function MarkdownToHtml() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [options, setOptions] = useState({
    gfm: true,
    breaks: true
  });

  useEffect(() => {
    if (input.trim()) {
      convert();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, options]);

  const convert = () => {
    setError('');
    if (!input.trim()) {
      setOutput('');
      return;
    }

    try {
      marked.setOptions({
        gfm: options.gfm,
        breaks: options.breaks
      });
      const html = marked(input);
      setOutput(html);
    } catch (err) {
      setError('Failed to parse Markdown: ' + err.message);
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
    const blob = new Blob([output], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted.html';
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

  const sampleMarkdown = `# Welcome to Markdown

This is a **bold** and *italic* text example.

## Features

- Easy to learn
- Clean syntax
- Widely supported

### Code Example

\`\`\`javascript
const greeting = "Hello, World!";
console.log(greeting);
\`\`\`

### Links and Images

[Visit GitHub](https://github.com)

> This is a blockquote. It's great for highlighting important information.

### Table Example

| Name | Age | City |
|------|-----|------|
| John | 25  | NYC  |
| Jane | 30  | LA   |
`;

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>
          <span className="icon"><FiFileText /></span>
          Markdown → HTML Converter
        </h1>
        <p>Convert Markdown to HTML with live preview</p>
      </div>

      {/* Options Panel */}
      <div className="options-panel">
        <div className="options-grid">
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="gfm"
              checked={options.gfm}
              onChange={(e) => setOptions({ ...options, gfm: e.target.checked })}
            />
            <label htmlFor="gfm">GitHub Flavored Markdown</label>
          </div>
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="breaks"
              checked={options.breaks}
              onChange={(e) => setOptions({ ...options, breaks: e.target.checked })}
            />
            <label htmlFor="breaks">Convert line breaks to &lt;br&gt;</label>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="action-bar">
        <div className="btn-group">
          <label className="btn btn-secondary">
            <FiUpload /> Upload Markdown
            <input type="file" accept=".md,.markdown,.txt" onChange={handleFileUpload} hidden />
          </label>
          <button className="btn btn-secondary" onClick={() => setInput(sampleMarkdown)}>
            Load Sample
          </button>
          <button 
            className={`btn ${showPreview ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setShowPreview(!showPreview)}
          >
            <FiEye /> {showPreview ? 'Show HTML' : 'Show Preview'}
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
            <h3>Markdown Input</h3>
          </div>
          <div className="panel-body">
            <textarea
              className="code-textarea"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type or paste your Markdown here..."
              spellCheck={false}
            />
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>{showPreview ? 'Preview' : 'HTML Output'}</h3>
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
            {showPreview ? (
              <div 
                className="markdown-preview"
                dangerouslySetInnerHTML={{ __html: output }}
                style={{
                  minHeight: '400px',
                  padding: '1rem',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  lineHeight: 1.7,
                  overflow: 'auto'
                }}
              />
            ) : (
              <textarea
                className="code-textarea"
                value={output}
                readOnly
                placeholder="HTML output will appear here..."
              />
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="status-message error">
          {error}
        </div>
      )}

      <style>{`
        .markdown-preview h1, .markdown-preview h2, .markdown-preview h3 {
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }
        .markdown-preview h1 { font-size: 2rem; }
        .markdown-preview h2 { font-size: 1.5rem; }
        .markdown-preview h3 { font-size: 1.25rem; }
        .markdown-preview p { margin-bottom: 1rem; }
        .markdown-preview ul, .markdown-preview ol {
          margin-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .markdown-preview li { margin-bottom: 0.25rem; }
        .markdown-preview code {
          background: var(--bg-tertiary);
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.9em;
        }
        .markdown-preview pre {
          background: var(--bg-tertiary);
          padding: 1rem;
          border-radius: var(--radius-md);
          overflow-x: auto;
          margin-bottom: 1rem;
        }
        .markdown-preview pre code {
          background: none;
          padding: 0;
        }
        .markdown-preview blockquote {
          border-left: 4px solid var(--accent-primary);
          padding-left: 1rem;
          margin: 1rem 0;
          color: var(--text-secondary);
        }
        .markdown-preview table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 1rem;
        }
        .markdown-preview th, .markdown-preview td {
          border: 1px solid var(--border-primary);
          padding: 0.5rem 1rem;
          text-align: left;
        }
        .markdown-preview th {
          background: var(--bg-tertiary);
        }
        .markdown-preview a {
          color: var(--accent-primary);
        }
        .markdown-preview a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}

export default MarkdownToHtml;
