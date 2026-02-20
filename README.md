# Webware C26 Term Project

A full-stack **Task Manager** application built with:
- **React** (frontend)
- **Express.js** (backend REST API)
- **MongoDB** (database via Mongoose)

## Project Structure

```
├── client/          # React frontend
│   ├── public/
│   └── src/
│       ├── App.js
│       ├── components/
│       │   ├── TaskForm.js
│       │   ├── TaskList.js
│       │   └── TaskItem.js
│       └── __tests__/
├── server/          # Express backend
│   ├── server.js
│   ├── models/
│   │   └── Task.js
│   ├── routes/
│   │   └── tasks.js
│   └── __tests__/
└── package.json     # Root scripts
```

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/) (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

## Getting Started

### 1. Install dependencies

```bash
npm run install:all
```

### 2. Configure environment

```bash
cp server/.env.example server/.env
```

Edit `server/.env` with your MongoDB connection string:

```
MONGODB_URI=mongodb://localhost:27017/taskmanager
PORT=5000
```

### 3. Run in development mode

```bash
npm run dev
```

This starts:
- Express server on `http://localhost:5000`
- React client on `http://localhost:3000`

## API Endpoints

| Method | Endpoint          | Description        |
|--------|-------------------|--------------------|
| GET    | /api/tasks        | Get all tasks      |
| GET    | /api/tasks/:id    | Get a task by ID   |
| POST   | /api/tasks        | Create a new task  |
| PATCH  | /api/tasks/:id    | Update a task      |
| DELETE | /api/tasks/:id    | Delete a task      |
| GET    | /api/health       | Health check       |

## Running Tests

**Backend tests:**
```bash
npm run test:server
```

**Frontend tests:**
```bash
npm run test:client
```
