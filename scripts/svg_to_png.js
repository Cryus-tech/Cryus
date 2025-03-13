/**
 * SVG to PNG Conversion Script
 * 
 * This script converts SVG files to PNG format
 * 
 * Usage:
 * node svg_to_png.js [input_file] [output_file] [width] [height]
 * 
 * Dependencies:
 * - sharp (npm install sharp)
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Default values
const DEFAULT_WIDTH = 250;
const DEFAULT_HEIGHT = 250;

async function convertSvgToPng(inputFile, outputFile, width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT) {
  try {
    // Read SVG file
    const svgBuffer = fs.readFileSync(inputFile);
    
    // Convert SVG to PNG
    await sharp(svgBuffer)
      .resize(width, height)
      .png()
      .toFile(outputFile);
    
    console.log(`Successfully converted ${inputFile} to ${outputFile}`);
  } catch (error) {
    console.error('Error converting SVG to PNG:', error);
  }
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: node svg_to_png.js [input_file] [output_file] [width] [height]');
    process.exit(1);
  }
  
  const inputFile = args[0];
  const outputFile = args[1];
  const width = args[2] ? parseInt(args[2], 10) : DEFAULT_WIDTH;
  const height = args[3] ? parseInt(args[3], 10) : DEFAULT_HEIGHT;
  
  convertSvgToPng(inputFile, outputFile, width, height);
}

module.exports = convertSvgToPng; 