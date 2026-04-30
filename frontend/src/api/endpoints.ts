import { api } from './client';
import {
  AuthResponse,
  DashboardSummary,
  Project,
  ProjectMember,
  ProjectRole,
  ProjectSummary,
  Task,
  TaskPriority,
  TaskStatus,
  User,
  UserRole,
} from '../types';

export const authApi = {
  signup: (payload: { name: string; email: string; password: string }) =>
    api.post<AuthResponse>('/auth/signup', payload).then((res) => res.data),
  login: (payload: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', payload).then((res) => res.data),
  me: () => api.get<User>('/auth/me').then((res) => res.data),
};

export const usersApi = {
  list: () => api.get<User[]>('/users').then((res) => res.data),
  updateRole: (id: string, role: UserRole) => api.patch<User>(`/users/${id}/role`, { role }).then((res) => res.data),
};

export const projectsApi = {
  list: () => api.get<Project[]>('/projects').then((res) => res.data),
  detail: (id: string) => api.get<Project>(`/projects/${id}`).then((res) => res.data),
  create: (payload: { name: string; description?: string }) =>
    api.post<Project>('/projects', payload).then((res) => res.data),
  update: (id: string, payload: { name?: string; description?: string }) =>
    api.patch<Project>(`/projects/${id}`, payload).then((res) => res.data),
  remove: (id: string) => api.delete<Project>(`/projects/${id}`).then((res) => res.data),
};

export const projectMembersApi = {
  list: (projectId: string) => api.get<ProjectMember[]>(`/projects/${projectId}/members`).then((res) => res.data),
  add: (projectId: string, payload: { userId: string; role: ProjectRole }) =>
    api.post<ProjectMember>(`/projects/${projectId}/members`, payload).then((res) => res.data),
  updateRole: (projectId: string, userId: string, role: ProjectRole) =>
    api.patch<ProjectMember>(`/projects/${projectId}/members/${userId}/role`, { role }).then((res) => res.data),
  remove: (projectId: string, userId: string) =>
    api.delete<ProjectMember>(`/projects/${projectId}/members/${userId}`).then((res) => res.data),
};

export const tasksApi = {
  listByProject: (projectId: string) => api.get<Task[]>(`/projects/${projectId}/tasks`).then((res) => res.data),
  mine: () => api.get<Task[]>('/tasks/my').then((res) => res.data),
  create: (
    projectId: string,
    payload: {
      title: string;
      description?: string;
      status?: TaskStatus;
      priority?: TaskPriority;
      dueDate?: string;
      assignedToId?: string;
    },
  ) => api.post<Task>(`/projects/${projectId}/tasks`, payload).then((res) => res.data),
  update: (
    id: string,
    payload: {
      title?: string;
      description?: string;
      status?: TaskStatus;
      priority?: TaskPriority;
      dueDate?: string;
      assignedToId?: string | null;
    },
  ) => api.patch<Task>(`/tasks/${id}`, payload).then((res) => res.data),
  updateStatus: (id: string, status: TaskStatus) => api.patch<Task>(`/tasks/${id}/status`, { status }).then((res) => res.data),
  remove: (id: string) => api.delete<Task>(`/tasks/${id}`).then((res) => res.data),
};

export const dashboardApi = {
  summary: () => api.get<DashboardSummary>('/dashboard/summary').then((res) => res.data),
  projectSummary: (projectId: string) =>
    api.get<ProjectSummary>(`/dashboard/projects/${projectId}`).then((res) => res.data),
};
