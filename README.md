# Practice Logger UI

A React Router 7 + React 19 frontend for logging practice sessions. It fetches session data from a companion API and provides create, update, and delete flows for sessions.

## Tech Stack

- React 19 + React Router 7 (data loaders/actions)
- Tailwind CSS v4 + shadcn/ui components
- Vitest + Testing Library for unit tests

## Setup

### Installation

Install dependencies:

```bash
bun install
```

### Development

Start the development server with HMR:

```bash
bun run dev
```

Your application will be available at `http://localhost:5173`.

### API Configuration

The UI expects a backend service that exposes `GET/POST/PUT/DELETE /sessions`.
Set `VITE_API_URL` to point at the API base URL (defaults to `http://localhost:5270`):

```bash
VITE_API_URL=http://localhost:5270
```

## Building for Production

Create a production build:

```bash
bun run build
```

## Testing

Run unit tests with Vitest:

```bash
bun run test
```

Watch mode:

```bash
bun run test:watch
```

Coverage report:

```bash
bun run test:coverage
```

## Linting and Typechecking

```bash
bun run lint:check
bun run typecheck
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `bun run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```
