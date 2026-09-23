# User Authentication and CRUD App

A simple full-stack user authentication and user management application built for the Software Engineer Intern assessment.

## Tech Stack

- Frontend: Next.js, TypeScript, and Tailwind CSS
- Backend: NestJS
- Database: MongoDB with Mongoose
- Authentication: JWT stored in an HTTP-only cookie
- Deployment: Vercel and Render

## Live Links

- Frontend: `https://project-neon-lab.vercel.app/`
- Backend: `https://user-crud-backend-sdcz.onrender.com`
- GitHub: `https://github.com/niro1231/Project-NeonLab`

Replace the frontend and GitHub placeholders before submitting.

## Features

- Register, login, and logout
- Password hashing with bcrypt
- JWT authentication using HTTP-only cookies
- Protected NestJS routes using an authentication guard
- View all users and a single user
- View and update the logged-in user's profile
- Delete the logged-in user's account
- DTO validation using `class-validator`
- Production cross-domain cookies with `Secure`, `SameSite=None`, and CORS credentials

## Project Structure

```text
.
├── backend/    # NestJS API
└── frontend/   # Next.js application
```

## Requirements

- Node.js 20 or newer
- npm
- MongoDB or MongoDB Atlas

## Local Setup

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run start:dev
```

The API runs at `http://localhost:4000`.

### Frontend

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

Then run:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:3000`.

## Environment Variables

### Backend

```env
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/nest-assessment
JWT_SECRET=<long-random-secret>
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

### Frontend

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

Never commit `.env` or `.env.local` files.

## API Endpoints

All backend routes use the `/api` prefix. Authenticated requests use the JWT cookie.

### Authentication

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Register a user and set the authentication cookie |
| POST | `/api/auth/login` | Log in and set the authentication cookie |
| POST | `/api/auth/logout` | Clear the authentication cookie |
| GET | `/api/auth/me` | Get the logged-in user |

### Users

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/users` | List all users |
| GET | `/api/users/:id` | Get one user |
| GET | `/api/users/me` | Get the logged-in user's profile |
| PATCH | `/api/users/me` | Update the logged-in user's name or email |
| DELETE | `/api/users/me` | Delete the logged-in user's account |

## Deployment

### Backend on Render

Configure the Render service with:

- Root directory: `backend`
- Build command: `npm ci && npm run build`
- Start command: `npm run start:prod`
- Health check path: `/api/health`

Set these Render environment variables:

```env
NODE_ENV=production
MONGODB_URI=<your-mongodb-connection-string>
JWT_SECRET=<long-random-secret>
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://project-neon-lab.vercel.app
```

`CORS_ORIGIN` must exactly match the deployed Vercel origin, without a trailing slash.

### Frontend on Vercel

Set this Vercel environment variable:

```env
NEXT_PUBLIC_API_URL=https://user-crud-backend-sdcz.onrender.com/api
```

The frontend must use the live Render URL in production, not `localhost`.

## Verification Checklist

Test the complete flow before submission:

1. Register a new account.
2. Confirm the user reaches the dashboard.
3. View the users list and a profile.
4. Update the profile name or email.
5. Log out.
6. Log in again.
7. Delete the account.
8. Confirm protected routes reject requests after logout.

## Security

- Passwords are hashed with bcrypt before storage.
- JWTs are stored in HTTP-only cookies.
- Password hashes are never returned by the API.
- Protected routes require a valid JWT.
- Production cookies use `Secure` and `SameSite=None`.
- CORS is configured with credentials enabled.