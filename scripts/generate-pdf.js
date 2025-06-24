const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const puppeteer = require('puppeteer');
const { PDFDocument } = require('pdf-lib');
const { marked } = require('marked');

// Help function
function showHelp() {
  console.log(`
Docusaurus PDF Generator

USAGE:
  node scripts/generate-pdf.js [VERSION] [OPTIONS]

ARGUMENTS:
  VERSION                 Version to generate PDF for (default: 'current')
                         Examples: current, 0.14, 0.13, 0.12

OPTIONS:
  --help, -h             Show this help message

ENVIRONMENT VARIABLES:
  LOCALE                 Language locale for the documentation (default: 'en')
                         Examples: en, zh, ja, fr
                         
  BLACKLISTED_CATEGORIES Comma-separated list of categories to exclude from PDF
                         Examples: changelog,roadmap,api-reference

EXAMPLES:
  # Generate PDF for current English docs
  node scripts/generate-pdf.js current
  
  # Generate PDF for version 0.14 English docs
  node scripts/generate-pdf.js 0.14
  
  # Generate PDF for current Chinese docs
  LOCALE=zh node scripts/generate-pdf.js current
  
  # Generate PDF for version 0.14 with blacklisted categories
  BLACKLISTED_CATEGORIES=changelog,roadmap node scripts/generate-pdf.js 0.14
  
  # Generate PDF for Chinese version 0.14 with blacklisted categories
  LOCALE=zh BLACKLISTED_CATEGORIES=changelog,roadmap node scripts/generate-pdf.js 0.14

OUTPUT:
  PDF files are generated in the 'pdf-build' directory with the naming pattern:
  - docs-current.pdf (for current English docs)
  - docs-0.14.pdf (for version 0.14 English docs)
  - docs-current-zh.pdf (for current Chinese docs)
  - docs-0.14-zh.pdf (for version 0.14 Chinese docs)

NOTES:
  - The script follows the sidebar order defined in sidebars.js or versioned sidebar files
  - Outbound links (http://, https://) are converted to plain text in the PDF
  - Front matter is automatically removed from markdown files
  - Individual PDFs are generated first, then combined into a single document
`);
}

// Parse command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  showHelp();
  process.exit(0);
}

// Get version from command line
const version = args[0] || 'current'; // Default to current docs

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
    // For current localized docs, use the main sidebars.js (same structure for all locales)
    return path.join(BASE_DIR, 'sidebars.js');
  }
  // For versioned docs, always use the versioned sidebar (same for all locales)
  return path.join(BASE_DIR, `versioned_sidebars/version-${version}-sidebars.json`);
};

const DOCS_DIR = getDocsDir();
const SIDEBAR_PATH = getSidebarPath();
const OUTPUT_DIR = path.join(BASE_DIR, 'pdf-build');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

// 1. Parse the sidebar to get ordered doc IDs and structure
function getOrderedDocIds() {
  // All versioned sidebars are in JSON format, current English sidebar might be JS
  let sidebars;
  let docsSidebar;
  
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
  const sidebarStructure = [];
  
  function processItems(items, level = 0) {
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
        sidebarStructure.push({
          type: 'doc',
          id: item,
          label: item,
          level: level
        });
      } 
      // Doc link with custom label {type: 'doc', id: '...'}
      else if (item.type === 'doc' && item.id) {
        docIds.push(item.id);
        sidebarStructure.push({
          type: 'doc',
          id: item.id,
          label: item.label || item.id,
          level: level
        });
      }
      // Category with items
      else if (item.type === 'category') {
        // Skip blacklisted categories
        if (BLACKLISTED_CATEGORIES.includes(item.label?.toLowerCase())) {
          console.log(`Skipping blacklisted category: ${item.label}`);
          return;
        }
        
        sidebarStructure.push({
          type: 'category',
          label: item.label,
          level: level
        });
        
        if (item.link && item.link.type === 'doc') {
          // Category with index page
          docIds.push(item.link.id);
          sidebarStructure.push({
            type: 'doc',
            id: item.link.id,
            label: item.link.label || item.label,
            level: level + 1
          });
        }
        // Process nested items
        processItems(item.items, level + 1);
      }
      // External links and other types are ignored
    });
  }
  
  processItems(docsSidebar);
  const uniqueDocIds = docIds.filter((id, index, self) => self.indexOf(id) === index); // Remove duplicates
  console.log(`Found ${uniqueDocIds.length} documents to process`);
  return { docIds: uniqueDocIds, structure: sidebarStructure };
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

// Function to extract title from markdown content
function extractTitle(content) {
  // Remove front matter first
  const withoutFrontMatter = content.replace(/^---[\s\S]+?---/, '');
  
  // Look for first H1 heading
  const h1Match = withoutFrontMatter.match(/^#\s+(.+)$/m);
  if (h1Match) {
    return h1Match[1].trim();
  }
  
  // Look for first H2 heading if no H1
  const h2Match = withoutFrontMatter.match(/^##\s+(.+)$/m);
  if (h2Match) {
    return h2Match[1].trim();
  }
  
  return 'Untitled';
}


// Function to remove outbound links and convert them to plain text
function removeOutboundLinks(content) {
  // Remove markdown links that start with http:// or https://
  // Pattern: [link text](http://example.com) or [link text](https://example.com)
  content = content.replace(/\[([^\]]+)\]\(https?:\/\/[^\)]+\)/g, '$1');
  
  // Remove reference-style links that start with http:// or https://
  // Pattern: [link text][ref] where [ref]: http://example.com
  content = content.replace(/^\s*\[[^\]]+\]:\s*https?:\/\/.*$/gm, '');
  
  return content;
}

// Function to convert images to base64 data URLs
function convertImagesToBase64(content) {
  // Fix markdown image syntax: ![alt](path)
  content = content.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, imagePath) => {
    // Skip if it's already a data URL or external URL
    if (imagePath.startsWith('data:') || imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return match;
    }
    
    // For paths starting from root, convert to base64
    if (imagePath.startsWith('/')) {
      const absolutePath = path.join(BASE_DIR, 'static', imagePath.substring(1));
      try {
        if (fs.existsSync(absolutePath)) {
          const imageBuffer = fs.readFileSync(absolutePath);
          const ext = path.extname(absolutePath).toLowerCase();
          let mimeType = 'image/png'; // default
          
          if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
          else if (ext === '.gif') mimeType = 'image/gif';
          else if (ext === '.svg') mimeType = 'image/svg+xml';
          else if (ext === '.webp') mimeType = 'image/webp';
          
          const base64 = imageBuffer.toString('base64');
          const dataUrl = `data:${mimeType};base64,${base64}`;
          return `![${alt}](${dataUrl})`;
        }
      } catch (error) {
        console.warn(`Warning: Could not read image file ${absolutePath}: ${error.message}`);
      }
    }
    
    return match;
  });
  
  // Fix HTML img tags: <img src="path" />
  content = content.replace(/<img([^>]*)\ssrc=["']([^"']+)["']([^>]*)>/g, (match, beforeSrc, imagePath, afterSrc) => {
    // Skip if it's already a data URL or external URL
    if (imagePath.startsWith('data:') || imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return match;
    }
    
    // For paths starting from root, convert to base64
    if (imagePath.startsWith('/')) {
      const absolutePath = path.join(BASE_DIR, 'static', imagePath.substring(1));
      try {
        if (fs.existsSync(absolutePath)) {
          const imageBuffer = fs.readFileSync(absolutePath);
          const ext = path.extname(absolutePath).toLowerCase();
          let mimeType = 'image/png'; // default
          
          if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
          else if (ext === '.gif') mimeType = 'image/gif';
          else if (ext === '.svg') mimeType = 'image/svg+xml';
          else if (ext === '.webp') mimeType = 'image/webp';
          
          const base64 = imageBuffer.toString('base64');
          const dataUrl = `data:${mimeType};base64,${base64}`;
          return `<img${beforeSrc} src="${dataUrl}"${afterSrc}>`;
        }
      } catch (error) {
        console.warn(`Warning: Could not read image file ${absolutePath}: ${error.message}`);
      }
    }
    
    return match;
  });
  
  return content;
}

async function generatePDFFromMarkdown(file, outputPath) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  try {
    // Read and preprocess markdown
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/^---[\s\S]+?---/, ''); // Remove front matter
    
    // Remove outbound links
    content = removeOutboundLinks(content);
    
    // Convert images to base64 data URLs
    content = convertImagesToBase64(content);
    
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
            img {
              max-width: 100%;
              height: auto;
              display: block;
              margin: 10px 0;
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

async function combinePDFs(pdfFiles, outputPath, structure, docIds, markdownFiles) {
  const mergedPdf = await PDFDocument.create();
  
  // First pass - copy all pages
  for (const file of pdfFiles) {
    const pdfBytes = fs.readFileSync(file);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
    pages.forEach(page => mergedPdf.addPage(page));
  }

  // Second pass - create outline (bookmarks)
  let currentPage = 0;
  const outlineDict = mergedPdf.context.obj({
    Type: 'Outlines',
    First: null,
    Last: null,
    Count: 0
  });
  
  const bookmarks = [];
  let currentCategory = null;
  let currentCategoryBookmark = null;
  
  for (const [index, file] of pdfFiles.entries()) {
    const pdfDoc = await PDFDocument.load(fs.readFileSync(file));
    const pages = pdfDoc.getPageCount();
    
    // Get the corresponding docId and structure item
    const docId = docIds[index];
    const structureItem = structure.find(item => item.type === 'doc' && item.id === docId);
    const title = structureItem?.label || extractTitle(fs.readFileSync(markdownFiles[index], 'utf8'));
    
    // Create bookmark for this document
    const bookmark = {
      title: title,
      pageIndex: currentPage,
      parent: currentCategoryBookmark
    };
    bookmarks.push(bookmark);
    
    currentPage += pages;
  }

  // Add outline dictionary to document catalog
  mergedPdf.catalog.set(PDFName.of('Outlines'), outlineDict);

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
    
    const { docIds, structure } = getOrderedDocIds();
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
      const pdfPath = path.join(tempPdfDir, `${String(index + 1).padStart(3, '0')}.pdf`);
      console.log(`Processing ${index + 1}/${markdownFiles.length}: ${path.basename(file)}`);
      await generatePDFFromMarkdown(file, pdfPath);
      pdfFiles.push(pdfPath);
    }
    
    // Combine PDFs with bookmarks
    const outputFilename = `docs-${version}${LOCALE !== 'en' ? `-${LOCALE}` : ''}.pdf`;
    const outputPath = path.join(OUTPUT_DIR, outputFilename);
    console.log('Combining PDFs...');
    await combinePDFs(pdfFiles, outputPath, structure, docIds, markdownFiles);
    
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
