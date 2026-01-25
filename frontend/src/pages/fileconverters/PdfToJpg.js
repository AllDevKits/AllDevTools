import React, { useState, useRef } from 'react';
import { FiUpload, FiDownload, FiFile, FiRefreshCw, FiCheck, FiLoader, FiImage } from 'react-icons/fi';
import * as pdfjsLib from 'pdfjs-dist';
import '../ToolPage.css';

// Set worker source - using local worker file for reliability
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

function PdfToJpg() {
  const [file, setFile] = useState(null);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [progress, setProgress] = useState(0);
  const [images, setImages] = useState([]);
  const [options, setOptions] = useState({
    quality: 0.92,
    scale: 2
  });
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('Please select a PDF file');
        return;
      }
      setFile(selectedFile);
      setError('');
      setSuccess(false);
      setImages([]);
    }
  };

  const convert = async () => {
    if (!file) {
      setError('Please select a PDF file first');
      return;
    }
    
    setConverting(true);
    setError('');
    setSuccess(false);
    setProgress(0);
    setImages([]);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfData = new Uint8Array(arrayBuffer);
      
      const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
      const convertedImages = [];
      
      for (let i = 1; i <= pdf.numPages; i++) {
        setProgress(Math.round((i / pdf.numPages) * 100));
        
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: options.scale });
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        await page.render({
          canvasContext: ctx,
          viewport: viewport
        }).promise;
        
        const imageData = canvas.toDataURL('image/jpeg', options.quality);
        convertedImages.push({
          page: i,
          data: imageData,
          width: viewport.width,
          height: viewport.height
        });
      }
      
      setImages(convertedImages);
      setSuccess(true);
      setProgress(100);
    } catch (err) {
      setError('Failed to convert: ' + err.message);
    } finally {
      setConverting(false);
    }
  };

  const downloadImage = (imageData, pageNum) => {
    const link = document.createElement('a');
    link.href = imageData;
    link.download = `${file.name.replace('.pdf', '')}-page-${pageNum}.jpg`;
    link.click();
  };

  const downloadAll = () => {
    images.forEach((img, index) => {
      setTimeout(() => {
        downloadImage(img.data, img.page);
      }, index * 200);
    });
  };

  const handleClear = () => {
    setFile(null);
    setError('');
    setSuccess(false);
    setProgress(0);
    setImages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      setError('');
      setSuccess(false);
      setImages([]);
    } else {
      setError('Please drop a PDF file');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>
          <span className="icon"><FiFile /></span>
          PDF → JPG Converter
        </h1>
        <p>Convert PDF pages to JPG images</p>
      </div>

      {/* Options Panel */}
      <div className="options-panel">
        <div className="options-grid">
          <div className="option-group">
            <label htmlFor="quality">Image Quality</label>
            <select
              id="quality"
              value={options.quality}
              onChange={(e) => setOptions({ ...options, quality: parseFloat(e.target.value) })}
            >
              <option value={0.6}>Low (60%)</option>
              <option value={0.8}>Medium (80%)</option>
              <option value={0.92}>High (92%)</option>
              <option value={1}>Maximum (100%)</option>
            </select>
          </div>
          <div className="option-group">
            <label htmlFor="scale">Resolution Scale</label>
            <select
              id="scale"
              value={options.scale}
              onChange={(e) => setOptions({ ...options, scale: parseFloat(e.target.value) })}
            >
              <option value={1}>1x (72 DPI)</option>
              <option value={1.5}>1.5x (108 DPI)</option>
              <option value={2}>2x (144 DPI)</option>
              <option value={3}>3x (216 DPI)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="action-bar">
        <div className="btn-group">
          <button className="btn btn-icon" onClick={handleClear} title="Clear">
            <FiRefreshCw />
          </button>
        </div>
      </div>

      <div className="file-converter-container">
        {/* Upload Area */}
        <div 
          className={`file-drop-zone ${file ? 'has-file' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            hidden
          />
          
          {file ? (
            <div className="file-info">
              <FiFile className="file-icon" />
              <span className="file-name">{file.name}</span>
              <span className="file-size">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
            </div>
          ) : (
            <div className="drop-zone-content">
              <FiUpload className="upload-icon" />
              <p>Drag & drop your PDF file here</p>
              <p className="drop-zone-hint">or click to browse</p>
            </div>
          )}
        </div>

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
          disabled={!file || converting}
        >
          {converting ? (
            <>
              <FiLoader className="spin" />
              Converting...
            </>
          ) : (
            <>
              <FiImage />
              Convert to Images
            </>
          )}
        </button>

        {/* Image Preview */}
        {images.length > 0 && (
          <div className="image-preview-section">
            <div className="image-preview-header">
              <h3>Converted Pages ({images.length})</h3>
              <button className="btn btn-primary" onClick={downloadAll}>
                <FiDownload /> Download All
              </button>
            </div>
            <div className="image-preview-grid">
              {images.map((img) => (
                <div key={img.page} className="image-preview-item">
                  <img src={img.data} alt={`Page ${img.page}`} />
                  <div className="image-preview-overlay">
                    <span>Page {img.page}</span>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => downloadImage(img.data, img.page)}
                    >
                      <FiDownload />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status Messages */}
        {error && (
          <div className="status-message error">
            {error}
          </div>
        )}
        
        {success && images.length > 0 && (
          <div className="status-message success">
            <FiCheck /> Conversion successful! {images.length} page(s) converted.
          </div>
        )}

        {/* Info Section */}
        <div className="converter-info">
          <h3>About PDF to Image Conversion</h3>
          <ul>
            <li>Converts each PDF page to a separate JPG image</li>
            <li>Adjustable quality and resolution settings</li>
            <li>Preview images before downloading</li>
            <li>Works entirely in your browser - files are not uploaded</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default PdfToJpg;
