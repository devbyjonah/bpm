# Simple Package Manager

This is a custom Node.js package manager that handles dependency installation and management. It supports adding new packages and installing dependencies while maintaining a `package-lock.json` file to ensure consistent installations.

## Features

- Install dependencies listed in `package.json`
- Add new dependencies to `package.json` and `package-lock.json`
- Maintain a `package-lock.json` file with version numbers and tarball URLs

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/simple-package-manager.git
cd simple-package-manager
```

2. Install dependencies:

```bash
npm install
```

3. Build the project:

```bash
npm run build
```

## Usage

### Add Packages

To add new packages, use the `add` command followed by the package names:

```bash
node dist/index.js add <package1> <package2> ...
```

For example, to add `express` and `lodash`:

```bash
node dist/index.js add express lodash
```

### Install Packages

To install all dependencies listed in `package.json`, use the `install` command:

```bash
node dist/index.js install
```

### Example Commands

```bash
# Add a single package
node dist/index.js add axios

# Add multiple packages
node dist/index.js add react react-dom

# Install all dependencies
node dist/index.js install
```

## Project Structure

- `src/`: Source code
  - `packageManager.ts`: Core package manager functionality
  - `index.ts`: Command-line interface
  - `utils/`: Utility functions for file handling and network requests
- `output/`: Output directory containing installed packages and lock files
  - `package.json`: List of project dependencies
  - `package-lock.json`: Lock file with resolved versions and tarball URLs
  - `node_modules/`: Installed packages
