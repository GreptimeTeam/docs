---
keywords: [version numbering, Semantic Versioning, major release, minor release, revision number]
description: Explanation of GreptimeDB's version numbering scheme, including the significance of major, minor, and revision numbers.
---

# About GreptimeDB Version Number

GreptimeDB follows the [Semantic Versioning](https://semver.org/) scheme:

1.2.3 where:
- 1 is the major release
- 2 is the minor release
- 3 is the revision number

## Major release(1)
The major version indicates a significant milestone in the software’s lifecycle, often introducing extensive changes.
- Characteristics: Includes major architectural updates, substantial new features, or system overhauls.
- Impact: Typically not backward-compatible, requiring adjustments from users or developers.
- Examples: Major API redesigns, foundational architectural shifts, or the introduction of new core modules.

## Minor release(2)
The minor version focuses on feature enhancements and minor improvements, aiming to refine the existing system.
- Characteristics: Adds new features, small updates, or interface improvements.
- Impact: While it strives for backward compatibility within the same major version, minor breaking changes might occasionally occur.
- Examples: Introducing optional functionality, updating user interfaces, or expanding configuration options with slight adjustments to existing behaviors.

## Revision number(3)
The revision number is used for patches or minor refinements that address specific issues.
- Characteristics: Focuses on bug fixes, security updates, or performance optimizations.
- Impact: Does not introduce new features or change the overall behavior of the system.
- Examples: Fixing known bugs, addressing security vulnerabilities, or improving system stability.