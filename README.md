# Team Task Manager

A full-stack project management web app built with React, Vite, Express, and PostgreSQL.

## Features

- JWT authentication with signup/login
- Role-based access control (admin/member)
- Admins can create projects and assign team members
- Admins can create tasks and assign them to project members
- Members can view their tasks and update task status
- Dashboard with task status breakdown and overdue tasks

## Folder Structure

- `backend/`
  - `controllers/` - request handling logic
  - `middleware/` - authentication and authorization
  - `models/` - PostgreSQL connection and schema initialization
  - `routes/` - API route definitions
  - `server.js` - Express server entrypoint
- `frontend/`
  - `src/` - React app source
  - `src/pages/` - login, signup, dashboard
  - `src/services/` - API helper
  - `src/utils/` - auth helpers

## Setup

### Backend

1. Copy `.env.example` to `backend/.env` and configure:

   ```env
   DATABASE_URL=postgres://username:password@localhost:5432/team_task_manager
   JWT_SECRET=your_jwt_secret
   PORT=4000
   ```

2. Install dependencies:

   ```bash
   cd backend
   npm install
   ```

3. Start the backend:

   ```bash
   npm run dev
   ```

### Frontend

1. Copy `frontend/.env.example` to `frontend/.env` and configure:

   ```env
   VITE_API_URL=http://localhost:4000
   ```

2. Install dependencies:

   ```bash
   cd frontend
   npm install
   ```

3. Start the frontend:

   ```bash
   npm run dev
   ```

## API Documentation

### Auth

- `POST /auth/signup`
  - Body: `{ name, email, password, role }`
  - Returns: user and JWT token

- `POST /auth/login`
  - Body: `{ email, password }`
  - Returns: user and JWT token

### Projects

- `POST /projects` (admin only)
  - Body: `{ name, description }`

- `GET /projects`
  - Returns projects for the logged-in user

- `POST /projects/:projectId/members` (admin only)
  - Body: `{ userId }`

- `DELETE /projects/:projectId/members/:userId` (admin only)

### Tasks

- `POST /tasks` (admin only)
  - Body: `{ title, description, projectId, assignedTo, status, dueDate }`

- `GET /tasks`
  - Returns tasks assigned to the logged-in user

- `PATCH /tasks/:id`
  - Body: `{ status }`

### Users

- `GET /users` (admin only)
  - Returns a list of users

## Deployment

This app is ready for Railway deployment.

### Backend Deployment

- Add `DATABASE_URL`, `JWT_SECRET`, and `PORT` in Railway environment variables.
- Set the service's start command to:

  ```bash
  npm start
  ```

### Frontend Deployment

- Add `VITE_API_URL` to Railway environment variables pointing to the backend URL.
- Set the frontend start command to:

  ```bash
  npm run build
  ```

## Notes

- The backend auto-creates required tables on startup.
- Use `admin` or `member` roles at signup.
- Keep environment secrets out of source control.
