export type UserRole = 'ADMIN' | 'MEMBER';
export type ProjectRole = 'ADMIN' | 'MEMBER';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  owner: Pick<User, 'id' | 'name' | 'email' | 'role'>;
  _count: {
    members: number;
    tasks: number;
  };
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: ProjectRole;
  createdAt: string;
  user: Pick<User, 'id' | 'name' | 'email' | 'role'>;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  projectId: string;
  assignedToId?: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  project: {
    id: string;
    name: string;
    ownerId: string;
  };
  assignedTo?: Pick<User, 'id' | 'name' | 'email' | 'role'> | null;
  createdBy: Pick<User, 'id' | 'name' | 'email' | 'role'>;
}

export interface DashboardSummary {
  totalTasks: number;
  todo: number;
  inProgress: number;
  done: number;
  overdue: number;
  myTasks: number;
  projectsCount: number;
}

export interface ProjectSummary extends DashboardSummary {
  projectId: string;
  progress: number;
}
