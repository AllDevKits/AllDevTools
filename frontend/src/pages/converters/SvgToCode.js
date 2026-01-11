import React, { useState } from 'react';
import { FiCopy, FiDownload, FiRefreshCw, FiCode, FiCheck, FiUpload, FiArrowRight } from 'react-icons/fi';
import '../ToolPage.css';

function SvgToCode() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [framework, setFramework] = useState('react');
  const [options, setOptions] = useState({
    dynamicProps: true,
    optimize: true,
    componentName: 'MyIcon'
  });

  const convertToReact = (svg) => {
    let code = svg;
    
    const attrMap = {
      'class': 'className',
      'fill-rule': 'fillRule',
      'clip-rule': 'clipRule',
      'stroke-width': 'strokeWidth',
      'stroke-linecap': 'strokeLinecap',
      'stroke-linejoin': 'strokeLinejoin',
    };

    Object.entries(attrMap).forEach(([html, react]) => {
      code = code.replace(new RegExp(html + '=', 'g'), react + '=');
    });

    if (options.dynamicProps) {
      code = code.replace(/<svg/, '<svg {...props}');
      code = code.replace(/width="[^"]*"/, 'width={size || 24}');
      code = code.replace(/height="[^"]*"/, 'height={size || 24}');
      code = code.replace(/fill="(?!none|url)[^"]*"/g, 'fill={color || "currentColor"}');
    }

    return `import React from 'react';

const ${options.componentName} = ({ size, color, ...props }) => (
  ${code.trim()}
);

export default ${options.componentName};`;
  };

  const convertToVue = (svg) => {
    let code = svg;
    
    if (options.dynamicProps) {
      code = code.replace(/<svg/, '<svg v-bind="$attrs"');
      code = code.replace(/width="[^"]*"/, ':width="size || 24"');
      code = code.replace(/height="[^"]*"/, ':height="size || 24"');
    }

    return `<template>
  ${code.trim()}
</template>

<script>
export default {
  name: '${options.componentName}',
  props: {
    size: { type: [Number, String], default: 24 },
    color: { type: String, default: 'currentColor' }
  }
}
</script>`;
  };

  const convert = () => {
    setError('');
    if (!input.trim()) {
      setError('Please enter SVG code');
      return;
    }

    if (!input.includes('<svg')) {
      setError('Invalid SVG: Missing <svg> tag');
      return;
    }

    try {
      let result;
      switch (framework) {
        case 'react':
          result = convertToReact(input);
          break;
        case 'vue':
          result = convertToVue(input);
          break;
        default:
          result = input.replace(/\s+/g, ' ').trim();
      }
      setOutput(result);
    } catch (err) {
      setError('Failed to convert SVG: ' + err.message);
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
    const ext = framework === 'vue' ? 'vue' : framework === 'react' ? 'jsx' : 'html';
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${options.componentName}.${ext}`;
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

  const sampleSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <circle cx="12" cy="12" r="10"/>
  <line x1="12" y1="8" x2="12" y2="12"/>
</svg>`;

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>
          <span className="icon"><FiCode /></span>
          SVG → Code Converter
        </h1>
        <p>Convert SVG to React, Vue, or optimized HTML</p>
      </div>

      {/* Options Panel */}
      <div className="options-panel">
        <div className="options-grid">
          <div className="option-group">
            <label>Framework</label>
            <select value={framework} onChange={(e) => setFramework(e.target.value)}>
              <option value="react">React</option>
              <option value="vue">Vue</option>
              <option value="html">HTML</option>
            </select>
          </div>
          <div className="option-group">
            <label>Component Name</label>
            <input
              type="text"
              value={options.componentName}
              onChange={(e) => setOptions({ ...options, componentName: e.target.value })}
              placeholder="MyIcon"
            />
          </div>
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="dynamicProps"
              checked={options.dynamicProps}
              onChange={(e) => setOptions({ ...options, dynamicProps: e.target.checked })}
            />
            <label htmlFor="dynamicProps">Dynamic props</label>
          </div>
        </div>
      </div>

      {/* Top Action Bar */}
      <div className="action-bar">
        <div className="btn-group">
          <label className="btn btn-secondary">
            <FiUpload /> Upload
            <input type="file" accept=".svg" onChange={handleFileUpload} hidden />
          </label>
          <button className="btn btn-secondary" onClick={() => setInput(sampleSvg)}>
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
            <h3>SVG Input</h3>
          </div>
          <div className="panel-body">
            <textarea
              className="code-textarea"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your SVG code here..."
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
            <h3>{framework.toUpperCase()} Output</h3>
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
              placeholder="Converted code will appear here..."
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

export default SvgToCode;
