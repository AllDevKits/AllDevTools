import React, { useState, useEffect } from 'react';
import { FiCopy, FiRefreshCw, FiLink, FiCheck } from 'react-icons/fi';
import '../ToolPage.css';

function SlugGenerator() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState({
    separator: '-',
    lowercase: true,
    removeStopWords: false,
    maxLength: 0
  });

  const stopWords = [
    'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used',
    'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'up', 'about', 'into',
    'over', 'after', 'it', 'its', 'this', 'that', 'these', 'those', 'i', 'you', 'he',
    'she', 'we', 'they', 'what', 'which', 'who', 'when', 'where', 'why', 'how'
  ];

  useEffect(() => {
    generateSlug();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, options]);

  const generateSlug = () => {
    if (!input.trim()) {
      setOutput('');
      return;
    }

    let slug = input;

    // Convert to lowercase if option is set
    if (options.lowercase) {
      slug = slug.toLowerCase();
    }

    // Remove accents/diacritics
    slug = slug.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // Remove special characters except spaces and alphanumeric
    slug = slug.replace(/[^a-zA-Z0-9\s]/g, '');

    // Split into words
    let words = slug.split(/\s+/).filter(word => word.length > 0);

    // Remove stop words if option is set
    if (options.removeStopWords) {
      words = words.filter(word => !stopWords.includes(word.toLowerCase()));
    }

    // Join with separator
    slug = words.join(options.separator);

    // Apply max length if set
    if (options.maxLength > 0 && slug.length > options.maxLength) {
      slug = slug.substring(0, options.maxLength);
      // Remove trailing separator
      if (slug.endsWith(options.separator)) {
        slug = slug.slice(0, -1);
      }
    }

    setOutput(slug);
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
  };

  const sampleTitles = [
    "10 Tips for Better JavaScript Performance in 2024",
    "How to Build a REST API with Node.js & Express",
    "The Ultimate Guide to CSS Grid Layout",
    "Understanding React Hooks: useState vs useReducer"
  ];

  const loadRandomSample = () => {
    const random = sampleTitles[Math.floor(Math.random() * sampleTitles.length)];
    setInput(random);
  };

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>
          <span className="icon"><FiLink /></span>
          URL Slug Generator
        </h1>
        <p>Convert titles and text into URL-friendly slugs</p>
      </div>

      {/* Options Panel */}
      <div className="options-panel">
        <div className="options-grid">
          <div className="option-group">
            <label>Separator</label>
            <select value={options.separator} onChange={(e) => setOptions({ ...options, separator: e.target.value })}>
              <option value="-">Hyphen (-)</option>
              <option value="_">Underscore (_)</option>
              <option value=".">Dot (.)</option>
            </select>
          </div>
          <div className="option-group">
            <label>Max Length (0 = no limit)</label>
            <input
              type="number"
              min="0"
              max="200"
              value={options.maxLength}
              onChange={(e) => setOptions({ ...options, maxLength: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="lowercase"
              checked={options.lowercase}
              onChange={(e) => setOptions({ ...options, lowercase: e.target.checked })}
            />
            <label htmlFor="lowercase">Lowercase</label>
          </div>
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="removeStopWords"
              checked={options.removeStopWords}
              onChange={(e) => setOptions({ ...options, removeStopWords: e.target.checked })}
            />
            <label htmlFor="removeStopWords">Remove stop words (a, the, is...)</label>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="action-bar">
        <div className="btn-group">
          <button className="btn btn-secondary" onClick={loadRandomSample}>
            Load Sample
          </button>
          <button className="btn btn-secondary" onClick={handleCopy} disabled={!output}>
            {copied ? <FiCheck /> : <FiCopy />} Copy Slug
          </button>
        </div>
        <div className="btn-group">
          <button className="btn btn-icon" onClick={handleClear} title="Clear all">
            <FiRefreshCw />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="tool-content single">
        <div className="panel">
          <div className="panel-header">
            <h3>Input Text</h3>
          </div>
          <div className="panel-body">
            <textarea
              className="code-textarea small"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter a title or text to convert to a slug..."
              spellCheck={false}
            />
          </div>
        </div>
      </div>

      {/* Output Display */}
      <div className="slug-output-container">
        <div className="slug-label">Generated Slug:</div>
        <div className="slug-display">
          <span className="slug-value">{output || 'your-slug-will-appear-here'}</span>
          <button 
            className="btn btn-icon" 
            onClick={handleCopy} 
            disabled={!output}
            title="Copy to clipboard"
          >
            {copied ? <FiCheck /> : <FiCopy />}
          </button>
        </div>
        {output && (
          <div className="slug-preview">
            <span className="preview-label">Preview URL:</span>
            <code>https://example.com/blog/{output}</code>
          </div>
        )}
      </div>

      <style>{`
        .slug-output-container {
          margin-top: 1.5rem;
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
        }
        .slug-label {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 0.75rem;
        }
        .slug-display {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: var(--bg-secondary);
          padding: 1rem;
          border-radius: var(--radius-md);
        }
        .slug-value {
          flex: 1;
          font-family: 'JetBrains Mono', monospace;
          font-size: 1.1rem;
          color: var(--accent-primary);
          word-break: break-all;
        }
        .slug-preview {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-primary);
        }
        .preview-label {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-right: 0.5rem;
        }
        .slug-preview code {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.9rem;
          color: var(--text-secondary);
          background: var(--bg-secondary);
          padding: 0.3rem 0.6rem;
          border-radius: var(--radius-sm);
        }
      `}</style>
    </div>
  );
}

export default SlugGenerator;
