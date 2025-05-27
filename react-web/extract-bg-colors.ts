#!/usr/bin/env node
// Run this script with: node extract-bg-colors.js
// Make sure to install jsdom: npm install jsdom

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const svgPath = path.join(__dirname, 'src/assets/maps/albania.svg');
const outputPath = path.join(__dirname, 'src/assets/maps/albania.metadata.json');

// Read SVG file
const svgContent = fs.readFileSync(svgPath, 'utf8');

// Parse SVG with JSDOM
const dom = new JSDOM(svgContent, { contentType: 'image/svg+xml' });
const document = dom.window.document;

const result = {};

// Find all <g> elements with an id
const gElements = Array.from(document.querySelectorAll('g[id]'));
gElements.forEach(g => {
  const id = g.getAttribute('id');
  // Find the first <path> (or rect, polygon, etc.) inside the <g>
  const shape = g.querySelector('path, rect, polygon, ellipse, circle, polyline');
  if (shape) {
    const style = shape.getAttribute('style');
    let fill = null;
    if (style) {
      // Extract fill from style string
      const match = style.match(/fill:([^;]+);/);
      if (match) {
        fill = match[1].trim();
      }
    }
    // Fallback: try fill attribute directly
    if (!fill && shape.hasAttribute('fill')) {
      fill = shape.getAttribute('fill');
    }
    if (fill) {
      result[id] = { bgColor: fill };
    }
  }
});

fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
console.log(`Extracted ${Object.keys(result).length} regions to src/assets/maps/albania.metadata.json`);