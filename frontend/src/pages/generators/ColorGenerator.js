import React, { useState, useEffect } from 'react';
import { FiCopy, FiRefreshCw, FiDroplet, FiCheck, FiPlus, FiTrash2 } from 'react-icons/fi';
import '../ToolPage.css';

function ColorGenerator() {
  const [colors, setColors] = useState([]);
  const [copied, setCopied] = useState(null);
  const [options, setOptions] = useState({
    count: 5,
    format: 'hex',
    hueRange: [0, 360],
    saturationRange: [50, 100],
    lightnessRange: [25, 75]
  });

  useEffect(() => {
    generatePalette();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hslToHex = (h, s, l) => {
    s /= 100;
    l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = n => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const hslToRgb = (h, s, l) => {
    s /= 100;
    l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = n => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color);
    };
    return { r: f(0), g: f(8), b: f(4) };
  };

  const generateColor = () => {
    const h = Math.floor(Math.random() * (options.hueRange[1] - options.hueRange[0])) + options.hueRange[0];
    const s = Math.floor(Math.random() * (options.saturationRange[1] - options.saturationRange[0])) + options.saturationRange[0];
    const l = Math.floor(Math.random() * (options.lightnessRange[1] - options.lightnessRange[0])) + options.lightnessRange[0];
    
    const hex = hslToHex(h, s, l);
    const rgb = hslToRgb(h, s, l);
    
    return {
      hex,
      rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
      hsl: `hsl(${h}, ${s}%, ${l}%)`,
      values: { h, s, l, ...rgb }
    };
  };

  const generatePalette = () => {
    const newColors = [];
    for (let i = 0; i < options.count; i++) {
      newColors.push(generateColor());
    }
    setColors(newColors);
  };

  const addColor = () => {
    setColors([...colors, generateColor()]);
  };

  const removeColor = (index) => {
    setColors(colors.filter((_, i) => i !== index));
  };

  const regenerateColor = (index) => {
    const newColors = [...colors];
    newColors[index] = generateColor();
    setColors(newColors);
  };

  const getColorValue = (color) => {
    switch (options.format) {
      case 'rgb': return color.rgb;
      case 'hsl': return color.hsl;
      default: return color.hex;
    }
  };

  const handleCopy = async (color, index) => {
    await navigator.clipboard.writeText(getColorValue(color));
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleCopyAll = async () => {
    const allColors = colors.map(c => getColorValue(c)).join('\n');
    await navigator.clipboard.writeText(allColors);
    setCopied('all');
    setTimeout(() => setCopied(null), 2000);
  };

  const getContrastColor = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>
          <span className="icon"><FiDroplet /></span>
          Random Color Generator
        </h1>
        <p>Generate beautiful color palettes for your projects</p>
      </div>

      {/* Options Panel */}
      <div className="options-panel">
        <div className="options-grid">
          <div className="option-group">
            <label>Colors Count</label>
            <input
              type="number"
              min="1"
              max="20"
              value={options.count}
              onChange={(e) => setOptions({ ...options, count: parseInt(e.target.value) || 1 })}
            />
          </div>
          <div className="option-group">
            <label>Format</label>
            <select value={options.format} onChange={(e) => setOptions({ ...options, format: e.target.value })}>
              <option value="hex">HEX</option>
              <option value="rgb">RGB</option>
              <option value="hsl">HSL</option>
            </select>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="action-bar">
        <div className="btn-group">
          <button className="btn btn-primary" onClick={generatePalette}>
            <FiRefreshCw /> Generate Palette
          </button>
          <button className="btn btn-secondary" onClick={addColor}>
            <FiPlus /> Add Color
          </button>
          <button className="btn btn-secondary" onClick={handleCopyAll} disabled={colors.length === 0}>
            {copied === 'all' ? <FiCheck /> : <FiCopy />} Copy All
          </button>
        </div>
      </div>

      {/* Color Palette Display */}
      <div className="color-palette">
        {colors.map((color, index) => (
          <div 
            key={index} 
            className="color-card"
            style={{ backgroundColor: color.hex }}
          >
            <div className="color-actions" style={{ color: getContrastColor(color.hex) }}>
              <button 
                className="color-action-btn"
                onClick={() => regenerateColor(index)}
                title="Regenerate"
                style={{ color: getContrastColor(color.hex) }}
              >
                <FiRefreshCw />
              </button>
              <button 
                className="color-action-btn"
                onClick={() => handleCopy(color, index)}
                title="Copy"
                style={{ color: getContrastColor(color.hex) }}
              >
                {copied === index ? <FiCheck /> : <FiCopy />}
              </button>
              <button 
                className="color-action-btn"
                onClick={() => removeColor(index)}
                title="Remove"
                style={{ color: getContrastColor(color.hex) }}
              >
                <FiTrash2 />
              </button>
            </div>
            <div className="color-info" style={{ color: getContrastColor(color.hex) }}>
              <span className="color-value">{getColorValue(color)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Color Details */}
      {colors.length > 0 && (
        <div className="panel" style={{ marginTop: '1.5rem' }}>
          <div className="panel-header">
            <h3>Color Values</h3>
          </div>
          <div className="panel-body">
            <div className="color-table">
              <div className="color-table-header">
                <span>Preview</span>
                <span>HEX</span>
                <span>RGB</span>
                <span>HSL</span>
              </div>
              {colors.map((color, index) => (
                <div key={index} className="color-table-row">
                  <span 
                    className="color-preview-small" 
                    style={{ backgroundColor: color.hex }}
                  />
                  <span className="color-code">{color.hex}</span>
                  <span className="color-code">{color.rgb}</span>
                  <span className="color-code">{color.hsl}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .color-palette {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 1rem;
        }
        .color-card {
          aspect-ratio: 1;
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 1rem;
          transition: all var(--transition-fast);
          cursor: pointer;
        }
        .color-card:hover {
          transform: scale(1.02);
          box-shadow: var(--shadow-lg);
        }
        .color-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
          opacity: 0;
          transition: opacity var(--transition-fast);
        }
        .color-card:hover .color-actions {
          opacity: 1;
        }
        .color-action-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          border-radius: var(--radius-sm);
          padding: 0.4rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-fast);
        }
        .color-action-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        .color-info {
          text-align: center;
        }
        .color-value {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.9rem;
          font-weight: 600;
        }
        .color-table {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .color-table-header {
          display: grid;
          grid-template-columns: 40px 1fr 1fr 1fr;
          gap: 1rem;
          padding: 0.5rem;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-muted);
          border-bottom: 1px solid var(--border-primary);
        }
        .color-table-row {
          display: grid;
          grid-template-columns: 40px 1fr 1fr 1fr;
          gap: 1rem;
          padding: 0.5rem;
          align-items: center;
          background: var(--bg-secondary);
          border-radius: var(--radius-sm);
        }
        .color-preview-small {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-primary);
        }
        .color-code {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }
        @media (max-width: 768px) {
          .color-palette {
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          }
          .color-table-header,
          .color-table-row {
            grid-template-columns: 30px 1fr;
          }
          .color-table-header span:nth-child(3),
          .color-table-header span:nth-child(4),
          .color-table-row span:nth-child(3),
          .color-table-row span:nth-child(4) {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

export default ColorGenerator;
