# Contributing to Pharmacy Appointment Agent

Thank you for your interest in contributing to the Pharmacy Appointment Agent! This document provides guidelines and information for contributors.

## Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Git
- Google Cloud Project (for testing)
- Retell AI account (for testing)

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/yourusername/pharmacy-appointment-agent.git
   cd pharmacy-appointment-agent
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

4. **Build and Test**
   ```bash
   npm run build
   npm test
   ```

## Development Workflow

### Branch Naming
- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

### Commit Messages
Use conventional commit format:
- `feat: add new appointment type`
- `fix: resolve calendar API timeout issue`
- `docs: update setup instructions`
- `refactor: improve error handling`

### Code Style
- Use TypeScript for all new code
- Follow existing code patterns
- Add JSDoc comments for public functions
- Use meaningful variable and function names

## Testing

### Running Tests
```bash
npm test              # Run all tests
npm run test:api      # Run API tests only
npm run setup-demo    # Setup demo calendar
```

### Test Coverage
- Write tests for new features
- Test error scenarios
- Test both text and voice modes
- Verify Google API integrations

## Pull Request Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Write code following project standards
   - Add tests for new functionality
   - Update documentation if needed

3. **Test Your Changes**
   ```bash
   npm run build
   npm test
   npm run lint
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**
   - Use the PR template
   - Describe changes clearly
   - Link any related issues
   - Request review from maintainers

## Code Review Process

### What We Look For
- **Functionality**: Does it work as expected?
- **Code Quality**: Is it readable and maintainable?
- **Testing**: Are there adequate tests?
- **Documentation**: Is it properly documented?
- **Performance**: Does it impact performance?
- **Security**: Are there any security concerns?

### Review Checklist
- [ ] Code follows project conventions
- [ ] Tests pass and cover new functionality
- [ ] Documentation is updated
- [ ] No breaking changes (or properly documented)
- [ ] Error handling is appropriate
- [ ] Performance impact is acceptable

## Issue Reporting

### Bug Reports
When reporting bugs, please include:
- **Description**: Clear description of the issue
- **Steps to Reproduce**: Detailed steps to reproduce
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Environment**: OS, Node version, etc.
- **Logs**: Relevant error logs or screenshots

### Feature Requests
For feature requests, please include:
- **Use Case**: Why is this feature needed?
- **Proposed Solution**: How should it work?
- **Alternatives**: Other solutions considered
- **Additional Context**: Any other relevant information

## Development Guidelines

### Architecture
- Follow the existing modular architecture
- Keep integrations separate from business logic
- Use dependency injection where appropriate
- Maintain separation of concerns

### Error Handling
- Use try-catch blocks for async operations
- Provide meaningful error messages
- Log errors appropriately
- Handle edge cases gracefully

### API Design
- Follow RESTful principles
- Use consistent response formats
- Include proper HTTP status codes
- Validate input parameters

### Documentation
- Update README for user-facing changes
- Add JSDoc comments for new functions
- Update architecture docs for structural changes
- Include examples in documentation

## Release Process

### Versioning
We use semantic versioning (MAJOR.MINOR.PATCH):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist
- [ ] All tests pass
- [ ] Documentation is updated
- [ ] CHANGELOG is updated
- [ ] Version is bumped
- [ ] Release notes are written

## Community Guidelines

### Code of Conduct
- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Follow the golden rule

### Getting Help
- Check existing documentation first
- Search existing issues and discussions
- Ask questions in GitHub Discussions
- Join our community chat (if available)

## License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- Project documentation

Thank you for contributing to the Pharmacy Appointment Agent! 🎉
