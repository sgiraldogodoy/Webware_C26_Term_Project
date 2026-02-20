import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTasks = async () => {
    try {
      const res = await axios.get('/api/tasks');
      setTasks(res.data);
    } catch (err) {
      setError('Failed to load tasks. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async (title, description) => {
    try {
      const res = await axios.post('/api/tasks', { title, description });
      setTasks([res.data, ...tasks]);
    } catch (err) {
      setError('Failed to add task.');
    }
  };

  const toggleTask = async (id, completed) => {
    try {
      const res = await axios.patch(`/api/tasks/${id}`, { completed: !completed });
      setTasks(tasks.map((t) => (t._id === id ? res.data : t)));
    } catch (err) {
      setError('Failed to update task.');
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`/api/tasks/${id}`);
      setTasks(tasks.filter((t) => t._id !== id));
    } catch (err) {
      setError('Failed to delete task.');
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Task Manager</h1>
        <p>Powered by React, Express &amp; MongoDB</p>
      </header>
      <main className="app-main">
        <TaskForm onAdd={addTask} />
        {error && <p className="error-msg">{error}</p>}
        {loading ? (
          <p className="loading">Loading tasks...</p>
        ) : (
          <TaskList tasks={tasks} onToggle={toggleTask} onDelete={deleteTask} />
        )}
      </main>
    </div>
  );
}

export default App;
