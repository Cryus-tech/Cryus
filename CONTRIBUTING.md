# Contributing to Cryus

Thank you for your interest in contributing to Cryus! We're excited to have you join our community of contributors. This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please read it before contributing.

## How Can I Contribute?

There are many ways you can contribute to Cryus:

### Reporting Bugs

This section guides you through submitting a bug report. Following these guidelines helps maintainers understand your report, reproduce the behavior, and find related reports.

- **Use the GitHub issue tracker**: Bug reports should be submitted through the [GitHub issue tracker](https://github.com/Cryus-tech/Cryus/issues).
- **Check if the bug has already been reported**: Before creating a new issue, please search to see if someone has already reported the problem.
- **Use the bug report template**: When creating a new issue, please use the bug report template if available.
- **Provide detailed information**: Include as much detail as possible, such as steps to reproduce, expected behavior, actual behavior, and your environment details.

### Suggesting Enhancements

This section guides you through submitting an enhancement suggestion, including completely new features and minor improvements to existing functionality.

- **Use the GitHub issue tracker**: Enhancement suggestions should be submitted through the [GitHub issue tracker](https://github.com/Cryus-tech/Cryus/issues).
- **Check if the enhancement has already been suggested**: Before creating a new issue, please search to see if someone has already suggested the enhancement.
- **Use the feature request template**: When creating a new issue, please use the feature request template if available.
- **Provide detailed information**: Include as much detail as possible, such as the steps that you imagine you would take if the feature existed, and how it would benefit the project.

### Pull Requests

This section guides you through submitting a pull request.

- **Follow the coding style**: Make sure your code follows the coding style used in the project.
- **Document new code**: Add necessary documentation for any new code.
- **Write tests**: Add tests for any new functionality.
- **Update documentation**: Update the documentation if necessary.
- **Create a descriptive pull request**: Include a detailed description of the changes and the purpose of the pull request.

## Development Process

### Setting Up the Development Environment

To set up the development environment:

1. Fork the repository on GitHub.
2. Clone your fork locally:
   ```bash
   git clone https://github.com/Cryus-tech/Cryus.git
   cd Cryus
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

### Branching Strategy

We use a simplified version of the [GitHub flow](https://guides.github.com/introduction/flow/):

1. Create a new branch for each feature or bugfix.
2. Name your branch according to what you're working on (e.g., `feature/add-new-generator`, `bugfix/fix-login-issue`).
3. Submit a pull request from your branch to the main branch.

### Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages:

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools and libraries

Example:
```
feat(whitepaper): add template selection feature
```

## Code Review Process

All pull requests will be reviewed by at least one of the core team members before being merged. Reviewers may ask you to make changes to your pull request before it can be merged.

## Community

### Communication Channels

- **GitHub Issues**: For bug reports, feature requests, and discussion related to the codebase.
- **Twitter**: Follow us [@cryusxyz](https://x.com/cryusxyz) for project updates.
- **Website**: Visit our website at [cryus.xyz](https://cryus.xyz) for more information.

### Recognition

We believe in recognizing the contributions of our community members. Contributors will be acknowledged in our release notes and on our website.

## Questions?

If you have any questions or need help with contributing, please reach out to us through one of the communication channels mentioned above.

Thank you for contributing to Cryus! 