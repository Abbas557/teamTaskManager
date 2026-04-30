import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { getApiError } from '../../api/client';
import { projectsApi } from '../../api/endpoints';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { Field, TextAreaField } from '../../components/Field';

const schema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(1000).optional(),
});

type ProjectForm = z.infer<typeof schema>;

export function ProjectsPage() {
  const queryClient = useQueryClient();
  const projects = useQuery({ queryKey: ['projects'], queryFn: projectsApi.list });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectForm>({ resolver: zodResolver(schema) });

  const createProject = useMutation({
    mutationFn: projectsApi.create,
    onSuccess: () => {
      reset();
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Projects</h1>
          <p>Create projects, then add members and tasks.</p>
        </div>
      </header>

      <section className="split-grid wide-left">
        <div className="panel">
          <div className="panel-header">
            <h2>All projects</h2>
            <span>{projects.data?.length ?? 0} total</span>
          </div>

          <div className="project-grid">
            {projects.data?.length ? (
              projects.data.map((project) => (
                <Link className="project-card" to={`/projects/${project.id}`} key={project.id}>
                  <div>
                    <h3>{project.name}</h3>
                    <p>{project.description || 'No description'}</p>
                  </div>
                  <div className="card-meta">
                    <span>{project._count.members} members</span>
                    <span>{project._count.tasks} tasks</span>
                  </div>
                </Link>
              ))
            ) : (
              <EmptyState title="No projects">Use the form to create your first project.</EmptyState>
            )}
          </div>
        </div>

        <form className="panel form-panel" onSubmit={handleSubmit((values) => createProject.mutate(values))}>
          <div className="panel-header">
            <h2>New project</h2>
            <Plus size={18} />
          </div>

          <Field label="Name" error={errors.name?.message} {...register('name')} />
          <TextAreaField label="Description" rows={5} error={errors.description?.message} {...register('description')} />

          {createProject.isError ? <div className="form-error">{getApiError(createProject.error)}</div> : null}

          <Button type="submit" disabled={createProject.isPending}>
            {createProject.isPending ? 'Creating...' : 'Create project'}
          </Button>
        </form>
      </section>
    </div>
  );
}
