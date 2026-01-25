import React, { useState, useRef } from 'react';
import { FiUpload, FiDownload, FiImage, FiRefreshCw, FiCheck, FiLoader, FiTrash2, FiPlus } from 'react-icons/fi';
import jsPDF from 'jspdf';
import '../ToolPage.css';

function JpgToPdf() {
  const [files, setFiles] = useState([]);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [progress, setProgress] = useState(0);
  const [options, setOptions] = useState({
    orientation: 'portrait',
    pageSize: 'a4',
    fitToPage: true
  });
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter(file => 
      file.type.startsWith('image/')
    );
    
    if (validFiles.length === 0) {
      setError('Please select image files (JPG, PNG, etc.)');
      return;
    }
    
    setFiles(prev => [...prev, ...validFiles]);
    setError('');
    setSuccess(false);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const loadImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => resolve({ img, dataUrl: e.target.result });
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const convert = async () => {
    if (files.length === 0) {
      setError('Please select at least one image');
      return;
    }
    
    setConverting(true);
    setError('');
    setSuccess(false);
    setProgress(0);
    
    try {
      const pdf = new jsPDF({
        orientation: options.orientation,
        unit: 'mm',
        format: options.pageSize
      });
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      
      for (let i = 0; i < files.length; i++) {
        setProgress(Math.round((i / files.length) * 100));
        
        const { img, dataUrl } = await loadImage(files[i]);
        
        if (i > 0) {
          pdf.addPage();
        }
        
        let imgWidth = img.width;
        let imgHeight = img.height;
        
        if (options.fitToPage) {
          const maxWidth = pageWidth - margin * 2;
          const maxHeight = pageHeight - margin * 2;
          const ratio = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
          imgWidth = imgWidth * ratio;
          imgHeight = imgHeight * ratio;
        }
        
        const x = (pageWidth - imgWidth) / 2;
        const y = (pageHeight - imgHeight) / 2;
        
        pdf.addImage(dataUrl, 'JPEG', x, y, imgWidth, imgHeight);
      }
      
      setProgress(100);
      pdf.save('images-to-pdf.pdf');
      setSuccess(true);
    } catch (err) {
      setError('Failed to convert: ' + err.message);
    } finally {
      setConverting(false);
    }
  };

  const handleClear = () => {
    setFiles([]);
    setError('');
    setSuccess(false);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = droppedFiles.filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length === 0) {
      setError('Please drop image files');
      return;
    }
    
    setFiles(prev => [...prev, ...validFiles]);
    setError('');
    setSuccess(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>
          <span className="icon"><FiImage /></span>
          JPG → PDF Converter
        </h1>
        <p>Convert images (JPG, PNG, etc.) to PDF format</p>
      </div>

      {/* Options Panel */}
      <div className="options-panel">
        <div className="options-grid">
          <div className="option-group">
            <label htmlFor="orientation">Orientation</label>
            <select
              id="orientation"
              value={options.orientation}
              onChange={(e) => setOptions({ ...options, orientation: e.target.value })}
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </div>
          <div className="option-group">
            <label htmlFor="pageSize">Page Size</label>
            <select
              id="pageSize"
              value={options.pageSize}
              onChange={(e) => setOptions({ ...options, pageSize: e.target.value })}
            >
              <option value="a4">A4</option>
              <option value="letter">Letter</option>
              <option value="legal">Legal</option>
              <option value="a3">A3</option>
            </select>
          </div>
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="fitToPage"
              checked={options.fitToPage}
              onChange={(e) => setOptions({ ...options, fitToPage: e.target.checked })}
            />
            <label htmlFor="fitToPage">Fit images to page</label>
          </div>
        </div>
      </div>

      <div className="action-bar">
        <div className="btn-group">
          <button className="btn btn-icon" onClick={handleClear} title="Clear all">
            <FiRefreshCw />
          </button>
        </div>
      </div>

      <div className="file-converter-container">
        {/* Upload Area */}
        <div 
          className={`file-drop-zone ${files.length > 0 ? 'has-file' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            hidden
          />
          
          <div className="drop-zone-content">
            <FiUpload className="upload-icon" />
            <p>Drag & drop images here</p>
            <p className="drop-zone-hint">or click to browse (supports multiple files)</p>
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="file-list">
            <div className="file-list-header">
              <h3>Selected Images ({files.length})</h3>
              <button 
                className="btn btn-secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                <FiPlus /> Add More
              </button>
            </div>
            <div className="file-list-items">
              {files.map((file, index) => (
                <div key={index} className="file-list-item">
                  <FiImage className="file-icon" />
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">({(file.size / 1024).toFixed(1)} KB)</span>
                  <button 
                    className="btn btn-icon btn-danger"
                    onClick={() => removeFile(index)}
                    title="Remove"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {converting && (
          <div className="progress-container">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <span className="progress-text">{progress}% - Converting...</span>
          </div>
        )}

        {/* Convert Button */}
        <button 
          className={`btn-convert-large ${converting ? 'converting' : ''}`}
          onClick={convert}
          disabled={files.length === 0 || converting}
        >
          {converting ? (
            <>
              <FiLoader className="spin" />
              Converting...
            </>
          ) : (
            <>
              <FiDownload />
              Convert to PDF
            </>
          )}
        </button>

        {/* Status Messages */}
        {error && (
          <div className="status-message error">
            {error}
          </div>
        )}
        
        {success && (
          <div className="status-message success">
            <FiCheck /> Conversion successful! Your PDF has been downloaded.
          </div>
        )}

        {/* Info Section */}
        <div className="converter-info">
          <h3>About Image to PDF Conversion</h3>
          <ul>
            <li>Supports JPG, PNG, GIF, and other image formats</li>
            <li>Combine multiple images into a single PDF</li>
            <li>Choose page orientation and size</li>
            <li>Works entirely in your browser - files are not uploaded</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default JpgToPdf;
