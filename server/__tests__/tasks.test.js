process.env.NODE_ENV = 'test';

const request = require('supertest');

// Mock mongoose to avoid real DB connection
jest.mock('mongoose', () => {
  const actual = jest.requireActual('mongoose');
  return {
    ...actual,
    connect: jest.fn().mockResolvedValue({}),
  };
});

// Mock the Task model
const mockTaskData = {
  _id: '64a000000000000000000001',
  title: 'Test Task',
  description: 'A test task',
  completed: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockSave = jest.fn();

jest.mock('../models/Task', () => {
  function MockTask(data) {
    Object.assign(this, { ...mockTaskData, ...data });
    this.save = mockSave;
  }
  MockTask.find = jest.fn();
  MockTask.findById = jest.fn();
  MockTask.findByIdAndDelete = jest.fn();
  return MockTask;
});

const Task = require('../models/Task');
const app = require('../server');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/health', () => {
  it('returns status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('Tasks API', () => {
  it('GET /api/tasks returns list of tasks', async () => {
    Task.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([mockTaskData]) });
    const res = await request(app).get('/api/tasks');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/tasks creates a task', async () => {
    mockSave.mockResolvedValue({ ...mockTaskData });
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'Test Task', description: 'A test task' });
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('Test Task');
  });

  it('POST /api/tasks returns 400 when title is missing', async () => {
    const res = await request(app).post('/api/tasks').send({ description: 'no title' });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Title is required');
  });

  it('GET /api/tasks/:id returns 404 when not found', async () => {
    Task.findById.mockResolvedValue(null);
    const res = await request(app).get('/api/tasks/64a000000000000000000099');
    expect(res.statusCode).toBe(404);
  });

  it('GET /api/tasks/:id returns the task when found', async () => {
    Task.findById.mockResolvedValue(mockTaskData);
    const res = await request(app).get(`/api/tasks/${mockTaskData._id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Test Task');
  });

  it('PATCH /api/tasks/:id updates a task', async () => {
    const taskInstance = { ...mockTaskData, save: jest.fn().mockResolvedValue({ ...mockTaskData, completed: true }) };
    Task.findById.mockResolvedValue(taskInstance);
    const res = await request(app)
      .patch(`/api/tasks/${mockTaskData._id}`)
      .send({ completed: true });
    expect(res.statusCode).toBe(200);
  });

  it('DELETE /api/tasks/:id deletes a task', async () => {
    Task.findByIdAndDelete.mockResolvedValue(mockTaskData);
    const res = await request(app).delete(`/api/tasks/${mockTaskData._id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Task deleted');
  });

  it('DELETE /api/tasks/:id returns 404 when not found', async () => {
    Task.findByIdAndDelete.mockResolvedValue(null);
    const res = await request(app).delete('/api/tasks/64a000000000000000000099');
    expect(res.statusCode).toBe(404);
  });
});
