import React from 'react';
import './TaskItem.css';

function TaskItem({ task, onToggle, onDelete }) {
  return (
    <li className={`task-item${task.completed ? ' task-item--done' : ''}`}>
      <input
        className="task-item__checkbox"
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task._id, task.completed)}
        aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
      />
      <div className="task-item__content">
        <span className="task-item__title">{task.title}</span>
        {task.description && (
          <span className="task-item__desc">{task.description}</span>
        )}
      </div>
      <button
        className="task-item__delete"
        onClick={() => onDelete(task._id)}
        aria-label={`Delete "${task.title}"`}
      >
        ✕
      </button>
    </li>
  );
}

export default TaskItem;
