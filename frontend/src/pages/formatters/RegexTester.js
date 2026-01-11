import React, { useState, useEffect } from 'react';
import { FiCopy, FiRefreshCw, FiSearch, FiCheck, FiInfo } from 'react-icons/fi';
import '../ToolPage.css';

function RegexTester() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [testString, setTestString] = useState('');
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [highlightedText, setHighlightedText] = useState('');

  useEffect(() => {
    testRegex();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pattern, flags, testString]);

  const testRegex = () => {
    setError('');
    setMatches([]);
    setHighlightedText(testString);

    if (!pattern || !testString) return;

    try {
      const regex = new RegExp(pattern, flags);
      const foundMatches = [];
      let match;

      if (flags.includes('g')) {
        while ((match = regex.exec(testString)) !== null) {
          foundMatches.push({
            value: match[0],
            index: match.index,
            groups: match.slice(1)
          });
        }
      } else {
        match = regex.exec(testString);
        if (match) {
          foundMatches.push({
            value: match[0],
            index: match.index,
            groups: match.slice(1)
          });
        }
      }

      setMatches(foundMatches);

      // Create highlighted text
      if (foundMatches.length > 0) {
        let highlighted = testString;
        let offset = 0;
        
        foundMatches.forEach((m, i) => {
          const startTag = `<mark class="match-highlight match-${i % 4}">`;
          const endTag = '</mark>';
          const pos = m.index + offset;
          highlighted = highlighted.slice(0, pos) + startTag + m.value + endTag + highlighted.slice(pos + m.value.length);
          offset += startTag.length + endTag.length;
        });
        
        setHighlightedText(highlighted);
      }
    } catch (err) {
      setError('Invalid regex: ' + err.message);
    }
  };

  const toggleFlag = (flag) => {
    if (flags.includes(flag)) {
      setFlags(flags.replace(flag, ''));
    } else {
      setFlags(flags + flag);
    }
  };

  const handleCopy = async () => {
    if (!pattern) return;
    await navigator.clipboard.writeText(`/${pattern}/${flags}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setPattern('');
    setTestString('');
    setMatches([]);
    setError('');
    setHighlightedText('');
  };

  const loadSample = () => {
    setPattern('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}');
    setTestString(`Contact us at support@example.com or sales@company.org.
Invalid emails: @invalid.com, test@, not-an-email
More valid ones: john.doe@gmail.com, jane_smith123@yahoo.co.uk`);
  };

  const commonPatterns = [
    { name: 'Email', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}' },
    { name: 'URL', pattern: 'https?:\\/\\/[\\w\\-._~:/?#[\\]@!$&\'()*+,;=%]+' },
    { name: 'Phone (US)', pattern: '\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}' },
    { name: 'IP Address', pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b' },
    { name: 'Date (YYYY-MM-DD)', pattern: '\\d{4}-\\d{2}-\\d{2}' },
    { name: 'Hex Color', pattern: '#(?:[0-9a-fA-F]{3}){1,2}\\b' },
  ];

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>
          <span className="icon"><FiSearch /></span>
          Regex Tester & Explainer
        </h1>
        <p>Test and debug regular expressions in real-time</p>
      </div>

      {/* Pattern Input */}
      <div className="options-panel">
        <div className="regex-input-group">
          <span className="regex-delimiter">/</span>
          <input
            type="text"
            className="regex-input"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="Enter regex pattern..."
            spellCheck={false}
          />
          <span className="regex-delimiter">/</span>
          <div className="flags-group">
            {['g', 'i', 'm', 's'].map(flag => (
              <button
                key={flag}
                className={`flag-btn ${flags.includes(flag) ? 'active' : ''}`}
                onClick={() => toggleFlag(flag)}
                title={
                  flag === 'g' ? 'Global' :
                  flag === 'i' ? 'Case insensitive' :
                  flag === 'm' ? 'Multiline' :
                  'Dot matches newline'
                }
              >
                {flag}
              </button>
            ))}
          </div>
        </div>

        {/* Common Patterns */}
        <div className="common-patterns">
          <span className="patterns-label">Quick patterns:</span>
          <div className="patterns-list">
            {commonPatterns.map(p => (
              <button
                key={p.name}
                className="pattern-chip"
                onClick={() => setPattern(p.pattern)}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="action-bar">
        <div className="btn-group">
          <button className="btn btn-secondary" onClick={loadSample}>
            Load Sample
          </button>
          <button className="btn btn-icon" onClick={handleCopy} title="Copy regex">
            {copied ? <FiCheck /> : <FiCopy />}
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
            <h3>Test String</h3>
          </div>
          <div className="panel-body">
            <textarea
              className="code-textarea"
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              placeholder="Enter text to test against..."
              spellCheck={false}
            />
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>
              Matches
              {matches.length > 0 && (
                <span className="match-count">{matches.length} match{matches.length !== 1 ? 'es' : ''}</span>
              )}
            </h3>
          </div>
          <div className="panel-body">
            {/* Highlighted Preview */}
            <div 
              className="highlighted-preview"
              dangerouslySetInnerHTML={{ __html: highlightedText || '<span class="placeholder">Matches will be highlighted here...</span>' }}
            />

            {/* Matches List */}
            {matches.length > 0 && (
              <div className="matches-list">
                {matches.map((match, index) => (
                  <div key={index} className="match-item">
                    <div className="match-header">
                      <span className="match-index">Match {index + 1}</span>
                      <span className="match-position">Index: {match.index}</span>
                    </div>
                    <div className="match-value">{match.value}</div>
                    {match.groups.length > 0 && (
                      <div className="match-groups">
                        {match.groups.map((group, gIndex) => (
                          <span key={gIndex} className="group-item">
                            Group {gIndex + 1}: {group || '(empty)'}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="status-message error">
          {error}
        </div>
      )}

      {/* Regex Cheatsheet */}
      <div className="panel" style={{ marginTop: '1.5rem' }}>
        <div className="panel-header">
          <h3><FiInfo /> Regex Cheatsheet</h3>
        </div>
        <div className="panel-body">
          <div className="cheatsheet-grid">
            <div className="cheatsheet-section">
              <h4>Characters</h4>
              <code>.</code> Any character<br/>
              <code>\d</code> Digit [0-9]<br/>
              <code>\w</code> Word [a-zA-Z0-9_]<br/>
              <code>\s</code> Whitespace
            </div>
            <div className="cheatsheet-section">
              <h4>Quantifiers</h4>
              <code>*</code> 0 or more<br/>
              <code>+</code> 1 or more<br/>
              <code>?</code> 0 or 1<br/>
              <code>{"{n}"}</code> Exactly n
            </div>
            <div className="cheatsheet-section">
              <h4>Anchors</h4>
              <code>^</code> Start of string<br/>
              <code>$</code> End of string<br/>
              <code>\b</code> Word boundary
            </div>
            <div className="cheatsheet-section">
              <h4>Groups</h4>
              <code>(...)</code> Capturing group<br/>
              <code>(?:...)</code> Non-capturing<br/>
              <code>[...]</code> Character class<br/>
              <code>|</code> Alternation
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .regex-input-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        .regex-delimiter {
          font-size: 1.5rem;
          color: var(--accent-primary);
          font-family: 'JetBrains Mono', monospace;
        }
        .regex-input {
          flex: 1;
          padding: 0.75rem 1rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 1rem;
        }
        .flags-group {
          display: flex;
          gap: 0.25rem;
        }
        .flag-btn {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-sm);
          background: var(--bg-tertiary);
          border: 1px solid var(--border-primary);
          color: var(--text-muted);
          font-family: 'JetBrains Mono', monospace;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .flag-btn:hover {
          border-color: var(--accent-primary);
          color: var(--text-primary);
        }
        .flag-btn.active {
          background: var(--accent-primary);
          border-color: var(--accent-primary);
          color: white;
        }
        .common-patterns {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .patterns-label {
          font-size: 0.85rem;
          color: var(--text-muted);
        }
        .patterns-list {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .pattern-chip {
          padding: 0.35rem 0.75rem;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-primary);
          border-radius: 9999px;
          color: var(--text-secondary);
          font-size: 0.8rem;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .pattern-chip:hover {
          border-color: var(--accent-primary);
          color: var(--text-primary);
        }
        .match-count {
          background: var(--success);
          color: white;
          padding: 0.2rem 0.6rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          margin-left: 0.5rem;
        }
        .highlighted-preview {
          background: var(--bg-secondary);
          padding: 1rem;
          border-radius: var(--radius-md);
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.9rem;
          line-height: 1.6;
          white-space: pre-wrap;
          word-break: break-word;
          min-height: 100px;
          margin-bottom: 1rem;
        }
        .highlighted-preview .placeholder {
          color: var(--text-muted);
        }
        .match-highlight {
          padding: 0.1rem 0.2rem;
          border-radius: 3px;
        }
        .match-0 { background: rgba(99, 102, 241, 0.3); }
        .match-1 { background: rgba(236, 72, 153, 0.3); }
        .match-2 { background: rgba(16, 185, 129, 0.3); }
        .match-3 { background: rgba(245, 158, 11, 0.3); }
        .matches-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .match-item {
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-md);
          padding: 0.75rem;
        }
        .match-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }
        .match-index {
          font-weight: 600;
          color: var(--accent-primary);
          font-size: 0.85rem;
        }
        .match-position {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .match-value {
          font-family: 'JetBrains Mono', monospace;
          background: var(--bg-tertiary);
          padding: 0.5rem;
          border-radius: var(--radius-sm);
          word-break: break-all;
        }
        .match-groups {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-top: 0.5rem;
        }
        .group-item {
          font-size: 0.8rem;
          color: var(--text-secondary);
          background: var(--bg-tertiary);
          padding: 0.2rem 0.5rem;
          border-radius: var(--radius-sm);
        }
        .cheatsheet-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1.5rem;
        }
        .cheatsheet-section h4 {
          color: var(--accent-primary);
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }
        .cheatsheet-section code {
          background: var(--bg-tertiary);
          padding: 0.1rem 0.3rem;
          border-radius: 3px;
          font-size: 0.85rem;
          color: var(--text-accent);
        }
        .cheatsheet-section {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.8;
        }
      `}</style>
    </div>
  );
}

export default RegexTester;
