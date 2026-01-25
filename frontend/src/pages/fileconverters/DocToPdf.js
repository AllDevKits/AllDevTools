import React, { useState, useRef } from 'react';
import { FiUpload, FiDownload, FiFile, FiRefreshCw, FiCheck, FiLoader } from 'react-icons/fi';
import mammoth from 'mammoth';
import jsPDF from 'jspdf';
import '../ToolPage.css';

function DocToPdf() {
  const [file, setFile] = useState(null);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword'
      ];
      if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(docx?|doc)$/i)) {
        setError('Please select a DOC or DOCX document');
        return;
      }
      setFile(selectedFile);
      setError('');
      setSuccess(false);
    }
  };

  const convert = async () => {
    if (!file) {
      setError('Please select a DOC document first');
      return;
    }
    
    setConverting(true);
    setError('');
    setSuccess(false);
    setProgress(0);
    
    try {
      setProgress(20);
      const arrayBuffer = await file.arrayBuffer();
      
      setProgress(40);
      // Extract text from DOC document
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = result.value;
      
      if (!text.trim()) {
        setError('Could not extract text from the document');
        setConverting(false);
        return;
      }
      
      setProgress(60);
      
      // Create PDF
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const lineHeight = 7;
      const maxWidth = pageWidth - margin * 2;
      
      // Split text into lines
      const lines = pdf.splitTextToSize(text, maxWidth);
      let y = margin;
      
      setProgress(80);
      
      lines.forEach((line, index) => {
        if (y + lineHeight > pageHeight - margin) {
          pdf.addPage();
          y = margin;
        }
        pdf.text(line, margin, y);
        y += lineHeight;
      });
      
      setProgress(100);
      
      // Download PDF
      const fileName = file.name.replace(/\.(docx?|doc)$/i, '.pdf');
      pdf.save(fileName);
      
      setSuccess(true);
    } catch (err) {
      setError('Failed to convert: ' + err.message);
    } finally {
      setConverting(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setError('');
    setSuccess(false);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.match(/\.(docx?|doc)$/i)) {
      setFile(droppedFile);
      setError('');
      setSuccess(false);
    } else {
      setError('Please drop a DOC or DOCX document');
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
          DOC → PDF Converter
        </h1>
        <p>Convert DOC/DOCX documents to PDF format</p>
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
            accept=".doc,.docx"
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
              <p>Drag & drop your DOC document here</p>
              <p className="drop-zone-hint">or click to browse (.doc, .docx)</p>
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
          <h3>About DOC to PDF Conversion</h3>
          <ul>
            <li>Supports both .doc and .docx formats</li>
            <li>Extracts and converts text content to PDF</li>
            <li>Works entirely in your browser - files are not uploaded</li>
            <li>Note: Complex formatting may be simplified</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default DocToPdf;
