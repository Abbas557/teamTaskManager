import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, CheckCircle2, CircleDashed, Clock3, ListChecks, Pencil, Plus, Trash2, UserPlus, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useParams } from 'react-router-dom';
import { z } from 'zod';
import { getApiError } from '../../api/client';
import { dashboardApi, projectMembersApi, projectsApi, tasksApi, usersApi } from '../../api/endpoints';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { Field, SelectField, TextAreaField } from '../../components/Field';
import { PriorityBadge, StatusBadge } from '../../components/StatusBadge';
import { getStoredUser } from '../auth/auth-storage';
import { ProjectRole, Task, TaskStatus } from '../../types';

const memberSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(['ADMIN', 'MEMBER']),
});

const taskSchema = z.object({
  title: z.string().min(2).max(160),
  description: z.string().max(2000).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  dueDate: z.string().optional(),
  assignedToId: z.string().optional(),
});

type MemberForm = z.infer<typeof memberSchema>;
type TaskForm = z.infer<typeof taskSchema>;

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const queryClient = useQueryClient();
  const user = getStoredUser();
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const project = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectsApi.detail(projectId!),
    enabled: Boolean(projectId),
  });
  const summary = useQuery({
    queryKey: ['project-summary', projectId],
    queryFn: () => dashboardApi.projectSummary(projectId!),
    enabled: Boolean(projectId),
  });
  const members = useQuery({
    queryKey: ['project-members', projectId],
    queryFn: () => projectMembersApi.list(projectId!),
    enabled: Boolean(projectId),
  });
  const tasks = useQuery({
    queryKey: ['project-tasks', projectId],
    queryFn: () => tasksApi.listByProject(projectId!),
    enabled: Boolean(projectId),
  });
  const users = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.list,
    enabled: user?.role === 'ADMIN',
  });

  const memberForm = useForm<MemberForm>({
    resolver: zodResolver(memberSchema),
    defaultValues: { role: 'MEMBER' },
  });
  const taskForm = useForm<TaskForm>({
    resolver: zodResolver(taskSchema),
    defaultValues: { priority: 'MEDIUM' },
  });
  const editTaskForm = useForm<TaskForm>({
    resolver: zodResolver(taskSchema),
    defaultValues: { priority: 'MEDIUM', status: 'TODO' },
  });

  function invalidateProject() {
    void queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    void queryClient.invalidateQueries({ queryKey: ['project-members', projectId] });
    void queryClient.invalidateQueries({ queryKey: ['project-tasks', projectId] });
    void queryClient.invalidateQueries({ queryKey: ['project-summary', projectId] });
    void queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    void queryClient.invalidateQueries({ queryKey: ['projects'] });
  }

  const addMember = useMutation({
    mutationFn: (values: MemberForm) => projectMembersApi.add(projectId!, values),
    onSuccess: () => {
      memberForm.reset({ role: 'MEMBER', userId: '' });
      invalidateProject();
    },
  });

  const removeMember = useMutation({
    mutationFn: (userId: string) => projectMembersApi.remove(projectId!, userId),
    onSuccess: invalidateProject,
  });

  const createTask = useMutation({
    mutationFn: (values: TaskForm) =>
      tasksApi.create(projectId!, {
        ...values,
        dueDate: values.dueDate || undefined,
        assignedToId: values.assignedToId || undefined,
      }),
    onSuccess: () => {
      taskForm.reset({ priority: 'MEDIUM', title: '', description: '', dueDate: '', assignedToId: '' });
      invalidateProject();
    },
  });

  const updateStatus = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) => tasksApi.updateStatus(taskId, status),
    onSuccess: invalidateProject,
  });

  const updateTask = useMutation({
    mutationFn: (values: TaskForm) =>
      tasksApi.update(editingTask!.id, {
        ...values,
        status: values.status,
        dueDate: values.dueDate || undefined,
        assignedToId: values.assignedToId || null,
      }),
    onSuccess: () => {
      setEditingTask(null);
      invalidateProject();
    },
  });

  const deleteTask = useMutation({
    mutationFn: (taskId: string) => tasksApi.remove(taskId),
    onSuccess: () => {
      setEditingTask(null);
      invalidateProject();
    },
  });

  const availableUsers = users.data?.filter((candidate) => !members.data?.some((member) => member.userId === candidate.id)) ?? [];
  const currentMembership = members.data?.find((member) => member.userId === user?.id);
  const canManageTasks =
    user?.role === 'ADMIN' || project.data?.ownerId === user?.id || currentMembership?.role === 'ADMIN';
  const projectMetrics = [
    { label: 'Total', value: summary.data?.totalTasks ?? 0, icon: ListChecks, tone: 'blue' },
    { label: 'To do', value: summary.data?.todo ?? 0, icon: CircleDashed, tone: 'violet' },
    { label: 'In progress', value: summary.data?.inProgress ?? 0, icon: Clock3, tone: 'amber' },
    { label: 'Done', value: summary.data?.done ?? 0, icon: CheckCircle2, tone: 'green' },
  ];

  function openTaskEditor(task: Task) {
    if (!canManageTasks) {
      return;
    }

    setEditingTask(task);
    editTaskForm.reset({
      title: task.title,
      description: task.description ?? '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
      assignedToId: task.assignedToId ?? '',
    });
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <Link className="back-link" to="/projects">Projects</Link>
          <h1>{project.data?.name ?? 'Project'}</h1>
          <p>{project.data?.description || 'No description'}</p>
        </div>
        <div className="progress-block">
          <span>Progress</span>
          <strong>{summary.data?.progress ?? 0}%</strong>
        </div>
      </header>

      <section className="metric-grid small">
        {projectMetrics.map((metric) => (
          <article className={`metric-card project-metric metric-${metric.tone}`} key={metric.label}>
            <div className="metric-icon">
              <metric.icon size={22} />
            </div>
            <div className="metric-copy">
              <span>{metric.label}</span>
              <strong>{summary.isLoading ? '-' : metric.value}</strong>
            </div>
          </article>
        ))}
      </section>

      <section className="split-grid wide-left">
        <div className="panel">
          <div className="panel-header">
            <h2>Tasks</h2>
            <span>{tasks.data?.length ?? 0}</span>
          </div>
          <div className="task-table">
            {tasks.data?.length ? (
              tasks.data.map((task) => (
                <div
                  className={`task-table-row ${canManageTasks ? 'clickable-task' : ''}`}
                  key={task.id}
                  role={canManageTasks ? 'button' : undefined}
                  tabIndex={canManageTasks ? 0 : undefined}
                  onClick={() => openTaskEditor(task)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      openTaskEditor(task);
                    }
                  }}
                >
                  <div>
                    <strong>{task.title}</strong>
                    <span>{task.assignedTo?.name ?? 'Unassigned'}</span>
                  </div>
                  <StatusBadge status={task.status} />
                  <PriorityBadge priority={task.priority} />
                  <span className="date-cell">
                    <CalendarDays size={15} />
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                  </span>
                  <select
                    value={task.status}
                    disabled={!canManageTasks && task.assignedToId !== user?.id && task.createdById !== user?.id}
                    onClick={(event) => event.stopPropagation()}
                    onKeyDown={(event) => event.stopPropagation()}
                    onChange={(event) => updateStatus.mutate({ taskId: task.id, status: event.target.value as TaskStatus })}
                  >
                    <option value="TODO">TODO</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="DONE">DONE</option>
                  </select>
                  {canManageTasks ? <Pencil className="row-edit-icon" size={17} /> : null}
                </div>
              ))
            ) : (
              <EmptyState title="No tasks">Create a task and assign it to a project member.</EmptyState>
            )}
          </div>
        </div>

        {canManageTasks ? (
          <form className="panel form-panel" onSubmit={taskForm.handleSubmit((values) => createTask.mutate(values))}>
            <div className="panel-header">
              <h2>New task</h2>
              <Plus size={18} />
            </div>

            <Field label="Title" error={taskForm.formState.errors.title?.message} {...taskForm.register('title')} />
            <TextAreaField label="Description" rows={4} {...taskForm.register('description')} />
            <SelectField label="Priority" {...taskForm.register('priority')}>
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
            </SelectField>
            <Field label="Due date" type="date" {...taskForm.register('dueDate')} />
            <SelectField label="Assignee" {...taskForm.register('assignedToId')}>
              <option value="">Unassigned</option>
              {members.data?.map((member) => (
                <option key={member.userId} value={member.userId}>{member.user.name}</option>
              ))}
            </SelectField>

            {createTask.isError ? <div className="form-error">{getApiError(createTask.error)}</div> : null}

            <Button type="submit" disabled={createTask.isPending}>
              {createTask.isPending ? 'Creating...' : 'Create task'}
            </Button>
          </form>
        ) : (
          <div className="panel member-note">
            <h2>Task updates</h2>
            <p>Members can update the status of tasks assigned to them. Task details and assignments are managed by project admins.</p>
          </div>
        )}
      </section>

      <section className="split-grid">
        <div className="panel">
          <div className="panel-header">
            <h2>Team</h2>
            <span>{members.data?.length ?? 0} members</span>
          </div>
          <div className="stack-list">
            {members.data?.map((member) => (
              <div className="member-row" key={member.id}>
                <div>
                  <strong>{member.user.name}</strong>
                  <span>{member.user.email}</span>
                </div>
                <span className="badge">{member.role}</span>
                {member.userId !== project.data?.ownerId ? (
                  <Button variant="ghost" onClick={() => removeMember.mutate(member.userId)}>
                    <Trash2 size={16} />
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        {user?.role === 'ADMIN' ? (
          <form className="panel form-panel" onSubmit={memberForm.handleSubmit((values) => addMember.mutate(values))}>
            <div className="panel-header">
              <h2>Add member</h2>
              <UserPlus size={18} />
            </div>

            <SelectField label="User" error={memberForm.formState.errors.userId?.message} {...memberForm.register('userId')}>
              <option value="">Select user</option>
              {availableUsers.map((candidate) => (
                <option value={candidate.id} key={candidate.id}>{candidate.name} ({candidate.email})</option>
              ))}
            </SelectField>
            <SelectField label="Project role" {...memberForm.register('role')}>
              <option value="MEMBER">MEMBER</option>
              <option value="ADMIN">ADMIN</option>
            </SelectField>

            {addMember.isError ? <div className="form-error">{getApiError(addMember.error)}</div> : null}

            <Button type="submit" disabled={addMember.isPending}>
              {addMember.isPending ? 'Adding...' : 'Add member'}
            </Button>
          </form>
        ) : null}
      </section>

      {editingTask ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Edit task">
          <form className="modal-panel task-edit-modal" onSubmit={editTaskForm.handleSubmit((values) => updateTask.mutate(values))}>
            <div className="modal-header">
              <div>
                <span>Edit task</span>
                <h2>{editingTask.title}</h2>
              </div>
              <button className="icon-button" type="button" onClick={() => setEditingTask(null)} aria-label="Close edit task">
                <X size={20} />
              </button>
            </div>

            <div className="modal-grid">
              <Field label="Title" error={editTaskForm.formState.errors.title?.message} {...editTaskForm.register('title')} />
              <SelectField label="Status" {...editTaskForm.register('status')}>
                <option value="TODO">TODO</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="DONE">DONE</option>
              </SelectField>
              <TextAreaField label="Description" rows={5} {...editTaskForm.register('description')} />
              <SelectField label="Priority" {...editTaskForm.register('priority')}>
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </SelectField>
              <Field label="Due date" type="date" {...editTaskForm.register('dueDate')} />
              <SelectField label="Assignee" {...editTaskForm.register('assignedToId')}>
                <option value="">Unassigned</option>
                {members.data?.map((member) => (
                  <option key={member.userId} value={member.userId}>{member.user.name}</option>
                ))}
              </SelectField>
            </div>

            {updateTask.isError ? <div className="form-error">{getApiError(updateTask.error)}</div> : null}
            {deleteTask.isError ? <div className="form-error">{getApiError(deleteTask.error)}</div> : null}

            <div className="modal-actions">
              <Button type="button" variant="danger" onClick={() => deleteTask.mutate(editingTask.id)} disabled={deleteTask.isPending}>
                <Trash2 size={16} />
                {deleteTask.isPending ? 'Deleting...' : 'Delete task'}
              </Button>
              <div>
                <Button type="button" variant="secondary" onClick={() => setEditingTask(null)}>Cancel</Button>
                <Button type="submit" disabled={updateTask.isPending}>
                  {updateTask.isPending ? 'Saving...' : 'Save changes'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
