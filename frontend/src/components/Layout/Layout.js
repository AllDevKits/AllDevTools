import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiCode, FiFileText, FiTool, FiClock, FiChevronDown, FiChevronRight, FiHome, FiZap, FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';
import './Layout.css';

const menuItems = [
  {
    id: 'converters',
    title: 'Code and File Conversion',
    icon: <FiCode />,
    items: [
      { name: 'CSV → JSON', path: '/tools/csv-to-json' },
      { name: 'JSON → CSV', path: '/tools/json-to-csv' },
      { name: 'XML → JSON', path: '/tools/xml-to-json' },
      { name: 'YAML → JSON', path: '/tools/yaml-to-json' },
      { name: 'Markdown → HTML', path: '/tools/markdown-to-html' },
      { name: 'HTML → Markdown', path: '/tools/html-to-markdown' },
      { name: 'SVG → Code', path: '/tools/svg-to-code' },
    ]
  },
  {
    id: 'formatters',
    title: 'Formatter, Validator & Beautifier',
    icon: <FiFileText />,
    items: [
      { name: 'JSON Formatter', path: '/tools/json-formatter' },
      { name: 'SQL Formatter', path: '/tools/sql-formatter' },
      { name: 'HTML Formatter', path: '/tools/html-formatter' },
      { name: 'CSS Formatter', path: '/tools/css-formatter' },
      { name: 'JS Formatter', path: '/tools/js-formatter' },
      { name: 'Regex Tester', path: '/tools/regex-tester' },
    ]
  },
  {
    id: 'generators',
    title: 'Generator Tools',
    icon: <FiTool />,
    items: [
      { name: 'UUID Generator', path: '/tools/uuid-generator' },
      { name: 'Password Generator', path: '/tools/password-generator' },
      { name: 'Lorem Ipsum Generator', path: '/tools/lorem-generator' },
      { name: 'Slug Generator', path: '/tools/slug-generator' },
      { name: 'Color Generator', path: '/tools/color-generator' },
      { name: 'JWT Decoder', path: '/tools/jwt-decoder' },
    ]
  },
  {
    id: 'devodoro',
    title: 'Devodoro',
    icon: <FiClock />,
    items: [
      { name: 'Focus Timer', path: '/devodoro' },
    ]
  },
];

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState(['converters']);
  const location = useLocation();
  const { theme, toggleTheme, isDark } = useTheme();

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const isActiveItem = (path) => location.pathname === path;
  
  const isActiveSection = (section) => {
    return section.items.some(item => location.pathname === item.path);
  };

  return (
    <div className="layout">
      {/* Mobile Menu Toggle */}
      <button 
        className="mobile-menu-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <FiX /> : <FiMenu />}
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'collapsed'} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-header">
          <Link to="/" className="logo">
            <div className="logo-icon">
              <FiZap />
            </div>
            <span className="logo-text">
              <span className="logo-main">AllDev</span>
              <span className="logo-accent">Tools</span>
            </span>
          </Link>
          <button 
            className="sidebar-toggle desktop-only"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            <FiMenu />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <Link 
            to="/" 
            className={`nav-home ${location.pathname === '/' ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <FiHome />
            <span>Home</span>
          </Link>

          {menuItems.map((section) => (
            <div key={section.id} className="nav-section">
              <button
                className={`nav-section-header ${isActiveSection(section) ? 'active' : ''}`}
                onClick={() => toggleSection(section.id)}
              >
                <div className="section-header-left">
                  <span className="section-icon">{section.icon}</span>
                  <span className="section-title">{section.title}</span>
                </div>
                <span className="section-chevron">
                  {expandedSections.includes(section.id) ? <FiChevronDown /> : <FiChevronRight />}
                </span>
              </button>
              
              <div className={`nav-section-items ${expandedSections.includes(section.id) ? 'expanded' : ''}`}>
                {section.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`nav-item ${isActiveItem(item.path) ? 'active' : ''}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer with Theme Toggle */}
        <div className="sidebar-footer">
          <button 
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <div className={`theme-toggle-track ${isDark ? 'dark' : 'light'}`}>
              <div className="theme-toggle-thumb">
                {isDark ? <FiMoon /> : <FiSun />}
              </div>
            </div>
            <span className="theme-label">{isDark ? 'Dark' : 'Light'}</span>
          </button>
          <div className="version-badge">v1.0.0</div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className={`main-content ${sidebarOpen ? '' : 'expanded'}`}>
        {children}
      </main>
    </div>
  );
}

export default Layout;
