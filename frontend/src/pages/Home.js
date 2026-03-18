import React from 'react';
import { Link } from 'react-router-dom';
import { FiCode, FiFileText, FiTool, FiArrowRight, FiZap, FiGlobe, FiShield, FiCpu, FiFile, FiHeart } from 'react-icons/fi';
import './Home.css';

const categories = [
  {
    id: 'converters',
    title: 'Code & File Conversion',
    description: 'Convert between formats instantly',
    icon: <FiCode />,
    color: '#6366f1',
    tools: [
      { name: 'CSV → JSON', path: '/tools/csv-to-json' },
      { name: 'JSON → CSV', path: '/tools/json-to-csv' },
      { name: 'XML → JSON', path: '/tools/xml-to-json' },
      { name: 'YAML → JSON', path: '/tools/yaml-to-json' },
      { name: 'SVG → Code', path: '/tools/svg-to-code' },
    ]
  },
  {
    id: 'fileconverters',
    title: 'File Conversions',
    description: 'Convert PDF, Word, Images & more',
    icon: <FiFile />,
    color: '#f59e0b',
    singleLink: '/tools/file-converter',
    tools: [
      { name: 'PDF ↔ Word', path: '/tools/file-converter' },
      { name: 'PDF ↔ DOC', path: '/tools/file-converter' },
      { name: 'Images ↔ PDF', path: '/tools/file-converter' },
    ]
  },
  {
    id: 'formatters',
    title: 'Formatters & Validators',
    description: 'Beautify and validate your code',
    icon: <FiFileText />,
    color: '#8b5cf6',
    tools: [
      { name: 'JSON Formatter', path: '/tools/json-formatter' },
      { name: 'SQL Formatter', path: '/tools/sql-formatter' },
      { name: 'HTML Formatter', path: '/tools/html-formatter' },
      { name: 'Regex Tester', path: '/tools/regex-tester' },
    ]
  },
  {
    id: 'generators',
    title: 'Generator Tools',
    description: 'Generate what you need instantly',
    icon: <FiTool />,
    color: '#ec4899',
    tools: [
      { name: 'UUID Generator', path: '/tools/uuid-generator' },
      { name: 'Password Generator', path: '/tools/password-generator' },
      { name: 'Lorem Ipsum', path: '/tools/lorem-generator' },
      { name: 'Color Generator', path: '/tools/color-generator' },
    ]
  },
  {
    id: 'wellness',
    title: "Developer's Wellness",
    description: 'Stay healthy while coding',
    icon: <FiHeart />,
    color: '#10b981',
    tools: [
      { name: 'Devodoro', path: '/wellness/devodoro' },
      { name: 'Stretch Breaks', path: '/wellness/stretch-breaks' },
      { name: 'Breathing Reset', path: '/wellness/breathing-reset' },
    ]
  },
];

const features = [
  { icon: <FiZap />, title: 'Lightning Fast', desc: 'All tools run locally in your browser' },
  { icon: <FiShield />, title: 'Privacy First', desc: 'Your data never leaves your device' },
  { icon: <FiGlobe />, title: 'Works Offline', desc: 'Use anywhere, anytime' },
  { icon: <FiCpu />, title: 'Developer Built', desc: 'Made by developers, for developers' },
];

function Home() {
  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-gradient"></div>
          <div className="hero-grid"></div>
        </div>
        
        <div className="hero-content">
          <div className="hero-badge">
            <FiZap /> All-in-One Developer Suite
          </div>
          <h1 className="hero-title">
            Developer Tools
            <span className="gradient-text"> Reimagined</span>
          </h1>
          <p className="hero-subtitle">
            Powerful conversion, formatting, generation, and productivity tools—all in one place. 
            Fast, private, and built for developers.
          </p>
          <div className="hero-actions">
            <Link to="/tools/json-formatter" className="btn btn-primary btn-lg">
              Get Started <FiArrowRight />
            </Link>
            <Link to="/tools/uuid-generator" className="btn btn-secondary btn-lg">
              Explore Tools
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="features-strip">
          {features.map((feature, index) => (
            <div key={index} className="feature-item">
              <span className="feature-icon">{feature.icon}</span>
              <div className="feature-text">
                <h4>{feature.title}</h4>
                <p>{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories">
        <div className="section-header">
          <h2>Explore Tools</h2>
          <p>Everything you need for modern development</p>
        </div>

        <div className="categories-grid">
          {categories.map((category) => (
            <div key={category.id} className="category-card" style={{ '--accent': category.color }}>
              <div className="category-header">
                <div className="category-icon">{category.icon}</div>
                <div className="category-info">
                  <h3>{category.title}</h3>
                  <p>{category.description}</p>
                </div>
              </div>
              <div className="category-tools">
                {category.tools.map((tool) => (
                  <Link key={tool.path} to={tool.path} className="tool-link">
                    {tool.name}
                    <FiArrowRight />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="quick-access">
        <div className="section-header">
          <h2>Popular Tools</h2>
          <p>Jump right into our most-used tools</p>
        </div>
        
        <div className="quick-grid">
          <Link to="/tools/json-formatter" className="quick-card">
            <span className="quick-icon">{ }</span>
            <span className="quick-name">JSON Formatter</span>
          </Link>
          <Link to="/tools/file-converter" className="quick-card">
            <span className="quick-icon">📄</span>
            <span className="quick-name">File Converter</span>
          </Link>
          <Link to="/tools/uuid-generator" className="quick-card">
            <span className="quick-icon">#</span>
            <span className="quick-name">UUID Generator</span>
          </Link>
          <Link to="/tools/svg-to-code" className="quick-card">
            <span className="quick-icon">&lt;/&gt;</span>
            <span className="quick-name">SVG → Code</span>
          </Link>
          <Link to="/wellness/devodoro" className="quick-card">
            <span className="quick-icon">⏱</span>
            <span className="quick-name">Devodoro</span>
          </Link>
          <Link to="/tools/password-generator" className="quick-card">
            <span className="quick-icon">🔐</span>
            <span className="quick-name">Password Gen</span>
          </Link>
        </div>
      </section>

      {/* About Section */}
      <section className="about">
        <div className="section-header">
          <h2>Why Choose AllDevTools?</h2>
          <p>Everything developers need in one comprehensive suite</p>
        </div>
        
        <div className="about-content">
          <div className="about-text">
            <p>
              AllDevTools is a comprehensive collection of developer utilities designed to streamline your workflow 
              and boost productivity. Whether you're converting data formats, formatting code, generating test data, 
              or maintaining your coding wellness, we have the tools you need.
            </p>
            <p>
              Built with modern web technologies, all our tools run directly in your browser, ensuring your data 
              never leaves your device. This approach guarantees privacy, speed, and reliability for all your 
              development tasks.
            </p>
            <p>
              Our suite includes powerful converters for transforming between different data formats like JSON, 
              CSV, XML, YAML, and more. Code formatters help you maintain clean, readable code in multiple 
              programming languages. Generators create everything from UUIDs and passwords to lorem ipsum text 
              and color palettes.
            </p>
            <p>
              We also prioritize developer wellness with tools like Devodoro (a Pomodoro timer adapted for 
              developers), stretch break reminders, and breathing exercises to help you maintain focus and 
              physical health during long coding sessions.
            </p>
          </div>
          <div className="about-stats">
            <div className="stat">
              <span className="stat-number">20+</span>
              <span className="stat-label">Tools Available</span>
            </div>
            <div className="stat">
              <span className="stat-number">100%</span>
              <span className="stat-label">Privacy Focused</span>
            </div>
            <div className="stat">
              <span className="stat-number">0</span>
              <span className="stat-label">Data Collection</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Detail Section */}
      <section className="features-detail">
        <div className="section-header">
          <h2>Powerful Features</h2>
          <p>Explore what makes our tools exceptional</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-large">
              <FiCode />
            </div>
            <h3>Data Conversion</h3>
            <p>
              Seamlessly convert between popular data formats including JSON, CSV, XML, YAML, and SVG. 
              Our conversion tools handle complex nested structures and preserve data integrity during transformation.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon-large">
              <FiFileText />
            </div>
            <h3>Code Formatting</h3>
            <p>
              Format and validate code in multiple languages including JSON, SQL, HTML, CSS, and JavaScript. 
              Our formatters include syntax highlighting, error detection, and customizable formatting options.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon-large">
              <FiTool />
            </div>
            <h3>Data Generation</h3>
            <p>
              Generate test data, UUIDs, secure passwords, lorem ipsum text, and color palettes. 
              Perfect for development, testing, and design workflows.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon-large">
              <FiFile />
            </div>
            <h3>File Processing</h3>
            <p>
              Convert between document formats including PDF, Word documents, and images. 
              Process files directly in your browser without uploading to external servers.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon-large">
              <FiHeart />
            </div>
            <h3>Developer Wellness</h3>
            <p>
              Maintain coding health with Pomodoro timers, stretch break reminders, and breathing exercises. 
              Designed specifically for developers to prevent burnout and maintain productivity.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon-large">
              <FiShield />
            </div>
            <h3>Privacy & Security</h3>
            <p>
              All processing happens locally in your browser. Your code, data, and files never leave your device, 
              ensuring complete privacy and security for sensitive development work.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
