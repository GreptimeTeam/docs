const fs = require('fs');
const path = require('path');
const core = require('@actions/core');
const github = require('@actions/github');
const { minimatch } = require('minimatch')

// List of glob patterns to ignore during the front matter check
const exceptionPatterns = [
  '**/grpc-sdks/template.md',
  '**/db-cloud-shared/**',
  '**/CONTRIBUTING.md'
];

// Check if a file matches any of the exception patterns
function isExceptionFile(filename) {
  return exceptionPatterns.some(pattern => minimatch(filename, pattern));
}

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
  // Get the PR number from the GitHub context
  const prNumber = github.context.payload.pull_request.number;
  const owner = github.context.repo.owner;
  const repo = github.context.repo.repo;

  // Initialize the GitHub client
  const octokit = github.getOctokit(process.env.GITHUB_TOKEN);

  try {
    // Get the list of files changed in the PR
    const { data: files } = await octokit.rest.pulls.listFiles({
      owner,
      repo,
      pull_number: prNumber
    });

    // Filter to get only markdown files
    const markdownFiles = files.filter(file =>
      file.filename.endsWith('.md') && file.status !== 'removed'
    );

    let allValid = true;

    // Check each markdown file for front matter
    for (const file of markdownFiles) {
      // Skip files that match exception patterns
      if (isExceptionFile(file.filename)) {
        console.log(`Skipping front matter check for: ${file.filename}`);
        continue;
      }

      const filePath = path.join(process.cwd(), file.filename); // Path to the file
      if (!hasFrontMatter(filePath)) {
        console.log(`File missing front matter: ${filePath}`);
        allValid = false;
      }
    }

    if (!allValid) {
      process.exit(1); // Exit with an error code to fail the CI
    } else {
      console.log('All markdown files have valid front matter.');
    }
  } catch (error) {
    core.setFailed(`Error fetching PR files: ${error.message}`);
  }
}

checkMarkdownFiles();
