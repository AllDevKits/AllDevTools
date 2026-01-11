import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import CsvToJson from './pages/converters/CsvToJson';
import JsonToCsv from './pages/converters/JsonToCsv';
import XmlToJson from './pages/converters/XmlToJson';
import YamlToJson from './pages/converters/YamlToJson';
import MarkdownToHtml from './pages/converters/MarkdownToHtml';
import HtmlToMarkdown from './pages/converters/HtmlToMarkdown';
import SvgToCode from './pages/converters/SvgToCode';
import JsonFormatter from './pages/formatters/JsonFormatter';
import SqlFormatter from './pages/formatters/SqlFormatter';
import HtmlFormatter from './pages/formatters/HtmlFormatter';
import CssFormatter from './pages/formatters/CssFormatter';
import JsFormatter from './pages/formatters/JsFormatter';
import RegexTester from './pages/formatters/RegexTester';
import UuidGenerator from './pages/generators/UuidGenerator';
import PasswordGenerator from './pages/generators/PasswordGenerator';
import LoremGenerator from './pages/generators/LoremGenerator';
import SlugGenerator from './pages/generators/SlugGenerator';
import ColorGenerator from './pages/generators/ColorGenerator';
import JwtDecoder from './pages/generators/JwtDecoder';
import Devodoro from './pages/devodoro/Devodoro';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            {/* Converters */}
            <Route path="/tools/csv-to-json" element={<CsvToJson />} />
            <Route path="/tools/json-to-csv" element={<JsonToCsv />} />
            <Route path="/tools/xml-to-json" element={<XmlToJson />} />
            <Route path="/tools/yaml-to-json" element={<YamlToJson />} />
            <Route path="/tools/markdown-to-html" element={<MarkdownToHtml />} />
            <Route path="/tools/html-to-markdown" element={<HtmlToMarkdown />} />
            <Route path="/tools/svg-to-code" element={<SvgToCode />} />
            {/* Formatters */}
            <Route path="/tools/json-formatter" element={<JsonFormatter />} />
            <Route path="/tools/sql-formatter" element={<SqlFormatter />} />
            <Route path="/tools/html-formatter" element={<HtmlFormatter />} />
            <Route path="/tools/css-formatter" element={<CssFormatter />} />
            <Route path="/tools/js-formatter" element={<JsFormatter />} />
            <Route path="/tools/regex-tester" element={<RegexTester />} />
            {/* Generators */}
            <Route path="/tools/uuid-generator" element={<UuidGenerator />} />
            <Route path="/tools/password-generator" element={<PasswordGenerator />} />
            <Route path="/tools/lorem-generator" element={<LoremGenerator />} />
            <Route path="/tools/slug-generator" element={<SlugGenerator />} />
            <Route path="/tools/color-generator" element={<ColorGenerator />} />
            <Route path="/tools/jwt-decoder" element={<JwtDecoder />} />
            {/* Devodoro */}
            <Route path="/devodoro" element={<Devodoro />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
