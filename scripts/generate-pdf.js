const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const puppeteer = require('puppeteer');
const { PDFDocument } = require('pdf-lib');
const { marked } = require('marked');

// Get version from command line
const version = process.argv[2] || 'current'; // Default to current docs

// Configuration - can be moved to a config file if needed
const BLACKLISTED_CATEGORIES = process.env.BLACKLISTED_CATEGORIES 
  ? process.env.BLACKLISTED_CATEGORIES.split(',') 
  : []; // Example: 'changelog,roadmap'
const BASE_DIR = path.join(__dirname, '..');
const LOCALE = process.env.LOCALE || 'en'; // Default to English

const getDocsDir = () => {
  if (LOCALE === 'en') {
    return version === 'current'
      ? path.join(BASE_DIR, 'docs')
      : path.join(BASE_DIR, `versioned_docs/version-${version}`);
  }
  return version === 'current'
    ? path.join(BASE_DIR, `i18n/${LOCALE}/docusaurus-plugin-content-docs/current`)
    : path.join(BASE_DIR, `i18n/${LOCALE}/docusaurus-plugin-content-docs/version-${version}`);
};

const getSidebarPath = () => {
  if (version === 'current') {
    if (LOCALE === 'en') {
      return path.join(BASE_DIR, 'sidebars.js');
    }
    return path.join(BASE_DIR, `i18n/${LOCALE}/docusaurus-plugin-content-docs/current/sidebars.json`);
  }
  // For versioned docs, always use JSON format
  if (LOCALE === 'en') {
    return path.join(BASE_DIR, `versioned_sidebars/version-${version}-sidebars.json`);
  }
  return path.join(BASE_DIR, `i18n/${LOCALE}/docusaurus-plugin-content-docs/version-${version}/sidebars.json`);
};

const DOCS_DIR = getDocsDir();
const SIDEBAR_PATH = getSidebarPath();
const OUTPUT_DIR = path.join(BASE_DIR, 'pdf-build');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

// 1. Parse the sidebar to get ordered doc IDs
function getOrderedDocIds() {
  // All versioned sidebars are in JSON format, current English sidebar might be JS
  let sidebars;
  try {
    if (version === 'current' && LOCALE === 'en' && SIDEBAR_PATH.endsWith('.js')) {
      // Clear require cache to ensure fresh load
      delete require.cache[require.resolve(SIDEBAR_PATH)];
      sidebars = require(SIDEBAR_PATH);
    } else {
      const sidebarContent = fs.readFileSync(SIDEBAR_PATH, 'utf8');
      sidebars = JSON.parse(sidebarContent);
    }
    
    if (!sidebars) {
      throw new Error('Sidebar file is empty');
    }
    
    // Handle different sidebar structures
    let docsSidebar;
    if (sidebars.docsSidebar) {
      docsSidebar = sidebars.docsSidebar;
    } else if (sidebars.defaultSidebar) {
      docsSidebar = sidebars.defaultSidebar;
    } else if (Array.isArray(sidebars)) {
      docsSidebar = sidebars;
    } else {
      // Try to find the first array in the sidebar object
      const sidebarKeys = Object.keys(sidebars);
      const firstArrayKey = sidebarKeys.find(key => Array.isArray(sidebars[key]));
      if (firstArrayKey) {
        docsSidebar = sidebars[firstArrayKey];
      } else {
        throw new Error('Could not find docs sidebar in sidebar file');
      }
    }
    
  } catch (error) {
    console.error(`Error parsing sidebar file at ${SIDEBAR_PATH}:`, error);
    process.exit(1);
  }

  const docIds = [];
  
  function processItems(items) {
    if (!items) return;
    
    // Ensure items is an array before forEach
    if (!Array.isArray(items)) {
      console.warn(`Warning: Expected array but got ${typeof items} for sidebar items`);
      return;
    }
    
    items.forEach(item => {
      // Simple doc link (string ID)
      if (typeof item === 'string') {
        docIds.push(item);
      } 
      // Doc link with custom label {type: 'doc', id: '...'}
      else if (item.type === 'doc' && item.id) {
        docIds.push(item.id);
      }
      // Category with items
      else if (item.type === 'category') {
        // Skip blacklisted categories
        if (BLACKLISTED_CATEGORIES.includes(item.label?.toLowerCase())) {
          console.log(`Skipping blacklisted category: ${item.label}`);
          return;
        }
        
        if (item.link && item.link.type === 'doc') {
          // Category with index page
          docIds.push(item.link.id);
        }
        // Process nested items
        processItems(item.items);
      }
      // External links and other types are ignored
    });
  }
  
  processItems(docsSidebar);
  const uniqueDocIds = docIds.filter((id, index, self) => self.indexOf(id) === index); // Remove duplicates
  console.log(`Found ${uniqueDocIds.length} documents to process`);
  return uniqueDocIds;
}

// 2. Find corresponding markdown files
function findMarkdownFiles(docIds) {
  return docIds.map(id => {
    // Convert doc ID to file path (Docusaurus convention) - try both .md and .mdx
    const basePath = path.join(DOCS_DIR, id);
    const possiblePaths = [
      `${basePath}.mdx`,
      `${basePath}.md`,
      path.join(basePath, 'index.mdx'),
      path.join(basePath, 'index.md')
    ];
    
    const filePath = possiblePaths.find(p => fs.existsSync(p));
    if (filePath) {
      return filePath;
    }
    console.warn(`Warning: Could not find file for doc ID ${id}`);
    return null;
  }).filter(Boolean);
}

async function generatePDFFromMarkdown(file, outputPath) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  try {
    // Read and preprocess markdown
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/^---[\s\S]+?---/, ''); // Remove front matter
    
    // Convert markdown to HTML
    const htmlContent = marked(content);
    
    // Create simple HTML wrapper
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
              padding: 20px; 
              max-width: 800px;
              margin: 0 auto;
            }
            pre { 
              background: #f5f5f5; 
              padding: 10px; 
              border-radius: 3px; 
              overflow-x: auto;
            }
            code {
              background: #f5f5f5;
              padding: 2px 4px;
              border-radius: 3px;
            }
            table {
              border-collapse: collapse;
              width: 100%;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
            }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `;

    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.pdf({
      path: outputPath,
      format: 'A4',
      margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' }
    });
  } finally {
    await browser.close();
  }
}

async function combinePDFs(pdfFiles, outputPath) {
  const mergedPdf = await PDFDocument.create();
  
  for (const file of pdfFiles) {
    const pdfBytes = fs.readFileSync(file);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
    pages.forEach(page => mergedPdf.addPage(page));
  }

  const mergedPdfBytes = await mergedPdf.save();
  fs.writeFileSync(outputPath, mergedPdfBytes);
}

// Main execution
async function main() {
  try {
    console.log(`Generating PDF for version: ${version}, locale: ${LOCALE}`);
    console.log(`Docs directory: ${DOCS_DIR}`);
    console.log(`Sidebar path: ${SIDEBAR_PATH}`);
    
    // Verify directories exist
    if (!fs.existsSync(DOCS_DIR)) {
      throw new Error(`Docs directory does not exist: ${DOCS_DIR}`);
    }
    if (!fs.existsSync(SIDEBAR_PATH)) {
      throw new Error(`Sidebar file does not exist: ${SIDEBAR_PATH}`);
    }
    
    const docIds = getOrderedDocIds();
    if (docIds.length === 0) {
      throw new Error('No documents found in sidebar');
    }
    
    const markdownFiles = findMarkdownFiles(docIds);
    if (markdownFiles.length === 0) {
      throw new Error('No markdown files found');
    }
    
    console.log(`Processing ${markdownFiles.length} files...`);
    
    // Generate individual PDFs
    const tempPdfDir = path.join(OUTPUT_DIR, 'temp');
    if (!fs.existsSync(tempPdfDir)) {
      fs.mkdirSync(tempPdfDir, { recursive: true });
    }
    
    const pdfFiles = [];
    for (const [index, file] of markdownFiles.entries()) {
      const pdfPath = path.join(tempPdfDir, `${String(index).padStart(3, '0')}.pdf`);
      console.log(`Processing ${index + 1}/${markdownFiles.length}: ${path.basename(file)}`);
      await generatePDFFromMarkdown(file, pdfPath);
      pdfFiles.push(pdfPath);
    }
    
    // Combine PDFs
    const outputFilename = `docs-${version}${LOCALE !== 'en' ? `-${LOCALE}` : ''}.pdf`;
    const outputPath = path.join(OUTPUT_DIR, outputFilename);
    console.log('Combining PDFs...');
    await combinePDFs(pdfFiles, outputPath);
    
    // Clean up temp files
    fs.rmSync(tempPdfDir, { recursive: true, force: true });
    
    console.log('Successfully generated combined PDF');
    console.log(`Output file: ${outputPath}`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    process.exit(1);
  }
}

main();
