import React, { useState } from 'react';
import { FiCopy, FiRefreshCw, FiFileText, FiCheck } from 'react-icons/fi';
import '../ToolPage.css';

const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
  'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
  'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'perspiciatis', 'unde',
  'omnis', 'iste', 'natus', 'error', 'voluptatem', 'accusantium', 'doloremque',
  'laudantium', 'totam', 'rem', 'aperiam', 'eaque', 'ipsa', 'quae', 'ab', 'illo',
  'inventore', 'veritatis', 'quasi', 'architecto', 'beatae', 'vitae', 'dicta',
  'explicabo', 'nemo', 'ipsam', 'quia', 'voluptas', 'aspernatur', 'aut', 'odit',
  'fugit', 'consequuntur', 'magni', 'dolores', 'eos', 'ratione', 'sequi',
  'nesciunt', 'neque', 'porro', 'quisquam', 'nihil', 'quod', 'tempora',
  'numquam', 'eius', 'modi', 'magnam', 'quaerat'
];

function LoremGenerator() {
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState({
    type: 'paragraphs',
    count: 3,
    startWithLorem: true
  });

  const getRandomWord = () => {
    return LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)];
  };

  const generateSentence = (minWords = 8, maxWords = 15) => {
    const wordCount = Math.floor(Math.random() * (maxWords - minWords + 1)) + minWords;
    const words = [];
    
    for (let i = 0; i < wordCount; i++) {
      words.push(getRandomWord());
    }
    
    // Capitalize first letter
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
    
    return words.join(' ') + '.';
  };

  const generateParagraph = (isFirst = false) => {
    const sentenceCount = Math.floor(Math.random() * 4) + 4; // 4-7 sentences
    const sentences = [];
    
    for (let i = 0; i < sentenceCount; i++) {
      if (i === 0 && isFirst && options.startWithLorem) {
        sentences.push('Lorem ipsum dolor sit amet, consectetur adipiscing elit.');
      } else {
        sentences.push(generateSentence());
      }
    }
    
    return sentences.join(' ');
  };

  const generate = () => {
    let result = '';
    
    switch (options.type) {
      case 'words':
        const words = [];
        for (let i = 0; i < options.count; i++) {
          if (i === 0 && options.startWithLorem) {
            words.push('Lorem');
          } else if (i === 1 && options.startWithLorem) {
            words.push('ipsum');
          } else {
            words.push(getRandomWord());
          }
        }
        result = words.join(' ');
        break;
        
      case 'sentences':
        const sentences = [];
        for (let i = 0; i < options.count; i++) {
          if (i === 0 && options.startWithLorem) {
            sentences.push('Lorem ipsum dolor sit amet, consectetur adipiscing elit.');
          } else {
            sentences.push(generateSentence());
          }
        }
        result = sentences.join(' ');
        break;
        
      case 'paragraphs':
      default:
        const paragraphs = [];
        for (let i = 0; i < options.count; i++) {
          paragraphs.push(generateParagraph(i === 0));
        }
        result = paragraphs.join('\n\n');
        break;
    }
    
    setOutput(result);
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate on mount
  React.useEffect(() => {
    generate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>
          <span className="icon"><FiFileText /></span>
          Lorem Ipsum Generator
        </h1>
        <p>Generate placeholder text for your designs</p>
      </div>

      {/* Options Panel */}
      <div className="options-panel">
        <div className="options-grid">
          <div className="option-group">
            <label>Generate</label>
            <select value={options.type} onChange={(e) => setOptions({ ...options, type: e.target.value })}>
              <option value="words">Words</option>
              <option value="sentences">Sentences</option>
              <option value="paragraphs">Paragraphs</option>
            </select>
          </div>
          <div className="option-group">
            <label>Count</label>
            <input
              type="number"
              min="1"
              max="100"
              value={options.count}
              onChange={(e) => setOptions({ ...options, count: parseInt(e.target.value) || 1 })}
            />
          </div>
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="startWithLorem"
              checked={options.startWithLorem}
              onChange={(e) => setOptions({ ...options, startWithLorem: e.target.checked })}
            />
            <label htmlFor="startWithLorem">Start with "Lorem ipsum..."</label>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="action-bar">
        <div className="btn-group">
          <button className="btn btn-primary" onClick={generate}>
            <FiRefreshCw /> Generate
          </button>
          <button className="btn btn-secondary" onClick={handleCopy} disabled={!output}>
            {copied ? <FiCheck /> : <FiCopy />} Copy to Clipboard
          </button>
        </div>
      </div>

      {/* Output Panel */}
      <div className="panel">
        <div className="panel-header">
          <h3>Generated Text</h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {output.split(' ').length} words | {output.length} characters
          </span>
        </div>
        <div className="panel-body">
          <div className="lorem-output">
            {output.split('\n\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .lorem-output {
          background: var(--bg-secondary);
          padding: 1.5rem;
          border-radius: var(--radius-md);
          line-height: 1.8;
          color: var(--text-secondary);
        }
        .lorem-output p {
          margin-bottom: 1rem;
        }
        .lorem-output p:last-child {
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
}

export default LoremGenerator;
