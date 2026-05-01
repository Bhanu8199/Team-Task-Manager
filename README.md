# Team Task Manager

A full-stack project management web application with authentication, role-based access, and collaborative task tracking.

## Tech Stack

- Frontend: React, Vite, React Router
- Backend: Node.js, Express
- Database: PostgreSQL
- Authentication: JWT
- Styling: CSS with responsive layout
- Deployment-ready for platforms like Railway

## Features

- Secure signup and login with JWT authentication
- Role-based access control for `admin` and `member`
- Admin dashboard for creating projects and tasks
- Project member assignment and removal
- Task creation with status management and due dates
- Responsive dashboard with project and task summaries
- Auto-refreshing project list after creation

## Folder Structure

- `backend/`
  - `controllers/` - request handling and business logic
  - `middleware/` - auth and role checks
  - `models/` - PostgreSQL connection and schema setup
  - `routes/` - API route definitions
  - `server.js` - Express server entrypoint
- `frontend/`
  - `src/` - React application source
  - `src/pages/` - Login, Signup, Dashboard pages
  - `src/services/` - API request helpers
  - `src/utils/` - auth state helpers

## Setup

### 1. Backend Setup

1. Copy `backend/.env.example` to `backend/.env`.
2. Update backend environment variables:

   ```env
   DATABASE_URL=postgres://username:password@localhost:5432/team_task_manager
   JWT_SECRET=your_jwt_secret
   PORT=4000
   ```

3. Install backend dependencies:

   ```bash
   cd backend
   npm install
   ```

4. Start the backend server:

   ```bash
   npm run dev
   ```

### 2. Frontend Setup

1. Copy `frontend/.env.example` to `frontend/.env`.
2. Update frontend environment variables:

   ```env
   VITE_API_URL=http://localhost:4000
   ```

3. Install frontend dependencies:

   ```bash
   cd frontend
   npm install
   ```

4. Start the frontend app:

   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication

- `POST /auth/signup`
  - Body: `{ name, email, password, role }`
  - Response: `{ user, token }`

- `POST /auth/login`
  - Body: `{ email, password }`
  - Response: `{ user, token }`

### Projects

- `GET /projects`
  - Returns projects available to the authenticated user.

- `POST /projects`
  - Admin only.
  - Body: `{ name, description }`
  - Creates a new project.

- `POST /projects/:projectId/members`
  - Admin only.
  - Body: `{ userId }`
  - Adds a member to a project.

- `DELETE /projects/:projectId/members/:userId`
  - Admin only.
  - Removes a member from a project.

### Tasks

- `GET /tasks`
  - Returns tasks assigned to the authenticated user.

- `POST /tasks`
  - Admin only.
  - Body: `{ title, description, projectId, assignedTo, status, dueDate }`
  - Creates a new task.

- `PATCH /tasks/:id`
  - Updates task fields such as `{ status }`.

### Users

- `GET /users`
  - Admin only.
  - Returns all users.

## Deployment Notes

- Backend: set `DATABASE_URL`, `JWT_SECRET`, and `PORT` in your deployment environment.
- Frontend: set `VITE_API_URL` to the deployed backend URL.
- Backend start command: `npm start`
- Frontend build command: `npm run build`

## Important Notes

- Do not commit `.env` files or secrets.
- The backend initializes database tables automatically on startup.
- Use role values `admin` or `member` when signing up.
