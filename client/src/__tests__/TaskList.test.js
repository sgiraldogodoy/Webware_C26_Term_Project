import { render, screen } from '@testing-library/react';
import TaskList from '../components/TaskList';

const mockTasks = [
  { _id: '1', title: 'Buy groceries', description: 'Milk and eggs', completed: false },
  { _id: '2', title: 'Read a book', description: '', completed: true },
];

test('renders empty state message when no tasks', () => {
  render(<TaskList tasks={[]} onToggle={() => {}} onDelete={() => {}} />);
  expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
});

test('renders list of tasks', () => {
  render(<TaskList tasks={mockTasks} onToggle={() => {}} onDelete={() => {}} />);
  expect(screen.getByText('Buy groceries')).toBeInTheDocument();
  expect(screen.getByText('Read a book')).toBeInTheDocument();
});

test('renders task description when provided', () => {
  render(<TaskList tasks={mockTasks} onToggle={() => {}} onDelete={() => {}} />);
  expect(screen.getByText('Milk and eggs')).toBeInTheDocument();
});
