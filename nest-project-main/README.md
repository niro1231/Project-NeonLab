# Full-stack User Auth + CRUD

Software Engineer Intern assessment: a small full-stack app with user
authentication and user CRUD.

| Layer    | Technology            |
| -------- | --------------------- |
| Frontend | Next.js + Tailwind CSS |
| Backend  | NestJS                |
| Database | MongoDB (Mongoose)    |
| Auth     | JWT in an HTTP-only cookie |

## Live links

| What     | URL            |
| -------- | -------------- |
| Frontend | _to be added_  |
| Backend  | _to be added_  |

## Repository layout

This is a single repository holding both apps side by side:

```
.
├── api/   # NestJS backend  -> deployed to Render
└── web/   # Next.js frontend -> deployed to Vercel  (not built yet)
```

Each folder is its own npm project with its own `package.json`, `.env` and
README. Nothing is installed at the root.

## Getting started

Start with the backend, because the frontend needs it running:

- **Backend:** [api/README.md](api/README.md) - full first-time setup, from
  `git clone` to a verified working API, plus the endpoint reference and
  Render deployment steps.
- **Frontend:** coming next.

In short:

```bash
git clone https://github.com/daninithi/nest-project.git
cd nest-project/api
npm install
cp .env.example .env    # fill in MONGODB_URI and JWT_SECRET
npm run start:dev
```

The API then runs on <http://localhost:4000> and the frontend will run on
<http://localhost:3000>.
