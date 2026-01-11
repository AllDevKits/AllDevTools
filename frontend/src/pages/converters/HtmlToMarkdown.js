import React, { useState } from 'react';
import { FiCopy, FiDownload, FiRefreshCw, FiCode, FiCheck, FiUpload, FiArrowRight } from 'react-icons/fi';
import '../ToolPage.css';

function HtmlToMarkdown() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const htmlToMarkdown = (html) => {
    let md = html;

    md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
    md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
    md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
    md = md.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n');
    md = md.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n');
    md = md.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n');

    md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
    md = md.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
    md = md.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
    md = md.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');

    md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');
    md = md.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)');
    md = md.replace(/<img[^>]*src="([^"]*)"[^>]*\/?>/gi, '![]($1)');

    md = md.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');
    md = md.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '```\n$1\n```\n\n');
    md = md.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, '```\n$1\n```\n\n');

    md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (match, content) => {
      return content.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n') + '\n';
    });
    md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (match, content) => {
      let index = 0;
      return content.replace(/<li[^>]*>(.*?)<\/li>/gi, () => {
        index++;
        return `${index}. $1\n`;
      }) + '\n';
    });

    md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (match, content) => {
      return content.split('\n').map(line => `> ${line.trim()}`).join('\n') + '\n\n';
    });

    md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
    md = md.replace(/<br\s*\/?>/gi, '\n');
    md = md.replace(/<hr\s*\/?>/gi, '\n---\n\n');
    md = md.replace(/<[^>]+>/g, '');
    md = md.replace(/\n{3,}/g, '\n\n');
    md = md.trim();

    const textarea = document.createElement('textarea');
    textarea.innerHTML = md;
    md = textarea.value;

    return md;
  };

  const convert = () => {
    setError('');
    if (!input.trim()) {
      setError('Please enter HTML code');
      return;
    }

    try {
      const markdown = htmlToMarkdown(input);
      setOutput(markdown);
    } catch (err) {
      setError('Failed to convert HTML: ' + err.message);
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
    const blob = new Blob([output], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted.md';
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

  const sampleHtml = `<h1>Welcome to HTML</h1>
<p>This is a <strong>bold</strong> and <em>italic</em> text.</p>
<h2>Features</h2>
<ul>
  <li>Easy to learn</li>
  <li>Clean syntax</li>
</ul>
<p>Visit <a href="https://github.com">GitHub</a></p>`;

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>
          <span className="icon"><FiCode /></span>
          HTML → Markdown Converter
        </h1>
        <p>Convert HTML code to clean Markdown format</p>
      </div>

      {/* Top Action Bar */}
      <div className="action-bar">
        <div className="btn-group">
          <label className="btn btn-secondary">
            <FiUpload /> Upload
            <input type="file" accept=".html,.htm" onChange={handleFileUpload} hidden />
          </label>
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

        {/* Convert Button in Middle */}
        <div className="convert-button-middle">
          <button className="btn-convert" onClick={convert}>
            <FiArrowRight />
            Convert
          </button>
        </div>

        {/* Output Panel */}
        <div className="panel">
          <div className="panel-header">
            <h3>Markdown Output</h3>
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
              placeholder="Markdown output will appear here..."
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

export default HtmlToMarkdown;
