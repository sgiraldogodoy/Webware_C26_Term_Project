import { render, screen, fireEvent } from '@testing-library/react';
import TaskItem from '../components/TaskItem';

const task = { _id: '1', title: 'Test Task', description: 'Some details', completed: false };

test('renders task title and description', () => {
  render(<TaskItem task={task} onToggle={() => {}} onDelete={() => {}} />);
  expect(screen.getByText('Test Task')).toBeInTheDocument();
  expect(screen.getByText('Some details')).toBeInTheDocument();
});

test('calls onToggle when checkbox is clicked', () => {
  const onToggle = jest.fn();
  render(<TaskItem task={task} onToggle={onToggle} onDelete={() => {}} />);
  fireEvent.click(screen.getByRole('checkbox'));
  expect(onToggle).toHaveBeenCalledWith('1', false);
});

test('calls onDelete when delete button is clicked', () => {
  const onDelete = jest.fn();
  render(<TaskItem task={task} onToggle={() => {}} onDelete={onDelete} />);
  fireEvent.click(screen.getByRole('button', { name: /delete/i }));
  expect(onDelete).toHaveBeenCalledWith('1');
});

test('applies done class when task is completed', () => {
  const doneTask = { ...task, completed: true };
  const { container } = render(<TaskItem task={doneTask} onToggle={() => {}} onDelete={() => {}} />);
  expect(container.firstChild).toHaveClass('task-item--done');
});
