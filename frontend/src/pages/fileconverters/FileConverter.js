import React, { useState, useRef } from 'react';
import { FiUpload, FiDownload, FiFile, FiRefreshCw, FiCheck, FiLoader, FiImage, FiTrash2, FiPlus, FiArrowRight } from 'react-icons/fi';
import * as pdfjsLib from 'pdfjs-dist';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import mammoth from 'mammoth';
import jsPDF from 'jspdf';
import '../ToolPage.css';
import './FileConverter.css';

// Set worker source - using local worker file for reliability
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

const conversionTypes = [
  { id: 'pdf-to-word', name: 'PDF → Word', from: 'PDF', to: 'Word (.docx)', accept: '.pdf', icon: '📄' },
  { id: 'word-to-pdf', name: 'Word → PDF', from: 'Word', to: 'PDF', accept: '.doc,.docx', icon: '📝' },
  { id: 'pdf-to-doc', name: 'PDF → DOC', from: 'PDF', to: 'DOC', accept: '.pdf', icon: '📄' },
  { id: 'doc-to-pdf', name: 'DOC → PDF', from: 'DOC/DOCX', to: 'PDF', accept: '.doc,.docx', icon: '📝' },
  { id: 'jpg-to-pdf', name: 'Images → PDF', from: 'Images', to: 'PDF', accept: 'image/*', icon: '🖼️', multiple: true },
  { id: 'pdf-to-jpg', name: 'PDF → Images', from: 'PDF', to: 'JPG Images', accept: '.pdf', icon: '📄' },
];

function FileConverter() {
  const [selectedType, setSelectedType] = useState(conversionTypes[0]);
  const [files, setFiles] = useState([]);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [progress, setProgress] = useState(0);
  const [outputImages, setOutputImages] = useState([]);
  const [options, setOptions] = useState({
    orientation: 'portrait',
    pageSize: 'a4',
    fitToPage: true,
    quality: 0.92,
    scale: 2
  });
  const fileInputRef = useRef(null);

  const handleTypeChange = (type) => {
    setSelectedType(type);
    setFiles([]);
    setError('');
    setSuccess(false);
    setProgress(0);
    setOutputImages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    if (selectedType.multiple) {
      const validFiles = selectedFiles.filter(file => file.type.startsWith('image/'));
      if (validFiles.length === 0) {
        setError('Please select image files');
        return;
      }
      setFiles(prev => [...prev, ...validFiles]);
    } else {
      setFiles([selectedFiles[0]]);
    }
    setError('');
    setSuccess(false);
    setOutputImages([]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleClear = () => {
    setFiles([]);
    setError('');
    setSuccess(false);
    setProgress(0);
    setOutputImages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    
    if (selectedType.multiple) {
      const validFiles = droppedFiles.filter(file => file.type.startsWith('image/'));
      if (validFiles.length > 0) {
        setFiles(prev => [...prev, ...validFiles]);
        setError('');
        setSuccess(false);
      }
    } else {
      setFiles([droppedFiles[0]]);
      setError('');
      setSuccess(false);
    }
    setOutputImages([]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Helper function to extract structured text from PDF
  const extractStructuredText = async (page) => {
    const content = await page.getTextContent();
    const viewport = page.getViewport({ scale: 1.0 });
    const pageHeight = viewport.height;
    
    // Sort items by Y position (top to bottom) then X position (left to right)
    const items = content.items
      .filter(item => item.str.trim())
      .map(item => ({
        text: item.str,
        x: item.transform[4],
        y: pageHeight - item.transform[5], // Convert to top-down coordinates
        width: item.width,
        height: item.height,
        fontSize: Math.abs(item.transform[0]) || 12,
        fontName: item.fontName || ''
      }))
      .sort((a, b) => {
        // Group by Y position with tolerance
        const yDiff = a.y - b.y;
        if (Math.abs(yDiff) < 5) {
          return a.x - b.x; // Same line, sort by X
        }
        return yDiff; // Different lines, sort by Y
      });
    
    if (items.length === 0) return [];
    
    // Group items into lines
    const lines = [];
    let currentLine = [items[0]];
    let currentY = items[0].y;
    
    for (let i = 1; i < items.length; i++) {
      const item = items[i];
      // If Y position is similar (within 5 units), it's the same line
      if (Math.abs(item.y - currentY) < 5) {
        currentLine.push(item);
      } else {
        // New line
        lines.push({
          items: currentLine,
          y: currentY,
          text: currentLine.map(i => i.text).join(' '),
          avgFontSize: currentLine.reduce((sum, i) => sum + i.fontSize, 0) / currentLine.length,
          startX: Math.min(...currentLine.map(i => i.x))
        });
        currentLine = [item];
        currentY = item.y;
      }
    }
    // Don't forget the last line
    if (currentLine.length > 0) {
      lines.push({
        items: currentLine,
        y: currentY,
        text: currentLine.map(i => i.text).join(' '),
        avgFontSize: currentLine.reduce((sum, i) => sum + i.fontSize, 0) / currentLine.length,
        startX: Math.min(...currentLine.map(i => i.x))
      });
    }
    
    // Detect paragraphs based on vertical spacing
    const paragraphs = [];
    let currentParagraph = [];
    let prevY = lines[0]?.y || 0;
    const avgLineHeight = lines.length > 1 
      ? (lines[lines.length - 1].y - lines[0].y) / (lines.length - 1)
      : 15;
    
    for (const line of lines) {
      const verticalGap = line.y - prevY;
      
      // Detect paragraph break (gap > 1.5x average line height)
      if (currentParagraph.length > 0 && verticalGap > avgLineHeight * 1.5) {
        paragraphs.push(currentParagraph);
        currentParagraph = [];
      }
      
      currentParagraph.push(line);
      prevY = line.y;
    }
    if (currentParagraph.length > 0) {
      paragraphs.push(currentParagraph);
    }
    
    return paragraphs;
  };

  // Detect if line is a bullet point
  const isBulletPoint = (text) => {
    const bulletPatterns = [
      /^[\u2022\u2023\u25E6\u2043\u2219•●○◦‣⁃]\s*/,  // Unicode bullets
      /^[-–—]\s+/,  // Dashes
      /^\*\s+/,  // Asterisk
      /^\d+[.)]\s+/,  // Numbered lists
      /^[a-zA-Z][.)]\s+/,  // Lettered lists
    ];
    return bulletPatterns.some(pattern => pattern.test(text.trim()));
  };

  // Detect if line is likely a header
  const isHeader = (line, avgFontSize) => {
    return line.avgFontSize > avgFontSize * 1.1 || 
           /^[A-Z][A-Z\s]+$/.test(line.text.trim()) ||
           (line.text.length < 50 && line.avgFontSize >= avgFontSize);
  };

  // PDF to Word/DOC conversion with formatting preservation
  const convertPdfToWord = async (file, extension = 'docx') => {
    const arrayBuffer = await file.arrayBuffer();
    const pdfData = new Uint8Array(arrayBuffer);
    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
    
    const allParagraphs = [];
    let totalFontSize = 0;
    let fontSizeCount = 0;

    // First pass: extract all text and calculate average font size
    for (let i = 1; i <= pdf.numPages; i++) {
      setProgress(Math.round((i / pdf.numPages) * 30));
      const page = await pdf.getPage(i);
      const paragraphs = await extractStructuredText(page);
      
      paragraphs.forEach(para => {
        para.forEach(line => {
          totalFontSize += line.avgFontSize;
          fontSizeCount++;
        });
      });
      
      allParagraphs.push({ pageNum: i, paragraphs });
    }

    const avgFontSize = fontSizeCount > 0 ? totalFontSize / fontSizeCount : 12;

    if (allParagraphs.every(p => p.paragraphs.length === 0)) {
      throw new Error('Could not extract text from PDF. The PDF may contain only images.');
    }

    // Second pass: create Word document with proper formatting
    const children = [];
    
    allParagraphs.forEach((pageData, pageIndex) => {
      const { pageNum, paragraphs } = pageData;
      
      // Add page break between pages (except first page)
      if (pageIndex > 0) {
        children.push(
          new Paragraph({
            children: [],
            pageBreakBefore: true,
          })
        );
      }

      paragraphs.forEach((para, paraIndex) => {
        setProgress(30 + Math.round(((pageIndex * paragraphs.length + paraIndex) / 
          (allParagraphs.reduce((sum, p) => sum + p.paragraphs.length, 0))) * 70));
        
        para.forEach(line => {
          const text = line.text.trim();
          if (!text) return;
          
          const isBullet = isBulletPoint(text);
          const isHead = isHeader(line, avgFontSize);
          
          // Calculate relative font size for Word (half-points)
          const wordFontSize = Math.round((line.avgFontSize / avgFontSize) * 22);
          
          if (isBullet) {
            // Remove bullet character and create bullet point
            const cleanText = text.replace(/^[\u2022\u2023\u25E6\u2043\u2219•●○◦‣⁃\-–—\*]\s*/, '')
                                  .replace(/^\d+[.)]\s*/, '')
                                  .replace(/^[a-zA-Z][.)]\s*/, '');
            children.push(
              new Paragraph({
                children: [new TextRun({ text: cleanText, size: wordFontSize })],
                bullet: { level: 0 },
                spacing: { after: 80 },
              })
            );
          } else if (isHead) {
            // Create header
            children.push(
              new Paragraph({
                children: [new TextRun({ text: text, bold: true, size: Math.max(wordFontSize, 24) })],
                spacing: { before: 240, after: 120 },
              })
            );
          } else {
            // Regular paragraph
            children.push(
              new Paragraph({
                children: [new TextRun({ text: text, size: wordFontSize })],
                spacing: { after: 80 },
              })
            );
          }
        });
        
        // Add extra spacing between paragraphs
        if (paraIndex < paragraphs.length - 1) {
          children.push(new Paragraph({ spacing: { after: 160 } }));
        }
      });
    });

    const doc = new Document({ 
      sections: [{ 
        properties: {
          page: {
            margin: {
              top: 1440,    // 1 inch = 1440 twips
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children 
      }] 
    });
    
    const blob = await Packer.toBlob(doc);
    const fileName = file.name.replace('.pdf', `.${extension}`);
    saveAs(blob, fileName);
  };

  // Word/DOC to PDF conversion
  const convertWordToPdf = async (file) => {
    setProgress(20);
    const arrayBuffer = await file.arrayBuffer();
    
    setProgress(40);
    const result = await mammoth.extractRawText({ arrayBuffer });
    const text = result.value;
    
    if (!text.trim()) {
      throw new Error('Could not extract text from the document');
    }
    
    setProgress(60);
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const lineHeight = 7;
    const maxWidth = pageWidth - margin * 2;
    
    const lines = pdf.splitTextToSize(text, maxWidth);
    let y = margin;
    
    setProgress(80);
    lines.forEach((line) => {
      if (y + lineHeight > pageHeight - margin) {
        pdf.addPage();
        y = margin;
      }
      pdf.text(line, margin, y);
      y += lineHeight;
    });
    
    setProgress(100);
    const fileName = file.name.replace(/\.(docx?|doc)$/i, '.pdf');
    pdf.save(fileName);
  };

  // Images to PDF conversion
  const convertImagesToPdf = async () => {
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
      
      const file = files[i];
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      const img = await new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = dataUrl;
      });

      if (i > 0) pdf.addPage();
      
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
  };

  // PDF to Images conversion
  const convertPdfToImages = async (file) => {
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
      
      await page.render({ canvasContext: ctx, viewport }).promise;
      
      const imageData = canvas.toDataURL('image/jpeg', options.quality);
      convertedImages.push({ page: i, data: imageData });
    }
    
    setOutputImages(convertedImages);
  };

  const convert = async () => {
    if (files.length === 0) {
      setError('Please select a file first');
      return;
    }

    setConverting(true);
    setError('');
    setSuccess(false);
    setProgress(0);
    setOutputImages([]);

    try {
      switch (selectedType.id) {
        case 'pdf-to-word':
          await convertPdfToWord(files[0], 'docx');
          break;
        case 'pdf-to-doc':
          await convertPdfToWord(files[0], 'doc');
          break;
        case 'word-to-pdf':
        case 'doc-to-pdf':
          await convertWordToPdf(files[0]);
          break;
        case 'jpg-to-pdf':
          await convertImagesToPdf();
          break;
        case 'pdf-to-jpg':
          await convertPdfToImages(files[0]);
          break;
        default:
          throw new Error('Unknown conversion type');
      }
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
    link.download = `${files[0]?.name.replace('.pdf', '')}-page-${pageNum}.jpg`;
    link.click();
  };

  const downloadAllImages = () => {
    outputImages.forEach((img, index) => {
      setTimeout(() => downloadImage(img.data, img.page), index * 200);
    });
  };

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>
          <span className="icon"><FiFile /></span>
          File Converter
        </h1>
        <p>Convert between PDF, Word, DOC, and Image formats</p>
      </div>

      {/* Conversion Type Selector */}
      <div className="conversion-type-selector">
        {conversionTypes.map((type) => (
          <button
            key={type.id}
            className={`conversion-type-btn ${selectedType.id === type.id ? 'active' : ''}`}
            onClick={() => handleTypeChange(type)}
          >
            <span className="type-icon">{type.icon}</span>
            <span className="type-name">{type.name}</span>
          </button>
        ))}
      </div>

      {/* Selected Conversion Info */}
      <div className="conversion-info-bar">
        <span className="from-format">{selectedType.from}</span>
        <FiArrowRight className="arrow-icon" />
        <span className="to-format">{selectedType.to}</span>
      </div>

      {/* Options Panel - Show for specific conversions */}
      {(selectedType.id === 'jpg-to-pdf' || selectedType.id === 'pdf-to-jpg') && (
        <div className="options-panel">
          <div className="options-grid">
            {selectedType.id === 'jpg-to-pdf' && (
              <>
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
              </>
            )}
            {selectedType.id === 'pdf-to-jpg' && (
              <>
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
              </>
            )}
          </div>
        </div>
      )}

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
            accept={selectedType.accept}
            multiple={selectedType.multiple}
            onChange={handleFileChange}
            hidden
          />
          
          {files.length > 0 && !selectedType.multiple ? (
            <div className="file-info">
              <FiFile className="file-icon" />
              <span className="file-name">{files[0].name}</span>
              <span className="file-size">({(files[0].size / 1024 / 1024).toFixed(2)} MB)</span>
            </div>
          ) : (
            <div className="drop-zone-content">
              <FiUpload className="upload-icon" />
              <p>Drag & drop your {selectedType.from} file{selectedType.multiple ? 's' : ''} here</p>
              <p className="drop-zone-hint">or click to browse ({selectedType.accept})</p>
            </div>
          )}
        </div>

        {/* File List for multiple files */}
        {selectedType.multiple && files.length > 0 && (
          <div className="file-list">
            <div className="file-list-header">
              <h3>Selected Files ({files.length})</h3>
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
              Convert to {selectedType.to}
            </>
          )}
        </button>

        {/* Output Images for PDF to JPG */}
        {outputImages.length > 0 && (
          <div className="image-preview-section">
            <div className="image-preview-header">
              <h3>Converted Pages ({outputImages.length})</h3>
              <button className="btn btn-primary" onClick={downloadAllImages}>
                <FiDownload /> Download All
              </button>
            </div>
            <div className="image-preview-grid">
              {outputImages.map((img) => (
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
        
        {success && outputImages.length === 0 && (
          <div className="status-message success">
            <FiCheck /> Conversion successful! Your file has been downloaded.
          </div>
        )}

        {success && outputImages.length > 0 && (
          <div className="status-message success">
            <FiCheck /> Conversion successful! {outputImages.length} page(s) converted.
          </div>
        )}

        {/* Info Section */}
        <div className="converter-info">
          <h3>About {selectedType.name} Conversion</h3>
          <ul>
            <li>Works entirely in your browser - files are not uploaded</li>
            <li>Your data stays private and secure</li>
            {selectedType.id.includes('pdf-to') && <li>Text-based PDFs work best for conversion</li>}
            {selectedType.id.includes('-to-pdf') && <li>Creates standard PDF documents</li>}
            {selectedType.multiple && <li>Select multiple files to combine into one PDF</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default FileConverter;
