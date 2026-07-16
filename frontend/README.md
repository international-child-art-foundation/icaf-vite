# ICAF Website

## Contributing

> This project uses [pnpm](https://pnpm.io). Please install it globally via `npm i -g pnpm` before working locally. You must use pnpm to install dependencies.

When starting a new task, create a new branch (e.g. `sponsor-page`, `about-page-update`). Clone the repository, make local commits, and regularly sync with the remote branch. Once the task is complete, open a Pull Request to the `main` branch and assign it to a moderator (e.g. `31hemlock`) for review.

- Follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) for commit messages.

## Technology Stack

_Note: Subject to change._

### Frontend

- **Bundler**: Vite
- **Styling**: Tailwind CSS (v3) + ShadCN (v2.3.0) + Lucide (icons)
  - Tailwind v3 is required to support older browsers
  - ShadCN is locked to a Tailwind-compatible version
- **State Management**: React Context
- **Analytics**: Google Analytics
- **Caching/DNS**: Cloudflare

### Backend

- **API**: AWS Lambda + API Gateway
- **Database**: DynamoDB
- **Image Storage**: S3
- **Authentication**: Cognito

## Website assets

Small assets are stored directly in the frontend of this repository. For larger files (magazines, PDFs, long videos), keep an `icaf-vite-files` folder outside the repo and symlink its asset subfolders into `frontend/public`.
Do not set `VITE_PUBLIC_DIR`; Vite must use `frontend/public` so it copies root files like `favicon.svg`, `robots.txt`, `sitemap.xml`, `_headers`, and `_redirects` along with the symlinked asset folders.
Current server-root asset directories include /ChildArt, /assets, /data, /documents, /gallery-arts, and /large-media.
Larger media files and videos exist in our webspace under the domain media.icaf.org. They were moved so that icaf.org can be cached and managed by Cloudflare as per their TOS.

## API routing

Frontend API requests default to `/api/*` so auth cookies are set by the same browser origin as the app. In local development, set `API_PROXY_TARGET` in `frontend/.env.local` to the backend origin (the deployed API Gateway stage URL).

Production will mirror this shape by routing `https://<app-domain>/api/*` to the API origin.

## Style Guide

Tailwind is the primary styling solution. Icaf-specific colors will be defined in the Tailwind config. When creating a component:

1. Check if it already exists as a ShadCN component.
2. If so, import and style it according to our design system.
3. If not, create it from scratch only as a last resort.

Detailed styling guidelines are available in the Figma file.

## Resources

[Figma File – ICAF 2024–25 Website](https://www.figma.com/design/A5qtnPkMi0ujZiGiBMFB7c/ICAF-%7C-2024--25-%7C-Main-Website-%7C-Free-File)
