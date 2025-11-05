# Contributing to FPR Emarat

Thank you for considering contributing to the FPR Emarat testing framework! This document provides guidelines for contributing to the project.

## 🤝 How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Environment details (OS, Node version, etc.)

### Suggesting Enhancements

Enhancement suggestions are welcome! Please include:
- Clear use case description
- Expected benefits
- Potential implementation approach

### Pull Requests

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/FPR_Emarat.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Write clear, commented code
   - Follow existing code style
   - Add tests if applicable
   - Update documentation

4. **Test your changes**
   ```bash
   npx playwright test
   ```

5. **Commit your changes**
   ```bash
   git commit -am "Add feature: description"
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**
   - Provide clear description
   - Reference related issues
   - Include test results

## 📋 Code Style Guidelines

### TypeScript

- Use TypeScript for test files
- Define interfaces for data structures
- Use meaningful variable names
- Add comments for complex logic

### Naming Conventions

- **Files**: Use lowercase with underscores (e.g., `emarat_login.ts`)
- **Classes**: Use PascalCase (e.g., `FPRTestFramework`)
- **Functions**: Use camelCase (e.g., `validateReport`)
- **Constants**: Use UPPER_SNAKE_CASE (e.g., `MAX_TIMEOUT`)

### Documentation

- Add JSDoc comments for public methods
- Update README.md for new features
- Include examples for complex functionality

## 🧪 Testing Guidelines

### Writing Tests

- Each test should be independent
- Use descriptive test names
- Clean up after tests
- Handle timeouts appropriately

### Test Structure

```typescript
test('Feature description', async ({ page }) => {
  // Setup
  const framework = new FPRTestFramework(page, config);
  
  // Execute
  await framework.login();
  const result = await framework.validateReport('FPR Report');
  
  // Assert
  expect(result.successRate).toBeGreaterThan(90);
});
```

## 📝 Commit Message Guidelines

Use conventional commit format:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `test:` Test additions/changes
- `refactor:` Code refactoring
- `chore:` Maintenance tasks

Examples:
```
feat: Add multi-currency support
fix: Correct column offset detection
docs: Update README with new examples
test: Add test for edge case scenario
```

## 🔍 Review Process

1. All PRs require review before merging
2. CI/CD tests must pass
3. Code must follow style guidelines
4. Documentation must be updated

## 📞 Getting Help

- Create an issue for questions
- Contact the maintainers
- Check existing documentation

## 🙏 Thank You

Your contributions make this project better!
