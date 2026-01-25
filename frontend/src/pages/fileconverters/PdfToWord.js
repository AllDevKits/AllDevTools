import React, { useState, useRef } from 'react';
import { FiUpload, FiDownload, FiFile, FiRefreshCw, FiCheck, FiLoader } from 'react-icons/fi';
import * as pdfjsLib from 'pdfjs-dist';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import '../ToolPage.css';

// Set worker source - using local worker file for reliability
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

function PdfToWord() {
  const [file, setFile] = useState(null);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [progress, setProgress] = useState(0);
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
    }
  };

  const extractTextFromPdf = async (pdfData) => {
    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
    const textContent = [];
    
    for (let i = 1; i <= pdf.numPages; i++) {
      setProgress(Math.round((i / pdf.numPages) * 50));
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map(item => item.str).join(' ');
      textContent.push({ page: i, text: pageText });
    }
    
    return textContent;
  };

  const createWordDocument = async (textContent) => {
    const children = [];
    
    textContent.forEach((pageContent, index) => {
      // Add page header
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `--- Page ${pageContent.page} ---`,
              bold: true,
              size: 24,
            }),
          ],
          spacing: { after: 200 },
        })
      );
      
      // Add page content
      const paragraphs = pageContent.text.split(/\n+/).filter(p => p.trim());
      paragraphs.forEach(para => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: para,
                size: 22,
              }),
            ],
            spacing: { after: 120 },
          })
        );
      });
      
      // Add spacing between pages
      if (index < textContent.length - 1) {
        children.push(new Paragraph({ spacing: { after: 400 } }));
      }
      
      setProgress(50 + Math.round(((index + 1) / textContent.length) * 50));
    });
    
    const doc = new Document({
      sections: [{
        properties: {},
        children: children,
      }],
    });
    
    return doc;
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
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfData = new Uint8Array(arrayBuffer);
      
      // Extract text from PDF
      const textContent = await extractTextFromPdf(pdfData);
      
      if (textContent.every(page => !page.text.trim())) {
        setError('Could not extract text from PDF. The PDF may contain only images.');
        setConverting(false);
        return;
      }
      
      // Create Word document
      const doc = await createWordDocument(textContent);
      
      // Generate and download
      const blob = await Packer.toBlob(doc);
      const fileName = file.name.replace('.pdf', '.docx');
      saveAs(blob, fileName);
      
      setSuccess(true);
      setProgress(100);
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
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      setError('');
      setSuccess(false);
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
          PDF → Word Converter
        </h1>
        <p>Convert PDF documents to Word (.docx) format</p>
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
              <FiDownload />
              Convert to Word
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
            <FiCheck /> Conversion successful! Your file has been downloaded.
          </div>
        )}

        {/* Info Section */}
        <div className="converter-info">
          <h3>About PDF to Word Conversion</h3>
          <ul>
            <li>Extracts text content from PDF files</li>
            <li>Preserves text formatting where possible</li>
            <li>Works entirely in your browser - files are not uploaded</li>
            <li>Note: Image-based PDFs may not convert properly</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default PdfToWord;
