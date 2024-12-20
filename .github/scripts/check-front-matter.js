const fs = require('fs');
const path = require('path');
const glob = require('glob');

// This function checks if a markdown file contains the required front matter.
function hasFrontMatter(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Regex to capture the front matter block (between --- lines)
  const frontMatterRegex = /^---\s*([\s\S]*?)\s*---/;
  const match = content.match(frontMatterRegex);

  if (!match) return false;

  // Check if both 'keywords' and 'description' are present
  const frontMatter = match[1];
  const hasKeywords = /keywords\s*:\s*\[.*\]/.test(frontMatter);
  const hasDescription = /description\s*:\s*.+/.test(frontMatter);

  return hasKeywords && hasDescription;
}

async function checkMarkdownFiles() {
  // Glob to get all new markdown files in the PR
  const changedFiles = await new Promise((resolve, reject) => {
    glob('**/*.md', { cwd: process.cwd(), absolute: true }, (err, files) => {
      if (err) reject(err);
      resolve(files);
    });
  });

  let allValid = true;

  for (const file of changedFiles) {
    if (!hasFrontMatter(file)) {
      console.log(`File missing front matter: ${file}`);
      allValid = false;
    }
  }

  if (!allValid) {
    process.exit(1); // Exit with an error code to fail the CI
  } else {
    console.log('All markdown files have valid front matter.');
  }
}

checkMarkdownFiles();
