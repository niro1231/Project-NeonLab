# Backend API - NestJS + MongoDB

Backend for the Software Engineer Intern assessment: user authentication with
JWT stored in an HTTP-only cookie, plus CRUD for users.

- **Framework:** NestJS 12
- **Database:** MongoDB via Mongoose
- **Auth:** JWT in an HTTP-only cookie, passwords hashed with bcrypt
- **Validation:** class-validator DTOs

---

## Getting started (first time on this project)

Follow these steps in order. They take about five minutes.

### 0. What you need installed

| Tool    | Version | Check with  | Where to get it                        |
| ------- | ------- | ----------- | -------------------------------------- |
| Node.js | 20 or newer | `node -v` | <https://nodejs.org> (LTS)          |
| npm     | comes with Node | `npm -v` | -                              |
| Git     | any     | `git --version` | <https://git-scm.com>              |

You also need a MongoDB to talk to. Step 3 shows two ways to get one - pick
whichever is easier for you.

### 1. Clone the repo and open the backend folder

```bash
git clone <your-repo-url>
cd <repo-folder>/api
```

The backend lives in the `api` folder. Everything below is run from there.

### 2. Install the dependencies

```bash
npm install
```

This reads `package.json` and downloads the packages into `node_modules`.
Think of it like buying the ingredients before you start cooking. You only
need to do this again when someone adds a new package.

### 3. Get a MongoDB running

**Option A - MongoDB Atlas (free, nothing to install).** Recommended if you
are also going to deploy.

1. Create a free account at <https://www.mongodb.com/atlas> and make a free
   M0 cluster.
2. Under **Database Access**, create a user with a password.
3. Under **Network Access**, add `0.0.0.0/0` so your machine (and later
   Render) can connect.
4. Press **Connect → Drivers** and copy the connection string. It looks like
   `mongodb+srv://USER:PASSWORD@cluster0.xxxx.mongodb.net/nest-assessment`.



> You do not need to create the database or the `users` collection yourself.
> Mongoose makes them the first time someone registers.

### 4. Create your `.env` file

`.env` holds your secrets, so it is never committed to Git. `.env.example` is
the committed template. Copy it:

```bash
cp .env.example .env
```

Then open `.env` and fill in two values:

- `MONGODB_URI` - the connection string from step 3.
- `JWT_SECRET` - any long random string. Generate one with:

  ```bash
  openssl rand -base64 32
  ```

Leave `PORT`, `NODE_ENV` and `CORS_ORIGIN` as they are for local work.
`CORS_ORIGIN=http://localhost:3000` is where the Next.js frontend runs.

Every variable is explained in the table below.

### 5. Start the server

```bash
npm run start:dev
```

This runs in watch mode - save a file and it restarts itself. You should see
a list of mapped routes and then:

```
API running on port 4000
```

### 6. Check it works

In a second terminal:

```bash
curl http://localhost:4000/api/health
```

Expected reply:

```json
{ "status": "ok", "timestamp": "2026-09-22T10:00:00.000Z" }
```

Now try the real flow. `-c cookies.txt` saves the login cookie to a file and
`-b cookies.txt` sends it back, which is exactly what a browser does for you.

```bash
# register a user (this also logs you in)
curl -c cookies.txt -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"secret123"}'

# use the cookie to reach a protected route
curl -b cookies.txt http://localhost:4000/api/users

# log out
curl -b cookies.txt -X POST http://localhost:4000/api/auth/logout
```

If the second command returns your user list, the setup is complete.

### Common first-run problems

| What you see                                              | What it means                      | Fix                                                                 |
| --------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------- |
| `Configuration key "MONGODB_URI" does not exist`           | No `.env`, or the line is missing  | Re-do step 4.                                                       |
| `MongooseServerSelectionError` / `ECONNREFUSED`            | The database is not reachable      | Atlas: check the password and that `0.0.0.0/0` is allowed. Docker: check the container is running with `docker ps`. |
| `EADDRINUSE: address already in use :::4000`               | Port 4000 is taken                 | Stop the other process, or set a different `PORT` in `.env`.        |
| `401 You are not logged in` on `/api/users`                | The cookie was not sent            | Use `-b cookies.txt` with curl, or `credentials: 'include'` in fetch. |
| Browser requests blocked by CORS                           | Wrong frontend origin              | `CORS_ORIGIN` must match the frontend origin exactly, no trailing slash. |

---

## Environment variables

| Variable         | Required | Example                                      | What it does                                        |
| ---------------- | -------- | -------------------------------------------- | --------------------------------------------------- |
| `PORT`           | no       | `4000`                                       | Port to listen on. Render sets this automatically.   |
| `NODE_ENV`       | no       | `development`                                | `production` switches cookies to `Secure`+`SameSite=None`. |
| `MONGODB_URI`    | **yes**  | `mongodb+srv://user:pass@cluster/nest-assessment` | Database connection string.                    |
| `JWT_SECRET`     | **yes**  | a long random string                         | Signs and verifies the token.                        |
| `JWT_EXPIRES_IN` | no       | `7d`                                         | How long a login lasts. Defaults to `7d`.            |
| `CORS_ORIGIN`    | **yes** in prod | `https://your-app.vercel.app`         | Exact frontend origin(s), comma separated, no trailing slash. |

See [.env.example](.env.example).

---

## API reference

All routes are prefixed with `/api`. Requests from the browser must be sent
with credentials (`fetch(url, { credentials: 'include' })`) so the cookie
travels with them.

### Auth

| Method | Route            | Auth | Body                        | Result                                       |
| ------ | ---------------- | ---- | --------------------------- | -------------------------------------------- |
| `POST` | `/auth/register` | no   | `{ name, email, password }` | Creates the user, sets the cookie, returns the user. |
| `POST` | `/auth/login`    | no   | `{ email, password }`       | Sets the cookie, returns the user.           |
| `POST` | `/auth/logout`   | no   | -                           | Clears the cookie.                           |
| `GET`  | `/auth/me`       | yes  | -                           | The logged-in user. Handy for session checks.|

### Users

| Method   | Route        | Auth | Body               | Result                       |
| -------- | ------------ | ---- | ------------------ | ---------------------------- |
| `GET`    | `/users`     | yes  | -                  | List of all users.           |
| `GET`    | `/users/me`  | yes  | -                  | Own profile.                 |
| `GET`    | `/users/:id` | yes  | -                  | A single user.               |
| `PATCH`  | `/users/me`  | yes  | `{ name?, email? }`| Updated own profile.         |
| `DELETE` | `/users/me`  | yes  | -                  | Deletes own account + clears the cookie. |

A user object looks like this - the password hash is never sent:

```json
{
  "id": "6712f0...",
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "createdAt": "2026-09-22T10:00:00.000Z",
  "updatedAt": "2026-09-22T10:00:00.000Z"
}
```

---

## Folder structure

```
src/
├── main.ts                       # Bootstrap: cookies, CORS, validation, /api prefix
├── app.module.ts                 # Wires config, MongoDB, JWT and the feature modules
├── app.controller.ts             # GET /api/health
│
├── common/                       # Small pieces shared by every module
│   ├── cookie.options.ts         # One place deciding how the auth cookie is set
│   ├── decorators/
│   │   └── current-user.decorator.ts
│   ├── guards/
│   │   └── jwt-auth.guard.ts     # Reads the cookie, verifies the JWT
│   └── types/
│       └── auth-user.type.ts
│
└── modules/
    ├── auth/                     # Register / login / logout
    │   ├── auth.module.ts
    │   ├── auth.controller.ts    # HTTP layer: reads body, sets cookie
    │   ├── auth.service.ts       # Logic: hashing checks, token signing
    │   └── dto/
    │       ├── login.dto.ts
    │       └── register.dto.ts
    │
    └── users/                    # User CRUD
        ├── users.module.ts
        ├── users.controller.ts
        ├── users.service.ts      # The only place that touches the database
        ├── dto/
        │   ├── create-user.dto.ts
        │   └── update-user.dto.ts
        └── schemas/
            └── user.schema.ts    # Mongoose schema: name, unique email, hashed password
```

The idea is one job per layer:

- **Controller** - talks HTTP. Reads the body, sets or clears the cookie, returns a response.
- **Service** - holds the logic and the database calls.
- **DTO** - describes the shape of an incoming request and validates it.
- **Schema** - describes how a user is stored in MongoDB.
- **Guard** - the gate in front of protected routes.

---

## How the auth flow works

1. **Register** - the password is hashed with bcrypt (10 rounds) and only the
   hash is stored. A JWT is signed with the user's id and sent back as an
   HTTP-only cookie named `access_token`.
2. **Login** - bcrypt compares the typed password with the stored hash. Wrong
   email and wrong password give the identical error, so the API does not leak
   which emails are registered.
3. **Protected routes** - `JwtAuthGuard` reads the cookie, verifies the token,
   and attaches `{ userId, email }` to the request. No cookie or a bad token
   gives `401`.
4. **Logout** - the cookie is cleared. Because it is HTTP-only, page JavaScript
   could never read or delete it itself.
5. **Own data only** - update and delete work on `/users/me`, which always uses
   the id from the token. A user cannot edit or delete someone else's account.

---

## Deploying to Render

1. Push this repo to GitHub.
2. On Render: **New → Web Service**, pick the repo.
   - Root directory: `api`
   - Build command: `npm ci && npm run build`
   - Start command: `npm run start:prod`
   - Health check path: `/api/health`
3. Add the environment variables:
   - `NODE_ENV=production`
   - `MONGODB_URI` - your MongoDB Atlas string (allow access from anywhere, `0.0.0.0/0`, so Render can connect)
   - `JWT_SECRET` - a long random string
   - `CORS_ORIGIN` - your Vercel URL, e.g. `https://your-app.vercel.app` (no trailing slash)

`render.yaml` in this folder does the same thing automatically if you prefer
Render Blueprints.

### Making cookies work across domains

The frontend (Vercel) and backend (Render) are on different domains, so the
cookie needs `SameSite=None; Secure`. That happens on its own once
`NODE_ENV=production` is set - see [src/common/cookie.options.ts](src/common/cookie.options.ts).

Two things must also line up, or the browser will silently drop the cookie:

- `CORS_ORIGIN` must be the exact Vercel origin (CORS with credentials cannot use `*`).
- Every request from the frontend must send `credentials: 'include'`.

---

## Scripts

| Command             | What it does                        |
| ------------------- | ----------------------------------- |
| `npm run start:dev` | Development server with auto-reload |
| `npm run build`     | Compile TypeScript to `dist/`       |
| `npm run start:prod`| Run the compiled build              |
| `npm run lint`      | Lint `src/`                         |
| `npm run format`    | Format `src/` with Prettier         |
