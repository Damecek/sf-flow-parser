# Contributing to Deno Flow Parser

Thank you for your interest in contributing to Deno Flow Parser! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please be respectful and considerate of others when contributing to this project.

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/sf-flow-parser.git
   cd sf-flow-parser
   ```
3. Create a new branch for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Prerequisites

- [Deno](https://deno.land/) v1.37.0 or higher

### Running Tests

```bash
# Run all tests
deno task test

# Run all test with coverage
deno task test:coverage

# Run specific test file
deno task test src/test/flow.test.ts
```

### Code Style

- Follow the existing code style in the project
- Use meaningful variable and function names
- Add JSDoc comments for all public functions and types
- Keep functions small and focused on a single responsibility
- Use TypeScript types for better code quality and developer experience

### Commit Messages

- Use clear and descriptive commit messages
- Start with a verb in the present tense (e.g., "Add", "Fix", "Update")
- Reference issue numbers when applicable

Example:
```
Add support for scheduledPaths connectors

- Update BaseFlowNodeWithConnector interface to include scheduledPaths
- Enhance getConnectors function to handle scheduledPaths
- Add tests for the new functionality

Fixes #42
```

## Pull Request Process

1. Update the README.md with details of changes if applicable
2. Add or update tests for any new or modified functionality
3. Ensure all tests pass before submitting your PR
4. Update documentation for any changed functionality
5. The PR should work on the main branch

## Adding New Features

When adding new features:

1. Start by creating an issue describing the feature
2. Discuss the feature with maintainers
3. Implement the feature with appropriate tests
4. Update documentation
5. Submit a pull request

## Reporting Bugs

When reporting bugs:

1. Use the GitHub issue tracker
2. Describe the bug in detail
3. Include steps to reproduce
4. Include information about your environment (Deno version, OS, etc.)
5. If possible, provide a minimal code example that reproduces the issue

## Feature Requests

Feature requests are welcome! Please create an issue describing the feature and why it would be valuable.

## Documentation

- Keep documentation up-to-date with code changes
- Add JSDoc comments for all public functions and types
- Update the README.md for significant changes

## Testing

- Write tests for all new functionality
- Ensure existing tests pass with your changes
- Aim for high test coverage

## License

By contributing to this project, you agree that your contributions will be licensed under the project's MIT license.
