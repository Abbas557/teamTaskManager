import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, Clock3, FolderKanban, ListTodo } from 'lucide-react';
import { Link } from 'react-router-dom';
import { dashboardApi, projectsApi, tasksApi } from '../../api/endpoints';
import { EmptyState } from '../../components/EmptyState';
import { PriorityBadge, StatusBadge } from '../../components/StatusBadge';

export function DashboardPage() {
  const summary = useQuery({ queryKey: ['dashboard-summary'], queryFn: dashboardApi.summary });
  const projects = useQuery({ queryKey: ['projects'], queryFn: projectsApi.list });
  const myTasks = useQuery({ queryKey: ['my-tasks'], queryFn: tasksApi.mine });

  const cards = [
    { label: 'Total tasks', value: summary.data?.totalTasks ?? 0, icon: ListTodo, tone: 'blue' },
    { label: 'In progress', value: summary.data?.inProgress ?? 0, icon: Clock3, tone: 'amber' },
    { label: 'Done', value: summary.data?.done ?? 0, icon: CheckCircle2, tone: 'green' },
    { label: 'Overdue', value: summary.data?.overdue ?? 0, icon: AlertTriangle, tone: 'red' },
    { label: 'Projects', value: summary.data?.projectsCount ?? 0, icon: FolderKanban, tone: 'violet' },
  ];

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Current workload, project progress, and deadlines.</p>
        </div>
      </header>

      <section className="dashboard-hero">
        <div className="hero-content">
          <span>Operations overview</span>
          <h2>{summary.data?.done ?? 0} tasks completed across {summary.data?.projectsCount ?? 0} projects</h2>
          <p>Track assignments, follow status movement, and keep overdue work visible before it becomes a blocker.</p>
        </div>
        <div className="hero-photo" aria-hidden="true" />
      </section>

      <section className="metric-grid">
        {cards.map((card) => (
          <article className={`metric-card metric-${card.tone}`} key={card.label}>
            <div className="metric-icon">
              <card.icon size={22} />
            </div>
            <div className="metric-copy">
              <span>{card.label}</span>
              <strong>{summary.isLoading ? '-' : card.value}</strong>
            </div>
          </article>
        ))}
      </section>

      <section className="split-grid">
        <div className="panel">
          <div className="panel-header">
            <h2>Recent projects</h2>
            <Link to="/projects">View all</Link>
          </div>
          <div className="stack-list">
            {projects.data?.length ? (
              projects.data.slice(0, 4).map((project) => (
                <Link className="project-row" to={`/projects/${project.id}`} key={project.id}>
                  <div>
                    <strong>{project.name}</strong>
                    <span>{project._count.members} members</span>
                  </div>
                  <span>{project._count.tasks} tasks</span>
                </Link>
              ))
            ) : (
              <EmptyState title="No projects yet">Create a project to begin assigning work.</EmptyState>
            )}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2>My tasks</h2>
            <Link to="/tasks/my">Open</Link>
          </div>
          <div className="stack-list">
            {myTasks.data?.length ? (
              myTasks.data.slice(0, 5).map((task) => (
                <div className="task-row" key={task.id}>
                  <div>
                    <strong>{task.title}</strong>
                    <span>{task.project.name}</span>
                  </div>
                  <div className="badge-line">
                    <StatusBadge status={task.status} />
                    <PriorityBadge priority={task.priority} />
                  </div>
                </div>
              ))
            ) : (
              <EmptyState title="No assigned tasks">Tasks assigned to you will appear here.</EmptyState>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
