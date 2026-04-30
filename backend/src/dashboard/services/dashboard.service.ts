import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { ProjectsService } from '../../projects/services/projects.service';
import { TasksDao } from '../../tasks/dao/tasks.dao';
import { DashboardDao } from '../dao/dashboard.dao';

@Injectable()
export class DashboardService {
  constructor(
    private readonly dashboardDao: DashboardDao,
    private readonly projectsService: ProjectsService,
    private readonly tasksDao: TasksDao,
  ) {}

  summary(user: AuthUser) {
    return this.dashboardDao.summary(user.id, user.role === UserRole.ADMIN);
  }

  async projectSummary(projectId: string, user: AuthUser) {
    await this.projectsService.ensureCanViewProject(projectId, user);
    const tasks = await this.tasksDao.findByProject(projectId);
    const totalTasks = tasks.length;
    const todo = tasks.filter((task) => task.status === 'TODO').length;
    const inProgress = tasks.filter((task) => task.status === 'IN_PROGRESS').length;
    const done = tasks.filter((task) => task.status === 'DONE').length;
    const overdue = tasks.filter((task) => task.dueDate && task.dueDate < new Date() && task.status !== 'DONE').length;

    return {
      projectId,
      totalTasks,
      todo,
      inProgress,
      done,
      overdue,
      progress: totalTasks === 0 ? 0 : Math.round((done / totalTasks) * 100),
    };
  }
}
