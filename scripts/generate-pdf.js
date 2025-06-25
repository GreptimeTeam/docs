const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const puppeteer = require('puppeteer');
const { default: PDFMerger } = require('pdf-merger-js');
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
  --skip-generation      Skip individual PDF generation and combine existing temp files
  --keep-temp            Keep temporary PDF files after successful generation
  --locale LOCALE        Language locale for the documentation (default: 'en')
                         Examples: en, zh, ja, fr
  --blacklist CATEGORIES Comma-separated list of categories to exclude from PDF
                         Examples: changelog,roadmap,api-reference
  --whitelist CATEGORIES Comma-separated list of categories to include in PDF (excludes all others)
                         Examples: user-guide,getting-started
  --cover FILE           Path to PDF file to use as cover page (prepended to output)
                         Example: --cover docs/cover.pdf


EXAMPLES:
  # Generate PDF for current English docs
  node scripts/generate-pdf.js current

  # Generate PDF for version 0.14 English docs
  node scripts/generate-pdf.js 0.14

  # Generate PDF for current Chinese docs
  node scripts/generate-pdf.js current --locale zh

  # Generate PDF for version 0.14 with blacklisted categories
  node scripts/generate-pdf.js 0.14 --blacklist changelog,roadmap

  # Generate PDF for Chinese version 0.14 with blacklisted categories
  node scripts/generate-pdf.js 0.14 --locale zh --blacklist changelog,roadmap

  # Generate PDF with only specific categories (whitelist)
  node scripts/generate-pdf.js current --whitelist user-guide,getting-started

  # Generate PDF with whitelist and blacklist (blacklist takes precedence within whitelisted items)
  node scripts/generate-pdf.js current --whitelist user-guide --blacklist deprecated

  # Generate PDF with custom cover page
  node scripts/generate-pdf.js current --cover docs/cover.pdf

  # Generate PDF and keep temporary files for debugging
  node scripts/generate-pdf.js current --keep-temp

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

const skipGeneration = args.includes('--skip-generation');
const keepTemp = args.includes('--keep-temp');

// Parse cover option
const coverIndex = args.indexOf('--cover');
const COVER_PATH = coverIndex !== -1 && coverIndex + 1 < args.length ? args[coverIndex + 1] : null;

// Parse locale option
const localeIndex = args.indexOf('--locale');
const LOCALE = localeIndex !== -1 && localeIndex + 1 < args.length ? args[localeIndex + 1] : 'en';

// Parse blacklist option
const blacklistIndex = args.indexOf('--blacklist');
const BLACKLISTED_CATEGORIES = blacklistIndex !== -1 && blacklistIndex + 1 < args.length
  ? args[blacklistIndex + 1].split(',').map(cat => cat.trim().toLowerCase())
  : [];

// Parse whitelist option
const whitelistIndex = args.indexOf('--whitelist');
const WHITELISTED_CATEGORIES = whitelistIndex !== -1 && whitelistIndex + 1 < args.length
  ? args[whitelistIndex + 1].split(',').map(cat => cat.trim().toLowerCase())
  : [];

// Get version (first non-option argument)
const version = args.find(arg => 
  !arg.startsWith('-') && 
  arg !== LOCALE && 
  !BLACKLISTED_CATEGORIES.some(cat => cat === arg.toLowerCase()) &&
  !WHITELISTED_CATEGORIES.some(cat => cat === arg.toLowerCase())
) || 'current';

// Configuration - can be moved to a config file if needed
const BASE_DIR = path.join(__dirname, '..');

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

  // Helper function to check if a category should be included based on whitelist/blacklist
  function shouldIncludeCategory(categoryLabel, parentCategories = []) {
    const categoryLower = categoryLabel?.toLowerCase();
    const allCategories = [...parentCategories, categoryLower].filter(Boolean);
    
    // If whitelist is specified, check if this category or any parent is whitelisted
    if (WHITELISTED_CATEGORIES.length > 0) {
      const isWhitelisted = allCategories.some(cat => 
        WHITELISTED_CATEGORIES.some(whiteCat => cat === whiteCat || cat?.startsWith(whiteCat + '/'))
      ) || WHITELISTED_CATEGORIES.some(whiteCat => 
        allCategories.some(cat => whiteCat === cat || whiteCat?.startsWith(cat + '/'))
      );
      
      if (!isWhitelisted) {
        return false;
      }
    }
    
    // Check blacklist - if any parent or current category is blacklisted, exclude
    const isBlacklisted = allCategories.some(cat => 
      BLACKLISTED_CATEGORIES.some(blackCat => cat === blackCat || cat?.startsWith(blackCat + '/'))
    ) || BLACKLISTED_CATEGORIES.some(blackCat => 
      allCategories.some(cat => blackCat === cat || blackCat?.startsWith(cat + '/'))
    );
    
    return !isBlacklisted;
  }

  // Helper function to check if a standalone document should be included
  function shouldIncludeStandaloneDoc(docId) {
    // If no whitelist is specified, include all docs (subject to blacklist)
    if (WHITELISTED_CATEGORIES.length === 0) {
      return true;
    }
    
    // Check if the doc ID matches any whitelisted category or is specifically "index"
    const docLower = docId?.toLowerCase();
    return docLower === 'index' || 
           WHITELISTED_CATEGORIES.some(whiteCat => 
             docLower === whiteCat || 
             docLower?.startsWith(whiteCat + '/') ||
             whiteCat === 'index'
           );
  }

  function processItems(items, level = 0, parentCategories = []) {
    if (!items) return;

    // Ensure items is an array before forEach
    if (!Array.isArray(items)) {
      console.warn(`Warning: Expected array but got ${typeof items} for sidebar items`);
      return;
    }

    items.forEach(item => {
      // Simple doc link (string ID)
      if (typeof item === 'string') {
        // For standalone docs (no parent categories), check if they should be included
        const shouldInclude = parentCategories.length === 0 
          ? shouldIncludeStandaloneDoc(item)
          : shouldIncludeCategory('', parentCategories);
          
        if (shouldInclude) {
          docIds.push(item);
          sidebarStructure.push({
            type: 'doc',
            id: item,
            label: item,
            level: level
          });
        }
      }
      // Doc link with custom label {type: 'doc', id: '...'}
      else if (item.type === 'doc' && item.id) {
        // For standalone docs (no parent categories), check if they should be included
        const shouldInclude = parentCategories.length === 0 
          ? shouldIncludeStandaloneDoc(item.id)
          : shouldIncludeCategory('', parentCategories);
          
        if (shouldInclude) {
          docIds.push(item.id);
          sidebarStructure.push({
            type: 'doc',
            id: item.id,
            label: item.label || item.id,
            level: level
          });
        }
      }
      // Category with items
      else if (item.type === 'category') {
        const categoryLabel = item.label;
        const currentCategories = [...parentCategories, categoryLabel?.toLowerCase()];
        
        // Check if this category should be included
        if (!shouldIncludeCategory(categoryLabel, parentCategories)) {
          console.log(`Skipping filtered category: ${categoryLabel}`);
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
        // Process nested items with updated parent categories
        processItems(item.items, level + 1, currentCategories);
      }
      // External links and other types are ignored
    });
  }

  processItems(docsSidebar);
  
  // Log filtering results
  if (WHITELISTED_CATEGORIES.length > 0) {
    console.log(`Whitelist applied: ${WHITELISTED_CATEGORIES.join(', ')}`);
  }
  if (BLACKLISTED_CATEGORIES.length > 0) {
    console.log(`Blacklist applied: ${BLACKLISTED_CATEGORIES.join(', ')}`);
  }
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

// Function to build a mapping of document paths to bookmark titles
function buildDocumentMapping(docIds, structure, markdownFiles) {
  const docMapping = new Map();
  let docIndex = 0;
  
  // Create a mapping from docId to actual title from markdown content
  const docIdToTitle = new Map();
  for (let i = 0; i < docIds.length && i < markdownFiles.length; i++) {
    const file = markdownFiles[i];
    const content = fs.readFileSync(file, 'utf8');
    const title = extractTitle(content);
    docIdToTitle.set(docIds[i], title);
  }
  
  for (const structureItem of structure) {
    if (structureItem.type === 'doc') {
      if (docIndex < docIds.length) {
        const docId = docIds[docIndex];
        // Use the actual title from markdown content, not the structure label
        const title = docIdToTitle.get(docId) || structureItem.label;
        
        // Map various possible URL formats to the bookmark title
        docMapping.set(`/${docId}`, title);
        docMapping.set(`/${docId}/`, title);
        docMapping.set(`/${docId}.html`, title);
        docMapping.set(`/${docId}.html/`, title);
        docMapping.set(docId, title);
        docMapping.set(`${docId}/`, title);
        docMapping.set(`${docId}.html`, title);
        
        // Handle nested paths (e.g., /user-guide/concepts/overview)
        const pathParts = docId.split('/');
        if (pathParts.length > 1) {
          docMapping.set(`/${docId}`, title);
          docMapping.set(`/${docId}/`, title);
          docMapping.set(`/${docId}.html`, title);
        }
        
        docIndex++;
      }
    }
  }
  
  return docMapping;
}

// Function to convert internal links to bookmark references
function convertInternalLinks(content, docMapping) {
  console.log(`Converting internal links. Available mappings: ${docMapping.size}`);
  
  // Convert markdown links [text](/path) to bookmark references
  content = content.replace(/\[([^\]]+)\]\(\/([^)]+)\)/g, (match, linkText, linkPath) => {
    // Clean up the path (remove anchors, query params, trailing slashes)
    let cleanPath = `/${linkPath.split('#')[0].split('?')[0]}`;
    cleanPath = cleanPath.replace(/\/$/, ''); // Remove trailing slash
    
    // Remove .md extension if present (Docusaurus pattern)
    if (cleanPath.endsWith('.md')) {
      cleanPath = cleanPath.slice(0, -3);
    }
    
    // Try multiple variations of the path
    const pathVariations = [
      cleanPath,
      `${cleanPath}/`,
      `${cleanPath}.html`,
      `${cleanPath}.html/`,
      cleanPath.replace(/^\//, ''), // without leading slash
      `${cleanPath.replace(/^\//, '')}/`, // without leading slash but with trailing
      `${cleanPath.replace(/^\//, '')}.html` // without leading slash but with .html
    ];
    
    for (const variation of pathVariations) {
      if (docMapping.has(variation)) {
        const bookmarkTitle = docMapping.get(variation);
        console.log(`Converting link: ${match} -> [${linkText}](#bookmark:${bookmarkTitle})`);
        return `[${linkText}](#bookmark:${bookmarkTitle})`;
      }
    }
    
    console.log(`No mapping found for internal link: ${cleanPath} (original: ${linkPath}) - removing link, keeping text`);
    // If no mapping found, remove the link and keep only the text
    return linkText;
  });

  // Convert HTML links <a href="/path">text</a> to bookmark references
  content = content.replace(/<a\s+href=["']\/([^"']+)["'][^>]*>([^<]+)<\/a>/g, (match, linkPath, linkText) => {
    // Clean up the path (remove anchors, query params, trailing slashes)
    let cleanPath = `/${linkPath.split('#')[0].split('?')[0]}`;
    cleanPath = cleanPath.replace(/\/$/, ''); // Remove trailing slash
    
    // Remove .md extension if present (Docusaurus pattern)
    if (cleanPath.endsWith('.md')) {
      cleanPath = cleanPath.slice(0, -3);
    }
    
    // Try multiple variations of the path
    const pathVariations = [
      cleanPath,
      `${cleanPath}/`,
      `${cleanPath}.html`,
      `${cleanPath}.html/`,
      cleanPath.replace(/^\//, ''), // without leading slash
      `${cleanPath.replace(/^\//, '')}/`, // without leading slash but with trailing
      `${cleanPath.replace(/^\//, '')}.html` // without leading slash but with .html
    ];
    
    for (const variation of pathVariations) {
      if (docMapping.has(variation)) {
        const bookmarkTitle = docMapping.get(variation);
        console.log(`Converting HTML link: ${match} -> [${linkText}](#bookmark:${bookmarkTitle})`);
        return `[${linkText}](#bookmark:${bookmarkTitle})`;
      }
    }
    
    console.log(`No mapping found for internal HTML link: ${cleanPath} (original: ${linkPath}) - removing link, keeping text`);
    // If no mapping found, remove the link and keep only the text
    return linkText;
  });

  return content;
}

// Function to get page count of a PDF using pdftk via Docker
async function getPageCount(pdfPath) {
  try {
    const result = execSync(`docker run --rm -v "${path.dirname(pdfPath)}:/work" -w /work docker.io/pdftk/pdftk:latest "${path.basename(pdfPath)}" dump_data | grep NumberOfPages`, { encoding: 'utf8' });
    const match = result.match(/NumberOfPages:\s*(\d+)/);
    return match ? parseInt(match[1]) : 1;
  } catch (error) {
    console.warn(`Could not get page count for ${pdfPath}: ${error.message}`);
    return 1;
  }
}

// Function to create pdftk bookmark file format
function createBookmarkFile(bookmarkData, startPage = 1) {
  let bookmarkContent = '';
  let currentPage = startPage;

  for (const bookmark of bookmarkData) {
    bookmarkContent += `BookmarkBegin\n`;
    bookmarkContent += `BookmarkTitle: ${bookmark.title}\n`;
    bookmarkContent += `BookmarkLevel: ${bookmark.level}\n`;
    
    // Only add page number for items that have actual content (pageCount > 0)
    if (bookmark.pageCount > 0) {
      bookmarkContent += `BookmarkPageNumber: ${currentPage}\n`;
      currentPage += bookmark.pageCount;
    } else {
      // For categories, use the current page (they don't advance the page counter)
      bookmarkContent += `BookmarkPageNumber: ${currentPage}\n`;
    }
  }

  return bookmarkContent;
}

// Function to add bookmarks to PDF using pdftk via Docker
async function addBookmarksToPDF(inputPath, outputPath, bookmarkData, startPage = 1) {
  try {
    console.log('Adding bookmarks to PDF...');
    
    const bookmarkContent = createBookmarkFile(bookmarkData, startPage);
    const bookmarkFilePath = path.join(path.dirname(inputPath), 'bookmarks.txt');
    
    // Write bookmark file
    fs.writeFileSync(bookmarkFilePath, bookmarkContent);
    
    // Use pdftk via Docker to add bookmarks
    const inputDir = path.dirname(inputPath);
    const inputFile = path.basename(inputPath);
    const outputFile = path.basename(outputPath);
    const bookmarkFile = path.basename(bookmarkFilePath);
    
    const command = `docker run --rm -v "${inputDir}:/work" -w /work docker.io/pdftk/pdftk:latest "${inputFile}" update_info "${bookmarkFile}" output "${outputFile}"`;
    
    console.log('Running pdftk via Docker to add bookmarks...');
    execSync(command, { stdio: 'inherit' });
    
    // Clean up bookmark file
    fs.unlinkSync(bookmarkFilePath);
    
    console.log('Successfully added bookmarks to PDF');
  } catch (error) {
    console.error('Error adding bookmarks to PDF:', error);
    console.warn('Continuing without bookmarks...');
    // Fallback: just copy the input to output
    fs.copyFileSync(inputPath, outputPath);
  }
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

async function generatePDFFromMarkdown(file, outputPath, docMapping = new Map()) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    // Read and preprocess markdown
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/^---[\s\S]+?---/, ''); // Remove front matter

    // Convert internal links to bookmark references
    content = convertInternalLinks(content, docMapping);

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
            a {
              color: #0066cc;
              text-decoration: underline;
            }
            a:hover {
              color: #004499;
            }
            /* Style for internal bookmark links */
            a[href^="#bookmark:"] {
              color: #0066cc;
              text-decoration: underline;
              font-weight: normal;
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
      margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
      printBackground: true
    });
  } finally {
    await browser.close();
  }
}

async function combinePDFs(pdfFiles, outputPath, bookmarkData = []) {
  try {
    console.log('Merging PDF files...');

    const merger = new PDFMerger();
    let currentPage = 1;

    // Add cover page if specified
    if (COVER_PATH) {
      if (!fs.existsSync(COVER_PATH)) {
        throw new Error(`Cover PDF file not found: ${COVER_PATH}`);
      }
      console.log(`Adding cover page: ${path.basename(COVER_PATH)}`);
      await merger.add(COVER_PATH);
      
      // Count pages in cover PDF to adjust bookmark page numbers
      try {
        const coverPageCount = await getPageCount(COVER_PATH);
        currentPage += coverPageCount;
      } catch (error) {
        console.warn('Could not determine cover page count, assuming 1 page');
        currentPage += 1;
      }
    }

    // Add content pages
    for (const pdfFile of pdfFiles) {
      console.log(`Adding ${path.basename(pdfFile)} to merger...`);
      await merger.add(pdfFile);
    }

    const tempOutputPath = outputPath.replace('.pdf', '_temp.pdf');
    await merger.save(tempOutputPath);
    console.log(`Successfully combined ${pdfFiles.length} PDFs`);

    // Add bookmarks if we have bookmark data
    if (bookmarkData.length > 0) {
      await addBookmarksToPDF(tempOutputPath, outputPath, bookmarkData, currentPage);
      // Clean up temp file
      fs.unlinkSync(tempOutputPath);
    } else {
      // No bookmarks, just rename temp file
      fs.renameSync(tempOutputPath, outputPath);
    }

  } catch (error) {
    console.error('Error combining PDFs:', error);
    throw error;
  }
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

    // Build document mapping for internal links
    const docMapping = buildDocumentMapping(docIds, structure, markdownFiles);
    console.log(`Built mapping for ${docMapping.size} document paths`);
    
    // Debug: log some mappings
    if (docMapping.size > 0) {
      console.log('Sample mappings:');
      let count = 0;
      for (const [path, title] of docMapping.entries()) {
        if (count < 5) {
          console.log(`  ${path} -> ${title}`);
          count++;
        }
      }
    }

    console.log(`Processing ${markdownFiles.length} files...`);

    const tempPdfDir = path.join(OUTPUT_DIR, 'temp');
    let pdfFiles = [];
    let bookmarkData = [];

    if (skipGeneration) {
      console.log('Skipping individual PDF generation as requested');
      if (!fs.existsSync(tempPdfDir)) {
        throw new Error('Temp directory not found - cannot skip generation');
      }
      pdfFiles = fs.readdirSync(tempPdfDir)
        .filter(file => file.endsWith('.pdf'))
        .sort()
        .map(file => path.join(tempPdfDir, file));

      if (pdfFiles.length === 0) {
        throw new Error('No PDF files found in temp directory');
      }
      console.log(`Found ${pdfFiles.length} existing PDF files to combine`);
      
      // Try to recreate bookmark data from existing files using sidebar structure
      let fileIndex = 0;
      for (const structureItem of structure) {
        if (structureItem.type === 'doc') {
          if (fileIndex < markdownFiles.length) {
            const file = markdownFiles[fileIndex];
            const content = fs.readFileSync(file, 'utf8');
            const title = extractTitle(content);
            const pdfPath = path.join(tempPdfDir, `${String(fileIndex + 1).padStart(3, '0')}.pdf`);
            const pageCount = await getPageCount(pdfPath);
            
            bookmarkData.push({
              title: title,
              level: structureItem.level + 1, // pdftk levels start from 1
              pageCount: pageCount
            });
            fileIndex++;
          }
        } else if (structureItem.type === 'category') {
          // Add category as bookmark without page count
          bookmarkData.push({
            title: structureItem.label,
            level: structureItem.level + 1, // pdftk levels start from 1
            pageCount: 0 // Categories don't consume pages
          });
        }
      }
    } else {
      // Generate individual PDFs
      if (!fs.existsSync(tempPdfDir)) {
        fs.mkdirSync(tempPdfDir, { recursive: true });
      }

      // Generate individual PDFs and build bookmark data following sidebar structure
      let fileIndex = 0;
      for (const structureItem of structure) {
        if (structureItem.type === 'doc') {
          if (fileIndex < markdownFiles.length) {
            const file = markdownFiles[fileIndex];
            const pdfPath = path.join(tempPdfDir, `${String(fileIndex + 1).padStart(3, '0')}.pdf`);
            console.log(`Processing ${fileIndex + 1}/${markdownFiles.length}: ${path.basename(file)}`);
            
            // Extract title before generating PDF
            const content = fs.readFileSync(file, 'utf8');
            const title = extractTitle(content);
            
            await generatePDFFromMarkdown(file, pdfPath, docMapping);
            pdfFiles.push(pdfPath);
            
            // Get page count and add to bookmark data
            const pageCount = await getPageCount(pdfPath);
            bookmarkData.push({
              title: title,
              level: structureItem.level + 1, // pdftk levels start from 1
              pageCount: pageCount
            });
            fileIndex++;
          }
        } else if (structureItem.type === 'category') {
          // Add category as bookmark without page count
          bookmarkData.push({
            title: structureItem.label,
            level: structureItem.level + 1, // pdftk levels start from 1
            pageCount: 0 // Categories don't consume pages
          });
        }
      }
    }

    // Combine PDFs with bookmarks
    const outputFilename = `docs-${version}${LOCALE !== 'en' ? `-${LOCALE}` : ''}.pdf`;
    const outputPath = path.join(OUTPUT_DIR, outputFilename);
    console.log('Combining PDFs...');
    await combinePDFs(pdfFiles, outputPath, bookmarkData);

    // Clean up temp files unless --keep-temp is specified
    if (keepTemp) {
      console.log(`Temporary files preserved in: ${tempPdfDir}`);
    } else {
      fs.rmSync(tempPdfDir, { recursive: true, force: true });
    }

    console.log('Successfully generated combined PDF');
    console.log(`Output file: ${outputPath}`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    process.exit(1);
  }
}

main();
