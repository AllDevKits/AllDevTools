import React from 'react';
import { Link } from 'react-router-dom';
import { FiCode, FiFileText, FiTool, FiClock, FiArrowRight, FiZap, FiGlobe, FiShield, FiCpu } from 'react-icons/fi';
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
    id: 'devodoro',
    title: 'Devodoro',
    description: 'Developer-focused productivity',
    icon: <FiClock />,
    color: '#10b981',
    tools: [
      { name: 'Focus Timer', path: '/devodoro' },
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
          <Link to="/tools/uuid-generator" className="quick-card">
            <span className="quick-icon">#</span>
            <span className="quick-name">UUID Generator</span>
          </Link>
          <Link to="/tools/svg-to-code" className="quick-card">
            <span className="quick-icon">&lt;/&gt;</span>
            <span className="quick-name">SVG → Code</span>
          </Link>
          <Link to="/devodoro" className="quick-card">
            <span className="quick-icon">⏱</span>
            <span className="quick-name">Devodoro Timer</span>
          </Link>
          <Link to="/tools/password-generator" className="quick-card">
            <span className="quick-icon">🔐</span>
            <span className="quick-name">Password Gen</span>
          </Link>
          <Link to="/tools/regex-tester" className="quick-card">
            <span className="quick-icon">.*</span>
            <span className="quick-name">Regex Tester</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <p>Built with ❤️ for developers everywhere</p>
        <p className="footer-copyright">© 2026 AllDevTools</p>
      </footer>
    </div>
  );
}

export default Home;
