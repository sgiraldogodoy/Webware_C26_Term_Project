import { render, screen, fireEvent } from '@testing-library/react';
import TaskForm from '../components/TaskForm';

test('renders add task form', () => {
  render(<TaskForm onAdd={() => {}} />);
  expect(screen.getByPlaceholderText(/task title/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/description/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /add task/i })).toBeInTheDocument();
});

test('calls onAdd with title and description on submit', () => {
  const onAdd = jest.fn();
  render(<TaskForm onAdd={onAdd} />);
  fireEvent.change(screen.getByPlaceholderText(/task title/i), {
    target: { value: 'New Task' },
  });
  fireEvent.change(screen.getByPlaceholderText(/description/i), {
    target: { value: 'Task details' },
  });
  fireEvent.click(screen.getByRole('button', { name: /add task/i }));
  expect(onAdd).toHaveBeenCalledWith('New Task', 'Task details');
});

test('does not call onAdd when title is empty', () => {
  const onAdd = jest.fn();
  render(<TaskForm onAdd={onAdd} />);
  fireEvent.click(screen.getByRole('button', { name: /add task/i }));
  expect(onAdd).not.toHaveBeenCalled();
});

test('clears inputs after submit', () => {
  render(<TaskForm onAdd={() => {}} />);
  const input = screen.getByPlaceholderText(/task title/i);
  fireEvent.change(input, { target: { value: 'Clear me' } });
  fireEvent.click(screen.getByRole('button', { name: /add task/i }));
  expect(input.value).toBe('');
});
