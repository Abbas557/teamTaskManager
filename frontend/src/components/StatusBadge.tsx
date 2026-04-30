import { clsx } from 'clsx';
import { TaskPriority, TaskStatus } from '../types';

export function StatusBadge({ status }: { status: TaskStatus }) {
  const label = status.replace('_', ' ');
  return <span className={clsx('badge', `status-${status.toLowerCase()}`)}>{label}</span>;
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return <span className={clsx('badge', `priority-${priority.toLowerCase()}`)}>{priority}</span>;
}
