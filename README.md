# ICAF Website

## Contributing

> This project uses [pnpm](https://pnpm.io). Please install it globally via `npm i -g pnpm` before working locally. You must use pnpm to install dependencies.

When starting a new task, create a new branch (e.g. `sponsor-page`, `about-page-update`). Clone the repository, make local commits, and regularly sync with the remote branch. Once the task is complete, open a Pull Request to the `main` branch and assign it to a moderator (e.g. `31hemlock`) for review.

- Follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) for commit messages.

## Commands

- `pnpm i` - Installs dependencies
- `pnpm run dev` - Runs the frontend development server.
- `pnpm run check` - Checks all frontend files for type and linter errors.
- `pnpm run build` - Builds the frontend (plus shared dependencies) for web hosting.

## Technology Stack

_Note: Subject to change._

### Frontend

- **Bundler**: Vite
- **Styling**: Tailwind CSS (v3) + ShadCN (v2.3.0) + Lucide (icons)
  - Tailwind v3 is required to support older browsers
  - ShadCN is locked to a Tailwind-compatible version
- **State Management**: React Context
- **Analytics**: Likely Google Analytics; possibly PostHog

### Backend

- **API**: AWS Lambda + API Gateway
- **Database**: DynamoDB
- **Image Storage**: S3
- **Authentication**: Cognito, possibly OpenAuth

## Repo structure

The /shared folder is for types and other functions which are shared between frontend and backend code (mainly for API call and response objects).
`tsconfig.strict.json` is extended by each subproject and contains settings for all three TypeScript environments.

## Style Guide

Tailwind is the primary styling solution. Icaf-specific colors will be defined in the Tailwind config. When creating a component:

1. Check if it already exists as a ShadCN component.
2. If so, import and style it according to our design system.
3. If not, create it from scratch only as a last resort.

Detailed styling guidelines are available in the Figma file.

## Resources

[Figma File – ICAF 2024–25 Website](https://www.figma.com/design/A5qtnPkMi0ujZiGiBMFB7c/ICAF-%7C-2024--25-%7C-Main-Website-%7C-Free-File)
