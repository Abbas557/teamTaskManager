import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays } from 'lucide-react';
import { tasksApi } from '../../api/endpoints';
import { EmptyState } from '../../components/EmptyState';
import { PriorityBadge, StatusBadge } from '../../components/StatusBadge';
import { TaskStatus } from '../../types';

export function MyTasksPage() {
  const queryClient = useQueryClient();
  const tasks = useQuery({ queryKey: ['my-tasks'], queryFn: tasksApi.mine });
  const updateStatus = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) => tasksApi.updateStatus(taskId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>My Tasks</h1>
          <p>Work assigned to you across every project.</p>
        </div>
      </header>

      <section className="panel">
        <div className="task-table">
          {tasks.data?.length ? (
            tasks.data.map((task) => (
              <div className="task-table-row" key={task.id}>
                <div>
                  <strong>{task.title}</strong>
                  <span>{task.project.name}</span>
                </div>
                <StatusBadge status={task.status} />
                <PriorityBadge priority={task.priority} />
                <span className="date-cell">
                  <CalendarDays size={15} />
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                </span>
                <select
                  value={task.status}
                  onChange={(event) => updateStatus.mutate({ taskId: task.id, status: event.target.value as TaskStatus })}
                >
                  <option value="TODO">TODO</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="DONE">DONE</option>
                </select>
              </div>
            ))
          ) : (
            <EmptyState title="No assigned tasks">When a project admin assigns work to you, it will appear here.</EmptyState>
          )}
        </div>
      </section>
    </div>
  );
}
