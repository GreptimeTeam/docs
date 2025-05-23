#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class DocusaurusVersionSync {
  constructor(options = {}) {
    this.rootDir = options.rootDir || process.cwd();
    this.docsDir = options.docsDir || 'docs';
    this.versionsDir = options.versionsDir || 'versioned_docs';
    this.i18nDir = options.i18nDir || 'i18n';
    this.defaultLocale = options.defaultLocale || 'en';
    this.targetVersion = options.targetVersion;
    this.dryRun = options.dryRun || false;
    this.verbose = options.verbose || false;

    // File patterns to include/exclude
    this.includePatterns = options.includePatterns || ['.md', '.mdx'];
    this.excludePatterns = options.excludePatterns || ['node_modules', '.git'];
  }

  log(message, level = 'info') {
    if (this.verbose || level === 'error') {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
    }
  }

  /**
   * Get all available versions from versioned_docs directory
   */
  getAvailableVersions() {
    const versionsPath = path.join(this.rootDir, this.versionsDir);

    if (!fs.existsSync(versionsPath)) {
      this.log('No versioned_docs directory found', 'error');
      return [];
    }

    return fs.readdirSync(versionsPath)
      .filter(item => {
        const itemPath = path.join(versionsPath, item);
        return fs.statSync(itemPath).isDirectory();
      })
      .filter(version => version.startsWith('version-'))
      .sort();
  }

  /**
   * Get available locales from i18n directory
   */
  getAvailableLocales() {
    const i18nPath = path.join(this.rootDir, this.i18nDir);

    if (!fs.existsSync(i18nPath)) {
      return [this.defaultLocale];
    }

    const locales = fs.readdirSync(i18nPath)
      .filter(item => {
        const itemPath = path.join(i18nPath, item);
        return fs.statSync(itemPath).isDirectory();
      });

    return [this.defaultLocale, ...locales.filter(locale => locale !== this.defaultLocale)];
  }

  /**
   * Get git diff for modified files (including i18n current docs)
   */
  getModifiedFiles(since = 'HEAD~1') {
    try {
      const locales = this.getAvailableLocales();
      const patterns = [`${this.docsDir}/`];

      // Add i18n current docs patterns for non-default locales
      locales.forEach(locale => {
        if (locale !== this.defaultLocale) {
          patterns.push(`${this.i18nDir}/${locale}/docusaurus-plugin-content-docs/current/`);
        }
      });

      const command = `git diff --name-only ${since} -- ${patterns.join(' ')}`;
      const output = execSync(command, { cwd: this.rootDir, encoding: 'utf8' });

      return output.trim().split('\n').filter(file => {
        if (!file) return false;

        // Check if file matches include patterns
        const hasIncludePattern = this.includePatterns.some(pattern =>
          file.endsWith(pattern)
        );

        // Check if file matches exclude patterns
        const hasExcludePattern = this.excludePatterns.some(pattern =>
          file.includes(pattern)
        );

        return hasIncludePattern && !hasExcludePattern;
      });
    } catch (error) {
      this.log(`Error getting modified files: ${error.message}`, 'error');
      return [];
    }
  }

  /**
   * Get the actual diff content for a file
   */
  getFileDiff(filePath, since = 'HEAD~1') {
    try {
      const command = `git diff ${since} -- "${filePath}"`;
      return execSync(command, { cwd: this.rootDir, encoding: 'utf8' });
    } catch (error) {
      this.log(`Error getting diff for ${filePath}: ${error.message}`, 'error');
      return '';
    }
  }

  /**
   * Apply diff to a target file
   */
  applyDiffToFile(sourcePath, targetPath, diff) {
    if (!fs.existsSync(targetPath)) {
      this.log(`Target file doesn't exist: ${targetPath}`, 'error');
      return false;
    }

    try {
      // Create a temporary patch file
      const tempPatchFile = path.join(this.rootDir, '.temp_patch');

      // Modify the diff to point to the target file
      const modifiedDiff = diff.replace(
        new RegExp(`a/${sourcePath}`, 'g'),
        `a/${targetPath}`
      ).replace(
        new RegExp(`b/${sourcePath}`, 'g'),
        `b/${targetPath}`
      );

      fs.writeFileSync(tempPatchFile, modifiedDiff);

      if (this.dryRun) {
        this.log(`[DRY RUN] Would apply patch to: ${targetPath}`);
        this.log(`Patch content:\n${modifiedDiff}`);
      } else {
        // Apply the patch
        const command = `git apply --ignore-whitespace "${tempPatchFile}"`;
        execSync(command, { cwd: this.rootDir });
        this.log(`Successfully applied patch to: ${targetPath}`);
      }

      // Clean up temp file
      if (fs.existsSync(tempPatchFile)) {
        fs.unlinkSync(tempPatchFile);
      }

      return true;
    } catch (error) {
      this.log(`Error applying patch to ${targetPath}: ${error.message}`, 'error');

      // Try manual content replacement as fallback
      return this.manualContentSync(sourcePath, targetPath);
    }
  }

  /**
   * Fallback method: manually sync content when patch fails
   */
  manualContentSync(sourcePath, targetPath) {
    try {
      const sourceFullPath = path.join(this.rootDir, sourcePath);
      const targetFullPath = path.join(this.rootDir, targetPath);

      if (!fs.existsSync(sourceFullPath) || !fs.existsSync(targetFullPath)) {
        return false;
      }

      const sourceContent = fs.readFileSync(sourceFullPath, 'utf8');

      if (this.dryRun) {
        this.log(`[DRY RUN] Would copy content from ${sourcePath} to ${targetPath}`);
      } else {
        fs.writeFileSync(targetFullPath, sourceContent);
        this.log(`Manually synced content: ${sourcePath} → ${targetPath}`);
      }

      return true;
    } catch (error) {
      this.log(`Error in manual sync: ${error.message}`, 'error');
      return false;
    }
  }

  /**
   * Get target paths for a source file based on source type
   */
  getTargetPaths(sourceFile) {
    const targets = [];
    const locales = this.getAvailableLocales();

    // Remove source directory prefix from source file
    const relativePath = sourceFile.replace(/^[^/]+\//, '');

    // Check if this is a default locale docs file or i18n current file
    if (sourceFile.startsWith(`${this.docsDir}/`)) {
      // Source is default locale current docs -> target is versioned docs
      const versionedPath = `${this.versionsDir}/version-${this.targetVersion}/${relativePath}`;
      targets.push(versionedPath);
    }

    // Check if this is an i18n current docs file
    locales.forEach(locale => {
      if (locale !== this.defaultLocale) {
        const i18nCurrentPath = `${this.i18nDir}/${locale}/docusaurus-plugin-content-docs/current/`;
        if (sourceFile.startsWith(i18nCurrentPath)) {
          // Source is i18n current -> target is i18n versioned
          const versionedI18nPath = `${this.i18nDir}/${locale}/docusaurus-plugin-content-docs/version-${this.targetVersion}/${relativePath}`;
          targets.push(versionedI18nPath);
        }
      }
    });

    return targets;
  }

  /**
   * Main sync function
   */
  async sync(options = {}) {
    if (!this.targetVersion) {
      this.log('Target version is required. Use --version option.', 'error');
      return;
    }

    // Validate target version exists
    const versionedPath = path.join(this.rootDir, this.versionsDir, `version-${this.targetVersion}`);
    if (!fs.existsSync(versionedPath)) {
      this.log(`Target version directory not found: ${versionedPath}`, 'error');
      return;
    }

    const since = options.since || 'HEAD~1';
    const modifiedFiles = this.getModifiedFiles(since);

    if (modifiedFiles.length === 0) {
      this.log('No modified documentation files found');
      return;
    }

    this.log(`Found ${modifiedFiles.length} modified files:`);
    modifiedFiles.forEach(file => this.log(`  - ${file}`));
    this.log(`Target version: ${this.targetVersion}`);

    const results = {
      successful: [],
      failed: [],
      skipped: []
    };

    for (const sourceFile of modifiedFiles) {
      this.log(`Processing: ${sourceFile}`);

      const diff = this.getFileDiff(sourceFile, since);
      if (!diff.trim()) {
        this.log(`No meaningful diff found for: ${sourceFile}`);
        results.skipped.push(sourceFile);
        continue;
      }

      const targetPaths = this.getTargetPaths(sourceFile);

      if (targetPaths.length === 0) {
        this.log(`No target paths found for: ${sourceFile}`);
        results.skipped.push(sourceFile);
        continue;
      }

      for (const targetPath of targetPaths) {
        const fullTargetPath = path.join(this.rootDir, targetPath);

        if (!fs.existsSync(fullTargetPath)) {
          this.log(`Target file doesn't exist, skipping: ${targetPath}`);
          continue;
        }

        const success = this.applyDiffToFile(sourceFile, targetPath, diff);

        if (success) {
          results.successful.push(`${sourceFile} → ${targetPath}`);
        } else {
          results.failed.push(`${sourceFile} → ${targetPath}`);
        }
      }
    }

    // Report results
    console.log('\n=== SYNC RESULTS ===');
    console.log(`Target Version: ${this.targetVersion}`);
    console.log(`Successful: ${results.successful.length}`);
    console.log(`Failed: ${results.failed.length}`);
    console.log(`Skipped: ${results.skipped.length}`);

    if (results.successful.length > 0 && this.verbose) {
      console.log('\nSuccessful syncs:');
      results.successful.forEach(item => console.log(`  ✓ ${item}`));
    }

    if (results.failed.length > 0) {
      console.log('\nFailed syncs:');
      results.failed.forEach(item => console.log(`  ✗ ${item}`));
    }
  }
}

// CLI Usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--version':
        options.targetVersion = args[++i];
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--verbose':
        options.verbose = true;
        break;
      case '--since':
        options.since = args[++i];
        break;
      case '--docs-dir':
        options.docsDir = args[++i];
        break;
      case '--versions-dir':
        options.versionsDir = args[++i];
        break;
      case '--i18n-dir':
        options.i18nDir = args[++i];
        break;
      case '--help':
        console.log(`
Docusaurus Documentation Backport Script

Usage: node backport-docs.js --version <version> [options]

Required:
  --version <version>    Target version to sync to (e.g., 2.0, 1.5)

Options:
  --dry-run             Show what would be changed without making changes
  --verbose             Show detailed logging
  --since <ref>         Git reference to compare against (default: HEAD~1)
  --docs-dir <dir>      Docs directory name (default: docs)
  --versions-dir <dir>  Versioned docs directory name (default: versioned_docs)
  --i18n-dir <dir>      i18n directory name (default: i18n)
  --help                Show this help message

Sync Behavior:
  - docs/* → versioned_docs/version-<version>/*
  - i18n/*/docusaurus-plugin-content-docs/current/* → i18n/*/docusaurus-plugin-content-docs/version-<version>/*

Examples:
  node backport-docs.js --version 2.0 --dry-run --verbose
  node backport-docs.js --version 1.5 --since HEAD~3
  node backport-docs.js --version 2.0 --since main
        `);
        process.exit(0);
    }
  }

  if (!options.targetVersion) {
    console.error('Error: --version is required');
    console.error('Use --help for usage information');
    process.exit(1);
  }

  const syncer = new DocusaurusVersionSync(options);
  syncer.sync({ since: options.since }).catch(error => {
    console.error('Sync failed:', error);
    process.exit(1);
  });
}

module.exports = DocusaurusVersionSync;
